
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../services/supabaseClient';

const Dashboard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);

  const stats = [
    { status: 'Requested' as OrderStatus, label: 'Requested', color: 'text-blue-400', glow: 'shadow-blue-500/20', border: 'border-blue-500/50' },
    { status: 'On Progress' as OrderStatus, label: 'Progress', color: 'text-yellow-400', glow: 'shadow-yellow-500/20', border: 'border-yellow-500/50' },
    { status: 'Pending' as OrderStatus, label: 'Pending', color: 'text-red-400', glow: 'shadow-red-500/20', border: 'border-red-500/50' },
    { status: 'Closed' as OrderStatus, label: 'Closed', color: 'text-green-400', glow: 'shadow-green-500/20', border: 'border-green-500/50' }
  ];

  const handleFilterToggle = (status: OrderStatus) => {
    if (filterStatus === status) {
      setFilterStatus(null); // Reset filter jika diklik lagi
    } else {
      setFilterStatus(status);
    }
  };

  // Logika pemfilteran: 
  // Jika tidak ada filter, tampilkan semua kecuali Canceled.
  // Jika ada filter, tampilkan tepat status tersebut.
  const displayedJobs = useMemo(() => {
    if (!filterStatus) {
      return orders.filter(o => o.status !== 'Canceled');
    }
    return orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  const formatDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('-');
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
        <h2 className="text-2xl md:text-3xl font-bold text-white">Work Monitoring</h2>
        <p className="text-sm text-slate-400">Klik pada kartu status untuk memfilter data tabel.</p>
      </header>

      {/* Stats Cards as Interactive Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => {
          const count = orders.filter(o => o.status === stat.status).length;
          const isActive = filterStatus === stat.status;
          
          return (
            <button
              key={stat.label}
              onClick={() => handleFilterToggle(stat.status)}
              className={`text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-95 bg-slate-900/40 border p-4 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden group ${
                isActive 
                  ? `${stat.border} ${stat.glow} bg-slate-800/60 shadow-lg ring-1 ring-white/10` 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 p-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${stat.color.replace('text', 'bg')}`}></div>
                </div>
              )}
              <p className={`text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`}>
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

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold text-white">
              {filterStatus ? `Detail Pesanan: ${filterStatus}` : 'Semua Pekerjaan Aktif'}
            </h3>
            {filterStatus && (
              <button 
                onClick={() => setFilterStatus(null)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded-md font-bold uppercase transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded-lg">
            {displayedJobs.length} Data
          </span>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-800/50">
          {displayedJobs.length > 0 ? displayedJobs.map(order => (
            <div key={order.id} className="p-5 flex flex-col space-y-3 bg-slate-800/10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-mono text-sm font-bold">{order.id}</span>
                  </div>
                  <h4 className="text-white font-bold text-base">{order.unit}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Oleh: {order.ordererName}</p>
                </div>
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                  className={`bg-slate-800 px-2 py-1 rounded-lg text-[10px] font-black uppercase border outline-none cursor-pointer ${STATUS_COLORS[order.status]}`}
                >
                  <option value="Requested">Requested</option>
                  <option value="On Progress">On Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(order.date)} • {order.startTime} - {order.endTime} WITA</span>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl text-xs text-slate-300 leading-relaxed italic border border-slate-700/30">
                "{order.details}"
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-slate-500 text-sm">
              Tidak ada data ditemukan untuk status ini.
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Pemesan</th>
                <th className="px-6 py-4 font-bold">Unit</th>
                <th className="px-6 py-4 font-bold">Waktu</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {displayedJobs.length > 0 ? displayedJobs.map(order => (
                <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400 font-bold">{order.id}</td>
                  <td className="px-6 py-4 text-slate-300 font-medium">{order.ordererName}</td>
                  <td className="px-6 py-4 text-white font-medium">{order.unit}</td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap text-xs">
                    <div>{formatDate(order.date)}</div>
                    <div>{order.startTime} - {order.endTime} WITA</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                      className={`bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer hover:border-slate-500 transition-colors ${STATUS_COLORS[order.status].split(' ')[1]}`}
                    >
                      <option value="Requested" className="bg-slate-900">Requested</option>
                      <option value="On Progress" className="bg-slate-900">On Progress</option>
                      <option value="Pending" className="bg-slate-900">Pending</option>
                      <option value="Closed" className="bg-slate-900">Closed</option>
                    </select>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data ditemukan untuk status ini.
                  </td>
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
