
import React, { useState } from 'react';
import { RegistrationData, FormStatus } from '../types';
import { GENDER_OPTIONS } from '../constants';
import { sendWhatsAppNotification } from '../services/whatsappService';
import { Input } from './ui/Input';

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    gender: GENDER_OPTIONS[0],
    age: ''
  });

  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(FormStatus.SUBMITTING);
    setErrorMessage('');

    try {
      const response = await sendWhatsAppNotification(formData);
      
      if (response.status) {
        setStatus(FormStatus.SUCCESS);
        setFormData({
          fullName: '',
          gender: GENDER_OPTIONS[0],
          age: ''
        });
      } else {
        setStatus(FormStatus.ERROR);
        setErrorMessage(response.reason || 'Gagal mengirim data ke WhatsApp.');
      }
    } catch (err) {
      setStatus(FormStatus.ERROR);
      setErrorMessage('Terjadi kesalahan sistem saat menghubungi API.');
    }
  };

  if (status === FormStatus.SUCCESS) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 p-8 rounded-3xl text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 text-green-400 rounded-full mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">Berhasil!</h2>
        <p className="text-slate-400 max-w-sm mx-auto">
          Terima kasih. Data Anda telah terkirim ke WhatsApp Group.
        </p>
        <button
          onClick={() => setStatus(FormStatus.IDLE)}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          Isi Form Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full"></div>
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-2">Formulir Pendaftaran</h2>
        <p className="text-slate-400 mb-8">Silakan isi data diri Anda di bawah ini.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nama Lengkap"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Ketik nama lengkap Anda"
            required
            disabled={status === FormStatus.SUBMITTING}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Jenis Kelamin</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={status === FormStatus.SUBMITTING}
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                {GENDER_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            
            <Input
              label="Umur"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Contoh: 25"
              required
              min="1"
              max="120"
              disabled={status === FormStatus.SUBMITTING}
            />
          </div>

          {status === FormStatus.ERROR && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === FormStatus.SUBMITTING}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-xl flex items-center justify-center space-x-2 ${
              status === FormStatus.SUBMITTING 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]'
            }`}
          >
            {status === FormStatus.SUBMITTING ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Mengirim...</span>
              </>
            ) : (
              <span>Kirim Sekarang</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
