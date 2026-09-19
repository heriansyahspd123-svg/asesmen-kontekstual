import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  CheckCircle2, 
  Share2, 
  Smartphone, 
  Laptop, 
  ExternalLink, 
  QrCode as QrIcon, 
  Download, 
  Maximize2, 
  Minimize2,
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  BookOpen,
  MessageCircle,
  Globe,
  Settings,
  HelpCircle,
  Play,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Assessment } from '../types';
import { buildStudentShareUrl, buildWhatsAppShareText, getPublicShareOrigin } from '../utils/storage';
import { generateInteractiveHtmlAssessment } from '../utils/exportInteractiveHtml';

interface ShareStudentLinkModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
  onTestNow?: (assessmentId: string) => void;
}

export const ShareStudentLinkModal: React.FC<ShareStudentLinkModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onTestNow
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isQrFullscreen, setIsQrFullscreen] = useState<boolean>(false);
  const [linkMode, setLinkMode] = useState<'public' | 'current' | 'custom'>('public');
  const [teacherPhone, setTeacherPhone] = useState<string>(() => {
    try {
      return localStorage.getItem('teacher_phone_wa') || '';
    } catch {
      return '';
    }
  });
  const [customOrigin, setCustomOrigin] = useState<string>(() => {
    try {
      return localStorage.getItem('custom_share_origin') || '';
    } catch {
      return '';
    }
  });
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicOrigin = getPublicShareOrigin();
  const isAisDev = currentOrigin.includes('ais-dev-');

  const effectiveOrigin = linkMode === 'public' 
    ? publicOrigin 
    : (linkMode === 'current' ? currentOrigin : (customOrigin.trim() || publicOrigin));

  const shareUrl = assessment ? buildStudentShareUrl(assessment, effectiveOrigin) : '';
  const waText = assessment ? buildWhatsAppShareText(assessment, effectiveOrigin) : '';

  // Generate QR Code when modal opens or assessment/shareUrl changes
  useEffect(() => {
    if (!isOpen || !assessment || !shareUrl) return;
    try {
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    } catch (e) {
      console.error('QR code generation failed:', e);
    }
  }, [isOpen, assessment, shareUrl]);

  if (!isOpen || !assessment) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(assessment.kodeAkses);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyWAText = () => {
    navigator.clipboard.writeText(waText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(waText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenTestLink = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDirectTestNow = () => {
    if (onTestNow && assessment) {
      onTestNow(assessment.id);
    } else {
      window.location.href = `/?view=student&code=${encodeURIComponent(assessment.kodeAkses)}`;
    }
  };

  const handleDownloadInteractiveHtml = () => {
    if (!assessment) return;
    try {
      localStorage.setItem('teacher_phone_wa', teacherPhone);
    } catch {}
    generateInteractiveHtmlAssessment(assessment, teacherPhone);
  };

  const handleSaveCustomOrigin = (val: string) => {
    setCustomOrigin(val);
    try {
      if (val.trim()) {
        localStorage.setItem('custom_share_origin', val.trim());
      } else {
        localStorage.removeItem('custom_share_origin');
      }
    } catch {
      // Ignore
    }
  };

  const handleResetToPublic = () => {
    setCustomOrigin('');
    setLinkMode('public');
    try {
      localStorage.removeItem('custom_share_origin');
    } catch {
      // Ignore
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-Asesmen-${assessment.kodeAkses}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:hidden">
      {/* Fullscreen QR Code Mode for Classroom Projector */}
      {isQrFullscreen && (
        <div className="fixed inset-0 z-60 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-white text-center space-y-6 animate-in fade-in">
          <button
            type="button"
            onClick={() => setIsQrFullscreen(false)}
            className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-2 text-sm"
          >
            <Minimize2 className="w-5 h-5" />
            <span>Tutup Layar Penuh</span>
          </button>

          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              TAMPILAN PROYEKTOR KELAS • SCAN ANDROID / LAPTOP
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {assessment.judul}
            </h2>
            <p className="text-sm text-slate-300">
              {assessment.config.jenjang} Kelas {assessment.config.kelas} • {assessment.config.mataPelajaran} • Waktu: {assessment.config.waktuPengerjaan} Menit
            </p>
          </div>

          <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-emerald-400">
            {qrDataUrl && (
              <img 
                src={qrDataUrl} 
                alt="QR Code Asesmen Siswa" 
                className="w-72 h-72 sm:w-84 sm:h-84 object-contain rounded-xl"
              />
            )}
          </div>

          <div className="space-y-2 max-w-md">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-slate-300">Kode Akses Asesmen:</span>
              <span className="font-mono font-black text-2xl tracking-wider text-amber-400 bg-amber-950/80 px-4 py-1 rounded-xl border border-amber-500/40">
                {assessment.kodeAkses}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Arahkan kamera HP Android siswa ke kode QR di atas untuk langsung mulai mengerjakan.
            </p>
          </div>
        </div>
      )}

      {/* Main Modal Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <Share2 className="w-4 h-4 text-emerald-300" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Bagikan Link Pengerjaan Siswa
              </h2>
            </div>
            <p className="text-xs text-emerald-100/90 pl-10">
              Link siap pakai untuk dikerjakan siswa melalui <strong>HP Android</strong> maupun <strong>Laptop/Komputer</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Assessment Overview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
                {assessment.config.jenjang} Kelas {assessment.config.kelas} • {assessment.config.mataPelajaran}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {assessment.judul}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {assessment.config.waktuPengerjaan} Menit
                </span>
                <span>•</span>
                <span>{assessment.questions.length} Soal Berpikir Kritis</span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end shrink-0">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">KODE AKSES RESMI:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Klik untuk salin kode"
                className="flex items-center gap-1.5 font-mono font-black text-sm text-slate-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 px-3 py-1 rounded-xl transition-colors cursor-pointer"
              >
                <span>{assessment.kodeAkses}</span>
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
              </button>
            </div>
          </div>

          {/* Quick Action: Direct Test Button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-sm">
                <Play className="w-4 h-4 fill-white" />
                <span>Uji Langsung Lembar Soal Siswa</span>
              </div>
              <p className="text-xs text-emerald-100">
                Buka dan coba kerjakan asesmen ini langsung di aplikasi tanpa perlu membuka link eksternal.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDirectTestNow}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-800" />
              <span>Kerjakan Sekarang (Mode Siswa)</span>
            </button>
          </div>

          {/* Solusi 100% Bebas 403: Unduh Lembar Soal Mandiri (.html) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-700/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <Download className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-white">
                    Solusi 100% Bebas 403: File Soal Interaktif Mandiri (.html)
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    Bebas Login & Bebas Server
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Kirimkan file ini ke grup WhatsApp siswa. Siswa cukup klik/buka file tersebut di HP Android atau Laptop (buka dengan Chrome). Soal langsung tampil lengkap dan interaktif tanpa butuh login Google, tanpa server, dan bisa langsung mengirim jawaban kembali ke WhatsApp Guru!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 pt-1 border-t border-slate-800">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                  Nomor WhatsApp Guru untuk menerima jawaban siswa (opsional):
                </label>
                <input
                  type="tel"
                  value={teacherPhone}
                  onChange={(e) => {
                    setTeacherPhone(e.target.value);
                    try { localStorage.setItem('teacher_phone_wa', e.target.value); } catch {}
                  }}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={handleDownloadInteractiveHtml}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File .html Siswa</span>
              </button>
            </div>
          </div>

          {/* Link Type Selector & Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Atau Bagikan Lewat Tautan Web:</span>
              </label>
              <button
                type="button"
                onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showTroubleshoot ? 'Tutup Penjelasan 403' : 'Mengapa Muncul Pesan 403?'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLinkMode('public')}
                className={`p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 ${
                  linkMode === 'public'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold border border-emerald-500/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${linkMode === 'public' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    Tautan Publik Siswa (ais-pre)
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                    Untuk Siswa
                  </span>
                </div>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 pl-3.5">
                  Bebas login akun Google (Aktif setelah klik Share di kanan atas AI Studio)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLinkMode('current')}
                className={`p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 ${
                  linkMode === 'current'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold border border-emerald-500/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${linkMode === 'current' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    Tautan Sesi Pengembang (ais-dev)
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                    Khusus Guru
                  </span>
                </div>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 pl-3.5">
                  Khusus tab laptop guru (akan 403 jika dibuka di HP siswa)
                </span>
              </button>
            </div>

            {/* Troubleshooting info banner */}
            {(showTroubleshoot || linkMode === 'public') && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Penjelasan Lengkap Galat: <em>"403 Itu adalah kesalahan / Anda tidak memiliki akses"</em></span>
                </div>
                <div className="space-y-2 text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                  <p>
                    1. <strong>Mengapa Muncul Pesan 403?</strong> Tautan pengembang (<code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 rounded">ais-dev</code>) diproteksi langsung oleh Google Cloud IAM agar hanya dapat dibuka oleh akun Google developer Anda (<code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 rounded">heriansyah.spd123@gmail.com</code>). Saat tautan tersebut dibuka di HP Android siswa, akun lain, atau peramban privat, Google Cloud otomatis menampilkan pesan: <em>"403 Itu adalah kesalahan. Kami mohon maaf, tetapi Anda tidak memiliki akses ke halaman ini."</em>
                  </p>
                  <p>
                    2. <strong>Cara Praktis Membuka Akses Web Publik:</strong> Di sudut kanan atas layar Google AI Studio Anda, klik tombol <strong>"Share" (Bagikan)</strong>. Setelah tombol Share diklik, Google Cloud akan mengaktifkan domain publik (<code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 rounded">ais-pre</code>) yang bisa dibuka siswa tanpa login.
                  </p>
                  <p>
                    3. <strong>Solusi Paling Cepat Tanpa Bergantung Server Google:</strong> Cukup gunakan tombol <strong>"Unduh File .html Siswa"</strong> di kotak hitam di atas. File tersebut bisa langsung dibagikan lewat WA ke siswa dan 100% langsung bisa dibuka di peramban HP Android maupun Laptop tanpa error 403 sama sekali.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Direct Link Input & Actions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Link URL Langsung (Android & Laptop):</span>
              </label>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                Auto-Buka Soal Siswa
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 select-all"
              />

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Link Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenTestLink}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Buka link ini di tab baru browser untuk menguji tampilan siswa"
              >
                <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Uji Buka</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Siswa cukup membuka tautan ini di browser Google Chrome HP Android atau Laptop. Soal asesmen dan kode akses otomatis terisi dan siap dikerjakan secara langsung.
            </p>
          </div>

          {/* Section 2: Quick Broadcast to WhatsApp & Classroom */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Kirim Instruksi Siap Pakai ke Grup WhatsApp / Google Classroom
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Pesan rapi lengkap dengan judul, panduan open book, kode akses, dan tautan langsung.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buka & Kirim di WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyWAText}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Teks Broadcast Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Salin Pesan Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Interactive QR Code for Classroom Scan */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-5">
            <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code Asesmen" 
                  className="w-36 h-36 object-contain rounded-lg"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-400">
                  <QrIcon className="w-10 h-10 animate-pulse" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold">
                <Smartphone className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                SCAN KAMERA HP ANDROID SISWA
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Pindai Kode QR Tanpa Perlu Mengetik URL
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Tampilkan kode QR ini di layar proyektor kelas atau bagikan gambarnya. Siswa tinggal scan menggunakan kamera HP Android untuk membuka lembar asesmen secara instan.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQrFullscreen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Layar Penuh (Proyektor)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Unduh Gambar QR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Device Compatibility Features Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-xs space-y-1.5">
              <div className="font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>Pengoptimalan HP Android:</span>
              </div>
              <ul className="text-[11px] text-teal-900/90 dark:text-teal-300 space-y-1 list-disc list-inside">
                <li>Ukuran font & tata letak responsif ramah layar sentuh.</li>
                <li>Penyimpanan otomatis (Auto-Save) lokal jika kuota/sinyal terputus.</li>
                <li>Bebas buka Google & catatan (prinsip Open Book).</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs space-y-1.5">
              <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Pengoptimalan Laptop / PC Siswa:</span>
              </div>
              <ul className="text-[11px] text-amber-900/90 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Tampilan nyaman membaca tabel data studi kasus.</li>
                <li>Kolom uraian berbasis Bukti Data, Alasan, & Refleksi.</li>
                <li>Evaluasi integritas anti copy-paste teks internet/AI.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Dikembangkan oleh: <strong className="text-slate-800 dark:text-slate-200 font-semibold">Heriansyah, S.Si., S.Pd., M.Pd</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onTestNow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTestNow(assessment.id);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Mode Siswa Sekarang</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
