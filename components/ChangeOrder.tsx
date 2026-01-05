
import React, { useState } from 'react';
import { Order, UnitType } from '../types';
import { UNIT_TYPES } from '../constants';
import { supabase } from '../services/supabaseClient';

interface ChangeOrderProps {
  orders: Order[];
  onOrderUpdated: () => void;
}

const ChangeOrder: React.FC<ChangeOrderProps> = ({ orders, onOrderUpdated }) => {
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Order | null>(null);

  const availableOrders = orders.filter(o => o.status !== 'Closed' && o.status !== 'Canceled');

  const calculatePlanDuration = (start: string | null, end: string | null): string => {
    if (!start || !end) return '-';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMinutes < 0) diffMinutes += 1440;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const order = orders.find(o => o.id === id);
    if (order) setFormData({ ...order });
    else setFormData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setLoading(true);

    try {
      const planDur = calculatePlanDuration(formData.startTime, formData.endTime);
      const { error: dbError } = await supabase
        .from('orders')
        .update({
          unit: formData.unit,
          orderer_name: formData.ordererName,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          duration_plan: planDur,
          details: formData.details
        })
        .eq('id', formData.id);

      if (dbError) throw dbError;
      onOrderUpdated();
      alert('Pesanan berhasil diperbarui.');
    } catch (err: any) {
      alert('Gagal mengupdate: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!formData) return;
    if (!window.confirm(`Batalkan pesanan ${formData.id}?`)) return;

    setLoading(true);
    try {
      const baseId = formData.id.replace(/^(CANCELED-|PENDING-)+/g, '');
      const newCanceledId = `CANCELED-${baseId}`;

      const { error: dbError } = await supabase
        .from('orders')
        .update({ status: 'Canceled', id: newCanceledId })
        .eq('id', formData.id);

      if (dbError) throw dbError;
      onOrderUpdated();
      alert('Pesanan telah dibatalkan.');
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Edit Pesanan</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Pilih ID Pesanan untuk merubah detail operasional.</p>
      </header>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-6 shadow-sm transition-colors duration-300">
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih ID Pesanan</label>
          <select className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base cursor-pointer" value={selectedId} onChange={(e) => handleSelect(e.target.value)}>
            <option value="">-- Pilih ID Pesanan --</option>
            {availableOrders.map(o => <option key={o.id} value={o.id}>{o.id} - {o.unit} ({o.ordererName})</option>)}
          </select>
        </div>

        {formData && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Unit</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value as any })}>
                  {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Pemesan</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base" value={formData.ordererName} onChange={e => setFormData({ ...formData, ordererName: e.target.value })} required />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Tanggal</label>
              <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base cursor-pointer" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Mulai</label>
                <input type="time" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base" value={formData.startTime || ''} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Selesai</label>
                <input type="time" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base" value={formData.endTime || ''} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Detail</label>
              <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none h-24 resize-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base" value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50">Update Data</button>
              <button type="button" onClick={handleCancelOrder} disabled={loading} className="flex-1 py-4 bg-red-600/10 text-red-600 border border-red-600/20 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50">Batalkan Pesanan</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangeOrder;
