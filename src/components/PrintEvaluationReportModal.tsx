import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Check, 
  Copy, 
  Award, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  User, 
  Building, 
  Sparkles,
  Loader2,
  FileCheck
} from 'lucide-react';
import { Assessment, StudentSubmission, KKTPKategori, EvaluationItem, StudentAnswer } from '../types';
import { determineKKTPKategori, generateERaporNarrative } from '../data/kurikulumMerdekaData';
import { 
  generateEvaluationReportWord, 
  exportElementToPdf, 
  triggerReliablePrint, 
  sanitizeFilename 
} from '../utils/exportReport';

interface PrintEvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: StudentSubmission | null;
  assessment?: Assessment | null;
}

export const PrintEvaluationReportModal: React.FC<PrintEvaluationReportModalProps> = ({
  isOpen,
  onClose,
  submission,
  assessment
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');
  const [copiedNarrative, setCopiedNarrative] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  if (!isOpen || !submission) return null;

  const evalData = submission.evaluation;
  const finalScore = evalData ? evalData.skorAkhir : 80;
  const kktpKategori: KKTPKategori = evalData?.kktpKategori || determineKKTPKategori(finalScore);
  const narrative = evalData?.deskripsieRapor || generateERaporNarrative(
    submission.studentName,
    assessment?.config.tujuanPembelajaran || 'asesmen kontekstual',
    finalScore,
    kktpKategori
  );

  const formattedDate = new Date(submission.timestamp || Date.now()).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mataPelajaran = assessment?.config.mataPelajaran || 'Mata Pelajaran';
  const fase = assessment?.config.fase || 'Fase C / D';
  const jenjang = assessment?.config.jenjang || 'SD / SMP';
  const teacherName = (assessment?.config as any)?.namaGuru || 'Guru Pengampu';

  // Handle direct print
  const handlePrint = () => {
    setPrintNotice('Mengirim dokumen ke dialog cetak browser...');
    const res = triggerReliablePrint('evaluation-printable-report');
    if (!res.success && res.error) {
      setPrintNotice(res.error);
    } else {
      setTimeout(() => setPrintNotice(null), 4000);
    }
  };

  // Handle PDF Export
  const handleSavePdf = async () => {
    try {
      setIsExportingPdf(true);
      setPdfProgressText('Menyiapkan halaman PDF...');
      const fileName = `Rapor_Evaluasi_${sanitizeFilename(submission.studentName)}_${sanitizeFilename(submission.assessmentTitle || 'Asesmen')}.pdf`;
      await exportElementToPdf('evaluation-printable-report', fileName, (status) => {
        setPdfProgressText(status);
      });
      setPrintNotice('✓ Berkas PDF berhasil diunduh!');
      setTimeout(() => setPrintNotice(null), 3500);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setPrintNotice('Gagal mengekspor PDF. Silakan gunakan Simpan Word (.doc) sebagai alternatif.');
    } finally {
      setIsExportingPdf(false);
      setPdfProgressText('');
    }
  };

  // Handle Word Export
  const handleSaveWord = () => {
    try {
      generateEvaluationReportWord(submission, assessment);
      setPrintNotice('✓ Berkas Microsoft Word (.doc) berhasil diunduh!');
      setTimeout(() => setPrintNotice(null), 3500);
    } catch (err: any) {
      console.error('Word export error:', err);
      setPrintNotice('Gagal mengekspor berkas Word.');
    }
  };

  // Copy narrative
  const handleCopyNarrative = () => {
    navigator.clipboard.writeText(narrative);
    setCopiedNarrative(true);
    setTimeout(() => setCopiedNarrative(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:max-h-none print:w-full flex flex-col">
        {/* Floating action bar (hidden on print) */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cetak & Ekspor Rapor Evaluasi Siswa</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {submission.studentName} • {submission.studentClass} • {mataPelajaran}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Print Button */}
            <button
              id="btn-modal-print-direct"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              title="Cetak langsung menggunakan printer atau dialog cetak browser"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
              <span>Cetak / Print</span>
            </button>

            {/* Save PDF Button */}
            <button
              id="btn-modal-save-pdf"
              type="button"
              onClick={handleSavePdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              title="Unduh langsung sebagai dokumen PDF (.pdf)"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{pdfProgressText || 'Memproses PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Simpan PDF (.pdf)</span>
                </>
              )}
            </button>

            {/* Save Word Button */}
            <button
              id="btn-modal-save-word"
              type="button"
              onClick={handleSaveWord}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              title="Unduh berkas Microsoft Word (.doc) yang dapat diedit"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Simpan Word (.doc)</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice/Alert if sandbox or feedback */}
        {printNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between print:hidden">
            <span>{printNotice}</span>
            <button onClick={() => setPrintNotice(null)} className="text-emerald-700 dark:text-emerald-300 font-bold ml-2">×</button>
          </div>
        )}

        {/* Informative helper banner for iframe */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-700">💡 Tips Guru:</span>
            <span>
              Bisa langsung klik <strong>Simpan PDF</strong> untuk arsip raport siswa, atau <strong>Simpan Word</strong> jika ingin mengedit nilai / catatan di Microsoft Word.
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyNarrative}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-[11px] cursor-pointer"
          >
            {copiedNarrative ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copiedNarrative ? 'Tersalin!' : 'Salin Teks e-Rapor'}</span>
          </button>
        </div>

        {/* Printable A4 Report Card Container */}
        <div className="p-6 sm:p-10">
          <div 
            id="evaluation-printable-report"
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-slate-900 font-sans space-y-6 print:border-none print:p-0"
          >
            {/* Header / KOP Rapor Resmi */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase text-slate-900">
                RAPOR EVALUASI ASESMEN KONTEKSTUAL & PENALARAN KRITIS
              </h2>
              <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                KURIKULUM MERDEKA • {jenjang} • {fase}
              </div>
              <p className="text-[11px] text-slate-500">
                Asesmen Terbuka (Open-Book) Berbasis Masalah, Bukti Data & Pengambilan Keputusan
              </p>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-slate-500 font-medium">Nama Siswa</span>
                  <span className="font-bold text-slate-900">: {submission.studentName}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500 font-medium">Kelas / Fase</span>
                  <span className="text-slate-800">: {submission.studentClass} ({fase})</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500 font-medium">Waktu Ujian</span>
                  <span className="text-slate-800">: {formattedDate}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-slate-500 font-medium">Mata Pelajaran</span>
                  <span className="font-semibold text-slate-900">: {mataPelajaran}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500 font-medium">Judul Asesmen</span>
                  <span className="font-semibold text-slate-800">: {submission.assessmentTitle}</span>
                </div>
                {assessment?.config.elemenCP && (
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Elemen CP</span>
                    <span className="text-slate-800">: {assessment.config.elemenCP}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Score & KKTP Summary Block */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
                </span>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-lg sm:text-xl font-bold text-slate-900">
                    {kktpKategori}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    kktpKategori === 'Perlu Bimbingan'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {kktpKategori === 'Perlu Bimbingan' ? 'Belum Tuntas (Remedial)' : 'Mencapai Ketuntasan (Tuntas)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {assessment?.config.tujuanPembelajaran ? `TP: ${assessment.config.tujuanPembelajaran}` : 'Asesmen kemampuan penalaran konteks data'}
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 text-center min-w-[140px] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">SKOR AKHIR</span>
                <div className="text-3xl font-extrabold font-mono text-emerald-700">
                  {finalScore}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </div>
              </div>
            </div>

            {/* E-Rapor Narrative */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950 uppercase tracking-wide text-[11px]">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>Deskripsi Capaian Kompetensi (e-Rapor Kurikulum Merdeka)</span>
              </div>
              <p className="italic text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-emerald-100">
                "{narrative}"
              </p>
            </div>

            {/* General Evaluation Note */}
            {evalData?.catatanUmum && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <strong className="text-slate-800 font-semibold block">Catatan Evaluasi Guru:</strong>
                <p className="text-slate-700 leading-relaxed">{evalData.catatanUmum}</p>
              </div>
            )}

            {/* Detailed per-question section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
                Rincian Evaluasi & Jawaban Siswa per Soal Kasus
              </h3>

              {assessment?.questions.map((q, idx) => {
                const ans = submission.answers?.[q.id] as StudentAnswer | undefined;
                const qEval = evalData?.evaluasiPerSoal?.[q.id] as EvaluationItem | undefined;
                const score = qEval ? qEval.persentase : 80;
                const isFlagged = qEval?.integrityWarning?.isSuspicious || ans?.copyPasteDetected;

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-900">
                        Soal Kasus #{idx + 1}: {q.judulKasus}
                      </span>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        Skor: {score}/100
                      </span>
                    </div>

                    {isFlagged && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span><strong>Catatan Guru:</strong> Terindikasi penempelan teks/kemiripan dengan sumber eksternal.</span>
                      </div>
                    )}

                    {/* Student Answers Table */}
                    <div className="text-xs space-y-1.5">
                      <div className="p-2 rounded bg-slate-50 border border-slate-150">
                        <span className="font-semibold text-slate-700 block text-[11px]">1. Keputusan / Solusi Siswa:</span>
                        <span className="text-slate-900">{ans?.jawabanSaya || '(Tidak diisi)'}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-150">
                        <span className="font-semibold text-emerald-800 block text-[11px]">2. Bukti Kasus yang Digunakan:</span>
                        <span className="text-slate-900 font-medium">{ans?.buktiDigunakan || '(Tidak menyertakan bukti spesifik)'}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-150">
                        <span className="font-semibold text-slate-700 block text-[11px]">3. Alasan / Penalaran:</span>
                        <span className="text-slate-900">{ans?.alasanSaya || '(Tidak menyertakan alasan)'}</span>
                      </div>
                    </div>

                    {/* Rubric scores */}
                    <div className="text-[11px] grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                      <div className="p-1.5 rounded bg-slate-100 text-center">
                        <span className="text-slate-500 block text-[10px]">Pemahaman</span>
                        <strong className="text-slate-800">{qEval?.aspekSkor?.pemahamanMasalah ?? 3}/4</strong>
                      </div>
                      <div className="p-1.5 rounded bg-slate-100 text-center">
                        <span className="text-slate-500 block text-[10px]">Bukti</span>
                        <strong className="text-slate-800">{qEval?.aspekSkor?.penggunaanBukti ?? 3}/4</strong>
                      </div>
                      <div className="p-1.5 rounded bg-slate-100 text-center">
                        <span className="text-slate-500 block text-[10px]">Penalaran</span>
                        <strong className="text-slate-800">{qEval?.aspekSkor?.penalaran ?? 3}/4</strong>
                      </div>
                      <div className="p-1.5 rounded bg-slate-100 text-center">
                        <span className="text-slate-500 block text-[10px]">Keputusan</span>
                        <strong className="text-slate-800">{qEval?.aspekSkor?.keputusanSolusi ?? 3}/4</strong>
                      </div>
                      <div className="p-1.5 rounded bg-slate-100 text-center">
                        <span className="text-slate-500 block text-[10px]">Refleksi</span>
                        <strong className="text-slate-800">{qEval?.aspekSkor?.refleksi ?? 3}/4</strong>
                      </div>
                    </div>

                    {qEval?.rekomendasi && (
                      <p className="text-[11px] text-slate-600 italic">
                        <strong>Umpan Balik:</strong> {qEval.rekomendasi}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Official Signatures Section */}
            <div className="pt-8 border-t border-slate-300 text-xs">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="space-y-12">
                  <p>
                    Mengetahui,<br />
                    <strong>Orang Tua / Wali Siswa</strong>
                  </p>
                  <p className="font-semibold text-slate-700">
                    ( .................................................... )
                  </p>
                </div>

                <div className="space-y-12">
                  <p>
                    ....................., {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                    <strong>Guru Mata Pelajaran</strong>
                  </p>
                  <div>
                    <p className="font-bold text-slate-900 underline">
                      {teacherName}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      NIP. ........................................
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <span className="text-xs text-slate-500">
            Format resmi sesuai standar Kurikulum Merdeka
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveWord}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Simpan Word (.doc)
            </button>
            <button
              type="button"
              onClick={handleSavePdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Simpan PDF (.pdf)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
