import React, { useState } from 'react';
import { PenTool, UserCheck, BarChart3, HelpCircle, ArrowRight, Sparkles, CheckCircle2, ShieldAlert, Cpu, Award, FileText, ChevronRight, Copy, Check, Share2, Smartphone, Laptop } from 'lucide-react';
import { Assessment } from '../types';

interface HomeViewProps {
  onNavigate: (view: string, assessmentId?: string) => void;
  onOpenGuide: () => void;
  onOpenAudit?: () => void;
  assessments: Assessment[];
  flaggedCount?: number;
  onShare?: (assessment: Assessment) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onNavigate, 
  onOpenGuide, 
  onOpenAudit,
  assessments,
  flaggedCount = 0,
  onShare
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (e: React.MouseEvent, asmId: string, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(asmId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              ASESMEN KONTEKSTUAL • SD & SMP
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-medium backdrop-blur-xs">
              <span className="text-emerald-400 font-semibold">Pengembang:</span>
              <span>Heriansyah, S.Si., S.Pd., M.Pd</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Generator Asesmen Kontekstual
          </h1>

          <p className="text-lg sm:text-xl font-medium text-emerald-300">
            Open Book • Berbasis Masalah • Berbasis Bukti • Mendorong Penalaran Kritis
          </p>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic">
              “Open book bukan berarti siswa cukup mencari jawaban. Asesmen ini dirancang agar siswa menggunakan informasi untuk menganalisis masalah, mengambil keputusan, memberikan bukti, dan menjelaskan alasan.”
            </p>
          </div>

          {/* 4 Main Action Buttons */}
          <div className="pt-2 grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
            <button
              id="btn-home-create"
              onClick={() => onNavigate('create')}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-950/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <PenTool className="w-4 h-4" />
              <span>BUAT ASESMEN</span>
            </button>

            <button
              id="btn-home-student"
              onClick={() => onNavigate('student')}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-950/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>KERJAKAN ASESMEN</span>
            </button>

            <button
              id="btn-home-results"
              onClick={() => onNavigate('results')}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/15 transition-all hover:-translate-y-0.5"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>LIHAT HASIL</span>
            </button>

            {onOpenAudit && (
              <button
                id="btn-home-audit"
                onClick={onOpenAudit}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white font-semibold text-sm sm:text-base border border-rose-400/30 transition-all hover:-translate-y-0.5"
                title="Buka Pusat Audit Integritas Guru"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>AUDIT INTEGRITAS</span>
                {flaggedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[11px] font-mono font-bold">
                    {flaggedCount}
                  </span>
                )}
              </button>
            )}

            <button
              id="btn-home-guide"
              onClick={onOpenGuide}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-sm sm:text-base border border-white/10 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>PANDUAN GURU</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8-Step Thinking Pipeline */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Struktur Logika Penalaran Soal Kontekstual
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Jawaban Google & AI tidak dapat langsung dipakai karena soal terikat erat pada data lokal spesifik.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            Siklus 8 Tahap
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 text-center">
          {[
            { step: '1', title: 'Konteks Nyata', desc: 'Situasi riil sekolah/hidup' },
            { step: '2', title: 'Masalah', desc: 'Dilema yang perlu solusi' },
            { step: '3', title: 'Data/Bukti', desc: 'Tabel, kutipan, observasi' },
            { step: '4', title: 'Analisis', desc: 'Hubungan & pemilahan' },
            { step: '5', title: 'Keputusan', desc: 'Tindakan yang dipilih' },
            { step: '6', title: 'Bukti', desc: 'Kutipan data penguat' },
            { step: '7', title: 'Justifikasi', desc: 'Alasan mengapa relevan' },
            { step: '8', title: 'Refleksi', desc: 'Evaluasi & data kurang' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-center hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center mb-1.5 border border-emerald-200 dark:border-emerald-800/60">
                {item.step}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {item.title}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Ready-to-Test Assessments Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bank Asesmen Kontekstual Aktif
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pilih untuk mencoba langsung sebagai siswa atau tinjau dan edit struktur soal.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
          >
            + Buat Asesmen Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assessments.map((asm) => (
            <div
              key={asm.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      asm.config.jenjang === 'SD'
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}>
                      {asm.config.jenjang} Kelas {asm.config.kelas}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {asm.config.mataPelajaran}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(e, asm.id, asm.kodeAkses)}
                    title="Klik untuk menyalin Kode Akses Siswa"
                    className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-900 dark:hover:text-amber-300 hover:border-amber-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs group cursor-pointer"
                  >
                    <span className="text-[10px] text-slate-400 font-sans font-medium uppercase tracking-wider group-hover:text-amber-700 dark:group-hover:text-amber-400">KODE:</span>
                    <span>{asm.kodeAkses}</span>
                    {copiedCodeId === asm.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 ml-0.5" />
                    )}
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg line-clamp-1">
                  {asm.judul}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {asm.config.tujuanPembelajaran}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {asm.questions.length} Kasus Soal
                  </span>
                  <span>•</span>
                  <span>Waktu: {asm.config.waktuPengerjaan} menit</span>
                  <span>•</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Data Nyata Terlampir</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('editor', asm.id)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Edit & Cetak
                  </button>

                  {onShare && (
                    <button
                      type="button"
                      onClick={() => onShare(asm)}
                      title="Bagikan link langsung ke HP Android & Laptop siswa"
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/90 dark:border-emerald-800/80 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Bagikan Link</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('student', asm.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <span>Kerjakan Asesmen</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Pedagogical Principles Banner */}
      <section className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 transition-colors">
        <div className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800">
            01
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Bukan Menghafal, Tapi Menganalisis</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Menghilangkan pertanyaan berbasis definisi ("Apa itu fotosintesis?"). Digantikan dengan studi kasus perbandingan tanaman di pot teduh vs pot terik.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-sm border border-teal-200 dark:border-teal-800">
            02
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Open Book & AI-Proof Design</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Siswa bebas membuka Google dan AI. Namun kunci keputusan terletak pada tabel angka lokal sekolah yang tidak ada di database publik AI.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm border border-amber-200 dark:border-amber-800">
            03
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Rubrik Otomatis Skala 1–4</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Mengevaluasi 5 Aspek: Pemahaman Masalah, Penggunaan Bukti Kasus, Alur Penalaran, Keputusan Solusi, dan Refleksi Keterbatasan Data.
          </p>
        </div>
      </section>
    </div>
  );
};
