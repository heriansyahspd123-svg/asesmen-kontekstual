import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogIn, 
  Lock, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Eye,
  EyeOff,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { loginWithEmailOrUsername } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Email atau Username wajib diisi.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmailOrUsername(identifier, password);
      setSuccessMessage('Berhasil masuk! Mengalihkan ke Generator Asesmen Kontekstual...');
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Gagal memproses login. Periksa kembali email dan password Anda.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Email atau Password salah. Silakan periksa kembali.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password terlalu lemah. Gunakan minimal 6 karakter kombinasi.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-28 -mt-28 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-28 -mb-28 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md my-auto">
        {/* App Title & Badge */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>KURIKULUM MERDEKA SD & SMP</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                ASESMEN KONTEKSTUAL
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Karya: <strong className="text-slate-300">Heriansyah, S.Si., S.Pd., M.Pd</strong>
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Silakan masukkan email dan password akun Anda untuk masuk ke Generator Asesmen Kontekstual.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5" />
              <div>
                <h3 className="text-sm font-bold leading-tight">Masuk Akun Pengajar</h3>
                <p className="text-[11px] text-emerald-100">Penyimpanan Terenkripsi Cloud Firestore</p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-black/20 text-[10px] font-mono font-bold">
              VERIFIED
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div className="leading-relaxed font-semibold">{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-mono border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi akun...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Generator Asesmen</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>Asesmen Kontekstual Kurikulum Merdeka • Penyimpanan Aman Cloud Firebase</p>
        </div>
      </div>
    </div>
  );
};
