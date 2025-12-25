
import React, { useState, useEffect, useRef } from 'react';
import { Order, ViewType } from './types';
import Dashboard from './components/Dashboard';
import NewOrder from './components/NewOrder';
import ChangeOrder from './components/ChangeOrder';
import Schedule from './components/Schedule';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo(0, 0);
  }, [view]);

  const mapOrder = (data: any): Order => ({
    id: data.id,
    unit: data.unit,
    ordererName: data.orderer_name || '-',
    date: data.date,
    startTime: data.start_time,
    endTime: data.end_time,
    details: data.details,
    status: data.status,
    createdAt: data.created_at
  });

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrders(data.map(mapOrder));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ambil data awal
    fetchOrders();

    // Setup Realtime Subscription
    // Pastikan channel unik untuk menghindari konflik session
    const subscription = supabase
      .channel('public:orders:realtime')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          console.log('Realtime change detected:', payload.eventType);
          // Selalu fetch data terbaru untuk memastikan UI sinkron dengan database
          fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log('Realtime connection status:', status);
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    { id: 'new', label: 'Order', icon: 'M12 4v16m8-8H4' },
    { id: 'change', label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
  ];

  const ThemeToggle = () => (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 hover:scale-110 active:scale-95 transition-all shadow-sm"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-100 dark:bg-[#1e293b]/50 border-r border-slate-200 dark:border-slate-800 flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 text-center">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            SCM ANGBER
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                view === item.id 
                  ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 dark:border-blue-500/20' 
                  : 'hover:bg-slate-200/80 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden py-3 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#1e293b]/50 sticky top-0 z-50 flex justify-between items-center backdrop-blur-lg">
        <h1 className="text-base font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
          SCM ANGBER
        </h1>
        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="hidden md:flex items-center justify-end px-8 py-3 bg-white/40 dark:bg-[#0f172a]/40 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm shrink-0">
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 mr-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">System Online</span>
             </div>
             <ThemeToggle />
          </div>
        </header>

        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8"
        >
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-500"></div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Memuat data...</p>
              </div>
            ) : (
              <>
                {view === 'dashboard' && <Dashboard orders={orders} />}
                {view === 'new' && (
                  <NewOrder 
                    orders={orders} 
                    onOrderCreated={() => setView('dashboard')} 
                  />
                )}
                {view === 'change' && (
                  <ChangeOrder 
                    orders={orders} 
                    onOrderUpdated={() => setView('dashboard')} 
                  />
                )}
                {view === 'schedule' && <Schedule orders={orders} />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#1e293b]/95 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-1 py-1.5 pb-4 z-50 backdrop-blur-md">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`flex flex-col items-center justify-center space-y-1 px-3 py-1 transition-colors ${
              view === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
