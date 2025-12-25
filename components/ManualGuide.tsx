
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ManualGuide: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    
    setIsGenerating(true);
    try {
      window.scrollTo(0, 0);
      
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        logging: false,
        windowWidth: 1024, // Gunakan lebar standar untuk konsistensi PDF
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('MANUAL_BOOK_SCM_ANGBER_V1.1.pdf');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Maaf, terjadi kendala saat membuat PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-32 px-2 sm:px-4">
      {/* Action Bar */}
      <div className="sticky top-4 sm:top-6 z-50 flex justify-end mb-6 sm:mb-8 print:hidden">
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className={`group flex items-center space-x-2 sm:space-x-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm shadow-[0_20px_50px_rgba(37,99,235,0.2)] transition-all active:scale-95 ${
            isGenerating 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>PROSES...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="tracking-widest uppercase">Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Dokumen Manual */}
      <div 
        ref={pdfRef}
        className="bg-white dark:bg-[#0f172a] p-5 sm:p-8 md:p-14 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-500"
      >
        {/* HALAMAN 1: COVER */}
        <section className="mb-12 sm:mb-20">
          <div className="relative overflow-hidden p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 blur-3xl"></div>
            <div className="relative z-10 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em]">Integrated Logistics System</span>
              </div>
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
               <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                  <span className="text-[8px] sm:text-[9px] font-bold">SCM Security</span>
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                     <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" /></svg>
                  </div>
               </div>
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
           <div className="flex justify-center gap-8 sm:gap-12">
              <div className="text-center space-y-1">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                 </div>
                 <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400">Cloud Sync</p>
              </div>
              <div className="text-center space-y-1">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                 </div>
                 <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400">Support</p>
              </div>
           </div>
           
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
