import React, { useState } from 'react';
import { 
  Home, 
  PenTool, 
  UserCheck, 
  BarChart3, 
  ShieldAlert, 
  HelpCircle, 
  Database, 
  Download, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  UserPlus, 
  LogOut, 
  FileText,
  Copy,
  Check,
  Plus
} from 'lucide-react';
import { Assessment } from '../types';
import { useAuth } from '../context/AuthContext';
import { downloadAllDataBackupAsJSON } from '../utils/storage';

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string, assessmentId?: string) => void;
  onOpenGuide: () => void;
  onOpenAudit?: () => void;
  onOpenRegisterGuru?: () => void;
  assessments: Assessment[];
  flaggedCount?: number;
  isOpen: boolean;
  onToggle: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  onOpenGuide,
  onOpenAudit,
  onOpenRegisterGuru,
  assessments,
  flaggedCount = 0,
  isOpen,
  onToggle
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (e: React.MouseEvent, asmId: string, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(asmId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <>
      {/* Mobile Overlay backdrop when sidebar is open on small screens */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none ${
          isOpen ? 'w-64 sm:w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'
        }`}
      >
        {/* Sidebar Header with Brand & Close/Collapse Toggle */}
        <div className="h-16 px-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/80">
          <div 
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2.5 cursor-pointer overflow-hidden transition-opacity ${
              isOpen ? 'opacity-100' : 'md:opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white block truncate leading-tight">
                ASESMEN KONTEKSTUAL
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block truncate">
                SD & SMP Kurikulum Merdeka
              </span>
            </div>
          </div>

          {/* Flexible Toggle Button */}
          <button
            type="button"
            onClick={onToggle}
            title={isOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
            className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-auto"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5 scrollbar-thin">
          <div className="space-y-1">
            <button
              onClick={() => onNavigate('home')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Beranda Dashboard"
            >
              <Home className="w-4 h-4 shrink-0" />
              {isOpen && <span>Beranda</span>}
            </button>

            <button
              onClick={() => onNavigate('create')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'create'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Buat Instrumen Asesmen Baru"
            >
              <PenTool className="w-4 h-4 shrink-0 text-emerald-500" />
              {isOpen && <span>Buat Asesmen</span>}
            </button>

            <button
              onClick={() => onNavigate('student')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'student'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-900 dark:hover:text-amber-300'
              }`}
              title="Mode Ruang Siswa"
            >
              <UserCheck className="w-4 h-4 shrink-0 text-amber-500" />
              {isOpen && <span>Mode Siswa</span>}
            </button>

            <button
              onClick={() => onNavigate('results')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'results'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Hasil Evaluasi Siswa & AI Check"
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-teal-500" />
              {isOpen && <span>Hasil & AI Check</span>}
            </button>

            {onOpenAudit && (
              <button
                onClick={onOpenAudit}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  flaggedCount > 0
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Pusat Audit Integritas & Anti Salin-Tempel"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`w-4 h-4 shrink-0 ${flaggedCount > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
                  {isOpen && <span>Audit Integritas</span>}
                </div>
                {isOpen && flaggedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold">
                    {flaggedCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenGuide}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Panduan Guru Asesmen Kontekstual"
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
              {isOpen && <span>Panduan Guru</span>}
            </button>
          </div>

          {/* Quick Bank List in Sidebar (When Open) */}
          {isOpen && (
            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bank Soal ({assessments.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('create')}
                  title="Tambah Asesmen Baru"
                  className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {assessments.slice(0, 6).map((asm) => (
                  <div
                    key={asm.id}
                    onClick={() => onNavigate('editor', asm.id)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group flex items-center justify-between gap-1.5"
                  >
                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {asm.judul}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {asm.config.jenjang} Kls {asm.config.kelas} • {asm.config.mataPelajaran}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(e, asm.id, asm.kodeAkses)}
                      title="Salin Kode Akses"
                      className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 shrink-0 cursor-pointer"
                    >
                      {copiedCodeId === asm.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Backup */}
          {isOpen && (
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                Cadangan Data
              </span>
              <button
                type="button"
                onClick={downloadAllDataBackupAsJSON}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh Cadangan (JSON)</span>
              </button>

              {onOpenRegisterGuru && (
                <button
                  type="button"
                  onClick={onOpenRegisterGuru}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                  <span>Daftar Guru Baru</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 shrink-0">
          {isOpen ? (
            <div className="flex items-center justify-between gap-2">
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {userProfile?.displayName || currentUser?.displayName || 'Guru Pengajar'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate block">
                  {currentUser?.email || 'Akun Aktif Online'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                title="Keluar Akun"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logout()}
              title="Keluar Akun"
              className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
