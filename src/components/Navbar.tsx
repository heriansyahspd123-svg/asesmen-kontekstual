import React from 'react';
import { BookOpen, PenTool, UserCheck, BarChart3, HelpCircle, Sparkles, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenGuide: () => void;
  onOpenAudit?: () => void;
  flaggedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenGuide,
  onOpenAudit,
  flaggedCount = 0
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="nav-brand"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  ASESMEN KONTEKSTUAL
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Open Book
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                SD & SMP • Karya Heriansyah, S.Si., S.Pd., M.Pd
              </p>
            </div>
          </div>

          {/* Nav Links & Controls */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-btn-home"
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Beranda
            </button>

            <button
              id="nav-btn-create"
              onClick={() => onNavigate('create')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'create'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xs:inline">Buat Asesmen</span>
            </button>

            <button
              id="nav-btn-student"
              onClick={() => onNavigate('student')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'student'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Mode Siswa</span>
            </button>

            <button
              id="nav-btn-results"
              onClick={() => onNavigate('results')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'results'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Hasil & AI Check</span>
            </button>

            {onOpenAudit && (
              <button
                id="nav-btn-audit"
                onClick={onOpenAudit}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  flaggedCount > 0
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Audit Integritas Jawaban Siswa & Anti Salin-Tempel Guru"
              >
                <ShieldAlert className={`w-4 h-4 ${flaggedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="hidden md:inline font-semibold">Audit Integritas</span>
                {flaggedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold">
                    {flaggedCount}
                  </span>
                )}
              </button>
            )}

            <button
              id="nav-btn-guide"
              onClick={onOpenGuide}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Panduan Guru Asesmen Kontekstual"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="hidden lg:inline">Panduan Guru</span>
            </button>

            {/* Dark Mode & Light Mode Toggle */}
            <div className="pl-1 border-l border-slate-200 dark:border-slate-800 ml-0.5">
              <button
                id="nav-btn-theme-toggle"
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 dark:border-slate-700 shadow-2xs"
                title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
                aria-label={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline text-amber-300">Mode Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" />
                    <span className="hidden md:inline text-slate-800">Mode Gelap</span>
                  </>
                )}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

