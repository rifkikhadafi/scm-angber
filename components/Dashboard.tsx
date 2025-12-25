
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../services/supabaseClient';
import * as XLSX from 'xlsx';

const Dashboard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);
  const [rescheduleOrder, setRescheduleOrder] = useState<Order | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', start: '', end: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = [
    { status: 'Requested' as OrderStatus, label: 'Requested', color: 'text-blue-700 dark:text-blue-400' },
    { status: 'On Progress' as OrderStatus, label: 'Progress', color: 'text-amber-700 dark:text-yellow-400' },
    { status: 'Pending' as OrderStatus, label: 'Pending', color: 'text-red-700 dark:text-red-400' },
    { status: 'Closed' as OrderStatus, label: 'Closed', color: 'text-emerald-700 dark:text-green-400' }
  ];

  const handleFilterToggle = (status: OrderStatus) => {
    setFilterStatus(filterStatus === status ? null : status);
  };

  const displayedJobs = useMemo(() => {
    // Jika tidak ada filter yang dipilih
    if (!filterStatus) {
      // Sembunyikan 'Canceled' (selalu) dan 'Closed' (secara default) di tampilan UI
      return orders.filter(o => o.status !== 'Canceled' && o.status !== 'Closed');
    }
    // Jika filter dipilih (termasuk jika mengklik 'Closed'), tampilkan hanya status tersebut
    return orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr || dateStr.trim() === '') return '--/--/----';
    return dateStr.split('-').reverse().join('-');
  };
  
  const formatTime = (timeStr: string | null) => {
    if (!timeStr || timeStr.trim() === '') return '--.--';
    const parts = timeStr.split(':');
    return `${parts[0]}.${parts[1]}`;
  };

  const formatTimestampToTime = (ts: string | null) => {
    if (!ts) return '--.--';
    const date = new Date(ts);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}.${minutes}`;
  };

  const calculateDuration = (startTs: string | null, endTs: string | null): string => {
    if (!startTs || !endTs) return '-';
    const start = new Date(startTs).getTime();
    const end = new Date(endTs).getTime();
    const diffMs = end - start;
    if (diffMs < 0) return '-';
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const calculatePlanDuration = (start: string | null, end: string | null): string => {
    if (!start || !end) return '-';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMinutes < 0) diffMinutes += 1440;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const getBaseId = (id: string) => id.replace(/^(PENDING-|CANCELED-)+/g, '');

  const handleExportExcel = () => {
    // Logika pemilihan data: Jika filter aktif, ekspor sesuai filter. Jika tidak, ekspor semua kecuali Canceled.
    const ordersToExport = filterStatus 
      ? orders.filter(o => o.status === filterStatus)
      : orders.filter(o => o.status !== 'Canceled');

    const dataToExport = ordersToExport.map(order => ({
      'ID Pesanan': order.id,
      'Unit': order.unit,
      'Pemesan': order.ordererName,
      'Tanggal': formatDate(order.date),
      'Plan Mulai': formatTime(order.startTime),
      'Plan Selesai': formatTime(order.endTime),
      'Durasi Plan': order.durationPlan || '-',
      'Aktual Mulai': formatTimestampToTime(order.actualStartTime),
      'Aktual Selesai': formatTimestampToTime(order.actualEndTime),
      'Durasi Aktual': order.durationActual || '-',
      'Status': order.status,
      'Detail Pekerjaan': order.details
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pesanan");
    
    const fileName = filterStatus 
      ? `Laporan_SCM_${filterStatus}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `Database_Full_SCM_Angber_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    if (order.status === newStatus) return;
    if (order.status === 'Pending' && newStatus === 'Requested') {
      setRescheduleOrder(order);
      setRescheduleData({ date: new Date().toISOString().split('T')[0], start: '08:00', end: '17:00' });
      return;
    }

    try {
      const baseId = getBaseId(order.id);
      let updateData: any = { status: newStatus };
      const now = new Date().toISOString();
      if (newStatus === 'Canceled') {
        updateData.id = `CANCELED-${baseId}`;
      } else if (newStatus === 'Pending') {
        updateData.id = `PENDING-${baseId}`;
        updateData.date = null; updateData.start_time = null; updateData.end_time = null; updateData.duration_plan = null;
      } else if (newStatus === 'On Progress') {
        updateData.id = baseId; updateData.actual_start_time = now;
      } else if (newStatus === 'Closed') {
        updateData.id = baseId; updateData.actual_end_time = now;
        if (order.actualStartTime) updateData.duration_actual = calculateDuration(order.actualStartTime, now);
        else updateData.duration_actual = "00:00";
      } else { updateData.id = baseId; }

      const { error } = await supabase.from('orders').update(updateData).eq('id', order.id);
      if (error) throw error;
    } catch (err: any) {
      alert('Database Error: ' + err.message);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleOrder) return;
    setIsSubmitting(true);
    try {
      const { data: allOrders } = await supabase.from('orders').select('id');
      let nextIdNumber = 1;
      const numbers = allOrders?.map(o => {
        const match = o.id.match(/REQ-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }) || [];
      if (numbers.length > 0) nextIdNumber = Math.max(...numbers) + 1;
      const newIdString = `REQ-${nextIdNumber}`;
      const planDur = calculatePlanDuration(rescheduleData.start, rescheduleData.end);
      const { error } = await supabase.from('orders').update({
        id: newIdString, status: 'Requested', date: rescheduleData.date,
        start_time: rescheduleData.start, end_time: rescheduleData.end, duration_plan: planDur,
        actual_start_time: null, actual_end_time: null, duration_actual: null
      }).eq('id', rescheduleOrder.id);
      if (error) throw error;
      setRescheduleOrder(null);
    } catch (err: any) {
      alert('Gagal Reschedule: ' + err.message);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Work Monitoring</h2>
            <button
              onClick={handleExportExcel}
              className="md:hidden flex items-center justify-center p-2 bg-emerald-600 text-white rounded-lg shadow-lg active:scale-90 transition-transform"
              title="Export Excel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 font-medium">Status operasional unit dan perbandingan durasi kerja.</p>
        </div>
        
        <button
          onClick={handleExportExcel}
          className="hidden md:flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export {filterStatus || 'All Database'}</span>
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => {
          const count = orders.filter(o => o.status === stat.status).length;
          const isActive = filterStatus === stat.status;
          return (
            <button
              key={stat.label}
              onClick={() => handleFilterToggle(stat.status)}
              className={`text-left transition-all bg-white dark:bg-slate-900/40 border p-4 md:p-6 rounded-2xl relative shadow-sm hover:shadow-md ${
                isActive ? `border-blue-500 ring-1 ring-blue-500/20 bg-blue-50 dark:bg-slate-800/60` : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-500'}`}>{stat.label}</p>
              <p className={`text-2xl md:text-4xl font-black mt-1 ${stat.color}`}>{count}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {/* Header Baris (Desktop) */}
        <div className="hidden lg:flex items-center px-6 py-3 bg-slate-200/60 dark:bg-slate-800/50 rounded-xl text-[10px] font-black uppercase text-slate-700 dark:text-slate-400 tracking-widest border border-transparent">
          <div className="w-[10%]">ID</div>
          <div className="w-[15%]">Unit / Pemesan / Tgl</div>
          <div className="flex-1 px-4">Detail Pekerjaan</div>
          <div className="w-[15%]">Plan (Jam/Dur)</div>
          <div className="w-[15%]">Aktual (Jam/Dur)</div>
          <div className="w-[15%] text-center">Status</div>
        </div>

        {/* List Pesanan */}
        <div className="space-y-3">
          {displayedJobs.map(order => (
            <React.Fragment key={order.id}>
              {/* Layout Baris (Desktop) */}
              <div className="hidden lg:flex items-center w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-blue-500/40 transition-all group animate-in fade-in shadow-sm">
                <div className="w-[10%] shrink-0">
                  <span className="text-blue-700 dark:text-blue-400 font-mono text-[11px] font-bold truncate block pr-2" title={order.id}>{order.id}</span>
                </div>
                <div className="w-[15%] shrink-0 overflow-hidden">
                  <h4 className="text-slate-900 dark:text-white font-bold text-sm leading-tight truncate">{order.unit}</h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-500 font-bold uppercase truncate">{order.ordererName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg className="w-2.5 h-2.5 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400/80">{formatDate(order.date)}</span>
                  </div>
                </div>
                <div className="flex-1 px-4 min-w-0">
                  <p className="text-xs text-slate-700 dark:text-slate-400 italic line-clamp-2 leading-relaxed">
                    {order.details || '-'}
                  </p>
                </div>
                <div className="w-[15%] shrink-0 pl-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                      {order.status === 'Pending' ? <span className="text-red-600 italic">HOLD</span> : `${formatTime(order.startTime)}-${formatTime(order.endTime)}`}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-500 uppercase tracking-tighter">Plan: {order.durationPlan || '--:--'}</span>
                  </div>
                </div>
                <div className="w-[15%] shrink-0 pl-2">
                   <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                      {formatTimestampToTime(order.actualStartTime)}-{formatTimestampToTime(order.actualEndTime)}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-tighter ${order.durationActual ? 'text-emerald-700 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      Act: {order.durationActual || '--:--'}
                    </span>
                  </div>
                </div>
                <div className="w-[15%] shrink-0 flex justify-center pl-2">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                    className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-black uppercase border outline-none cursor-pointer transition-colors shadow-sm ${STATUS_COLORS[order.status]}`}
                  >
                    <option value="Requested">Requested</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
              </div>

              {/* Layout Kartu (Tablet & Mobile) */}
              <div className="lg:hidden bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-700 dark:text-blue-400 font-mono text-[10px] font-bold uppercase tracking-tight">{order.id}</span>
                      <span className="text-slate-400 dark:text-slate-700">|</span>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500">{formatDate(order.date)}</span>
                    </div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-base leading-tight truncate">{order.unit}</h4>
                    <p className="text-[10px] text-slate-600 dark:text-slate-500 font-bold uppercase tracking-wider">{order.ordererName}</p>
                  </div>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border outline-none cursor-pointer shadow-sm ${STATUS_COLORS[order.status]}`}
                  >
                    <option value="Requested">Requested</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-black mb-1">Plan</p>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {order.status === 'Pending' ? 'HOLD' : `${formatTime(order.startTime)} - ${formatTime(order.endTime)}`}
                      </p>
                      <p className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-600 mt-1 uppercase">Dur: {order.durationPlan || '--:--'}</p>
                   </div>
                   <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-200 dark:border-emerald-500/10">
                      <p className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase font-black mb-1">Aktual</p>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {formatTimestampToTime(order.actualStartTime)} - {formatTimestampToTime(order.actualEndTime)}
                      </p>
                      <p className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-600 mt-1 uppercase">Act: {order.durationActual || '--:--'}</p>
                   </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                   <p className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-black mb-1">Work Details</p>
                   <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed italic line-clamp-3">
                     {order.details || 'Tidak ada keterangan tambahan.'}
                   </p>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {displayedJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
             <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Data tidak ditemukan.</p>
          {!filterStatus && orders.some(o => o.status === 'Closed') && (
            <p className="text-xs text-slate-500 dark:text-slate-500 italic">Klik kartu status 'Closed' untuk melihat riwayat pekerjaan selesai.</p>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reschedule Pesanan</h3>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase ml-1">Tanggal Baru</label>
                <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase ml-1">Mulai</label>
                  <input type="time" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={rescheduleData.start} onChange={e => setRescheduleData({...rescheduleData, start: e.target.value})} />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase ml-1">Selesai</label>
                  <input type="time" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={rescheduleData.end} onChange={e => setRescheduleData({...rescheduleData, end: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setRescheduleOrder(null)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-sm">Batal</button>
              <button onClick={submitReschedule} disabled={isSubmitting} className="flex-[2] px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm">
                {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
