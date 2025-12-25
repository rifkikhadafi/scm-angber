
import React, { useState, useEffect } from 'react';
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

  const mapOrder = (data: any): Order => ({
    id: data.id,
    unit: data.unit,
    ordererName: data.orderer_name || '-', // Map snake_case to camelCase
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
    fetchOrders();

    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(); 
      })
      .subscribe();

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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      <aside className="w-64 bg-[#1e293b]/50 border-r border-slate-800 flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent text-center">
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
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'hover:bg-slate-800/50 text-slate-400 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <header className="md:hidden py-3 px-4 border-b border-slate-800 bg-[#1e293b]/50 sticky top-0 z-50 flex justify-between items-center backdrop-blur-lg">
        <h1 className="text-base font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
          SCM ANGBER
        </h1>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <p className="text-slate-500 text-sm font-medium">Menghubungkan ke Database...</p>
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1e293b]/95 border-t border-slate-800 flex justify-around items-center px-1 py-1.5 pb-3.5 z-50 backdrop-blur-md">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`flex flex-col items-center justify-center space-y-0.5 px-3 py-1 transition-colors ${
              view === item.id ? 'text-blue-400' : 'text-slate-500'
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
