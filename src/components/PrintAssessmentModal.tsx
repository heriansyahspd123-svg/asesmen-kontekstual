import React, { useState } from 'react';
import { X, Printer, Download, FileText, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Assessment } from '../types';
import { 
  generateAssessmentWord, 
  generateAssessmentPdf, 
  triggerReliablePrint, 
  sanitizeFilename 
} from '../utils/exportReport';

interface PrintAssessmentModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintAssessmentModal: React.FC<PrintAssessmentModalProps> = ({
  assessment,
  isOpen,
  onClose
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  if (!isOpen || !assessment) return null;

  const handlePrint = () => {
    setFeedbackNotice(null);
    const res = triggerReliablePrint('assessment-printable-sheet');
    if (!res.success && res.error) {
      setFeedbackNotice({
        type: 'warning',
        message: 'Dialog cetak dibatasi oleh peramban di mode pratinjau. Kami sarankan langsung klik tombol "Simpan PDF (.pdf)" di sebelah kanan untuk mengunduh dokumen.'
      });
    } else {
      setFeedbackNotice({
        type: 'success',
        message: '✓ Mengirim lembar soal ke dialog cetak...'
      });
      setTimeout(() => setFeedbackNotice(null), 3500);
    }
  };

  const handleSaveWord = () => {
    try {
      generateAssessmentWord(assessment);
      setFeedbackNotice({
        type: 'success',
        message: '✓ Berkas Microsoft Word (.doc) berhasil diunduh!'
      });
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (e) {
      console.error('Word error:', e);
      setFeedbackNotice({
        type: 'error',
        message: 'Gagal mengunduh berkas Word.'
      });
    }
  };

  const handleSavePdf = async () => {
    try {
      setIsExportingPdf(true);
      setPdfStatus('Menyusun PDF vektor...');
      setFeedbackNotice(null);
      const fileName = `Lembar_Soal_${sanitizeFilename(assessment.judul || 'Asesmen')}.pdf`;
      
      // Direct high-fidelity vector PDF generation - 100% reliable
      await generateAssessmentPdf(assessment, fileName, (status) => {
        setPdfStatus(status);
      });

      setFeedbackNotice({
        type: 'success',
        message: '✓ Berkas PDF lembar soal berhasil diunduh!'
      });
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (e) {
      console.error('PDF error:', e);
      setFeedbackNotice({
        type: 'error',
        message: 'Gagal mengekspor PDF. Anda dapat menggunakan tombol Simpan Word (.doc) sebagai alternatif cetak.'
      });
    } finally {
      setIsExportingPdf(false);
      setPdfStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Floating action bar (hidden on print) */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pratinjau Lembar Soal Asesmen</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Format resmi tes tertulis siap cetak atau ekspor PDF</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSaveWord}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Unduh format dokumen Microsoft Word (.doc)"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Simpan Word (.doc)</span>
            </button>

            <button
              onClick={handleSavePdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              title="Unduh langsung sebagai dokumen PDF (.pdf) resmi"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>{pdfStatus || 'Menyiapkan PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Simpan PDF (.pdf)</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              title="Kirim ke dialog cetak / printer peramban"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak / Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Notice */}
        {feedbackNotice && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 print:hidden ${
            feedbackNotice.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
              : feedbackNotice.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}>
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <div className="flex-1">
              <span>{feedbackNotice.message}</span>
            </div>
            {feedbackNotice.type === 'warning' && (
              <button
                type="button"
                onClick={handleSavePdf}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 cursor-pointer"
              >
                Unduh PDF
              </button>
            )}
            <button
              type="button"
              onClick={() => setFeedbackNotice(null)}
              className="text-slate-500 hover:text-slate-800 ml-1 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Printable Document Body - Kept white paper sheet for authentic print WYSIWYG */}
        <div className="p-4 sm:p-6">
          <div id="assessment-printable-sheet" className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-xs space-y-8 text-slate-900 font-sans print:p-4 print:text-black print:border-none print:shadow-none">
          {/* Header Lembaga / KOP */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="text-lg font-bold tracking-tight uppercase">
              LEMBAR ASESMEN KONTEKSTUAL & PENALARAN KRITIS
            </h2>
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
              KURIKULUM MERDEKA • {assessment.config.fase || 'FASE C / D'}
            </div>
            <h3 className="text-base font-semibold">
              {assessment.judul}
            </h3>
            <p className="text-xs text-slate-600">
              Mata Pelajaran: {assessment.config.mataPelajaran} • {assessment.config.jenjang} Kelas {assessment.config.kelas} ({assessment.config.fase || 'Fase'}) • Waktu: {assessment.config.waktuPengerjaan} Menit
            </p>
            {assessment.config.elemenCP && (
              <p className="text-[11px] text-slate-500 italic max-w-2xl mx-auto">
                Elemen CP: {assessment.config.elemenCP}
              </p>
            )}
          </div>

          {/* Form Identitas Siswa */}
          <div className="grid grid-cols-2 gap-4 border border-slate-400 p-3 rounded-lg text-xs">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-24 font-semibold">Nama Siswa</span>
                <span>: ................................................................</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold">Kelas</span>
                <span>: ................................................................</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-24 font-semibold">No. Absen</span>
                <span>: ................................................................</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold">Tanggal</span>
                <span>: ................................................................</span>
              </div>
            </div>
          </div>

          {/* Petunjuk Open Book */}
          <div className="bg-slate-50 border border-slate-300 p-3.5 rounded-lg text-xs space-y-1">
            <span className="font-bold block">PETUNJUK PENGERJAAN (OPEN BOOK):</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>Asesmen ini bersifat <strong>Open Book</strong>. Kamu diperbolehkan membaca catatan, buku teks, internet, maupun AI.</li>
              <li>Namun, jawabanmu dinilai dari <strong>kemampuan menganalisis data kasus yang tersedia</strong>, menyertakan bukti nyata dari tabel kasus, serta memberikan alasan yang logis.</li>
              <li>Tuliskan jawaban pada kolom yang disediakan secara ringkas, jelas, dan berbasis fakta.</li>
            </ol>
          </div>

          {/* Render Questions */}
          <div className="space-y-8">
            {assessment.questions.map((q, idx) => (
              <div key={q.id || idx} className="space-y-4 break-inside-avoid pt-2">
                <div className="font-bold text-sm border-b border-slate-300 pb-1 flex items-center justify-between">
                  <span>SOAL KASUS #{idx + 1}: {q.judulKasus}</span>
                  <span className="text-xs font-normal text-slate-500">[{q.bentukSoal}]</span>
                </div>

                {/* Konteks Cerita */}
                <div className="text-xs leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold block mb-1">Konteks Nyata:</span>
                  {q.konteks}
                </div>

                {/* Data & Tabel Kasus */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold block">Data & Informasi Pengamatan:</span>
                  <p>{q.dataInformasi.konten}</p>

                  {q.dataInformasi?.tabelData && Array.isArray(q.dataInformasi.tabelData.headers) && Array.isArray(q.dataInformasi.tabelData.baris) && (
                    <table className="w-full border-collapse border border-slate-400 text-xs my-2">
                      <thead>
                        <tr className="bg-slate-100">
                          {q.dataInformasi.tabelData.headers.map((h, i) => (
                            <th key={i} className="border border-slate-400 p-1.5 text-left font-bold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {q.dataInformasi.tabelData.baris.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {Array.isArray(row) && row.map((cell, cIdx) => (
                              <td key={cIdx} className="border border-slate-400 p-1.5">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {q.dataInformasi?.visualisasiGrafik && (
                    <div className="border border-slate-300 bg-slate-50/70 p-2.5 rounded text-xs my-2 space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-slate-800">
                        <span>📊 Visualisasi Grafik Data: {q.dataInformasi.visualisasiGrafik.judulGrafik}</span>
                        <span className="text-[10px] font-normal text-slate-500">({(q.dataInformasi.visualisasiGrafik.tipeGrafik || 'bar').toUpperCase()})</span>
                      </span>
                      {q.dataInformasi.visualisasiGrafik.deskripsiGrafik && (
                        <p className="text-[11px] text-slate-600 italic">{q.dataInformasi.visualisasiGrafik.deskripsiGrafik}</p>
                      )}
                      {Array.isArray(q.dataInformasi.visualisasiGrafik.datasets) && (
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                          {q.dataInformasi.visualisasiGrafik.datasets.map((ds, dsIdx) => (
                            <span key={dsIdx} className="bg-white border border-slate-300 px-2 py-0.5 rounded font-mono">
                              <strong>{ds?.nama}:</strong> {Array.isArray(ds?.nilai) ? ds.nilai.join(', ') : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {Array.isArray(q.dataInformasi?.kutipanPihak) && q.dataInformasi.kutipanPihak.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 my-2">
                      {q.dataInformasi.kutipanPihak.map((pihak, pIdx) => (
                        <div key={pIdx} className="border border-slate-300 p-2 rounded text-[11px]">
                          <span className="font-bold">{pihak?.nama} ({pihak?.peran}):</span>
                          <p className="italic">"{pihak?.pernyataan}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pertanyaan Kasus */}
                <div className="space-y-3 text-xs pt-1">
                  <div>
                    <span className="font-bold block">A. Pertanyaan Utama & Keputusan:</span>
                    <p className="font-medium text-slate-800">{q.pertanyaanUtama}</p>
                    <div className="border border-slate-300 rounded min-h-[60px] p-2 mt-1">
                      <span className="text-slate-300 text-[10px]">Tuliskan keputusan/solusi pilihanmu di sini...</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold block">B. Bukti Spesifik dari Kasus:</span>
                    <p className="text-slate-600 text-[11px] italic">{q.permintaanBukti}</p>
                    <div className="border border-slate-300 rounded min-h-[50px] p-2 mt-1">
                      <span className="text-slate-300 text-[10px]">Tuliskan data/angka/fakta bukti di sini...</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold block">C. Alasan / Justifikasi Logis:</span>
                    <p className="text-slate-600 text-[11px] italic">{q.permintaanAlasan}</p>
                    <div className="border border-slate-300 rounded min-h-[60px] p-2 mt-1">
                      <span className="text-slate-300 text-[10px]">Jelaskan alasan mengapa bukti tersebut relevan...</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold block">D. Refleksi Diri:</span>
                    <p className="text-slate-600 text-[11px] italic">{q.refleksi}</p>
                    <div className="border border-slate-300 rounded min-h-[45px] p-2 mt-1">
                      <span className="text-slate-300 text-[10px]">Tuliskan refleksi keterbatasan jawabanmu...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Guru */}
          <div className="pt-6 border-t border-slate-400 flex justify-between text-xs text-slate-500">
            <div>
              <span>Kode Validasi Asesmen: {assessment.kodeAkses}</span>
            </div>
            <div>
              <span>Tanda Tangan Guru: .......................................</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
