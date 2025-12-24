
import React from 'react';
import { Order } from '../types';
import { STATUS_COLORS } from '../constants';

const Dashboard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const stats = [
    { label: 'Requested', count: orders.filter(o => o.status === 'Requested').length, color: 'text-blue-400' },
    { label: 'Progress', count: orders.filter(o => o.status === 'On Progress').length, color: 'text-green-400' },
    { label: 'Pending', count: orders.filter(o => o.status === 'Pending').length, color: 'text-yellow-400' },
    { label: 'Closed', count: orders.filter(o => o.status === 'Closed').length, color: 'text-slate-400' }
  ];

  const activeJobs = orders.filter(o => o.status !== 'Closed');

  const formatDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('-');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Work Monitoring</h2>
        <p className="text-sm md:text-base text-slate-400">Silahkan cek status pesanan anda.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-900/40 border border-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl">
            <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl md:text-4xl font-black mt-1 md:mt-2 ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Jobs List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 md:p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-bold text-white">Detail Pekerjaan Aktif</h3>
          <span className="text-xs text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded-lg">
            {activeJobs.length} Aktif
          </span>
        </div>

        {/* Mobile View (Card List) */}
        <div className="md:hidden divide-y divide-slate-800/50">
          {activeJobs.length > 0 ? activeJobs.map(order => (
            <div key={order.id} className="p-5 flex flex-col space-y-3 bg-slate-800/10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-blue-400 font-mono text-sm font-bold">{order.id}</span>
                  <h4 className="text-white font-bold text-base">{order.unit}</h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
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

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Unit</th>
                <th className="px-6 py-4 font-bold">Waktu</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Pekerjaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {activeJobs.map(order => (
                <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400 font-bold">{order.id}</td>
                  <td className="px-6 py-4 text-white font-medium">{order.unit}</td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    <div>{formatDate(order.date)}</div>
                    <div className="text-xs">{order.startTime} - {order.endTime} WITA</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm max-w-xs truncate">
                    {order.details}
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
