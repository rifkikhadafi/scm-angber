
import React, { useRef } from 'react';

const ManualGuide: React.FC = () => {
  const pdfRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-5xl mx-auto pb-32 px-2 sm:px-4">
      {/* Dokumen Manual */}
      <div 
        ref={pdfRef}
        className="bg-white dark:bg-[#0f172a] p-5 sm:p-8 md:p-14 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-500 mt-8"
      >
        {/* HALAMAN 1: COVER */}
        <section className="mb-12 sm:mb-20">
          <div className="relative overflow-hidden p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 blur-3xl"></div>
            <div className="relative z-10 space-y-4 sm:space-y-5">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
                MANUAL BOOK<br/><span className="text-blue-200">SCM ANGBER</span>
              </h1>
              <div className="h-1 w-16 sm:w-20 bg-blue-300/50 rounded-full"></div>
              <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-xl font-medium leading-relaxed">
                Panduan Komprehensif Operasional Manajemen Unit Alat Berat & Transportasi.
              </p>
              <div className="pt-4 sm:pt-6 flex items-center space-x-6 sm:space-x-8">
                <div className="text-left">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-blue-300">Versi</p>
                  <p className="text-sm sm:text-base font-bold">v.1.1 Build 2025</p>
                </div>
                <div className="w-px h-6 sm:h-8 bg-white/20"></div>
                <div className="text-left">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-blue-300">Update</p>
                  <p className="text-sm sm:text-base font-bold">Desember 2025</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HALAMAN 2: ALUR KERJA */}
        <section className="mb-12 sm:mb-20 space-y-8 sm:space-y-10">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-5">
            <div className="space-y-1">
              <h3 className="text-[8px] sm:text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Bab 01</h3>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Alur Kerja Operasional</h2>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 bg-blue-50 dark:bg-blue-500/5 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-500/10 space-y-2 sm:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-base sm:text-lg">1</div>
              <h4 className="font-black text-slate-900 dark:text-white text-[12px] sm:text-sm uppercase">REQUESTED</h4>
              <p className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                Pesanan baru dibuat melalui menu <strong>Order</strong>. Notifikasi otomatis terkirim ke WhatsApp Group.
              </p>
            </div>
            <div className="p-5 sm:p-6 bg-amber-50 dark:bg-amber-500/5 rounded-xl sm:rounded-2xl border border-amber-100 dark:border-amber-500/10 space-y-2 sm:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-base sm:text-lg">2</div>
              <h4 className="font-black text-slate-900 dark:text-white text-[12px] sm:text-sm uppercase">ON PROGRESS</h4>
              <p className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                Status diubah ke <strong>Progress</strong> saat unit mulai bekerja. Sistem mencatat waktu aktual secara otomatis.
              </p>
            </div>
            <div className="p-5 sm:p-6 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl sm:rounded-2xl border border-emerald-100 dark:border-emerald-500/10 space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-base sm:text-lg">3</div>
              <h4 className="font-black text-slate-900 dark:text-white text-[12px] sm:text-sm uppercase">CLOSED</h4>
              <p className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                Setelah selesai, status diubah ke <strong>Closed</strong>. Sistem menghitung efisiensi untuk laporan akhir.
              </p>
            </div>
          </div>
        </section>

        {/* HALAMAN 3: PENANGANAN KENDALA */}
        <section className="mb-12 sm:mb-20 space-y-8 sm:space-y-10">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-5">
            <div className="space-y-1">
              <h3 className="text-[8px] sm:text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Bab 02</h3>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Penanganan Kendala</h2>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch">
            <div className="flex-1 space-y-4 sm:space-y-5">
              <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs sm:text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Status Pending (HOLD)</h4>
                <p className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Digunakan jika terjadi <strong>Breakdown</strong> unit atau kendala cuaca. Unit akan menghilang dari Timeline untuk penjadwalan ulang.
                </p>
              </div>

              <div className="p-5 sm:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-800">
                <h4 className="text-xs sm:text-base font-black text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">Proses Re-schedule</h4>
                <p className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Untuk memulai unit yang Pending, ubah status ke <strong>Requested</strong>. Sistem akan meminta input jam kerja baru secara otomatis.
                </p>
              </div>
            </div>

            <div className="w-full lg:w-72 p-6 bg-slate-900 rounded-2xl sm:rounded-[1.5rem] text-white space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-center">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl"></div>
               <h5 className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Security Note</h5>
               <p className="text-[10px] sm:text-[11px] font-medium leading-relaxed italic text-slate-300">
                 "Integritas data dijamin melalui ID Pesanan yang tetap (Persistence ID) meskipun dilakukan reschedule berulang kali."
               </p>
            </div>
          </div>
        </section>

        {/* HALAMAN 4: VALIDASI */}
        <section className="mb-12 sm:mb-20 space-y-8 sm:space-y-10">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-5">
            <div className="space-y-1">
              <h3 className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Bab 03</h3>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Validasi & Pelaporan</h2>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">Pencegahan Overlap</h4>
              <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border-l-4 border-blue-600">
                <p className="text-[11px] sm:text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Sistem menolak pesanan jika Unit yang sama dijadwalkan pada Jam yang bertabrakan dengan pesanan aktif lainnya.
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">Ekspor Administrasi</h4>
              <p className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Fitur <strong>Export Excel</strong> menghasilkan laporan metadata audit yang mencakup efisiensi waktu operasional.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                 <div className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl border border-emerald-200/50 text-center">
                    <p className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase">Efisiensi</p>
                 </div>
                 <div className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl border border-emerald-200/50 text-center">
                    <p className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase">Audit Ready</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* PENUTUP */}
        <footer className="pt-12 sm:pt-16 border-t-2 border-slate-100 dark:border-slate-800 text-center space-y-6 sm:space-y-8">
           <div className="space-y-2 sm:space-y-3">
              <p className="text-[11px] sm:text-[13px] font-bold text-slate-900 dark:text-white px-4">Diterbitkan oleh Tim Operasional SCM Angber Tanjung Field</p>
              <div className="flex items-center justify-center text-[8px] sm:text-[9px] font-black text-slate-400 tracking-[0.3em] sm:tracking-[0.5em] uppercase">
                 SUPPLY CHAIN MANAGEMENT
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default ManualGuide;
