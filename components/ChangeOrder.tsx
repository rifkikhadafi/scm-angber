
import React, { useState } from 'react';
import { Order, UnitType } from '../types';
import { UNIT_TYPES } from '../constants';
import { sendOrderNotification } from '../services/whatsappService';
import { supabase } from '../services/supabaseClient';

interface ChangeOrderProps {
  orders: Order[];
  onOrderUpdated: (order: Order) => void;
}

const ChangeOrder: React.FC<ChangeOrderProps> = ({ orders, onOrderUpdated }) => {
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Order | null>(null);

  // Hanya pesanan yang belum selesai atau belum dicancel yang bisa diedit
  const availableOrders = orders.filter(o => o.status !== 'Closed' && o.status !== 'Canceled');

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const order = orders.find(o => o.id === id);
    if (order) setFormData({ ...order });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setLoading(true);

    try {
      const { error: dbError } = await supabase
        .from('orders')
        .update({
          unit: formData.unit,
          orderer_name: formData.ordererName,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          details: formData.details
          // Catatan: Status tidak diupdate di sini sesuai permintaan
        })
        .eq('id', formData.id);

      if (dbError) throw dbError;

      // Kirim notifikasi WhatsApp untuk perubahan detail (bukan status)
      await sendOrderNotification(formData, 'CHANGE');
      onOrderUpdated(formData);
    } catch (err) {
      console.error('Update Error:', err);
      alert('Gagal mengupdate database.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!formData) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pesanan ${formData.id}? ID ini tidak akan bisa digunakan kembali.`)) return;

    setLoading(true);
    try {
      // Mengubah status menjadi Canceled di database
      const { error: dbError } = await supabase
        .from('orders')
        .update({ status: 'Canceled' })
        .eq('id', formData.id);

      if (dbError) throw dbError;

      const canceledOrder = { ...formData, status: 'Canceled' as const };
      
      // Kirim notifikasi pembatalan ke WhatsApp
      await sendOrderNotification(canceledOrder, 'DELETE');
      onOrderUpdated(canceledOrder);
    } catch (err) {
      console.error('Cancel Error:', err);
      alert('Gagal membatalkan pesanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">Edit Pesanan</h2>
        <p className="text-slate-400">Pilih ID Pesanan untuk merubah detail operasional.</p>
      </header>

      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pilih ID Pesanan</label>
          <select
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            value={selectedId}
            onChange={e => handleSelect(e.target.value)}
          >
            <option value="">-- Cari ID REQ --</option>
            {availableOrders.map(o => (
              <option key={o.id} value={o.id} className="bg-slate-900">
                {o.id} - {o.unit} ({o.ordererName})
              </option>
            ))}
          </select>
        </div>

        {formData && (
          <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-slate-800/50">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Pemesan</label>
              <input
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.ordererName}
                onChange={e => setFormData({ ...formData, ordererName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unit</label>
                <select
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none cursor-pointer"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value as UnitType })}
                >
                  {UNIT_TYPES.map(unit => <option key={unit} value={unit} className="bg-slate-900">{unit}</option>)}
                </select>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID (Locked)</label>
                <input
                  disabled
                  className="bg-slate-800/30 border border-slate-800 text-slate-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed"
                  value={formData.id}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tanggal</label>
                <input
                  type="date"
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mulai (WITA)</label>
                  <input
                    type="time"
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selesai (WITA)</label>
                  <input
                    type="time"
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-500/10"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={loading}
                className="py-4 px-6 bg-red-500/10 border border-red-500/30 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-all"
              >
                Hapus Pesanan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangeOrder;
