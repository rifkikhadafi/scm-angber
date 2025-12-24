
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
    unit: UNIT_TYPES[0] as UnitType,
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    details: ''
  });

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const checkOverlap = () => {
    const newStart = timeToMinutes(formData.startTime);
    const newEnd = timeToMinutes(formData.endTime);

    if (newEnd <= newStart) {
      setError("Jam selesai harus lebih besar dari jam mulai.");
      return true;
    }

    return orders.some(existing => {
      if (
        existing.unit === formData.unit && 
        existing.date === formData.date && 
        existing.status !== 'Closed'
      ) {
        const existingStart = timeToMinutes(existing.startTime);
        const existingEnd = timeToMinutes(existing.endTime);
        return newStart < existingEnd && existingStart < newEnd;
      }
      return false;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (checkOverlap()) {
      if (!error) setError("Mohon maaf, jadwal sudah terisi. Silahkan hubungi SCM.");
      return;
    }

    setLoading(true);

    try {
      const nextId = `REQ-${String(Date.now()).slice(-5)}`; // ID Unik sederhana
      const newOrder: Order = {
        ...formData,
        id: nextId,
        status: 'Requested',
        createdAt: new Date().toISOString()
      };

      // 1. Simpan ke Supabase
      const { error: dbError } = await supabase.from('orders').insert({
        id: newOrder.id,
        unit: newOrder.unit,
        date: newOrder.date,
        start_time: newOrder.startTime,
        end_time: newOrder.endTime,
        details: newOrder.details,
        status: newOrder.status
      });

      if (dbError) throw dbError;

      // 2. Kirim Notifikasi WA (Database First)
      await sendOrderNotification(newOrder, 'NEW');
      onOrderCreated(newOrder);
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
        <p className="text-sm md:text-base text-slate-400">Cek ketersediaan di Schedule sebelum memesan.</p>
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
          <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Pilih Unit</label>
          <select
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 md:py-3 outline-none"
            value={formData.unit}
            onChange={e => setFormData({...formData, unit: e.target.value as UnitType})}
          >
            {UNIT_TYPES.map(unit => <option key={unit} value={unit} className="bg-slate-900">{unit}</option>)}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Tanggal Pelaksanaan</label>
          <input
            type="date"
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Jam Mulai</label>
            <input
              type="time"
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none"
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
              required
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Jam Selesai</label>
            <input
              type="time"
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none"
              value={formData.endTime}
              onChange={e => setFormData({...formData, endTime: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Detail Pekerjaan</label>
          <textarea
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none h-28 resize-none"
            placeholder="Lokasi dan jenis pekerjaan..."
            value={formData.details}
            onChange={e => setFormData({...formData, details: e.target.value})}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? <span>Mengirim...</span> : <span>Kirim Permintaan</span>}
        </button>
      </form>
    </div>
  );
};

export default NewOrder;
