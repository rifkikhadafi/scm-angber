
import React, { useState } from 'react';
import { Order, UnitType } from '../types';
import { UNIT_TYPES } from '../constants';
import { sendOrderNotification } from '../services/whatsappService';
import { supabase } from '../services/supabaseClient';

interface NewOrderProps {
  orders: Order[];
  onOrderCreated: () => void;
}

const NewOrder: React.FC<NewOrderProps> = ({ orders, onOrderCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ordererName: '',
    selectedUnits: [] as UnitType[],
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    details: ''
  });

  const calculatePlanDuration = (start: string, end: string): string => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMinutes < 0) diffMinutes += 1440;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const toggleUnit = (unit: UnitType) => {
    setFormData(prev => ({
      ...prev,
      selectedUnits: prev.selectedUnits.includes(unit)
        ? prev.selectedUnits.filter(u => u !== unit)
        : [...prev.selectedUnits, unit]
    }));
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const checkOverlap = (unit: UnitType) => {
    const newStart = timeToMinutes(formData.startTime);
    const newEnd = timeToMinutes(formData.endTime);
    if (newEnd <= newStart) return "Jam selesai harus lebih besar dari jam mulai.";

    const isOverlap = orders.some(existing => {
      if (existing.unit === unit && existing.date === formData.date && !['Closed', 'Canceled', 'Pending'].includes(existing.status)) {
        const existingStart = timeToMinutes(existing.startTime || '00:00');
        const existingEnd = timeToMinutes(existing.endTime || '00:00');
        return newStart < existingEnd && existingStart < newEnd;
      }
      return false;
    });
    return isOverlap ? `Unit ${unit} sudah terisi pada jam tersebut.` : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.ordererName.trim()) { setError("Nama pemesan wajib diisi."); return; }
    if (formData.selectedUnits.length === 0) { setError("Pilih minimal satu unit."); return; }
    for (const unit of formData.selectedUnits) {
      const overlapMsg = checkOverlap(unit);
      if (overlapMsg) { setError(overlapMsg); return; }
    }

    setLoading(true);
    try {
      const { data: allOrders, error: fetchError } = await supabase.from('orders').select('id');
      if (fetchError) throw fetchError;
      
      let nextIdNumber = 1;
      if (allOrders && allOrders.length > 0) {
        const numbers = allOrders.map(o => {
          const match = o.id.match(/REQ-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        });
        if (numbers.length > 0) nextIdNumber = Math.max(...numbers) + 1;
      }

      const planDur = calculatePlanDuration(formData.startTime, formData.endTime);

      for (const unit of formData.selectedUnits) {
        const idString = `REQ-${nextIdNumber}`;
        const newOrderData = {
          id: idString,
          unit: unit,
          orderer_name: formData.ordererName,
          date: formData.date || null,
          start_time: formData.startTime || null,
          end_time: formData.endTime || null,
          duration_plan: planDur,
          details: formData.details,
          status: 'Requested'
        };

        const { error: dbError } = await supabase.from('orders').insert(newOrderData);
        if (dbError) throw dbError;

        const finalOrder: Order = {
          id: idString, unit, ordererName: formData.ordererName,
          date: formData.date, startTime: formData.startTime, endTime: formData.endTime,
          actualStartTime: null, actualEndTime: null,
          durationPlan: planDur, durationActual: null,
          details: formData.details, status: 'Requested' as const, createdAt: new Date().toISOString()
        };
        await sendOrderNotification(finalOrder, 'NEW');
        nextIdNumber++;
      }
      onOrderCreated();
    } catch (err: any) {
      setError("Gagal menyimpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Pesan Unit Baru</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Silahkan isi data pemesanan operasional unit.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-5 md:space-y-6 shadow-sm shadow-blue-500/5 transition-colors duration-300">
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium">{error}</div>
        )}

        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Pemesan</label>
          <input type="text" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm md:text-base" placeholder="Nama anda" value={formData.ordererName} onChange={e => setFormData({...formData, ordererName: e.target.value})} required />
        </div>

        <div className="flex flex-col space-y-3">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih Unit</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {UNIT_TYPES.map(unit => (
              <button key={unit} type="button" onClick={() => toggleUnit(unit as UnitType)} className={`px-3 py-3 rounded-xl border text-xs md:text-sm font-bold transition-all duration-200 ${formData.selectedUnits.includes(unit as UnitType) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:border-blue-400'}`}>{unit}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Tanggal</label>
          <input type="date" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm md:text-base cursor-pointer" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Mulai</label>
            <input type="time" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm md:text-base cursor-pointer" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Selesai</label>
            <input type="time" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm md:text-base cursor-pointer" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Detail Pekerjaan</label>
          <textarea className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none h-24 resize-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm md:text-base placeholder:text-slate-400" placeholder="Lokasi dan jenis pekerjaan..." value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} required />
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/20">{loading ? <span>Mengirim...</span> : <span className="uppercase tracking-widest text-xs font-bold">Kirim Permintaan</span>}</button>
      </form>
    </div>
  );
};

export default NewOrder;
