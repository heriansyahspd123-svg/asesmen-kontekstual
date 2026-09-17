import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  BarChart2, 
  Calendar, 
  Clock, 
  Download, 
  User, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Sparkles,
  Printer,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import { StudentSubmission, Assessment, KKTPKategori, EvaluationItem, StudentAnswer } from '../types';
import { determineKKTPKategori, generateERaporNarrative } from '../data/kurikulumMerdekaData';
import { TeacherIntegrityAuditModal } from './TeacherIntegrityModal';
import { PrintEvaluationReportModal } from './PrintEvaluationReportModal';
import { 
  generateEvaluationReportWord, 
  exportElementToPdf, 
  sanitizeFilename 
} from '../utils/exportReport';

interface ResultsViewProps {
  submissions: StudentSubmission[];
  assessments: Assessment[];
  onBack: () => void;
  onSelectSubmission?: (sub: StudentSubmission) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  submissions,
  assessments,
  onBack
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string>(
    submissions.length > 0 ? submissions[0].id : ''
  );
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [copiedRapor, setCopiedRapor] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  const activeSubmission = submissions.find(s => s.id === selectedSubId) || (submissions[0] || null);
  const associatedAssessment = activeSubmission 
    ? assessments.find(a => a.id === activeSubmission.assessmentId)
    : null;

  // Count flagged students across all submissions
  const totalFlaggedStudents = submissions.filter(s => 
    Object.values((s.answers || {}) as Record<string, StudentAnswer>).some(
      (ans: StudentAnswer) => ans.copyPasteDetected || s.evaluation?.evaluasiPerSoal?.[ans.questionId]?.integrityWarning?.isSuspicious
    )
  ).length;

  const handleOpenPrintModal = () => {
    setIsPrintModalOpen(true);
  };

  const handleSaveWordDirect = () => {
    if (!activeSubmission) return;
    try {
      generateEvaluationReportWord(activeSubmission, associatedAssessment);
      setQuickNotice('✓ Berkas Word (.doc) rapor berhasil diunduh!');
      setTimeout(() => setQuickNotice(null), 3000);
    } catch (e) {
      console.error(e);
      setQuickNotice('Gagal mengunduh berkas Word.');
    }
  };

  const handleSavePdfDirect = () => {
    if (!activeSubmission) return;
    setIsPrintModalOpen(true);
  };

