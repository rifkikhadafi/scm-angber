
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../services/supabaseClient';

const Dashboard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);

  const stats = [
    { status: 'Requested' as OrderStatus, label: 'Requested', color: 'text-blue-600 dark:text-blue-400', glow: 'shadow-blue-500/10', border: 'border-blue-500/30' },
    { status: 'On Progress' as OrderStatus, label: 'Progress', color: 'text-yellow-600 dark:text-yellow-400', glow: 'shadow-yellow-500/10', border: 'border-yellow-500/30' },
    { status: 'Pending' as OrderStatus, label: 'Pending', color: 'text-red-600 dark:text-red-400', glow: 'shadow-red-500/10', border: 'border-red-500/30' },
    { status: 'Closed' as OrderStatus, label: 'Closed', color: 'text-green-600 dark:text-green-400', glow: 'shadow-green-500/10', border: 'border-green-500/30' }
  ];

  const handleFilterToggle = (status: OrderStatus) => {
    if (filterStatus === status) {
      setFilterStatus(null);
    } else {
      setFilterStatus(status);
    }
  };

  const displayedJobs = useMemo(() => {
    if (!filterStatus) {
      return orders.filter(o => o.status !== 'Canceled');
    }
    return orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  const formatDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('-');
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    // Menghilangkan detik jika ada dan mengganti separator ':' menjadi '.'
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    return `${parts[0]}.${parts[1]}`;
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Gagal memperbarui status.');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Work Monitoring</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Klik pada kartu status untuk memfilter data tabel.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => {
          const count = orders.filter(o => o.status === stat.status).length;
          const isActive = filterStatus === stat.status;
          
          return (
            <button
              key={stat.label}
              onClick={() => handleFilterToggle(stat.status)}
              className={`text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-95 bg-white dark:bg-slate-900/40 border p-4 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden group shadow-sm ${
                isActive 
                  ? `border-blue-500 ring-1 ring-blue-500/20 bg-blue-50 dark:bg-slate-800/60` 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 p-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${stat.color.replace('text', 'bg')}`}></div>
                </div>
              )}
              <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl md:text-4xl font-black mt-1 md:mt-2 transition-all ${stat.color} ${isActive ? 'scale-110 origin-left' : ''}`}>
                {count}
              </p>
              <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isActive ? 'w-full' : 'w-0'} ${stat.color.replace('text', 'bg')}`}></div>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {filterStatus ? `Detail: ${filterStatus}` : 'Pekerjaan Aktif'}
            </h3>
            {filterStatus && (
              <button 
                onClick={() => setFilterStatus(null)}
                className="text-[10px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md font-bold uppercase transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {displayedJobs.length} Data
          </span>
        </div>

        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
          {displayedJobs.length > 0 ? displayedJobs.map(order => (
            <div key={order.id} className="p-5 flex flex-col space-y-3 bg-white dark:bg-slate-800/10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-sm font-bold">{order.id}</span>
                  <h4 className="text-slate-900 dark:text-white font-bold text-base">{order.unit}</h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase font-bold tracking-tight">Oleh: {order.ordererName}</p>
                </div>
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border outline-none cursor-pointer bg-slate-50 dark:bg-slate-800 ${STATUS_COLORS[order.status]}`}
                >
                  <option value="Requested">Requested</option>
                  <option value="On Progress">On Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(order.date)} • {formatTime(order.startTime)} - {formatTime(order.endTime)} WITA</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic border border-slate-200 dark:border-slate-700/30">
                "{order.details}"
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada data.</div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-600 dark:text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Pemesan</th>
                <th className="px-6 py-4 font-bold">Unit</th>
                <th className="px-6 py-4 font-bold">Waktu</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
              {displayedJobs.length > 0 ? displayedJobs.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-700 dark:text-blue-400 font-bold">{order.id}</td>
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-300 font-semibold">{order.ordererName}</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{order.unit}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
                    <div className="font-semibold">{formatDate(order.date)}</div>
                    <div className="opacity-80">{formatTime(order.startTime)} - {formatTime(order.endTime)} WITA</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                      className={`bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer hover:border-blue-400 dark:hover:border-slate-500 transition-colors ${STATUS_COLORS[order.status].split(' ')[1]}`}
                    >
                      <option value="Requested">Requested</option>
                      <option value="On Progress">On Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Belum ada data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
