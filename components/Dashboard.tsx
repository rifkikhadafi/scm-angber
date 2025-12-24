
import React from 'react';
import { Order, OrderStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../services/supabaseClient';

const Dashboard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const stats = [
    { label: 'Requested', count: orders.filter(o => o.status === 'Requested').length, color: 'text-blue-400' },
    { label: 'Progress', count: orders.filter(o => o.status === 'On Progress').length, color: 'text-yellow-400' },
    { label: 'Pending', count: orders.filter(o => o.status === 'Pending').length, color: 'text-red-400' },
    { label: 'Closed', count: orders.filter(o => o.status === 'Closed').length, color: 'text-green-400' }
  ];

  const activeJobs = orders.filter(o => o.status !== 'Closed' && o.status !== 'Canceled');

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
      
      // Notifikasi WA dihapus sesuai permintaan user: 
      // "Untuk perubahan status tidak perlu mengirimkan pesan ke WA Group"
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Gagal memperbarui status.');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Work Monitoring</h2>
        <p className="text-sm md:text-base text-slate-400">Silahkan cek status pesanan anda.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-900/40 border border-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl">
            <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl md:text-4xl font-black mt-1 md:mt-2 ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 md:p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-bold text-white">Detail Pekerjaan Aktif</h3>
          <span className="text-xs text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded-lg">
            {activeJobs.length} Aktif
          </span>
        </div>

        <div className="md:hidden divide-y divide-slate-800/50">
          {activeJobs.length > 0 ? activeJobs.map(order => (
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

              <div className="p-3 bg-slate-800/50 rounded-xl text-xs text-slate-300 leading-relaxed italic">
                "{order.details}"
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-slate-500 text-sm">
              Belum ada pekerjaan aktif.
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Pemesan</th>
                <th className="px-6 py-4 font-bold">Unit</th>
                <th className="px-6 py-4 font-bold">Waktu</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {activeJobs.map(order => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
