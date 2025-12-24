
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
        })
        .eq('id', formData.id);

      if (dbError) throw dbError;

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
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini? ID tidak akan bisa digunakan kembali.")) return;

    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from('orders')
        .update({ status: 'Canceled' })
        .eq('id', formData.id);

      if (dbError) throw dbError;

      const canceledOrder = { ...formData, status: 'Canceled' as const };
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
        <h2 className="text-3xl font-bold text-white">Ubah Pesanan</h2>
        <p className="text-slate-400">Pilih ID Pesanan untuk melakukan perubahan data.</p>
      </header>

      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-slate-300">Pilih ID Pesanan</label>
          <select
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none"
            value={selectedId}
            onChange={e => handleSelect(e.target.value)}
          >
            <option value="">-- Pilih ID REQ --</option>
            {availableOrders.map(o => <option key={o.id} value={o.id}>{o.id} - {o.unit} ({o.ordererName})</option>)}
          </select>
        </div>

        {formData && (
          <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-300">Nama Pemesan</label>
              <input
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none"
                value={formData.ordererName}
                onChange={e => setFormData({ ...formData, ordererName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-300">Unit</label>
                <select
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value as UnitType })}
                >
                  {UNIT_TYPES.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-300">ID Pesanan</label>
                <input
                  disabled
                  className="bg-slate-800/30 border border-slate-800 text-slate-500 rounded-xl px-4 py-3 outline-none"
                  value={formData.id}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-300">Tanggal</label>
                <input
                  type="date"
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-slate-300">Mulai (WITA)</label>
                  <input
                    type="time"
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-slate-300">Selesai (WITA)</label>
                  <input
                    type="time"
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all"
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
