
import React, { useState } from 'react';
import { Order, UnitType } from '../types';
import { UNIT_TYPES } from '../constants';
import { sendOrderNotification } from '../services/whatsappService';
import { supabase } from '../services/supabaseClient';

interface NewOrderProps {
  orders: Order[];
  onOrderCreated: (order: Order) => void;
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
      if (
        existing.unit === unit && 
        existing.date === formData.date && 
        !['Closed', 'Canceled'].includes(existing.status)
      ) {
        const existingStart = timeToMinutes(existing.startTime);
        const existingEnd = timeToMinutes(existing.endTime);
        return newStart < existingEnd && existingStart < newEnd;
      }
      return false;
    });

    return isOverlap ? `Unit ${unit} sudah terisi pada jam tersebut.` : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.ordererName.trim()) {
      setError("Nama pemesan wajib diisi.");
      return;
    }

    if (formData.selectedUnits.length === 0) {
      setError("Pilih minimal satu unit.");
      return;
    }

    for (const unit of formData.selectedUnits) {
      const overlapMsg = checkOverlap(unit);
      if (overlapMsg) {
        setError(overlapMsg);
        return;
      }
    }

    setLoading(true);

    try {
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      let nextIdNumber = (count || 0) + 1;

      for (const unit of formData.selectedUnits) {
        const idString = `REQ-${String(nextIdNumber).padStart(4, '0')}`;
        
        const newOrderData = {
          id: idString,
          unit: unit,
          orderer_name: formData.ordererName,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          details: formData.details,
          status: 'Requested'
        };

        const { error: dbError } = await supabase.from('orders').insert(newOrderData);
        if (dbError) throw dbError;

        const finalOrder: Order = {
          id: idString,
          unit: unit,
          ordererName: formData.ordererName,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          details: formData.details,
          status: 'Requested',
          createdAt: new Date().toISOString()
        };

        await sendOrderNotification(finalOrder, 'NEW');
        nextIdNumber++;
      }

      onOrderCreated({} as Order);
    } catch (err: any) {
      console.error('Submit Error:', err);
      setError("Gagal menyimpan pesanan: " + (err.message || "Koneksi bermasalah"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Pesan Unit Baru</h2>
        <p className="text-sm text-slate-400">Silahkan isi data pemesanan operasional unit.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-5 md:space-y-6 shadow-2xl relative">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Pemesan</label>
          <input
            type="text"
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base"
            placeholder="Masukan nama anda"
            value={formData.ordererName}
            onChange={e => setFormData({...formData, ordererName: e.target.value})}
            required
          />
        </div>

        <div className="flex flex-col space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Pilih Unit</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {UNIT_TYPES.map(unit => (
              <button
                key={unit}
                type="button"
                onClick={() => toggleUnit(unit as UnitType)}
                className={`px-3 py-3 rounded-xl border text-xs md:text-sm font-bold transition-all duration-200 ${
                  formData.selectedUnits.includes(unit as UnitType)
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tanggal Pelaksanaan</label>
          <input
            type="date"
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base cursor-pointer"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Jam Mulai</label>
            <input
              type="time"
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base cursor-pointer"
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
              required
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Jam Selesai</label>
            <input
              type="time"
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base cursor-pointer"
              value={formData.endTime}
              onChange={e => setFormData({...formData, endTime: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Detail Pekerjaan</label>
          <textarea
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none h-24 resize-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base"
            placeholder="Sebutkan lokasi dan jenis pekerjaan..."
            value={formData.details}
            onChange={e => setFormData({...formData, details: e.target.value})}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/10"
        >
          {loading ? <span className="text-sm">Mengirim...</span> : <span className="text-sm uppercase tracking-widest">Kirim Permintaan</span>}
        </button>
      </form>
    </div>
  );
};

export default NewOrder;
