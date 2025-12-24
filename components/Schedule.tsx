
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { UNIT_TYPES, STATUS_COLORS } from '../constants';

const Schedule: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTimePos, setCurrentTimePos] = useState<number | null>(null);

  // WITA is UTC + 8
  const getWitaTime = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 8));
  };

  useEffect(() => {
    const updateTimePos = () => {
      const wita = getWitaTime();
      const currentDay = wita.toISOString().split('T')[0];
      
      if (currentDay === selectedDate) {
        const hour = wita.getHours();
        const minute = wita.getMinutes();
        // Calculate percentage within the 24-hour block
        const position = ((hour + minute / 60) / 24) * 100;
        setCurrentTimePos(position);
      } else {
        setCurrentTimePos(null);
      }
    };

    updateTimePos();
    const interval = setInterval(updateTimePos, 30000); // Update every 30 seconds for better precision
    return () => clearInterval(interval);
  }, [selectedDate]);

  const hours = Array.from({ length: 25 }, (_, i) => i); // 0 to 24

  const formatDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('-');
  };

  const getPosition = (startTime: string, endTime: string) => {
    const startH = parseInt(startTime.split(':')[0]);
    const startM = parseInt(startTime.split(':')[1]);
    const endH = parseInt(endTime.split(':')[0]);
    const endM = parseInt(endTime.split(':')[1]);

    const left = (startH + startM / 60) * (100 / 24);
    const width = ((endH + endM / 60) - (startH + startM / 60)) * (100 / 24);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Timeline Unit</h2>
          <p className="text-sm md:text-base text-slate-400">Pantau jadwal operasional harian (WITA).</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900/40 p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-800">
          <input
            type="date"
            className="bg-transparent text-blue-400 font-bold outline-none px-4 text-sm md:text-base w-full md:w-auto cursor-pointer"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      </header>

      <div className="md:hidden flex items-center justify-center space-x-2 py-2 text-slate-500 animate-pulse">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <span className="text-[10px] font-bold uppercase">Geser untuk melihat jadwal</span>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl overflow-hidden relative">
        <div className="relative overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[900px] md:min-w-[1200px] relative">
            
            {/* Hour Header */}
            <div className="flex border-b border-slate-800/50 pb-4 relative z-10">
              <div className="w-32 md:w-48 flex-shrink-0 text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-widest">UNIT TYPE</div>
              <div className="flex-1 flex relative">
                {hours.map(h => (
                  <div key={h} className="flex-1 text-center text-[9px] md:text-[10px] text-slate-600 border-l border-slate-800/30 first:border-l-0">
                    {String(h === 24 ? 0 : h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Rows Area */}
            <div className="relative">
              
              {/* FIXED TIME INDICATOR OVERLAY */}
              {/* This overlay uses flex to mirror the row structure, ensuring the percentage only applies to the hours area */}
              {currentTimePos !== null && (
                <div className="absolute inset-0 pointer-events-none z-30 transition-all duration-1000 ease-in-out">
                  <div className="flex h-full">
                    <div className="w-32 md:w-48 shrink-0"></div> {/* Spacer for Unit Column */}
                    <div className="flex-1 relative">
                      {/* The White Line - Positioned precisely relative to the 24h grid */}
                      <div 
                        className="absolute top-0 bottom-0 w-[1.5px] md:w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                        style={{ left: `${currentTimePos}%` }}
                      >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-800/30 relative z-20">
                {UNIT_TYPES.map(unit => {
                  const dayOrders = orders.filter(o => o.unit === unit && o.date === selectedDate);
                  return (
                    <div key={unit} className="flex py-4 md:py-6 group hover:bg-slate-800/5 transition-colors">
                      <div className="w-32 md:w-48 flex-shrink-0 font-bold text-slate-300 text-xs md:text-sm flex items-center">{unit}</div>
                      <div className="flex-1 relative h-8 md:h-10 bg-slate-800/10 rounded-lg md:rounded-xl border border-slate-800/30">
                        
                        {/* Vertical Grid Lines within each row */}
                        {hours.map(h => (
                          <div key={h} className="absolute h-full border-l border-slate-800/10" style={{ left: `${(h/24)*100}%` }}></div>
                        ))}
                        
                        {/* Order Blocks */}
                        {dayOrders.map(order => {
                          const style = getPosition(order.startTime, order.endTime);
                          const colorParts = STATUS_COLORS[order.status].split(' ');
                          const bgColorClass = colorParts[0].replace('/20', '/80'); // Higher opacity for visibility
                          
                          return (
                            <div
                              key={order.id}
                              className={`absolute top-1 bottom-1 border border-white/20 rounded-md md:rounded-lg flex flex-col justify-center px-1 md:px-2 shadow-lg overflow-hidden cursor-help transition-all hover:scale-[1.02] active:z-50 ${bgColorClass}`}
                              style={style}
                              title={`${order.id} [${order.status}]: ${order.details}`}
                            >
                              <span className={`text-[8px] md:text-[10px] font-black truncate drop-shadow-sm text-white`}>{order.id}</span>
                              <span className={`text-[7px] md:text-[8px] truncate hidden xs:block text-white/90`}>{order.startTime}-{order.endTime}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Requested</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>On Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Closed</span>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
           <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
           <span className="text-white/80 font-black">Realtime WITA</span>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
