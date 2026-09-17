import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  Copy, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Table as TableIcon,
  MessageSquare,
  Sparkles,
  Sliders,
  Award,
  Smartphone,
  Laptop,
  QrCode as QrIcon,
  Check
} from 'lucide-react';
import { Assessment, Question, RubrikPenilaian } from '../types';
import { ShareStudentLinkModal } from './ShareStudentLinkModal';
import { buildStudentShareUrl } from '../utils/storage';

interface AssessmentEditorProps {
  assessment: Assessment;
  onBack: () => void;
  onSave: (updated: Assessment) => void;
  onPrint: (assessment: Assessment) => void;
  onTestAsStudent: (assessmentId: string) => void;
  onShare?: (assessment: Assessment) => void;
}

const REGENERATE_MODIFIERS = [
  'lebih kontekstual',
  'lebih menantang',
  'lebih sederhana',
  'lebih dekat dengan kehidupan siswa',
  'lebih banyak data',
  'lebih banyak argumentasi',
  'lebih banyak refleksi',
  'gunakan konteks lokal',
  'ubah menjadi studi kasus',
  'ubah menjadi HOTS'
];

export const AssessmentEditor: React.FC<AssessmentEditorProps> = ({
  assessment,
  onBack,
  onSave,
  onPrint,
  onTestAsStudent,
  onShare
}) => {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment>(assessment);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);
  const [showQCDetails, setShowQCDetails] = useState<boolean>(false);
  const [selectedModifier, setSelectedModifier] = useState<string>('lebih banyak data');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const currentQ = currentAssessment.questions[activeQuestionIndex];
  const studentShareUrl = buildStudentShareUrl(currentAssessment);

  const handleOpenShare = () => {
    if (onShare) {
      onShare(currentAssessment);
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(studentShareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const handleUpdateQuestion = (updatedFields: Partial<Question>) => {
    const newQuestions = [...currentAssessment.questions];
    newQuestions[activeQuestionIndex] = {
      ...newQuestions[activeQuestionIndex],
      ...updatedFields
    };
    const updatedAssessment = {
      ...currentAssessment,
      questions: newQuestions
    };
    setCurrentAssessment(updatedAssessment);
  };

  const handleSave = () => {
    onSave(currentAssessment);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleCopyText = () => {
    const text = `=== ${currentAssessment.judul} ===\n` +
      `Jenjang: ${currentAssessment.config.jenjang} Kelas ${currentAssessment.config.kelas}\n` +
      `Mata Pelajaran: ${currentAssessment.config.mataPelajaran}\n` +
      `Kode Akses: ${currentAssessment.kodeAkses}\n\n` +
      `PETUNJUK:\nBuku, catatan, internet, dan AI boleh digunakan. Namun jawaban harus menunjukkan pemikiranmu sendiri. Gunakan bukti dari kasus/data dan jelaskan alasanmu.\n\n` +
      currentAssessment.questions.map((q, i) => (
        `SOAL ${i + 1}: ${q.judulKasus}\n` +
        `Konteks: ${q.konteks}\n` +
        `Data: ${q.dataInformasi.konten}\n` +
        (q.dataInformasi.tabelData ? `[Tabel Data Terlampir]\n` : '') +
        `Pertanyaan Utama: ${q.pertanyaanUtama}\n` +
        `Permintaan Bukti: ${q.permintaanBukti}\n` +
        `Permintaan Alasan: ${q.permintaanAlasan}\n` +
        `Refleksi: ${q.refleksi}\n`
      )).join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleRegenerateQuestion = async () => {
    if (!currentQ) return;
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/regenerate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ,
          modifier: selectedModifier,
          config: currentAssessment.config
        })
      });
      const data = await res.json();
      if (data.success && data.question) {
        handleUpdateQuestion(data.question);
      }
    } catch (e) {
      console.error('Error regenerating question:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-750" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(currentAssessment.kodeAkses);
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
              }}
              title="Klik untuk menyalin Kode Akses Siswa"
              className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium uppercase">KODE AKSES:</span>
              <span>{currentAssessment.kodeAkses}</span>
              <Copy className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {currentAssessment.config.jenjang} • Kelas {currentAssessment.config.kelas} • {currentAssessment.config.mataPelajaran}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-sm cursor-pointer"
            title="Bagikan link langsung dan QR Code ke siswa (Android & Laptop)"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan ke Siswa</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copyFeedback ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={() => onPrint(currentAssessment)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={() => onTestAsStudent(currentAssessment.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Uji Coba Siswa</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveFeedback ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* Direct Student Access Banner (Android & Laptop Ready) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              <Smartphone className="w-3 h-3" />
              <Laptop className="w-3 h-3" />
              SIAP UNTUK ANDROID & LAPTOP
            </span>
            <span className="text-xs text-emerald-200/80">Kode: <strong className="font-mono text-amber-300">{currentAssessment.kodeAkses}</strong></span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Link Pengerjaan Asesmen Siswa
          </h3>
          <p className="text-xs text-emerald-100/80">
            Siswa dapat langsung mengerjakan lewat Google Chrome di HP Android atau Laptop. Data kasus dan kolom jawaban tersinkronisasi otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyDirectLink}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedShareLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Link Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-emerald-300" />
                <span>Salin Link URL</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenShare}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <QrIcon className="w-4 h-4 text-slate-900" />
            <span>Tampilkan QR & WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Assessment Meta Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Judul Asesmen
          </label>
          <input
            type="text"
            value={currentAssessment.judul}
            onChange={(e) => setCurrentAssessment({ ...currentAssessment, judul: e.target.value })}
            className="w-full text-xl sm:text-2xl font-bold text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 focus:outline-none pb-1 transition-colors bg-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Tujuan Pembelajaran:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{currentAssessment.config.tujuanPembelajaran}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Sumber Boleh Digunakan:</span>
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              {currentAssessment.config.sumberBoleh.join(', ')} (Open Book)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Waktu & Bentuk:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {currentAssessment.config.waktuPengerjaan} Menit • {currentAssessment.config.bentukSoal}
            </span>
          </div>
        </div>

        {/* Kurikulum Merdeka: Fase, Elemen CP & KKTP Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-sky-50/60 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-sky-950/40 border border-emerald-200/80 dark:border-emerald-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                Penyelarasan Standar Kurikulum Merdeka
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                {currentAssessment.config.fase || 'Fase C / D'}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {currentAssessment.config.jenjang} Kelas {currentAssessment.config.kelas}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase block mb-1">
                Elemen Capaian Pembelajaran (CP)
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {currentAssessment.config.elemenCP || 'Keterampilan Proses & Pemahaman Konseptual'}
              </p>
              {currentAssessment.config.capaianPembelajaran && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                  {currentAssessment.config.capaianPembelajaran}
                </p>
              )}
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase block">
                Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Standar BSKAP
              </span>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                <div className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50">
                  <span className="block font-bold">0-60%</span>
                  <span className="text-[9px]">Perlu Bimbingan</span>
                </div>
                <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50">
                  <span className="block font-bold">61-70%</span>
                  <span className="text-[9px]">Cukup</span>
                </div>
                <div className="p-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-100 dark:border-sky-900/50">
                  <span className="block font-bold">71-85%</span>
                  <span className="text-[9px]">Baik</span>
                </div>
                <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                  <span className="block font-bold">86-100%</span>
                  <span className="text-[9px]">Sangat Baik</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Control Badge & Collapse */}
        <div className="pt-2">
          <div 
            onClick={() => setShowQCDetails(!showQCDetails)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Pemeriksaan Kualitas Otomatis (Quality Control Passed)</span>
              <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                10 Aturan Kontekstual Terpenuhi
              </span>
            </div>
            {showQCDetails ? <ChevronUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
          </div>

          {showQCDetails && (
            <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in">
              {[
                'Soal kontekstual & fenomena nyata',
                'Bukan hafalan / definisi semata',
                'Memerlukan analisis data spesifik kasus',
                'Klaim wajib didukung bukti kasus',
                'Tidak dapat dijawab instan dengan Google/AI',
                'Meminta alasan & hubungan logis',
                'Memiliki pertanyaan refleksi adaptif',
                'Sesuai psikologi usia SD / SMP',
                'Rubrik penilaian 5 aspek skala 1-4'
              ].map((check, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Selector Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {currentAssessment.questions.map((q, idx) => (
            <button
              key={q.id || idx}
              onClick={() => setActiveQuestionIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeQuestionIndex === idx
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span>Soal Kasus {idx + 1}</span>
              <span className="text-[10px] opacity-70">
                ({q.tingkatKesulitan || 'menengah'})
              </span>
            </button>
          ))}
        </div>

        {/* Regenerate Question Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedModifier}
            onChange={(e) => setSelectedModifier(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            {REGENERATE_MODIFIERS.map(mod => (
              <option key={mod} value={mod}>Modifikasi: {mod}</option>
            ))}
          </select>

          <button
            onClick={handleRegenerateQuestion}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Menyesuaikan...' : 'Regenerate Soal Ini'}</span>
          </button>
        </div>
      </div>

      {/* ACTIVE QUESTION EDITOR CARD */}
      {currentQ && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Header Soal */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Judul Kasus / Problem (Soal {activeQuestionIndex + 1})
              </label>
              <input
                type="text"
                value={currentQ.judulKasus}
                onChange={(e) => handleUpdateQuestion({ judulKasus: e.target.value })}
                className="w-full font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none pb-1 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {currentQ.bentukSoal}
              </span>
            </div>
          </div>

          {/* 1. Konteks */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 flex items-center justify-center text-xs font-bold">1</span>
              Konteks Nyata (Cerita Kasus yang Dekat dengan Kehidupan Siswa)
            </label>
            <textarea
              rows={2}
              value={currentQ.konteks}
              onChange={(e) => handleUpdateQuestion({ konteks: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* 2. Data / Informasi (Tabel / Kutipan Pihak) */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">2</span>
                Data & Bukti Kasus (Tabel, Angka & Multi-Perspektif)
              </label>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Deskripsi Data Pengamatan:
              </label>
              <textarea
                rows={2}
                value={currentQ.dataInformasi.konten}
                onChange={(e) => handleUpdateQuestion({
                  dataInformasi: { ...currentQ.dataInformasi, konten: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Render Editable Table if present */}
            {currentQ.dataInformasi.tabelData && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <TableIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Tabel Data Spesifik Kasus:
                </span>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        {currentQ.dataInformasi.tabelData.headers.map((h, i) => (
                          <th key={i} className="p-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentQ.dataInformasi.tabelData.baris.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Render Multi-perspective Quotes if present */}
            {currentQ.dataInformasi.kutipanPihak && currentQ.dataInformasi.kutipanPihak.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Pernyataan / Konflik Perspektif Antar Pihak:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.dataInformasi.kutipanPihak.map((pihak, pIdx) => (
                    <div key={pIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{pihak.nama}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{pihak.peran}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 italic">“{pihak.pernyataan}”</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Masalah Utama */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 flex items-center justify-center text-xs font-bold">3</span>
              Masalah / Dilema yang Dihadapi
            </label>
            <input
              type="text"
              value={currentQ.masalah}
              onChange={(e) => handleUpdateQuestion({ masalah: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* 4. Pertanyaan Utama & Tuntutan Berpikir Kritis */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-4">
            <label className="text-xs font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center text-xs font-bold">4</span>
              Pertanyaan Utama & Tuntutan Penalaran (Klaim → Bukti → Alasan → Refleksi)
            </label>

            <div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Pertanyaan Inti (Pengambilan Keputusan / Analisis):
              </span>
              <textarea
                rows={2}
                value={currentQ.pertanyaanUtama}
                onChange={(e) => handleUpdateQuestion({ pertanyaanUtama: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Permintaan Bukti Spesifik Kasus:
                </span>
                <input
                  type="text"
                  value={currentQ.permintaanBukti}
                  onChange={(e) => handleUpdateQuestion({ permintaanBukti: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Permintaan Alasan / Justifikasi:
                </span>
                <input
                  type="text"
                  value={currentQ.permintaanAlasan}
                  onChange={(e) => handleUpdateQuestion({ permintaanAlasan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Pertanyaan Refleksi & Evaluasi Keterbatasan Data:
              </span>
              <input
                type="text"
                value={currentQ.refleksi}
                onChange={(e) => handleUpdateQuestion({ refleksi: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* 5. Pedoman Jawaban & Kunci Guru */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">5</span>
              Pedoman Jawaban Guru (Ekspektasi Jawaban Kritis Siswa)
            </label>
            <textarea
              rows={3}
              value={currentQ.kunciJawaban}
              onChange={(e) => handleUpdateQuestion({ kunciJawaban: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* 6. Petunjuk Pemandu Siswa (Scaffolding Hints) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs font-bold">6</span>
              Petunjuk Pemandu Berpikir (Scaffolding Tanpa Membocorkan Jawaban)
            </label>
            <div className="space-y-2">
              {currentQ.petunjukPemandu.map((hint, hIdx) => (
                <div key={hIdx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono w-4">{hIdx + 1}.</span>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => {
                      const newHints = [...currentQ.petunjukPemandu];
                      newHints[hIdx] = e.target.value;
                      handleUpdateQuestion({ petunjukPemandu: newHints });
                    }}
                    className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 7. Rubrik Penilaian Skala 1-4 */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Rubrik Penilaian Otomatis (Skala 1–4 per 5 Aspek)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {[
                { key: 'pemahamanMasalah', label: '1. Pemahaman Masalah' },
                { key: 'penggunaanBukti', label: '2. Penggunaan Bukti' },
                { key: 'penalaran', label: '3. Penalaran Kritis' },
                { key: 'keputusanSolusi', label: '4. Keputusan / Solusi' },
                { key: 'refleksi', label: '5. Refleksi Keterbatasan' }
              ].map(aspect => {
                const item = (currentQ.rubrik as any)[aspect.key];
                return (
                  <div key={aspect.key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white block border-b border-slate-200 dark:border-slate-700 pb-1">
                      {aspect.label}
                    </span>
                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Skor 4:</span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-3">{item?.[4]}</p>
                      </div>
                      <div>
                        <span className="font-bold text-sky-700 dark:text-sky-400">Skor 3:</span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{item?.[3]}</p>
                      </div>
                      <div>
                        <span className="font-bold text-amber-700 dark:text-amber-400">Skor 2:</span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{item?.[2]}</p>
                      </div>
                      <div>
                        <span className="font-bold text-rose-700 dark:text-rose-400">Skor 1:</span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{item?.[1]}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal for Android & Laptop Access */}
      <ShareStudentLinkModal
        assessment={currentAssessment}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onTestNow={onTestAsStudent}
      />
    </div>
  );
};
