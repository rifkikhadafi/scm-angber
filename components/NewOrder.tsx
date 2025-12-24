
import React, { useState } from 'react';
import { Order, UnitType } from '../types';
import { UNIT_TYPES } from '../constants';
import { sendOrderNotification } from '../services/whatsappService';

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

    // Validate if end time is after start time
    if (newEnd <= newStart) {
      setError("Jam selesai harus lebih besar dari jam mulai.");
      return true;
    }

    return orders.some(existing => {
      // Only check conflicts for the same unit, same date, and non-closed status
      if (
        existing.unit === formData.unit && 
        existing.date === formData.date && 
        existing.status !== 'Closed'
      ) {
        const existingStart = timeToMinutes(existing.startTime);
        const existingEnd = timeToMinutes(existing.endTime);

        // Standard overlap logic: (StartA < EndB) && (StartB < EndA)
        return newStart < existingEnd && existingStart < newEnd;
      }
      return false;
    });
  };

  const handleChange = (field: string, value: string) => {
    setError(null); // Clear error on any change
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check for schedule conflicts
    if (checkOverlap()) {
      // If end time validation failed, error is already set. 
      // Otherwise, set the custom rejection message.
      if (!error) {
        setError("Mohon maaf, terdapat pesanan lain yang akan/sedang dikerjakan. Silahkan informasikan ke pihak SCM untuk tindak lanjutnya.");
      }
      return;
    }

    setLoading(true);

    try {
      const nextId = `REQ-${String(orders.length + 1).padStart(5, '0')}`;
      const newOrder: Order = {
        ...formData,
        id: nextId,
        status: 'Requested',
        createdAt: new Date().toISOString()
      };

      await sendOrderNotification(newOrder, 'NEW');
      onOrderCreated(newOrder);
    } catch (err) {
      setError("Gagal mengirim pesanan. Silakan coba lagi.");
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

      <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-5 md:space-y-6 shadow-2xl relative overflow-hidden">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm leading-relaxed font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Pilih Unit</label>
          <select
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 md:py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
            value={formData.unit}
            onChange={e => handleChange('unit', e.target.value)}
          >
            {UNIT_TYPES.map(unit => <option key={unit} value={unit} className="bg-slate-900">{unit}</option>)}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Tanggal Pelaksanaan</label>
          <input
            type="date"
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 md:py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            value={formData.date}
            onChange={e => handleChange('date', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Jam Mulai (WITA)</label>
            <input
              type="time"
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 md:py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              value={formData.startTime}
              onChange={e => handleChange('startTime', e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Jam Selesai (WITA)</label>
            <input
              type="time"
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 md:py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              value={formData.endTime}
              onChange={e => handleChange('endTime', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-xs md:text-sm font-bold text-slate-500 uppercase">Detail Pekerjaan</label>
          <textarea
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 md:py-3 focus:ring-2 focus:ring-blue-500/50 outline-none h-32 md:h-28 resize-none transition-all"
            placeholder="Lokasi dan jenis pekerjaan..."
            value={formData.details}
            onChange={e => handleChange('details', e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span>Kirim Permintaan Unit</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewOrder;
