import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Save, 
  HelpCircle, 
  Clock, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Table as TableIcon,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  User,
  Loader2,
  Check,
  RotateCcw,
  FileCheck2,
  X,
  ClipboardPaste,
  ShieldAlert,
  Smartphone,
  Laptop,
  Share2,
  Columns,
  LayoutList,
  Eye,
  EyeOff,
  QrCode as QrIcon
} from 'lucide-react';
import { Assessment, StudentAnswer, StudentSubmission, IntegrityIncident } from '../types';
import { fetchAssessmentByCodeOrId, buildStudentShareUrl } from '../utils/storage';
import { ShareStudentLinkModal } from './ShareStudentLinkModal';
import { DataChartViewer } from './DataChartViewer';

interface AutoSaveDraft {
  assessmentId: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, StudentAnswer>;
  remainingSeconds: number;
  savedAt: string;
}

interface StudentModeProps {
  assessments: Assessment[];
  initialAssessmentId?: string;
  onBack: () => void;
  onSubmitSuccess: (submission: StudentSubmission) => void;
  onShare?: (assessment: Assessment) => void;
}

export const StudentMode: React.FC<StudentModeProps> = ({
  assessments,
  initialAssessmentId,
  onBack,
  onSubmitSuccess,
  onShare
}) => {
  // Step 1: Login / Join Screen
  const [joined, setJoined] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isJoiningLoading, setIsJoiningLoading] = useState<boolean>(false);

  // Device & Layout Optimizations for Android & Laptop
  const [mobileTab, setMobileTab] = useState<'both' | 'case' | 'answers'>('both');
  const [isSplitLayout, setIsSplitLayout] = useState<boolean>(true);
  const [showCaseQuickSheet, setShowCaseQuickSheet] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Step 2: Assessment In Progress
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [showHints, setShowHints] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Auto-Save States
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [detectedDraft, setDetectedDraft] = useState<AutoSaveDraft | null>(null);
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false);
  const [restoredToast, setRestoredToast] = useState<boolean>(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Argument Completeness & Pre-Submission Review Modal
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Copy-Paste / Integrity Warning States
  const [activePasteWarning, setActivePasteWarning] = useState<{
    show: boolean;
    title: string;
    message: string;
    pastedTextSnippet: string;
    charCount: number;
    detectedSource: 'Google / Dokumen Luar' | 'Kunci Jawaban Guru' | 'Teks Soal Kasus';
  } | null>(null);

  // Local Storage Helpers
  const DRAFT_PREFIX = 'asesmen_draft_';

  const getStoredDraft = (assessmentId: string, name?: string): AutoSaveDraft | null => {
    try {
      if (name && name.trim()) {
        const key = `${DRAFT_PREFIX}${assessmentId}_${name.trim().toLowerCase().replace(/\s+/g, '_')}`;
        const val = localStorage.getItem(key);
        if (val) return JSON.parse(val);
      }
      const genericKey = `${DRAFT_PREFIX}${assessmentId}_latest`;
      const genericVal = localStorage.getItem(genericKey);
      if (genericVal) return JSON.parse(genericVal);
    } catch (e) {
      console.warn('Gagal membaca draf dari localStorage:', e);
    }
    return null;
  };

  const persistDraft = (draft: AutoSaveDraft) => {
    try {
      localStorage.setItem(`${DRAFT_PREFIX}${draft.assessmentId}_latest`, JSON.stringify(draft));
      if (draft.studentName.trim()) {
        const key = `${DRAFT_PREFIX}${draft.assessmentId}_${draft.studentName.trim().toLowerCase().replace(/\s+/g, '_')}`;
        localStorage.setItem(key, JSON.stringify(draft));
      }
    } catch (e) {
      console.warn('Gagal menyimpan draf ke localStorage:', e);
    }
  };

  const clearStoredDraft = (assessmentId: string, name?: string) => {
    try {
      localStorage.removeItem(`${DRAFT_PREFIX}${assessmentId}_latest`);
      if (name && name.trim()) {
        const key = `${DRAFT_PREFIX}${assessmentId}_${name.trim().toLowerCase().replace(/\s+/g, '_')}`;
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Gagal menghapus draf:', e);
    }
  };

  // Argument Completeness Logic (4 Pilar Penalaran Kritis)
  const getQuestionCompleteness = (ans?: StudentAnswer) => {
    if (!ans) {
      return {
        hasDecision: false,
        hasEvidence: false,
        hasDataDigits: false,
        hasReason: false,
        hasReflection: false,
        score: 0,
        isComplete: false
      };
    }

    const hasDecision = (ans.jawabanSaya || '').trim().length >= 8;
    const buktiText = (ans.buktiDigunakan || '').trim();
    const hasEvidence = buktiText.length >= 8;
    // Cek apakah siswa menyertakan bukti numerik atau terminologi data
    const hasDataDigits = /\d+|%|persen|tabel|selisih|rata-rata|kwh|ton|kg|orang|rupiah|rp/i.test(buktiText);
    const hasReason = (ans.alasanSaya || '').trim().length >= 10;
    const hasReflection = (ans.refleksiSaya || '').trim().length >= 8;

    let score = 0;
    if (hasDecision) score++;
    if (hasEvidence) score++;
    if (hasReason) score++;
    if (hasReflection) score++;

    return {
      hasDecision,
      hasEvidence,
      hasDataDigits,
      hasReason,
      hasReflection,
      score,
      isComplete: score === 4
    };
  };

  // Initialize with URL params or passed assessment
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCode = urlParams.get('code') || urlParams.get('kode') || urlParams.get('id') || urlParams.get('assessmentId');

      if (urlCode) {
        const cleanCode = urlCode.trim();
        setAccessCode(cleanCode);

        // Check in current loaded assessments
        const match = assessments.find(
          a => (a.kodeAkses && a.kodeAkses.toUpperCase().replace(/\s+/g, '') === cleanCode.toUpperCase().replace(/\s+/g, '')) ||
               (a.id && a.id.toLowerCase() === cleanCode.toLowerCase())
        );

        if (match) {
          setSelectedAssessment(match);
          setAccessCode(match.kodeAkses);
          setStudentClass(`${match.config.jenjang} Kelas ${match.config.kelas}`);
        } else {
          // Asynchronously fetch from server
          fetchAssessmentByCodeOrId(cleanCode).then(remote => {
            if (remote) {
              setSelectedAssessment(remote);
              setAccessCode(remote.kodeAkses);
              setStudentClass(`${remote.config.jenjang} Kelas ${remote.config.kelas}`);
            }
          });
        }
        return;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    if (initialAssessmentId) {
      const match = assessments.find(a => a.id === initialAssessmentId);
      if (match) {
        setSelectedAssessment(match);
        setAccessCode(match.kodeAkses);
        setStudentClass(`${match.config.jenjang} Kelas ${match.config.kelas}`);
      }
    } else if (assessments.length > 0) {
      // prefill with first active
      const first = assessments[0];
      setSelectedAssessment(first);
      setAccessCode(first.kodeAkses);
      setStudentClass(`${first.config.jenjang} Kelas ${first.config.kelas}`);
    }
  }, [initialAssessmentId, assessments]);

  // Timer countdown
  useEffect(() => {
    if (!joined || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [joined, remainingSeconds]);

  // Auto-Save Effect (Debounced to localStorage)
  useEffect(() => {
    if (!joined || !selectedAssessment) return;

    const hasAnyContent = Object.values(answers).some(
      (a: StudentAnswer) => 
        (a.jawabanSaya || '').trim() || 
        (a.buktiDigunakan || '').trim() || 
        (a.alasanSaya || '').trim() || 
        (a.refleksiSaya || '').trim()
    );
    if (!hasAnyContent) return;

    setAutoSaveStatus('saving');

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      const draft: AutoSaveDraft = {
        assessmentId: selectedAssessment.id,
        studentName: studentName.trim(),
        studentClass: studentClass.trim(),
        answers,
        remainingSeconds,
        savedAt: new Date().toISOString()
      };
      persistDraft(draft);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
      setAutoSaveStatus('saved');
    }, 1000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [answers, joined, remainingSeconds, selectedAssessment, studentName, studentClass]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    const cleanInput = accessCode.trim();
    if (!cleanInput) {
      setJoinError('Silakan masukkan kode asesmen terlebih dahulu.');
      return;
    }

    setIsJoiningLoading(true);

    const cleanUpper = cleanInput.toUpperCase().replace(/\s+/g, '');
    let found = assessments.find(
      a => (a.kodeAkses && a.kodeAkses.toUpperCase().replace(/\s+/g, '') === cleanUpper) ||
           (a.id && a.id.toLowerCase() === cleanInput.toLowerCase())
    );

    if (!found) {
      // Async lookup from server API to support multiple devices (Android & Laptop)
      found = await fetchAssessmentByCodeOrId(cleanInput) || undefined;
    }

    setIsJoiningLoading(false);

    if (!found) {
      setJoinError(`Kode asesmen "${cleanInput}" tidak ditemukan. Pastikan kode benar atau gunakan link yang dibagikan guru.`);
      return;
    }

    setSelectedAssessment(found);
    setAccessCode(found.kodeAkses);

    // Check for existing draft in localStorage
    const draft = getStoredDraft(found.id, studentName);
    if (draft && draft.answers) {
      const hasContent = Object.values(draft.answers).some(
        (a: StudentAnswer) => (a.jawabanSaya || '').trim() || (a.buktiDigunakan || '').trim() || (a.alasanSaya || '').trim() || (a.refleksiSaya || '').trim()
      );
      if (hasContent) {
        setDetectedDraft(draft);
        setShowDraftModal(true);
        return;
      }
    }

    // Start fresh
    startFreshSession(found);
  };

  const startFreshSession = (asm: Assessment) => {
    setRemainingSeconds((asm.config.waktuPengerjaan || 40) * 60);

    const initAnswers: Record<string, StudentAnswer> = {};
    asm.questions.forEach(q => {
      initAnswers[q.id] = {
        questionId: q.id,
        jawabanSaya: '',
        buktiDigunakan: '',
        alasanSaya: '',
        refleksiSaya: ''
      };
    });
    setAnswers(initAnswers);
    setJoined(true);
  };

  const handleRestoreDraft = () => {
    if (!detectedDraft || !selectedAssessment) return;
    setAnswers(detectedDraft.answers);
    if (detectedDraft.studentName) setStudentName(detectedDraft.studentName);
    if (detectedDraft.studentClass) setStudentClass(detectedDraft.studentClass);
    setRemainingSeconds(
      detectedDraft.remainingSeconds > 0 
        ? detectedDraft.remainingSeconds 
        : (selectedAssessment.config.waktuPengerjaan || 40) * 60
    );
    try {
      const timeStr = new Date(detectedDraft.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
    } catch {
      setLastSavedTime('sebelumnya');
    }
    setAutoSaveStatus('saved');
    setShowDraftModal(false);
    setJoined(true);
    setRestoredToast(true);
    setTimeout(() => setRestoredToast(false), 4000);
  };

  const handleDiscardDraft = () => {
    if (selectedAssessment) {
      clearStoredDraft(selectedAssessment.id, studentName);
    }
    setShowDraftModal(false);
    if (selectedAssessment) {
      startFreshSession(selectedAssessment);
    }
  };

  const handleUpdateAnswer = (field: keyof StudentAnswer, value: string) => {
    if (!selectedAssessment) return;
    const qId = selectedAssessment.questions[currentQIndex]?.id;
    if (!qId) return;

    setAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        [field]: value
      }
    }));
  };

  const handleCiteDataToEvidence = (citeText: string) => {
    if (!selectedAssessment) return;
    const qId = selectedAssessment.questions[currentQIndex]?.id;
    if (!qId) return;

    setAnswers(prev => {
      const currentAns = prev[qId] || {
        questionId: qId,
        jawabanSaya: '',
        buktiDigunakan: '',
        alasanSaya: '',
        refleksiSaya: ''
      };
      const curr = currentAns.buktiDigunakan || '';
      const formatted = curr.trim() 
        ? `${curr.trim()}\n[Kutipan Data/Grafik]: ${citeText}` 
        : `[Kutipan Data/Grafik]: ${citeText}`;
      return {
        ...prev,
        [qId]: {
          ...currentAns,
          buktiDigunakan: formatted
        }
      };
    });
  };

  const handlePasteDetection = (fieldKey: keyof StudentAnswer, fieldLabel: string, e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!selectedAssessment) return;
    const q = selectedAssessment.questions[currentQIndex];
    if (!q) return;

    const pastedText = e.clipboardData.getData('text') || '';
    const trimmed = pastedText.trim();
    if (trimmed.length < 15) {
      // Small paste, allow without alert
      return;
    }

    // Determine suspected source:
    // 1. Is it matching Teacher Key Answer (Kunci Jawaban Guru)?
    const cleanKey = (q.kunciJawaban || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const keyWords = cleanKey.split(/\s+/).filter(w => w.length > 3);
    const lowerPasted = trimmed.toLowerCase();
    let keyMatches = 0;
    if (keyWords.length > 0) {
      keyMatches = keyWords.filter(w => lowerPasted.includes(w)).length;
    }
    const keyMatchRate = keyWords.length > 0 ? keyMatches / keyWords.length : 0;

    let detectedSource: 'Google / Dokumen Luar' | 'Kunci Jawaban Guru' | 'Teks Soal Kasus' = 'Google / Dokumen Luar';
    let alertTitle = 'Peringatan: Terdeteksi Tempel Teks (Copy-Paste) Luar!';
    let alertMsg = 'Kamu baru saja menempelkan teks panjang ke kolom jawaban. Dalam Asesmen Penalaran Kritis Kurikulum Merdeka, kamu dinilai dari argumen orisinal dan bukti riil dari kasus, bukan teks salinan dari Google atau internet.';

    if (keyMatchRate > 0.45) {
      detectedSource = 'Kunci Jawaban Guru';
      alertTitle = 'Peringatan Keras: Teks Mirip Kunci Jawaban Guru!';
      alertMsg = 'Teks yang kamu tempelkan memiliki kemiripan sangat tinggi dengan kunci jawaban guru. Ingat, sistem merekam riwayat salin-tempel ini dan guru dapat memeriksa orisinalitas penalaranmu.';
    } else if (q.dataInformasi?.konten && q.dataInformasi.konten.toLowerCase().includes(lowerPasted.slice(0, 30))) {
      detectedSource = 'Teks Soal Kasus';
      alertTitle = 'Perhatian: Mengutip Langsung Teks Kasus';
      alertMsg = 'Kamu menyalin potongan teks kasus. Pastikan kamu menjelaskan interpretasimu dan sertakan alasan logis, bukan sekadar memindahkan teks.';
    }

    // Record incident in StudentAnswer
    const incident: IntegrityIncident = {
      type: detectedSource === 'Kunci Jawaban Guru' ? 'key_answer_leak' : 'external_paste',
      field: fieldLabel,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      charCount: trimmed.length,
      previewSnippet: trimmed.length > 60 ? trimmed.substring(0, 60) + '...' : trimmed,
      warningNote: alertTitle
    };

    setAnswers(prev => {
      const currentAns = prev[q.id] || {
        questionId: q.id,
        jawabanSaya: '',
        buktiDigunakan: '',
        alasanSaya: '',
        refleksiSaya: ''
      };

      const existingIncidents = currentAns.pasteIncidents || [];
      return {
        ...prev,
        [q.id]: {
          ...currentAns,
          copyPasteDetected: true,
          suspectedSource: detectedSource,
          pasteIncidents: [...existingIncidents, incident]
        }
      };
    });

    setActivePasteWarning({
      show: true,
      title: alertTitle,
      message: alertMsg,
      pastedTextSnippet: trimmed.length > 80 ? trimmed.substring(0, 80) + '...' : trimmed,
      charCount: trimmed.length,
      detectedSource
    });
  };

  const handleSaveLocal = () => {
    if (!selectedAssessment) return;
    const draft: AutoSaveDraft = {
      assessmentId: selectedAssessment.id,
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
      answers,
      remainingSeconds,
      savedAt: new Date().toISOString()
    };
    persistDraft(draft);
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(timeStr);
    setAutoSaveStatus('saved');
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleInitiateSubmit = () => {
    if (!selectedAssessment) return;
    setShowReviewModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedAssessment) return;
    setShowReviewModal(false);
    setIsSubmitting(true);

    const submissionData: StudentSubmission = {
      id: 'sub-' + Date.now(),
      assessmentId: selectedAssessment.id,
      assessmentTitle: selectedAssessment.judul,
      studentName: studentName.trim() || 'Siswa',
      studentClass: studentClass.trim() || `${selectedAssessment.config.jenjang} Kelas ${selectedAssessment.config.kelas}`,
      timestamp: new Date().toISOString(),
      answers,
      durasiPengerjaanDetik: (selectedAssessment.config.waktuPengerjaan * 60) - remainingSeconds
    };

    try {
      // Call evaluation API
      const res = await fetch('/api/evaluate-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission: submissionData,
          questions: selectedAssessment.questions
        })
      });

      const result = await res.json();
      if (result.success && result.evaluation) {
        submissionData.evaluation = result.evaluation;
      }
    } catch (e) {
      console.error('Error during automatic evaluation, will proceed with submission:', e);
    } finally {
      // Clear draft after successful submission
      clearStoredDraft(selectedAssessment.id, studentName);
      setIsSubmitting(false);
      onSubmitSuccess(submissionData);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ----------------------------------------------------
  // VIEW A: JOIN SCREEN
  // ----------------------------------------------------
  if (!joined) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        {/* Modal / Dialog Pemulihan Draf Tersimpan */}
        {showDraftModal && detectedDraft && selectedAssessment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                  <RotateCcw className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Ditemukan Draf Pengerjaan Sebelumnya
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sistem otomatis menyimpan progres jawabanmu di memori browser ini.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 text-xs space-y-2 text-amber-950 dark:text-amber-200">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Asesmen:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAssessment.judul}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Nama Siswa:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{detectedDraft.studentName || studentName || 'Siswa'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Waktu Simpan Terakhir:</span>
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                    {new Date(detectedDraft.savedAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sisa Waktu Terakhir:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {Math.floor(detectedDraft.remainingSeconds / 60)} Menit {detectedDraft.remainingSeconds % 60} Detik
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Apakah kamu ingin melanjutkan pengerjaan dari draf jawaban yang sudah ada, atau ingin mengulang dari awal (menghapus draf lama)?
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pulihkan Jawaban Saya</span>
                </button>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Mulai Ujian Baru
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Akses Siswa: HP Android & Laptop/PC</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Ruang Asesmen Siswa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Silakan masukkan identitas diri dan kode asesmen yang diberikan oleh guru, atau klik link pengerjaan langsung.
            </p>

            {/* Quick Share / QR Button if an assessment is selected */}
            {selectedAssessment && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Bagikan Link / QR Asesmen Ini</span>
                </button>
              </div>
            )}
          </div>

          {joinError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{joinError}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap Siswa
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Farhan"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-sm focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kelas
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: SD Kelas V atau SMP Kelas VIII-A"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-sm focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kode Asesmen
                </label>
                <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                  <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Diberikan oleh Guru
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="Misal: SD-PLASTIK-45 atau SMP-ENERGI-88"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-sm focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Kode ini dibuat oleh Guru saat membuat soal, atau klik salah satu pilihan di bawah untuk mengisi otomatis.
              </p>
            </div>

            {/* Quick selector for available assessments */}
            {assessments.length > 0 && (
              <div className="pt-1 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/90 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Pilih Cepat Asesmen (Klik untuk Isi Otomatis):
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {assessments.length} Asesmen Tersedia
                  </span>
                </div>
                <div className="space-y-1.5">
                  {assessments.map(asm => {
                    const isSelected = accessCode.trim().toUpperCase() === asm.kodeAkses.toUpperCase();
                    return (
                      <button
                        key={asm.id}
                        type="button"
                        onClick={() => {
                          setAccessCode(asm.kodeAkses);
                          setSelectedAssessment(asm);
                          setStudentClass(`${asm.config.jenjang} Kelas ${asm.config.kelas}`);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-200 font-semibold ring-1 ring-amber-400 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/40 dark:hover:bg-amber-950/30'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="truncate font-semibold text-slate-900 dark:text-white">{asm.judul}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {asm.config.jenjang} Kelas {asm.config.kelas} • {asm.config.mataPelajaran}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 shrink-0">
                          {asm.kodeAkses}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Aturan Pengerjaan Open Book:
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Kamu <strong>boleh</strong> membuka buku, catatan, internet, Google, dan AI. Namun jawabanmu harus mengutip data kasus yang diberikan dan memberikan alasan logismu sendiri.
              </p>
            </div>

            <button
              type="submit"
              disabled={isJoiningLoading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isJoiningLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Membuka Asesmen...</span>
                </>
              ) : (
                <span>Mulai Kerjakan Asesmen</span>
              )}
            </button>
          </form>

          {/* Modal Share if requested from join screen */}
          <ShareStudentLinkModal
            assessment={selectedAssessment}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW B: ACTIVE ASSESSMENT IN PROGRESS
  // ----------------------------------------------------
  if (!selectedAssessment) return null;

  const currentQ = selectedAssessment.questions[currentQIndex];
  const currentAnswer = currentQ ? (answers[currentQ.id] || {
    questionId: currentQ.id,
    jawabanSaya: '',
    buktiDigunakan: '',
    alasanSaya: '',
    refleksiSaya: ''
  }) : null;

  const isLastQuestion = currentQIndex === selectedAssessment.questions.length - 1;
  const isFirstQuestion = currentQIndex === 0;
  const currentCompleteness = getQuestionCompleteness(currentAnswer || undefined);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Restored Draft Alert Toast */}
      {restoredToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Draf jawaban berhasil dipulihkan dari penyimpanan browser. Kamu bisa melanjutkan pengerjaan dengan aman!</span>
          </div>
          <button 
            type="button" 
            onClick={() => setRestoredToast(false)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Student Assessment Header Bar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-200 dark:border-emerald-800">
            {currentQIndex + 1}/{selectedAssessment.questions.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {studentName} ({studentClass})
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {selectedAssessment.kodeAkses}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Soal {currentQIndex + 1} dari {selectedAssessment.questions.length}
            </p>
          </div>
        </div>

        {/* Auto-Save Status, Allowed Sources & Timer */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Auto-save status pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border border-slate-200 dark:border-slate-700">
            {autoSaveStatus === 'saving' ? (
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 font-medium">
                <Loader2 className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Menyimpan draf...</span>
                <span className="sm:hidden">Simpan...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/50 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">
                  {lastSavedTime ? `Tersimpan (${lastSavedTime})` : 'Auto-Save Aktif'}
                </span>
                <span className="sm:hidden">Tersimpan</span>
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Boleh: {(Array.isArray(selectedAssessment.config?.sumberBoleh) ? selectedAssessment.config.sumberBoleh : ['Buku', 'Catatan', 'Internet', 'AI']).join(', ')}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          {/* Share Button in Active Exam */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Bagikan Link atau QR Code Asesmen ini"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Bagikan</span>
          </button>
        </div>
      </div>

      {/* Mobile Android Quick View Switcher Tabs */}
      <div className="md:hidden flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileTab('both')}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
            mobileTab === 'both' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Semua
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('case')}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
            mobileTab === 'case' ? 'bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-300 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Data Kasus & Tabel
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('answers')}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
            mobileTab === 'answers' ? 'bg-white dark:bg-slate-700 text-amber-950 dark:text-amber-200 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Lembar Jawaban ({currentCompleteness.score}/4)
        </button>
      </div>

      {/* QUESTION NAVIGATOR PALETTE */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-2 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Navigasi Soal:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedAssessment.questions.map((q, qIdx) => {
              const qAns = answers[q.id];
              const qComp = getQuestionCompleteness(qAns);
              const hasIntegrityFlag = Boolean(qAns?.copyPasteDetected);
              const isActive = qIdx === currentQIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentQIndex(qIdx);
                    setShowHints(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-500 ring-2 ring-slate-900/20 dark:ring-emerald-500/40 shadow-xs'
                      : hasIntegrityFlag
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 ring-1 ring-rose-400'
                      : qComp.isComplete
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                      : qComp.score > 0
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  <span>Soal {qIdx + 1}</span>
                  {hasIntegrityFlag ? (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-ping inline-block"
                      title="Peringatan Salin-Tempel Terdeteksi"
                    />
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        qComp.isComplete
                          ? 'bg-emerald-500'
                          : qComp.score > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      title={`${qComp.score}/4 Aspek Terpenuhi`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Lengkap (4/4)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Sebagian Terisi
          </span>
          <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Ada Peringatan Copy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> Belum Diisi
          </span>
        </div>
      </div>

      {/* QUESTION CASE CARD */}
      {currentQ && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          {/* Header Soal */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Studi Kasus Soal #{currentQIndex + 1}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {currentQ.judulKasus}
            </h3>
          </div>

          {/* Konteks Cerita */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 space-y-2">
            <span className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              Konteks Kejadian
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentQ.konteks}
            </p>
          </div>

          {/* Data & Informasi Kasus (Tabel / Dialog / Angka) */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Data & Fakta yang Tersedia
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Gunakan data ini untuk menjawab
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {currentQ.dataInformasi.konten}
            </p>

            {/* Visualisasi Grafik & Tabel Data Nyata Siswa (Bar / Line / Pie / Area & Tabel Interaktif) */}
            {(currentQ.dataInformasi.visualisasiGrafik || currentQ.dataInformasi.tabelData) && (
              <DataChartViewer
                grafikData={currentQ.dataInformasi.visualisasiGrafik}
                grafik={currentQ.dataInformasi.visualisasiGrafik}
                tabelData={currentQ.dataInformasi.tabelData}
                judulKasus={currentQ.judulKasus}
                onCiteData={handleCiteDataToEvidence}
                defaultView={
                  currentQ.dataInformasi.visualisasiGrafik && currentQ.dataInformasi.tabelData 
                    ? 'split' 
                    : currentQ.dataInformasi.visualisasiGrafik 
                    ? 'chart' 
                    : 'table'
                }
              />
            )}

            {/* Multi-perspective Quotes */}
            {Array.isArray(currentQ.dataInformasi?.kutipanPihak) && currentQ.dataInformasi.kutipanPihak.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQ.dataInformasi.kutipanPihak.map((pihak, pIdx) => (
                  <div key={pIdx} className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white">
                      <span>{pihak?.nama || 'Narasumber'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{pihak?.peran || ''}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">“{pihak?.pernyataan || ''}”</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Masalah yang Dihadapi */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
              Masalah / Pertanyaan Tantangan:
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {currentQ.pertanyaanUtama}
            </p>
          </div>

          {/* Tombol Scaffolding Hints / Buka Petunjuk */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{showHints ? 'Tutup Petunjuk Pemandu' : 'Buka Petunjuk Pemandu Berpikir'}</span>
            </button>

            {showHints && (
              <div className="mt-3 p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 space-y-2 text-xs text-teal-950 dark:text-teal-200 animate-in fade-in">
                <span className="font-bold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  Pertanyaan Pemandu (Scaffolding):
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-teal-900 dark:text-teal-300">
                  {(Array.isArray(currentQ.petunjukPemandu) ? currentQ.petunjukPemandu : [currentQ.petunjukPemandu || 'Perhatikan data kasus yang disajikan.']).map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Kolom Jawaban Kritis Siswa (Uraian / Multiple Input) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Lembar Jawaban & Penalaran Kritis
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lengkapi 4 pilar argumen di bawah ini untuk memperoleh skor penalaran optimal.
                </p>
              </div>

              {/* Kelengkapan Argumen Counter */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Kelengkapan Argumen:
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                    currentCompleteness.isComplete
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : currentCompleteness.score >= 2
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  {currentCompleteness.score}/4 Aspek ({currentCompleteness.score * 25}%)
                </span>
              </div>
            </div>

            {/* Visual 4-Pillar Completeness Checklist Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 dark:from-slate-800/70 dark:to-emerald-950/40 border border-slate-200 dark:border-slate-700 space-y-3">
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentCompleteness.isComplete
                      ? 'bg-emerald-500'
                      : currentCompleteness.score >= 2
                      ? 'bg-amber-500'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${currentCompleteness.score * 25}%` }}
                />
              </div>

              {/* 4 Aspect Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* 1. Keputusan */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    currentCompleteness.hasDecision
                      ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-600 text-emerald-900 dark:text-emerald-300 shadow-2xs'
                      : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {currentCompleteness.hasDecision ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold block truncate text-[11px]">1. Keputusan</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {currentCompleteness.hasDecision ? 'Terisi ✓' : 'Belum'}
                    </span>
                  </div>
                </div>

                {/* 2. Bukti Data Kasus */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    currentCompleteness.hasEvidence
                      ? currentCompleteness.hasDataDigits
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-200 shadow-2xs ring-1 ring-emerald-300/40 dark:ring-emerald-700/40'
                        : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-600 text-amber-950 dark:text-amber-200 shadow-2xs'
                      : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {currentCompleteness.hasEvidence ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold block truncate text-[11px]">2. Bukti Data</span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">
                      {currentCompleteness.hasEvidence
                        ? currentCompleteness.hasDataDigits
                          ? 'Angka/Data Ada ✓'
                          : 'Perlu angka tabel'
                        : 'Wajib Angka/Tabel'}
                    </span>
                  </div>
                </div>

                {/* 3. Alasan Logis */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    currentCompleteness.hasReason
                      ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-600 text-emerald-900 dark:text-emerald-300 shadow-2xs'
                      : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {currentCompleteness.hasReason ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold block truncate text-[11px]">3. Alasan Logis</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {currentCompleteness.hasReason ? 'Terisi ✓' : 'Belum'}
                    </span>
                  </div>
                </div>

                {/* 4. Refleksi */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    currentCompleteness.hasReflection
                      ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-600 text-emerald-900 dark:text-emerald-300 shadow-2xs'
                      : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {currentCompleteness.hasReflection ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold block truncate text-[11px]">4. Refleksi</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {currentCompleteness.hasReflection ? 'Terisi ✓' : 'Belum'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Form Warning if Copy-Paste Detected on this current question */}
            {currentAnswer?.copyPasteDetected && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-rose-900 text-xs sm:text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>⚠️ Peringatan Integritas: Terdeteksi Salin-Tempel (Copy-Paste) pada Soal Ini</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">
                    Sumber: {currentAnswer.suspectedSource || 'Google / Dokumen Luar'}
                  </span>
                </div>
                <p className="leading-relaxed text-rose-900">
                  Sistem mencatat adanya teks yang disalin dari sumber luar (Google/Internet atau Beranda/Kunci Guru). Ingat bahwa sistem evaluasi kritis Kurikulum Merdeka mengutamakan <strong>argumen orisinal dan kutipan data dari tabel kasus</strong>, bukan hafalan atau teks salinan luar.
                </p>
                {currentAnswer.pasteIncidents && currentAnswer.pasteIncidents.length > 0 && (
                  <div className="text-[11px] bg-white/80 p-2.5 rounded-xl border border-rose-200">
                    <span className="font-semibold text-rose-900 block mb-1">Riwayat penempelan teks terdeteksi:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-rose-800">
                      {currentAnswer.pasteIncidents.map((inc, i) => (
                        <li key={i}>
                          <strong>{inc.field}</strong> pukul {inc.timestamp} ({inc.charCount} karakter): <em>"{inc.previewSnippet}"</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-rose-800 font-medium italic">
                    💡 Rekomendasi: Tuliskan kembali pemahamanmu sendiri dengan mengacu pada angka dalam tabel di atas.
                  </span>
                </div>
              </div>
            )}

            {/* Kolom 1: Jawaban Saya */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>1. Jawaban / Keputusan Pilihan Saya:</span>
                  {currentCompleteness.hasDecision && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                      ✓ Terisi
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Keputusan atau rekomendasi tindakan</span>
              </label>
              <textarea
                rows={3}
                value={currentAnswer?.jawabanSaya || ''}
                onChange={(e) => handleUpdateAnswer('jawabanSaya', e.target.value)}
                onPaste={(e) => handlePasteDetection('jawabanSaya', '1. Jawaban/Keputusan', e)}
                placeholder="Tuliskan jawaban atau keputusan tindakan yang kamu ambil..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Kolom 2: Bukti yang Saya Gunakan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>2. Bukti dari Kasus / Data yang Saya Gunakan:</span>
                  {currentCompleteness.hasEvidence ? (
                    currentCompleteness.hasDataDigits ? (
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                        ✓ Bukti Data Ada
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 rounded font-semibold border border-amber-200 dark:border-amber-800">
                        ⚠ Tambahkan angka dari tabel
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 px-1.5 py-0.2 rounded font-semibold border border-rose-200 dark:border-rose-800">
                      *Wajib diisi
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 font-medium">Wajib sebutkan angka/fakta tabel</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {currentQ.permintaanBukti}
              </p>
              <textarea
                rows={2}
                value={currentAnswer?.buktiDigunakan || ''}
                onChange={(e) => handleUpdateAnswer('buktiDigunakan', e.target.value)}
                onPaste={(e) => handlePasteDetection('buktiDigunakan', '2. Bukti dari Kasus', e)}
                placeholder="Tuliskan data/angka/fakta spesifik dari tabel atau kasus di atas yang mendukung jawabanmu..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Kolom 3: Alasan Saya */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>3. Alasan / Justifikasi Logis Saya:</span>
                  {currentCompleteness.hasReason && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                      ✓ Terisi
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Mengapa bukti tersebut membuktikan pilihanmu</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {currentQ.permintaanAlasan}
              </p>
              <textarea
                rows={3}
                value={currentAnswer?.alasanSaya || ''}
                onChange={(e) => handleUpdateAnswer('alasanSaya', e.target.value)}
                onPaste={(e) => handlePasteDetection('alasanSaya', '3. Alasan/Justifikasi', e)}
                placeholder="Jelaskan alasan logis mengapa bukti tersebut relevan dan mengapa pilihanmu lebih tepat..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Kolom 4: Refleksi Saya */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>4. Refleksi & Keterbatasan Data Saya:</span>
                  {currentCompleteness.hasReflection && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                      ✓ Terisi
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Kelemahan atau data baru yang masih dicari</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {currentQ.refleksi}
              </p>
              <textarea
                rows={2}
                value={currentAnswer?.refleksiSaya || ''}
                onChange={(e) => handleUpdateAnswer('refleksiSaya', e.target.value)}
                onPaste={(e) => handlePasteDetection('refleksiSaya', '4. Refleksi & Keterbatasan', e)}
                placeholder="Apakah jawabanmu dapat berubah jika kondisi berubah? Data apa yang masih belum kamu ketahui?"
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Toolbar at Bottom */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 transition-colors">
        <button
          type="button"
          disabled={isFirstQuestion}
          onClick={() => {
            setCurrentQIndex(prev => Math.max(0, prev - 1));
            setShowHints(false);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Soal Sebelumnya</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveLocal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Simpan manual draf jawaban ke browser"
          >
            <Save className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{savedFeedback ? 'Tersimpan!' : 'Simpan Draf'}</span>
          </button>

          {/* Quick Submit button accessible anytime */}
          {!isLastQuestion && (
            <button
              type="button"
              onClick={handleInitiateSubmit}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cek Kelengkapan</span>
            </button>
          )}
        </div>

        {isLastQuestion ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleInitiateSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengevaluasi Jawaban...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Asesmen</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCurrentQIndex(prev => Math.min(selectedAssessment.questions.length - 1, prev + 1));
              setShowHints(false);
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-sm cursor-pointer"
          >
            <span>Soal Berikutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL CHECKLIST KELENGKAPAN ARGUMEN SEBELUM KIRIM    */}
      {/* ---------------------------------------------------- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold border border-emerald-200 dark:border-emerald-800">
                  <FileCheck2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Cek Kelengkapan Argumen Sebelum Kirim
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pastikan seluruh pilar penalaran kritis telah kamu lengkapi dengan optimal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Questions Checklist Status */}
            <div className="space-y-3">
              {selectedAssessment.questions.map((q, idx) => {
                const qAns = answers[q.id];
                const qComp = getQuestionCompleteness(qAns);

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      qComp.isComplete
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Soal #{idx + 1}:
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                          {q.judulKasus}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          qComp.isComplete
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {qComp.score}/4 Lengkap
                      </span>
                    </div>

                    {/* Breakdown of the 4 aspects */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        {qComp.hasDecision ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        )}
                        <span>Keputusan</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        {qComp.hasEvidence ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        )}
                        <span className={!qComp.hasEvidence ? 'font-bold text-rose-700 dark:text-rose-400' : ''}>
                          Bukti Data
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        {qComp.hasReason ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        )}
                        <span>Alasan Logis</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        {qComp.hasReflection ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        )}
                        <span>Refleksi</span>
                      </div>
                    </div>

                    {/* Warning message if evidence is missing */}
                    {!qComp.hasEvidence && (
                      <p className="text-[11px] text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2 rounded-xl mt-2.5 border border-rose-200 dark:border-rose-800">
                        ⚠️ <strong>Penting:</strong> Kamu belum mengutip data angka dari tabel kasus di soal ini. Asesmen ini sangat menilai penggunaan data nyata!
                      </p>
                    )}

                    {/* Warning indicator if Copy-Paste was detected on this question */}
                    {qAns?.copyPasteDetected && (
                      <div className="text-[11px] text-rose-900 dark:text-rose-200 bg-rose-100/70 dark:bg-rose-950/60 p-2.5 rounded-xl mt-2 border border-rose-300 dark:border-rose-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-rose-950 dark:text-rose-100">
                            Peringatan Integritas: Terdeteksi Salin-Tempel ({qAns.suspectedSource || 'Google / Luar'})
                          </strong>
                          <span>
                            Jawaban ini terdeteksi memuat teks tempelan luar. Guru akan melihat riwayat ini pada lembar evaluasi. Disarankan perbaiki sebelum kirim.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Button to navigate directly to this question if not complete or flagged */}
                    {(!qComp.isComplete || qAns?.copyPasteDetected) && (
                      <div className="pt-2 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentQIndex(idx);
                            setShowReviewModal(false);
                          }}
                          className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-200 underline cursor-pointer"
                        >
                          {qAns?.copyPasteDetected ? 'Periksa & Tulis Ulang Jawaban Mandiri →' : `Buka Soal #${idx + 1} untuk Melengkapi →`}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pedagogical Notice */}
            {selectedAssessment.questions.some(q => !getQuestionCompleteness(answers[q.id]).isComplete) ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  Tips Rubrik Penilaian Terbuka:
                </span>
                <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                  Pada asesmen kontekstual, jawaban tanpa bukti data angka dari tabel akan dinilai sebagai opini belaka. Sebaiknya kamu lengkapi kolom bukti data terlebih dahulu.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-[11px]">
                  Semua 4 pilar penalaran kritis pada seluruh soal telah terisi lengkap. Kamu siap mengumpulkan hasil kerjamu!
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Kembali & Periksa Jawaban
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengevaluasi Jawaban Siswa...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Saya Yakin, Kirim Asesmen Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* POPUP MODAL PERINGATAN SALIN TEMPEL / COPY-PASTE     */}
      {/* ---------------------------------------------------- */}
      {activePasteWarning && activePasteWarning.show && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-rose-300 dark:border-rose-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                <ShieldAlert className="w-7 h-7 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Peringatan Integritas Siswa
                </span>
                <h3 className="text-base sm:text-lg font-bold text-rose-950 dark:text-rose-100 leading-snug">
                  {activePasteWarning.title}
                </h3>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-950 dark:text-rose-100">Terindikasi Sumber:</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200 font-bold border border-rose-300 dark:border-rose-700">
                  {activePasteWarning.detectedSource}
                </span>
              </div>
              <p className="leading-relaxed">
                {activePasteWarning.message}
              </p>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Kutipan teks yang ditempel:</span>
                <p className="italic font-mono">"{activePasteWarning.pastedTextSnippet}"</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">({activePasteWarning.charCount} karakter)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cara Mendapatkan Nilai Maksimal:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                Gunakan kemampuan berpikir kritismu sendiri. Ambil angka atau data dari <strong>Tabel Kasus</strong> di atas, dan jelaskan alasan logis mengapa angka tersebut membuktikan pendapatmu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActivePasteWarning(null)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer border border-transparent dark:border-slate-700"
              >
                Saya Mengerti, Saya Akan Menjawab Secara Orisinal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button on Android Mobile to peek at case & data table without losing typing position */}
      {joined && currentQ && (
        <button
          type="button"
          onClick={() => setShowCaseQuickSheet(true)}
          className="md:hidden fixed bottom-5 right-4 z-40 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-full shadow-lg border border-emerald-400 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          title="Buka Data Kasus & Tabel"
        >
          <TableIcon className="w-4 h-4 text-emerald-100" />
          <span>Intip Data Tabel</span>
        </button>
      )}

      {/* Quick Sheet Drawer Modal for Android Mobile Students */}
      {showCaseQuickSheet && currentQ && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200 transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Data & Konteks Soal #{currentQIndex + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCaseQuickSheet(false)}
                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{currentQ.judulKasus}</h4>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-800/60 text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="font-bold text-sky-900 dark:text-sky-300 block mb-1">Konteks Cerita:</span>
                {currentQ.konteks}
              </div>

              {currentQ.dataInformasi.tabelData && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                      <tr>
                        {currentQ.dataInformasi.tabelData.headers.map((h, i) => (
                          <th key={i} className="p-2.5 border-b border-slate-200 dark:border-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentQ.dataInformasi.tabelData.baris.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{currentQ.dataInformasi.konten}</p>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCaseQuickSheet(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup & Lanjut Menjawab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Modal for Active Assessment */}
      <ShareStudentLinkModal
        assessment={selectedAssessment}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
