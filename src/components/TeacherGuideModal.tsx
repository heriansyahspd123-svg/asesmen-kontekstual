import React from 'react';
import { X, BookOpen, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, HelpCircle, Layers, Award, ShieldAlert } from 'lucide-react';

interface TeacherGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Panduan Asesmen Kontekstual & Open Book
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prinsip Perancangan Soal Berpikir Kritis untuk SD dan SMP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1: Filosofi Utama */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <h4 className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Filosofi Open Book di Era AI
            </h4>
            <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
              Open book bukan berarti siswa hanya mencari jawaban di buku atau internet. Asesmen kontekstual dirancang agar siswa <strong>menggunakan informasi</strong> untuk memahami masalah nyata, membandingkan bukti, mengambil keputusan, dan merefleksikan konsekuensinya. Jawaban instan AI tidak mencukupi karena soal terikat erat dengan data lokal spesifik.
            </p>
          </div>

          {/* Section 2: 10 Aturan Kunci */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              10 Aturan Kunci Desain Soal Kontekstual
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { num: '1', title: 'Konteks Nyata', text: 'Mengambil situasi riil di sekolah, keluarga, atau lingkungan lokal.' },
                { num: '2', title: 'Bukan Hafalan Definisi', text: 'Hindari pertanyaan "Apa itu...". Ganti dengan fenomena yang dihadapi.' },
                { num: '3', title: 'Hubungkan ≥ 2 Informasi', text: 'Siswa harus memadukan minimal dua sumber data/fakta yang berbeda.' },
                { num: '4', title: 'Berbasis Bukti Kasus', text: 'Tersedia tabel angka, grafik, atau dialog dua pihak untuk dianalisis.' },
                { num: '5', title: 'AI-Proof by Design', text: 'Tidak dapat disalin langsung dari Google/AI karena bertumpu pada data kasus unik.' },
                { num: '6', title: 'Pengambilan Keputusan', text: 'Siswa harus memilih opsi atau tindakan, bukan sekadar meringkas teori.' },
                { num: '7', title: 'Wajib Mengutip Bukti', text: 'Siswa harus menyertakan bukti data spesifik untuk membela pilihannya.' },
                { num: '8', title: 'Menjelaskan Alasan Logis', text: 'Siswa menjelaskan mengapa bukti tersebut relevan mendukung keputusan.' },
                { num: '9', title: 'Pertanyaan Refleksi Diri', text: 'Mendorong evaluasi kelemahan keputusan atau data yang masih kurang.' },
                { num: '10', title: 'Adaptif Usia SD vs SMP', text: 'SD memakai bahasa konkret & akrab; SMP memakai data kuantitatif & multi-faktor.' }
              ].map(item => (
                <div key={item.num} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-center font-bold">
                      {item.num}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-7">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Perbedaan Jenjang SD vs SMP */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Pedoman Diferensiasi Jenjang SD vs SMP
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 space-y-2">
                <span className="font-bold text-sky-900 dark:text-sky-200 block text-sm">Jenjang SD (Kelas I–VI)</span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside text-[11px]">
                  <li>Gunakan bahasa sederhana, konkret, dan dekat dengan rutinitas anak (kantin, mainan, halaman sekolah).</li>
                  <li>Data disajikan dalam tabel kecil sederhana (3–4 baris) atau cerita bergambar.</li>
                  <li>Pertanyaan terfokus: memilih antara 2 alternatif tindakan yang jelas.</li>
                  <li>Refleksi: "Apa yang kamu rasakan atau apa yang akan kamu lakukan jika ada teman yang keberatan?"</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block text-sm">Jenjang SMP (Kelas VII–IX)</span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside text-[11px]">
                  <li>Gunakan data kuantitatif dengan anomali atau tren multi-bulan (kWh listrik, persentase).</li>
                  <li>Sertakan perbedaan pendapat atau hipotesis antara 2 pihak (Pak Joko vs Bu Rina).</li>
                  <li>Siswa diminta menguji validitas argumen masing-masing pihak berdasarkan bukti numerik.</li>
                  <li>Refleksi: "Data pendukung apa lagi yang perlu dikumpulkan sebelum kebijakan resmi diputuskan?"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Rubrik Penilaian 5 Aspek (1-4) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Struktur Rubrik Penilaian 5 Aspek (Skala 1–4)
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { name: '1. Pemahaman Masalah', desc: 'Mampu mengidentifikasi inti persoalan dan data yang relevan tanpa teralihkan oleh informasi sekunder.' },
                { name: '2. Penggunaan Bukti', desc: 'Mengutip fakta spesifik, angka dalam tabel, atau observasi nyata dari kasus untuk mendukung klaim.' },
                { name: '3. Alur Penalaran', desc: 'Menjelaskan hubungan sebab-akibat yang logis antara bukti dengan keputusan yang diambil.' },
                { name: '4. Keputusan & Solusi', desc: 'Memberikan tindakan konkret yang realistis dapat diterapkan sesuai kondisi kasus.' },
                { name: '5. Refleksi Keterbatasan', desc: 'Menyadari kelemahan keputusan, dampak sampingan, atau data tambahan yang masih dibutuhkan.' }
              ].map((asp, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">{asp.name}:</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">{asp.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Sistem Deteksi Salin-Tempel & Audit Integritas Guru */}
          <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 space-y-3">
            <h4 className="font-bold text-rose-950 dark:text-rose-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Sistem Deteksi Salin-Tempel & Panel Audit Guru
            </h4>
            <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed">
              Jika siswa menyalin teks langsung dari Google atau Kunci Jawaban Guru, sistem otomatis memberikan tanda peringatan di layar siswa dan menandai lembar evaluasi guru:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-rose-900 dark:text-rose-300">
              <li><strong>Peringatan Siswa:</strong> Muncul banner edukatif saat penempelan teks terjadi, memandu siswa untuk menarasikan dengan kata-kata sendiri dan mengutip data tabel kasus.</li>
              <li><strong>Panel Audit Guru:</strong> Guru dapat membuka menu <em>"Audit Integritas"</em> di navigasi atau tombol merah pada Laporan Hasil untuk memfilter siswa yang terindikasi salin-tempel, melihat kutipan teks yang ditempel, dan mendapatkan rekomendasi tindak lanjut lisan (coaching).</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Dikembangkan oleh: <strong className="text-slate-800 dark:text-slate-200 font-semibold">Heriansyah, S.Si., S.Pd., M.Pd</strong>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
