
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../services/supabaseClient';
import { sendOrderNotification } from '../services/whatsappService';
import * as XLSX from 'xlsx';

const Dashboard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);
  const [rescheduleOrder, setRescheduleOrder] = useState<Order | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', start: '', end: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = [
    { status: 'Requested' as OrderStatus, label: 'Requested', color: 'text-blue-600 dark:text-blue-400' },
    { status: 'On Progress' as OrderStatus, label: 'Progress', color: 'text-yellow-600 dark:text-yellow-400' },
    { status: 'Pending' as OrderStatus, label: 'Pending', color: 'text-red-600 dark:text-red-400' },
    { status: 'Closed' as OrderStatus, label: 'Closed', color: 'text-green-600 dark:text-green-400' }
  ];

  const handleFilterToggle = (status: OrderStatus) => {
    setFilterStatus(filterStatus === status ? null : status);
  };

  const displayedJobs = useMemo(() => {
    const active = orders.filter(o => o.status !== 'Canceled');
    if (!filterStatus) return active;
    return active.filter(o => o.status === filterStatus);
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

  const getBaseId = (id: string) => {
    return id.replace(/^(PENDING-|CANCELED-)+/g, '');
  };

  const handleExportExcel = () => {
    const dataToExport = displayedJobs.map(order => ({
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
    XLSX.writeFile(workbook, `Laporan_SCM_Angber_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    if (order.status === newStatus) return;

    if (order.status === 'Pending' && newStatus === 'Requested') {
      setRescheduleOrder(order);
      setRescheduleData({ 
        date: new Date().toISOString().split('T')[0], 
        start: '08:00', 
        end: '17:00' 
      });
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
        updateData.date = null;
        updateData.start_time = null;
        updateData.end_time = null;
        updateData.duration_plan = null;
      } else if (newStatus === 'On Progress') {
        updateData.id = baseId;
        updateData.actual_start_time = now;
      } else if (newStatus === 'Closed') {
        updateData.id = baseId;
        updateData.actual_end_time = now;
        const startTime = order.actualStartTime;
        if (startTime) {
          updateData.duration_actual = calculateDuration(startTime, now);
        } else {
          // Jika tidak sempat di On Progress, hitung dari sekarang (durasi 0) atau biarkan kosong
          updateData.duration_actual = "00:00"; 
        }
      } else {
        updateData.id = baseId;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Update status error:', err);
      alert('Database Error: ' + err.message);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleOrder) return;
    if (!rescheduleData.date || !rescheduleData.start || !rescheduleData.end) {
      alert('Mohon lengkapi tanggal dan waktu baru.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: allOrders, error: fetchError } = await supabase.from('orders').select('id');
      if (fetchError) throw fetchError;

      let nextIdNumber = 1;
      const numbers = allOrders.map(o => {
        const match = o.id.match(/REQ-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
      if (numbers.length > 0) nextIdNumber = Math.max(...numbers) + 1;

      const newIdString = `REQ-${nextIdNumber}`;
      const planDur = calculatePlanDuration(rescheduleData.start, rescheduleData.end);

      const { error } = await supabase
        .from('orders')
        .update({
          id: newIdString, 
          status: 'Requested',
          date: rescheduleData.date,
          start_time: rescheduleData.start,
          end_time: rescheduleData.end,
          duration_plan: planDur,
          actual_start_time: null,
          actual_end_time: null,
          duration_actual: null
        })
        .eq('id', rescheduleOrder.id); 

      if (error) throw error;
      setRescheduleOrder(null);
    } catch (err: any) {
      alert('Gagal Reschedule: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Work Monitoring</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Monitoring perbandingan durasi Plan vs Aktual.</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Excel</span>
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => {
          const count = orders.filter(o => o.status === stat.status).length;
          const isActive = filterStatus === stat.status;
          return (
            <button
              key={stat.label}
              onClick={() => handleFilterToggle(stat.status)}
              className={`text-left transition-all bg-white dark:bg-slate-900/40 border p-4 md:p-6 rounded-2xl relative shadow-sm ${
                isActive ? `border-blue-500 ring-1 ring-blue-500/20 bg-blue-50 dark:bg-slate-800/60` : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{stat.label}</p>
              <p className={`text-2xl md:text-4xl font-black mt-1 ${stat.color}`}>{count}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left hidden md:table min-w-[1100px]">
            <thead>
              <tr className="text-slate-600 dark:text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Unit / Pemesan</th>
                <th className="px-6 py-4">Plan (Durasi)</th>
                <th className="px-6 py-4">Aktual (Durasi)</th>
                <th className="px-6 py-4 text-center">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {displayedJobs.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-700 dark:text-blue-400 font-bold truncate max-w-[120px]" title={order.id}>{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 dark:text-white font-bold text-sm">{order.unit}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">{order.ordererName}</div>
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'Pending' ? (
                      <span className="text-red-500 font-black italic text-[10px]">HOLD</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300">
                          {formatTime(order.startTime)} - {formatTime(order.endTime)}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-blue-500">Plan: {order.durationPlan || '--:--'}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex space-x-2 text-[10px] text-slate-500 font-medium">
                        <span>In: {formatTimestampToTime(order.actualStartTime)}</span>
                        <span>Out: {formatTimestampToTime(order.actualEndTime)}</span>
                      </div>
                      <span className={`font-mono font-bold text-[11px] mt-1 ${order.durationActual ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        Aktual: {order.durationActual || '--:--'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                      className={`bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-black outline-none cursor-pointer uppercase ${STATUS_COLORS[order.status].split(' ')[1]}`}
                    >
                      <option value="Requested">Requested</option>
                      <option value="On Progress">On Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Closed">Closed</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {displayedJobs.map(order => (
              <div key={order.id} className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold block mb-1">{order.id}</span>
                    <h4 className="text-slate-900 dark:text-white font-bold text-base">{order.unit}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{order.ordererName}</p>
                  </div>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border outline-none bg-slate-50 dark:bg-slate-800 ${STATUS_COLORS[order.status]}`}
                  >
                    <option value="Requested">Requested</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Durasi Plan</p>
                      <p className="text-sm font-mono font-bold text-blue-600">{order.durationPlan || '--:--'}</p>
                   </div>
                   <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-black mb-1">Durasi Aktual</p>
                      <p className="text-sm font-mono font-bold text-emerald-600">{order.durationActual || '--:--'}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {rescheduleOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reschedule Pesanan</h3>
            <div className="space-y-4">
              <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="time" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl" value={rescheduleData.start} onChange={e => setRescheduleData({...rescheduleData, start: e.target.value})} />
                <input type="time" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl" value={rescheduleData.end} onChange={e => setRescheduleData({...rescheduleData, end: e.target.value})} />
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setRescheduleOrder(null)} className="flex-1 py-3 text-slate-500 font-bold">Batal</button>
              <button onClick={submitReschedule} disabled={isSubmitting} className="flex-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
