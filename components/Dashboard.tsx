
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../services/supabaseClient';
import { sendOrderNotification } from '../services/whatsappService';

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

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '') return '--/--/----';
    return dateStr.split('-').reverse().join('-');
  };
  
  const formatTime = (timeStr: string) => {
    if (!timeStr || timeStr === '') return '--.--';
    const parts = timeStr.split(':');
    return `${parts[0]}.${parts[1]}`;
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    // Jika dari Pending mau ke Requested, buka modal reschedule
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
      let updateData: any = { status: newStatus };
      
      // Jika diubah ke Pending, kosongkan tanggal dan waktu
      if (newStatus === 'Pending') {
        updateData.date = '';
        updateData.start_time = '';
        updateData.end_time = '';
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      if (newStatus === 'Canceled') {
        await sendOrderNotification({ ...order, status: 'Canceled' }, 'DELETE');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('Gagal memperbarui status.');
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
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'Requested',
          date: rescheduleData.date,
          start_time: rescheduleData.start,
          end_time: rescheduleData.end
        })
        .eq('id', rescheduleOrder.id);

      if (error) throw error;

      // Kirim notifikasi sebagai pesanan baru karena jadwal berubah total
      const updatedOrder = { 
        ...rescheduleOrder, 
        status: 'Requested' as OrderStatus,
        date: rescheduleData.date,
        startTime: rescheduleData.start,
        endTime: rescheduleData.end
      };
      await sendOrderNotification(updatedOrder, 'NEW');
      
      setRescheduleOrder(null);
    } catch (err) {
      alert('Gagal mengatur ulang jadwal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Work Monitoring</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Kelola status pekerjaan operasional secara real-time.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => {
          const count = orders.filter(o => o.status === stat.status).length;
          const isActive = filterStatus === stat.status;
          return (
            <button
              key={stat.label}
              onClick={() => handleFilterToggle(stat.status)}
              className={`text-left transition-all bg-white dark:bg-slate-900/40 border p-4 md:p-6 rounded-2xl relative overflow-hidden group shadow-sm ${
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
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {filterStatus ? `Detail: ${filterStatus}` : 'Pekerjaan Aktif'}
          </h3>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {displayedJobs.length} Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="text-slate-600 dark:text-slate-500 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Unit / Pemesan</th>
                <th className="px-6 py-4">Waktu Pelaksanaan</th>
                <th className="px-6 py-4 text-center">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {displayedJobs.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-700 dark:text-blue-400 font-bold">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 dark:text-white font-bold">{order.unit}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">{order.ordererName}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {order.status === 'Pending' ? (
                      <div className="text-red-500 font-black italic uppercase tracking-tighter">Hold Date & Time</div>
                    ) : (
                      <>
                        <div className="font-semibold text-slate-800 dark:text-slate-300">{formatDate(order.date)}</div>
                        <div className="text-slate-600 dark:text-slate-500">{formatTime(order.startTime)} - {formatTime(order.endTime)} WITA</div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                      className={`bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer ${STATUS_COLORS[order.status].split(' ')[1]}`}
                    >
                      {order.status === 'Pending' ? (
                        <>
                          <option value="Pending">Pending (Hold)</option>
                          <option value="Requested">Requested (Reschedule)</option>
                          <option value="Canceled">Canceled (Delete)</option>
                        </>
                      ) : (
                        <>
                          <option value="Requested">Requested</option>
                          <option value="On Progress">On Progress</option>
                          <option value="Pending">Pending (Hold All)</option>
                          <option value="Closed">Closed</option>
                          <option value="Canceled">Canceled</option>
                        </>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile view */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {displayedJobs.map(order => (
              <div key={order.id} className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm font-bold">{order.id}</span>
                    <h4 className="text-slate-900 dark:text-white font-bold text-base">{order.unit}</h4>
                  </div>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border outline-none cursor-pointer bg-slate-50 dark:bg-slate-800 ${STATUS_COLORS[order.status]}`}
                  >
                     {order.status === 'Pending' ? (
                        <>
                          <option value="Pending">Pending</option>
                          <option value="Requested">Requested</option>
                          <option value="Canceled">Canceled</option>
                        </>
                      ) : (
                        <>
                          <option value="Requested">Requested</option>
                          <option value="On Progress">On Progress</option>
                          <option value="Pending">Pending</option>
                          <option value="Closed">Closed</option>
                          <option value="Canceled">Canceled</option>
                        </>
                      )}
                  </select>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {order.status === 'Pending' ? <span className="text-red-500 font-bold uppercase">HOLD DATE & TIME</span> : `${formatDate(order.date)} • ${formatTime(order.startTime)} - ${formatTime(order.endTime)} WITA`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <header>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reschedule Pesanan</h3>
              <p className="text-sm text-slate-500">ID: <span className="font-mono font-bold text-blue-600">{rescheduleOrder.id}</span> - {rescheduleOrder.unit}</p>
            </header>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tanggal Baru</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={rescheduleData.date}
                  onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jam Mulai Baru</label>
                  <input 
                    type="time" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={rescheduleData.start}
                    onChange={e => setRescheduleData({...rescheduleData, start: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jam Selesai Baru</label>
                  <input 
                    type="time" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={rescheduleData.end}
                    onChange={e => setRescheduleData({...rescheduleData, end: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => setRescheduleOrder(null)}
                className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-bold text-sm"
              >
                Batal
              </button>
              <button 
                onClick={submitReschedule}
                disabled={isSubmitting}
                className="flex-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Proses...' : 'Update & Kirim WA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
