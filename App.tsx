
import React, { useState, useEffect } from 'react';
import { Order, ViewType, OrderStatus, UnitType } from './types';
import Dashboard from './components/Dashboard';
import NewOrder from './components/NewOrder';
import ChangeOrder from './components/ChangeOrder';
import Schedule from './components/Schedule';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('heavy_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      const today = new Date().toISOString().split('T')[0];
      const initial: Order[] = [
        { id: 'REQ-00001', unit: 'Crane', date: today, startTime: '08:00', endTime: '12:00', details: 'Pemasangan girder jembatan Blok A', status: 'On Progress', createdAt: new Date().toISOString() },
        { id: 'REQ-00002', unit: 'Primemover', date: today, startTime: '13:00', endTime: '17:00', details: 'Mobilisasi trafo ke lokasi site', status: 'Requested', createdAt: new Date().toISOString() },
        { id: 'REQ-00003', unit: 'TSO', date: today, startTime: '07:00', endTime: '10:00', details: 'Inspeksi rutin area workshop', status: 'Closed', createdAt: new Date().toISOString() },
        { id: 'REQ-00004', unit: 'Picker', date: today, startTime: '09:00', endTime: '15:00', details: 'Loading material pipa', status: 'Pending', createdAt: new Date().toISOString() }
      ];
      setOrders(initial);
      localStorage.setItem('heavy_orders', JSON.stringify(initial));
    }
  }, []);

  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('heavy_orders', JSON.stringify(newOrders));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    { id: 'new', label: 'Order', icon: 'M12 4v16m8-8H4' },
    { id: 'change', label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#1e293b]/50 border-r border-slate-800 flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
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
        <div className="p-6 border-t border-slate-800 flex justify-center">
          <div className="relative">
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.67.15-.198.3-.77.97-.943 1.17-.173.2-.347.225-.648.075-.301-.15-1.27-.467-2.42-1.493-.895-.798-1.498-1.784-1.674-2.084-.176-.3-.019-.462.13-.611.135-.133.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.67-1.615-.918-2.214-.242-.584-.488-.505-.67-.514-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.767-.722 2.015-1.42.247-.698.247-1.297.173-1.42-.074-.124-.271-.198-.57-.348zM12.067 0C5.412 0 0 5.412 0 12.067c0 2.124.551 4.12 1.516 5.86L.078 23.4l5.617-1.472a11.97 11.97 0 006.372 1.812c6.655 0 12.067-5.412 12.067-12.067S18.722 0 12.067 0z"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e293b] animate-pulse"></div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden p-4 border-b border-slate-800 bg-[#1e293b]/50 sticky top-0 z-50 flex justify-between items-center backdrop-blur-lg">
        <h1 className="text-lg font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          SCM ANGBER
        </h1>
        <div className="relative">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.67.15-.198.3-.77.97-.943 1.17-.173.2-.347.225-.648.075-.301-.15-1.27-.467-2.42-1.493-.895-.798-1.498-1.784-1.674-2.084-.176-.3-.019-.462.13-.611.135-.133.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.67-1.615-.918-2.214-.242-.584-.488-.505-.67-.514-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.767-.722 2.015-1.42.247-.698.247-1.297.173-1.42-.074-.124-.271-.198-.57-.348zM12.067 0C5.412 0 0 5.412 0 12.067c0 2.124.551 4.12 1.516 5.86L.078 23.4l5.617-1.472a11.97 11.97 0 006.372 1.812c6.655 0 12.067-5.412 12.067-12.067S18.722 0 12.067 0z"/>
          </svg>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#1e293b]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {view === 'dashboard' && <Dashboard orders={orders} />}
          {view === 'new' && (
            <NewOrder 
              orders={orders} 
              onOrderCreated={(newOrder) => {
                updateOrders([...orders, newOrder]);
                setView('dashboard');
              }} 
            />
          )}
          {view === 'change' && (
            <ChangeOrder 
              orders={orders} 
              onOrderUpdated={(updatedOrder) => {
                updateOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                setView('dashboard');
              }} 
            />
          )}
          {view === 'schedule' && <Schedule orders={orders} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-slate-800 flex justify-around items-center p-2 pb-6 z-50">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`flex flex-col items-center justify-center space-y-1 p-2 transition-colors ${
              view === item.id ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
