import React, { useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  Eye, 
  HelpCircle,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { StudentSubmission, Assessment, IntegrityIncident, Question, StudentAnswer, EvaluationItem } from '../types';

interface TeacherIntegrityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: StudentSubmission[];
  assessments: Assessment[];
  onSelectSubmissionToView: (submissionId: string) => void;
}

export const TeacherIntegrityAuditModal: React.FC<TeacherIntegrityAuditModalProps> = ({
  isOpen,
  onClose,
  submissions,
  assessments,
  onSelectSubmissionToView
}) => {
  const [filterSource, setFilterSource] = useState<string>('all'); // all, key_leak, google, clean

  if (!isOpen) return null;

  // Process all submissions to extract flagged incidents
  const incidentRecords = submissions.flatMap(sub => {
    const asm = assessments.find(a => a.id === sub.assessmentId);
    const flags: Array<{
      sub: StudentSubmission;
      questionId: string;
      question?: Question;
      answer: StudentAnswer;
      evalItem?: EvaluationItem;
      source: string;
      incidentCount: number;
      similarity: number;
    }> = [];

    const answerMap = (sub.answers || {}) as Record<string, StudentAnswer>;
    const evalMap = (sub.evaluation?.evaluasiPerSoal || {}) as Record<string, EvaluationItem>;

    Object.entries(answerMap).forEach(([qId, ans]) => {
      const q = asm?.questions.find(item => item.id === qId);
      const ev = evalMap[qId];

      const isFlagged = ans.copyPasteDetected || ev?.integrityWarning?.isSuspicious || ev?.isGenericFlag;
      if (isFlagged) {
        flags.push({
          sub,
          questionId: qId,
          question: q,
          answer: ans,
          evalItem: ev,
          source: ans.suspectedSource || (ans.similarityWithKey && ans.similarityWithKey > 40 ? 'Kunci Jawaban Guru' : 'Google / Luar'),
          incidentCount: ans.pasteIncidents?.length || 1,
          similarity: ans.similarityWithKey || 0
        });
      }
    });

    return flags;
  });

  const totalSubmissions = submissions.length;
  const submissionsWithFlags = submissions.filter(sub => {
    const answerMap = (sub.answers || {}) as Record<string, StudentAnswer>;
    const evalMap = (sub.evaluation?.evaluasiPerSoal || {}) as Record<string, EvaluationItem>;
    return Object.values(answerMap).some(
      (ans: StudentAnswer) => ans.copyPasteDetected || evalMap[ans.questionId]?.integrityWarning?.isSuspicious
    );
  });

  const filteredIncidents = incidentRecords.filter(item => {
    if (filterSource === 'all') return true;
    if (filterSource === 'key_leak') return item.source.toLowerCase().includes('kunci');
    if (filterSource === 'google') return item.source.toLowerCase().includes('google') || item.source.toLowerCase().includes('luar');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Pusat Audit Integritas & Anti Salin-Tempel Guru
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Panel Guru
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Deteksi penempelan teks (Google/Kunci Guru) dan verifikasi bukti data siswa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block mb-0.5">
              Total Pengumpulan
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalSubmissions} <span className="text-xs font-normal text-slate-400">Siswa</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 block mb-0.5">
              Siswa Terindikasi Copy
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {submissionsWithFlags.length}{' '}
              <span className="text-xs font-normal text-rose-700 dark:text-rose-400">
                ({totalSubmissions > 0 ? Math.round((submissionsWithFlags.length / totalSubmissions) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
              Butir Soal Terdampak
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {incidentRecords.length} <span className="text-xs font-normal text-amber-700 dark:text-amber-400">Insiden</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
              Jawaban Orisinal Murni
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {totalSubmissions - submissionsWithFlags.length} <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">Siswa</span>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Saring Sumber:
            </span>
            <button
              type="button"
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterSource === 'all'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Semua Insiden ({incidentRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSource('key_leak')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterSource === 'key_leak'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800'
              }`}
            >
              Mirip Kunci Guru ({incidentRecords.filter(i => i.source.toLowerCase().includes('kunci')).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSource('google')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterSource === 'google'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800'
              }`}
            >
              Google / Ensiklopedia Luar ({incidentRecords.filter(i => i.source.toLowerCase().includes('google') || i.source.toLowerCase().includes('luar')).length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Klik pada baris siswa untuk membuka rapor lengkap
          </span>
        </div>

        {/* INCIDENT TABLE / LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {filteredIncidents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Tidak Ditemukan Indikasi Salin-Tempel</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Semua siswa yang dinilai menunjukkan argumen orisinal berbasis analisis bukti data kasus.
              </p>
            </div>
          ) : (
            filteredIncidents.map((item, idx) => {
              const isKeyLeak = item.source.toLowerCase().includes('kunci');
              return (
                <div
                  key={`${item.sub.id}-${item.questionId}-${idx}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isKeyLeak ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.sub.studentName}
                          </span>
                          <span className="text-[11px] px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                            {item.sub.studentClass}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate block max-w-md">
                          Kasus: <strong>{item.question?.judulKasus || 'Soal Studi Kasus'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        isKeyLeak 
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800' 
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}>
                        {item.source}
                      </span>
                      {item.similarity > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          Kemiripan {item.similarity}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubmissionToView(item.sub.id);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Rapor Siswa</span>
                      </button>
                    </div>
                  </div>

                  {/* Incident Summary & Snippet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Riwayat Penempelan Teks ({item.incidentCount} kali):
                      </span>
                      {item.answer.pasteIncidents && item.answer.pasteIncidents.length > 0 ? (
                        <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                          {item.answer.pasteIncidents.map((inc: IntegrityIncident, i: number) => (
                            <li key={i} className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-0.5">
                                <span>Kolom: {inc.field}</span>
                                <span>Pukul {inc.timestamp} ({inc.charCount} chr)</span>
                              </div>
                              <p className="italic text-slate-800 dark:text-slate-200 font-mono text-[11px] line-clamp-2">
                                "{inc.previewSnippet}"
                              </p>
                              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-medium block mt-0.5">
                                ⚠️ {inc.warningNote}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          Terdeteksi gaya bahasa ensiklopedis umum yang tidak mencantumkan data numerik dari tabel soal.
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300 block">
                        Panduan Tindak Lanjut Guru (Pedagogis):
                      </span>
                      <p className="text-[11px] text-teal-950 dark:text-teal-200 leading-relaxed">
                        {item.evalItem?.integrityWarning?.suggestedTeacherAction || 
                         'Ajak siswa berdialog santai untuk menanyakan alasan di balik jawabannya, dan minta siswa menunjukkan angka dari tabel kasus yang mendukung argumennya.'}
                      </p>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-teal-200 dark:border-teal-700 text-[10px] text-teal-800 dark:text-teal-300">
                        💡 <strong>Pertanyaan Klarifikasi Lisan yang Disarankan:</strong><br />
                        <em>"Coba jelaskan dengan bahasamu sendiri, bagaimana angka pada tabel soal membuktikan usulanmu ini?"</em>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Prinsip Kurikulum Merdeka:</strong> Asesmen penalaran kontekstual bersifat <em>open-resource</em>, namun menuntut orisinalitas dalam mengaitkan fakta lokal kasus.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup Panel Audit
          </button>
        </div>

      </div>
    </div>
  );
};
