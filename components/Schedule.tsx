
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { UNIT_TYPES } from '../constants';

const Schedule: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const getWitaTime = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 8));
  };

  const getWitaDateString = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getWitaDateString(getWitaTime()));
  const [currentTimePos, setCurrentTimePos] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTimePos = () => {
      const witaNow = getWitaTime();
      const currentDayString = getWitaDateString(witaNow);
      
      if (currentDayString === selectedDate) {
        const hour = witaNow.getHours();
        const minute = witaNow.getMinutes();
        const position = ((hour + minute / 60) / 24) * 100;
        setCurrentTimePos(position);
      } else {
        setCurrentTimePos(null);
      }
    };

    updateTimePos();
    const interval = setInterval(updateTimePos, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  useEffect(() => {
    if (currentTimePos !== null && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const stickyWidth = window.innerWidth < 768 ? 112 : 160;
      const viewportWidth = container.clientWidth;
      const timelineTotalWidth = container.scrollWidth - stickyWidth;
      
      const indicatorPx = (currentTimePos / 100) * timelineTotalWidth;
      const scrollTarget = indicatorPx - (viewportWidth - stickyWidth) / 2;
      
      const timer = setTimeout(() => {
        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: 'smooth'
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedDate, currentTimePos === null]);

  const hours = Array.from({ length: 25 }, (_, i) => i);

  const getPosition = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return { left: '0%', width: '0%' };
    const startH = parseInt(startTime.split(':')[0]);
    const startM = parseInt(startTime.split(':')[1]);
    const endH = parseInt(endTime.split(':')[0]);
    const endM = parseInt(endTime.split(':')[1]);

    const left = (startH + startM / 60) * (100 / 24);
    const width = ((endH + endM / 60) - (startH + startM / 60)) * (100 / 24);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Dedicated high-contrast colors for timeline bars to ensure white text is readable
  const TIMELINE_BAR_COLORS: Record<OrderStatus, string> = {
    'Requested': 'bg-blue-600 dark:bg-blue-500',
    'On Progress': 'bg-amber-600 dark:bg-amber-500',
    'Closed': 'bg-emerald-600 dark:bg-emerald-500',
    'Pending': 'bg-red-600 dark:bg-red-500',
    'Canceled': 'bg-slate-600 dark:bg-slate-500'
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Timeline Unit</h2>
          <p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Pantau jadwal operasional harian (WITA).</p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900/40 p-2 md:p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <input
            type="date"
            className="bg-transparent text-blue-700 dark:text-blue-400 font-bold outline-none px-4 text-sm md:text-base cursor-pointer"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl shadow-sm dark:shadow-2xl overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="relative overflow-x-auto custom-scrollbar scroll-smooth"
        >
          <div className="min-w-[1200px] md:min-w-[1600px] relative">
            
            {/* Timeline Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 relative z-[100] bg-slate-100/50 dark:bg-slate-800/30">
              <div className="w-28 md:w-40 shrink-0 sticky left-0 bg-slate-200 dark:bg-[#1e293b] z-[110] text-[10px] font-black uppercase tracking-widest px-4 py-4 border-r border-slate-300 dark:border-slate-800 flex items-center text-slate-700 dark:text-slate-400 transition-colors">
                UNIT TYPE
              </div>
              
              <div className="flex-1 flex relative">
                {hours.map(h => (
                  <div key={h} className="flex-1 text-center text-[10px] text-slate-700 dark:text-slate-500 border-l border-slate-300 dark:border-slate-800/30 first:border-l-0 font-bold py-4">
                    {String(h === 24 ? 0 : h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Body */}
            <div className="relative">
              {/* Real-time Indicator Line */}
              {currentTimePos !== null && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  <div className="flex h-full">
                    <div className="w-28 md:w-40 shrink-0 border-r border-transparent"></div>
                    <div className="flex-1 relative">
                      <div 
                        className="absolute top-0 bottom-0 w-[2px] bg-blue-600 dark:bg-white/60 shadow-[0_0_15px_rgba(59,130,246,0.6)] z-30"
                        style={{ left: `${currentTimePos}%` }}
                      >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 dark:bg-white rounded-full animate-pulse shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-200 dark:divide-slate-800 relative">
                {UNIT_TYPES.map(unit => {
                  const dayOrders = orders.filter(o => 
                    o.unit === unit && 
                    o.date === selectedDate && 
                    o.status !== 'Pending' && 
                    o.status !== 'Canceled'
                  );

                  return (
                    <div key={unit} className="flex group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-200 relative">
                      
                      {/* Sticky Unit Column */}
                      <div className="w-28 md:w-40 shrink-0 sticky left-0 bg-white dark:bg-[#0f172a] group-hover:bg-slate-100 dark:group-hover:bg-[#1e293b] z-[50] font-bold text-slate-900 dark:text-slate-300 text-xs md:text-sm flex items-center px-4 py-6 border-r border-slate-200 dark:border-slate-800 transition-colors">
                        {unit}
                      </div>

                      <div className="flex-1 relative h-12 md:h-16 flex items-center z-10 px-0">
                        {/* Hour Grid Lines */}
                        <div className="absolute inset-x-0 h-full flex">
                           {hours.map(h => (
                             <div 
                               key={h} 
                               className="flex-1 border-l border-slate-200 dark:border-slate-800/30 first:border-l-0"
                             ></div>
                           ))}
                        </div>
                        
                        {/* Order Bars */}
                        <div className="relative w-full h-10 md:h-12">
                          {dayOrders.map(order => {
                            const style = getPosition(order.startTime, order.endTime);
                            const barBg = TIMELINE_BAR_COLORS[order.status] || 'bg-slate-500';
                            
                            return (
                              <div
                                key={order.id}
                                className={`absolute top-0 bottom-0 border border-white/30 rounded-lg flex flex-col justify-center px-2 shadow-md overflow-hidden cursor-help transition-all hover:scale-[1.02] hover:z-[60] active:scale-95 ${barBg} text-white`}
                                style={style}
                                title={`${order.id} [${order.status}]: ${order.details}`}
                              >
                                <span className="text-[9px] md:text-[11px] font-black truncate drop-shadow-md tracking-tight">
                                  {order.id}
                                </span>
                                <span className="text-[7px] md:text-[8px] truncate text-white font-bold drop-shadow-sm hidden sm:block">
                                  {order.startTime}-{order.endTime}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] text-slate-800 dark:text-slate-500 font-black uppercase tracking-widest">
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
          <span>Requested</span>
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-3 h-3 bg-amber-600 rounded-sm"></div>
          <span>Progress</span>
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
          <span>Closed</span>
        </div>
        <p className="text-[9px] text-red-600 italic mt-auto">Note: Pesanan berstatus Pending tidak ditampilkan di timeline.</p>
      </div>
    </div>
  );
};

export default Schedule;