  if (submissions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
          <BarChart2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Belum Ada Hasil Jawaban Siswa</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Belum ada siswa yang mengumpulkan jawaban asesmen. Cobalah masuk ke Mode Siswa untuk mencoba mengerjakan salah satu studi kasus.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-500 transition-colors cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const evalData = activeSubmission?.evaluation;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              totalFlaggedStudents > 0
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 ring-2 ring-rose-400/30'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${totalFlaggedStudents > 0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span>Audit Salin-Tempel Guru</span>
            {totalFlaggedStudents > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold">
                {totalFlaggedStudents} Siswa Flagged
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
                Aman ✓
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleSaveWordDirect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
            title="Unduh format dokumen Microsoft Word (.doc) yang dapat diedit"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Simpan Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={handleSavePdfDirect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
            title="Pratinjau dan Unduh dokumen PDF (.pdf)"
          >
            <Download className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Simpan PDF (.pdf)</span>
          </button>

          <button
            id="btn-print-rapor"
            type="button"
            onClick={handleOpenPrintModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
            title="Buka Pratinjau Resmi & Dialog Cetak Rapor"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-200" />
            <span>Cetak Rapor Evaluasi</span>
          </button>
        </div>
      </div>

      {/* Quick notice toast */}
      {quickNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>{quickNotice}</span>
          <button onClick={() => setQuickNotice(null)} className="text-emerald-700 dark:text-emerald-400 font-bold ml-2">×</button>
        </div>
      )}

      {/* Submission Selector Tabs */}
      {submissions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {submissions.map((sub, idx) => {
            const isSubFlagged = Object.values((sub.answers || {}) as Record<string, StudentAnswer>).some(
              (ans: StudentAnswer) => ans.copyPasteDetected || sub.evaluation?.evaluasiPerSoal?.[ans.questionId]?.integrityWarning?.isSuspicious
            );

            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubId(sub.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  sub.id === activeSubmission?.id
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                    : isSubFlagged
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{sub.studentName} ({sub.studentClass})</span>
                {isSubFlagged && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Terdeteksi Salin-Tempel" />
                )}
                {sub.evaluation && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 font-mono">
                    {sub.evaluation.skorAkhir}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {activeSubmission && (
        <div className="space-y-6">
          {/* Summary Score Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Laporan Evaluasi Asesmen Berpikir Kritis
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeSubmission.assessmentTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Siswa: {activeSubmission.studentName}
                  </span>
                  <span>•</span>
                  <span>Kelas: {activeSubmission.studentClass}</span>
                  <span>•</span>
                  <span>{new Date(activeSubmission.timestamp).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Total Score Badge & KKTP */}
              {(() => {
                const finalScore = evalData ? evalData.skorAkhir : 80;
                const kktpKategori: KKTPKategori = evalData?.kktpKategori || determineKKTPKategori(finalScore);
                const kktpColors = {
                  'Sangat Baik': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  'Baik': 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                  'Cukup': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  'Perlu Bimbingan': 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                };

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border border-slate-800 text-white flex flex-col justify-between gap-3 shadow-md sm:self-auto self-start min-w-[200px]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                          Skor Akhir Penalaran
                        </span>
                        <div className="text-3xl font-extrabold font-mono tracking-tight">
                          {finalScore}
                          <span className="text-sm font-normal text-slate-400">/100</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Predikat KKTP:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${kktpColors[kktpKategori]}`}>
                        {kktpKategori}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* KKTP & e-Rapor Narrative Section */}
            {(() => {
              const finalScore = evalData ? evalData.skorAkhir : 80;
              const kktpKategori: KKTPKategori = evalData?.kktpKategori || determineKKTPKategori(finalScore);
              const narrative = evalData?.deskripsieRapor || generateERaporNarrative(
                activeSubmission.studentName,
                associatedAssessment?.config.tujuanPembelajaran || 'asesmen kontekstual',
                finalScore,
                kktpKategori
              );

              return (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                        Deskripsi Capaian Siap Salin ke Aplikasi e-Rapor (Kurikulum Merdeka)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(narrative);
                        setCopiedRapor(true);
                        setTimeout(() => setCopiedRapor(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-slate-700 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
                    >
                      {copiedRapor ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Tersalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Salin Narasi e-Rapor</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                    {narrative}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <span><strong>Fase:</strong> {associatedAssessment?.config.fase || 'Fase C / D'}</span>
                    <span>•</span>
                    <span><strong>Elemen CP:</strong> {associatedAssessment?.config.elemenCP || 'Keterampilan Proses'}</span>
                    <span>•</span>
                    <span><strong>Status:</strong> {kktpKategori === 'Perlu Bimbingan' ? 'Belum Mencapai KKTP (Remedial)' : 'Mencapai KKTP (Tuntas)'}</span>
                  </div>
                </div>
              );
            })()}

            {/* General Feedback note */}
            {evalData && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Catatan Evaluasi Kritis Guru & AI:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {evalData.catatanUmum}
                </p>
              </div>
            )}

            {/* Overall Anti-Copy-Paste Integrity Notice if any question was flagged */}
            {(() => {
              const evaluasiMap = (evalData?.evaluasiPerSoal || {}) as Record<string, EvaluationItem>;
              const flaggedQuestions = Object.entries(evaluasiMap).filter(
                ([qId, ev]) => ev.integrityWarning?.isSuspicious || ev.isGenericFlag || activeSubmission.answers[qId]?.copyPasteDetected
              );

              if (flaggedQuestions.length === 0) return null;

              return (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 flex items-start gap-3 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-700 dark:text-rose-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200">
                      Tanda Peringatan Terdeteksi pada {flaggedQuestions.length} Soal Asesmen Siswa
                    </h4>
                    <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed">
                      Sistem mencatat adanya penempelan teks langsung (copy-paste) atau kemiripan kata yang tinggi dengan materi internet/kunci guru tanpa menyertakan fakta/angka studi kasus. Guru disarankan melakukan verifikasi lisan pada soal bersangkutan.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* PER QUESTION BREAKDOWN */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Detail Penilaian Per Soal & Aspek Rubrik
            </h3>

            {associatedAssessment?.questions.map((q, idx) => {
              const ans = activeSubmission.answers[q.id];
              const qEval = evalData?.evaluasiPerSoal?.[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Soal Kasus #{idx + 1}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {q.judulKasus}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {qEval?.integrityWarning?.isSuspicious || qEval?.isGenericFlag || ans?.copyPasteDetected ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs font-bold animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Peringatan Integritas</span>
                        </div>
                      ) : null}

                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        Skor: {qEval?.persentase ?? 80}/100
                      </span>
                    </div>
                  </div>

                  {/* Red/Amber Warning Banner for Copy-Paste from Google or Teacher Key */}
                  {(qEval?.integrityWarning?.isSuspicious || ans?.copyPasteDetected || qEval?.isGenericFlag) && (
                    <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 text-xs text-rose-950 dark:text-rose-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-300 text-sm">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>
                          {qEval?.integrityWarning?.flagTitle || 'Tanda Peringatan: Terdeteksi Salin-Tempel (Copy-Paste) Teks Eksternal'}
                        </span>
                      </div>
                      <p className="leading-relaxed text-rose-900 dark:text-rose-300">
                        {qEval?.integrityWarning?.details || qEval?.genericReason || 'Jawaban terindikasi menyalin teks dari sumber luar tanpa diolah mandiri menggunakan bukti kasus.'}
                      </p>
                      {ans?.pasteIncidents && ans.pasteIncidents.length > 0 && (
                        <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px] space-y-1">
                          <span className="font-bold text-rose-900 dark:text-rose-300 block">Riwayat Kejadian Penempelan Teks:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-rose-800 dark:text-rose-300">
                            {ans.pasteIncidents.map((inc, i) => (
                              <li key={i}>
                                <strong>{inc.field}:</strong> {inc.warningNote} ({inc.charCount} karakter)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {qEval?.integrityWarning?.suggestedTeacherAction && (
                        <div className="text-[11px] bg-rose-100/70 dark:bg-rose-900/40 p-2 rounded-xl text-rose-900 dark:text-rose-200">
                          <strong>Saran Tindakan Guru:</strong> {qEval.integrityWarning.suggestedTeacherAction}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Student Answer Overview */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">1. Jawaban / Keputusan Siswa:</span>
                      <p className="text-slate-900 dark:text-white font-medium bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {ans?.jawabanSaya || '(Tidak diisi)'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 block mb-0.5">2. Bukti dari Kasus yang Digunakan:</span>
                      <p className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {ans?.buktiDigunakan || '(Tidak menyertakan bukti spesifik)'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">3. Alasan / Justifikasi Siswa:</span>
                      <p className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {ans?.alasanSaya || '(Tidak menyertakan alasan)'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">4. Refleksi Siswa:</span>
                      <p className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {ans?.refleksiSaya || '(Tidak mengisi refleksi)'}
                      </p>
                    </div>
                  </div>

                  {/* 5-Aspect Rubric Breakdown (Skala 1-4) */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Pencapaian Rubrik 5 Aspek (Skala 1–4):
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      {[
                        { key: 'pemahamanMasalah', label: 'Pemahaman Masalah', score: qEval?.aspekSkor.pemahamanMasalah || 3 },
                        { key: 'penggunaanBukti', label: 'Penggunaan Bukti', score: qEval?.aspekSkor.penggunaanBukti || 3 },
                        { key: 'penalaran', label: 'Penalaran Logis', score: qEval?.aspekSkor.penalaran || 3 },
                        { key: 'keputusanSolusi', label: 'Keputusan / Solusi', score: qEval?.aspekSkor.keputusanSolusi || 3 },
                        { key: 'refleksi', label: 'Refleksi Kritis', score: qEval?.aspekSkor.refleksi || 3 }
                      ].map(asp => (
                        <div
                          key={asp.key}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1"
                        >
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block line-clamp-1">
                            {asp.label}
                          </span>
                          <div className="flex items-center justify-center gap-1 font-mono font-bold text-base text-slate-900 dark:text-white">
                            <span>{asp.score}</span>
                            <span className="text-xs text-slate-400 font-normal">/4</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                asp.score === 4 ? 'bg-emerald-500' :
                                asp.score === 3 ? 'bg-sky-500' :
                                asp.score === 2 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${(asp.score / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback and Recommendation */}
                  {qEval && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Analisis Evaluator:</span>
                        <p className="text-slate-600 dark:text-slate-300">{qEval.alasanSkor}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                        <span className="font-bold text-teal-900 dark:text-teal-200 block mb-1">Rekomendasi untuk Siswa:</span>
                        <p className="text-teal-800 dark:text-teal-300">{qEval.rekomendasi}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher Integrity Audit Modal */}
      <TeacherIntegrityAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        submissions={submissions}
        assessments={assessments}
        onSelectSubmissionToView={(subId) => {
          setSelectedSubId(subId);
        }}
      />

      {/* Official Student Evaluation Report Print & Export Modal */}
      <PrintEvaluationReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        submission={activeSubmission}
        assessment={associatedAssessment}
      />
    </div>
  );
};
