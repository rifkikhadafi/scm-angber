
import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { UNIT_TYPES, STATUS_COLORS } from '../constants';

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
          <p className="text-sm text-slate-400">Pantau jadwal operasional harian (WITA).</p>
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

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="relative overflow-x-auto pb-4 custom-scrollbar scroll-smooth"
        >
          <div className="min-w-[1200px] md:min-w-[1600px] relative">
            
            {/* Header Jam */}
            <div className="flex border-b border-slate-800/50 pb-4 relative z-50">
              <div className="w-28 md:w-40 shrink-0 sticky left-0 bg-[#0f172a] z-[60] text-xs font-black uppercase tracking-widest px-4 py-1 border-r border-slate-800/50 flex items-center shadow-[10px_0_15px_-5px_rgba(0,0,0,0.5)] text-slate-500">
                UNIT TYPE
              </div>
              
              <div className="flex-1 flex relative">
                {hours.map(h => (
                  <div key={h} className="flex-1 text-center text-[10px] text-slate-600 border-l border-slate-800/30 first:border-l-0 font-bold">
                    {String(h === 24 ? 0 : h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {currentTimePos !== null && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  <div className="flex h-full">
                    <div className="w-28 md:w-40 shrink-0"></div>
                    <div className="flex-1 relative">
                      <div 
                        className="absolute top-0 bottom-0 w-[2px] bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-30"
                        style={{ left: `${currentTimePos}%` }}
                      >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_20px_rgba(255,255,255,1)]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-800/30 relative">
                {UNIT_TYPES.map(unit => {
                  const dayOrders = orders.filter(o => o.unit === unit && o.date === selectedDate);
                  return (
                    <div key={unit} className="flex group hover:bg-slate-800/10 transition-colors relative z-20">
                      <div className="w-28 md:w-40 shrink-0 sticky left-0 bg-[#0f172a] z-40 font-bold text-slate-300 text-xs md:text-sm flex items-center px-4 py-6 border-r border-slate-800/50 shadow-[10px_0_15px_-5px_rgba(0,0,0,0.5)]">
                        {unit}
                      </div>

                      <div className="flex-1 relative h-12 md:h-16 flex items-center">
                        <div className="absolute inset-x-0 h-10 md:h-12 bg-slate-800/5 rounded-xl border border-slate-800/20">
                          {hours.map(h => (
                            <div 
                              key={h} 
                              className="absolute h-full border-l border-slate-800/10" 
                              style={{ left: `${(h/24)*100}%` }}
                            ></div>
                          ))}
                          
                          {dayOrders.map(order => {
                            const style = getPosition(order.startTime, order.endTime);
                            const colorParts = STATUS_COLORS[order.status].split(' ');
                            const bgColorClass = colorParts[0].replace('/20', '/95');
                            
                            return (
                              <div
                                key={order.id}
                                className={`absolute top-1 bottom-1 border border-white/20 rounded-lg flex flex-col justify-center px-2 shadow-lg overflow-hidden cursor-help transition-all hover:scale-[1.02] hover:z-50 active:scale-95 ${bgColorClass}`}
                                style={style}
                                title={`${order.id} [${order.status}]: ${order.details}`}
                              >
                                <span className="text-[8px] md:text-[10px] font-black truncate text-white drop-shadow-md">
                                  {order.id}
                                </span>
                                <span className="text-[7px] md:text-[8px] truncate text-white/80 hidden sm:block">
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

      <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span>Requested</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
          <span>Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>Closed</span>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
           <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
           <span className="text-white/80 font-black">Realtime</span>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
