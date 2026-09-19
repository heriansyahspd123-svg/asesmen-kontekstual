import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, AlertCircle, HelpCircle, Layers, Database, BookOpen, Clock, Award, Compass, ChevronDown, Check, BarChart3, LineChart, PieChart, AreaChart, TrendingUp, Save, Trash2, Search, Filter } from 'lucide-react';
import { AssessmentConfig, Assessment, FaseKurikulum } from '../types';
import { getFaseByJenjangAndKelas, DEFAULT_KKTP_INTERVALS, CAPAIAN_PEMBELAJARAN_PRESETS, CapaianPembelajaranPreset, BSKAP_DECREE_INFO } from '../data/kurikulumMerdekaData';
import { generateAlgorithmicAssessment } from '../utils/assessmentGeneratorEngine';

interface GeneratorFormProps {
  onBack: () => void;
  onGenerated: (assessment: Assessment) => void;
}

const LOCAL_DATA_PRESETS = [
  { label: 'Jumlah sampah botol & kantin', text: 'Data timbulan rata-rata 45-60 botol plastik per hari di kantin dan perbandingan usulan membawa tumbler vs menambah tempat sampah.' },
  { label: 'Penggunaan listrik sekolah', text: 'Catatan kWh meteran 5 bulan SMP Merdeka dengan anomali lonjakan 42% pada bulan Oktober saat suhu 34.8°C dan kegiatan Lab Komputer P5.' },
  { label: 'Harga makanan & kantin sehat', text: 'Daftar harga makanan berminyak vs makanan sehat di kantin, modal bahan, dan daya beli uang saku harian siswa (Rp5.000 - Rp10.000).' },
  { label: 'Hasil pengamatan tanaman & cuaca', text: 'Perbandingan pertumbuhan tinggi tanaman cabai di pot terik (halaman) vs pot teduh (lorong) selama 14 hari.' },
  { label: 'Penggunaan air keran & wudhu', text: 'Volume pemakaian air harian di toilet dan tempat wudhu sekolah saat jam istirahat dan musim kemarau.' },
  { label: 'Jarak rumah & kebiasaan berangkat', text: 'Data jarak rumah siswa dari sekolah (0.5 km - 5 km) dan pilihan moda transportasi (jalan kaki, sepeda, antar-jemput motor).' }
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onBack, onGenerated }) => {
  const [jenjang, setJenjang] = useState<'SD' | 'SMP'>('SD');
  const [kelas, setKelas] = useState<string>('V');
  const [mataPelajaran, setMataPelajaran] = useState<string>('IPAS');
  const [materi, setMateri] = useState<string>('Kelestarian Lingkungan & Pengelolaan Sampah');
  
  // Kurikulum Merdeka States
  const currentFase = getFaseByJenjangAndKelas(jenjang, kelas);
  const [elemenCP, setElemenCP] = useState<string>('Keterampilan Proses & Pemahaman IPAS (Lingkungan Hidup)');
  const [capaianPembelajaran, setCapaianPembelajaran] = useState<string>(
    'Peserta didik menganalisis hubungan timbal balik antara manusia dengan lingkungan, menyelidiki permasalahan lingkungan sekolah melalui pengumpulan dan analisis data empiris, serta merancang tindakan berkelanjutan berbasis bukti.'
  );
  const [showCPPresets, setShowCPPresets] = useState<boolean>(false);
  const [cpFilterFase, setCpFilterFase] = useState<string>('SEMUA');
  const [cpFilterMapel, setCpFilterMapel] = useState<string>('SEMUA');
  const [cpSearchQuery, setCpSearchQuery] = useState<string>('');

  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<string>(
    'Peserta didik mampu menganalisis masalah timbulan sampah di sekolah, membandingkan dua opsi solusi berdasarkan data konkret, dan merefleksikan konsekuensi keputusan.'
  );
  const [konteks, setKonteks] = useState<string>('lingkungan sekolah');
  const [jumlahSoal, setJumlahSoal] = useState<number>(2);
  const [bentukSoal, setBentukSoal] = useState<string>('studi kasus');
  const [tingkatKesulitan, setTingkatKesulitan] = useState<'dasar' | 'menengah' | 'tinggi' | 'campuran'>('menengah');
  const [fokusPenalaran, setFokusPenalaran] = useState<string[]>(['menganalisis', 'mengevaluasi', 'mencipta']);
  const [sumberBoleh, setSumberBoleh] = useState<string[]>(['Buku', 'Catatan', 'Internet', 'Google', 'AI']);
  const [waktuPengerjaan, setWaktuPengerjaan] = useState<number>(35);
  const [menggunakanDataLokal, setMenggunakanDataLokal] = useState<boolean>(true);
  const [dataLokalDeskripsi, setDataLokalDeskripsi] = useState<string>(
    'Data audit harian sampah botol plastik SDN 01 Harmoni dan perbandingan usulan kelas IV dan V'
  );
  const [sertakanGrafik, setSertakanGrafik] = useState<boolean>(true);
  const [tipeGrafikPreferensi, setTipeGrafikPreferensi] = useState<'otomatis' | 'bar' | 'line' | 'pie' | 'area'>('otomatis');

  // Custom Local Data Presets saved by teacher
  const [customPresets, setCustomPresets] = useState<{ id: string; label: string; text: string; date: string }[]>(() => {
    try {
      const stored = localStorage.getItem('asmt_custom_local_data_presets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [savedPresetFeedback, setSavedPresetFeedback] = useState<boolean>(false);

  const handleSaveDataPreset = () => {
    const trimmed = dataLokalDeskripsi.trim();
    if (!trimmed) {
      alert('Tuliskan data atau kondisi nyata terlebih dahulu sebelum menyimpannya.');
      return;
    }

    const firstWords = trimmed.slice(0, 32) + (trimmed.length > 32 ? '...' : '');
    const newPreset = {
      id: 'cp-' + Date.now(),
      label: firstWords,
      text: trimmed,
      date: new Date().toLocaleDateString('id-ID')
    };

    const updated = [newPreset, ...customPresets.filter(p => p.text !== trimmed)].slice(0, 15);
    setCustomPresets(updated);
    try {
      localStorage.setItem('asmt_custom_local_data_presets', JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
    setSavedPresetFeedback(true);
    setTimeout(() => setSavedPresetFeedback(false), 3000);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('asmt_custom_local_data_presets', JSON.stringify(updated));
    } catch (err) {
      console.warn('Gagal menghapus dari localStorage:', err);
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle jenjang change to adjust default kelas and subject
  const handleJenjangChange = (newJenjang: 'SD' | 'SMP') => {
    setJenjang(newJenjang);
    if (newJenjang === 'SD') {
      setKelas('V');
      setMataPelajaran('IPAS');
      setMateri('Kelestarian Lingkungan & Pengelolaan Sampah');
      setElemenCP('Keterampilan Proses & Pemahaman IPAS (Lingkungan Hidup)');
      setCapaianPembelajaran('Peserta didik menganalisis hubungan timbal balik antara manusia dengan lingkungan, menyelidiki permasalahan lingkungan sekolah melalui pengumpulan dan analisis data empiris, serta merancang tindakan berkelanjutan berbasis bukti.');
      setTujuanPembelajaran('Peserta didik mampu menganalisis masalah timbulan sampah di sekolah, membandingkan dua opsi solusi berdasarkan data nyata, dan merefleksikan konsekuensi keputusan.');
      setDataLokalDeskripsi('Data audit harian sampah botol plastik SDN 01 Harmoni dan perbandingan usulan kelas IV dan V');
    } else {
      setKelas('VIII');
      setMataPelajaran('IPA');
      setMateri('Energi Listrik, Daya, & Efisiensi Energi');
      setElemenCP('Keterampilan Proses & Pemahaman IPA (Energi dan Kelistrikan)');
      setCapaianPembelajaran('Peserta didik memahami konsep energi listrik, daya, dan efisiensinya dalam kehidupan sehari-hari; mampu merancang penyelidikan, menginterpretasi data konsumsi energi, serta mengevaluasi klaim efisiensi energi dengan penalaran ilmiah berbasis bukti.');
      setTujuanPembelajaran('Peserta didik mampu menganalisis grafik tren penggunaan energi listrik 5 bulan, menguji validitas hipotesis dua pihak berdasarkan bukti parsial, dan merancang rekomendasi.');
      setDataLokalDeskripsi('Catatan kWh meteran 5 bulan SMP Merdeka dengan anomali lonjakan 42% pada bulan Oktober saat suhu 34.8°C dan kegiatan Lab Komputer P5.');
    }
  };

  const handleApplyCPPreset = (preset: CapaianPembelajaranPreset) => {
    setJenjang(preset.jenjang);
    if (preset.kelasContoh) {
      setKelas(preset.kelasContoh);
    } else if (preset.jenjang === 'SD') {
      if (preset.fase === 'Fase A') setKelas('II');
      else if (preset.fase === 'Fase B') setKelas('IV');
      else setKelas('V');
    } else {
      setKelas('VIII');
    }
    setMataPelajaran(preset.mataPelajaran);
    if (preset.materiContoh) {
      setMateri(preset.materiContoh);
    }
    setElemenCP(preset.elemenCP);
    setCapaianPembelajaran(preset.rumusanCP);
    setTujuanPembelajaran(preset.tujuanPembelajaranContoh);
    if (preset.dataLokalContoh) {
      setDataLokalDeskripsi(preset.dataLokalContoh);
      setMenggunakanDataLokal(true);
    }
    setShowCPPresets(false);
  };

  const filteredCPPresets = useMemo(() => {
    return CAPAIAN_PEMBELAJARAN_PRESETS.filter(item => {
      // Filter by Fase / Jenjang
      if (cpFilterFase === 'SD' && item.jenjang !== 'SD') return false;
      if (cpFilterFase === 'SMP' && item.jenjang !== 'SMP') return false;
      if (cpFilterFase.startsWith('Fase') && item.fase !== cpFilterFase) return false;

      // Filter by Mata Pelajaran
      if (cpFilterMapel !== 'SEMUA') {
        const targetMapel = cpFilterMapel.toLowerCase();
        const itemMapel = (item.kategoriMapel || item.mataPelajaran).toLowerCase();
        const rawMapel = item.mataPelajaran.toLowerCase();
        if (!itemMapel.includes(targetMapel) && !rawMapel.includes(targetMapel)) {
          return false;
        }
      }

      // Filter by Search Query
      if (cpSearchQuery.trim()) {
        const q = cpSearchQuery.toLowerCase();
        const match =
          item.mataPelajaran.toLowerCase().includes(q) ||
          item.elemenCP.toLowerCase().includes(q) ||
          item.rumusanCP.toLowerCase().includes(q) ||
          (item.materiContoh && item.materiContoh.toLowerCase().includes(q)) ||
          item.tujuanPembelajaranContoh.toLowerCase().includes(q) ||
          (item.kategoriMapel && item.kategoriMapel.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [cpFilterFase, cpFilterMapel, cpSearchQuery]);

  const toggleFokus = (item: string) => {
    setFokusPenalaran(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const toggleSumber = (item: string) => {
    setSumberBoleh(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Menganalisis tujuan pembelajaran & konteks lokal...');

    const config: AssessmentConfig = {
      jenjang,
      kelas,
      fase: currentFase,
      elemenCP,
      capaianPembelajaran,
      kktpInterval: DEFAULT_KKTP_INTERVALS,
      mataPelajaran,
      materi,
      tujuanPembelajaran,
      konteks,
      jumlahSoal,
      bentukSoal,
      tingkatKesulitan,
      fokusPenalaran,
      sumberBoleh,
      waktuPengerjaan,
      menggunakanDataLokal,
      dataLokalDeskripsi: menggunakanDataLokal ? dataLokalDeskripsi : undefined,
      sertakanGrafik,
      tipeGrafikPreferensi
    };

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('Merancang kasus nyata & tabel data perbandingan...');
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Menyusun pertanyaan analitis, permintaan bukti, dan rubrik 1-4...');
      }, 2500);

      let generatedAssessment: Assessment | null = null;

      try {
        const res = await fetch('/api/generate-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.assessment) {
            generatedAssessment = data.assessment;
          }
        }
      } catch (netErr) {
        console.warn('Backend unavailable, using built-in contextual generator engine:', netErr);
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      // If backend is unavailable or on static hosts like Netlify, generate with built-in engine
      if (!generatedAssessment) {
        generatedAssessment = generateAlgorithmicAssessment(config);
      }

      onGenerated(generatedAssessment);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat membuat asesmen. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Formulir Asesmen Kontekstual
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Perancangan Asesmen Kontekstual
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Konfigurasikan instrumen penilaian open-book yang mendorong analisis data, klaim berbasis bukti, dan evaluasi kritis siswa.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Gagal Memproses</p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-8">
          {/* SECTION 1: Jenjang & Kelas */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              1. Jenjang Pendidikan & Kelas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Jenjang Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenjang Sekolah
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleJenjangChange('SD')}
                    className={`py-2.5 px-4 rounded-xl font-bold text-sm border text-center transition-all cursor-pointer ${
                      jenjang === 'SD'
                        ? 'bg-sky-50 dark:bg-sky-950/80 border-sky-500 dark:border-sky-500 text-sky-900 dark:text-sky-200 shadow-sm ring-2 ring-sky-200 dark:ring-sky-900'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    Sekolah Dasar (SD)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJenjangChange('SMP')}
                    className={`py-2.5 px-4 rounded-xl font-bold text-sm border text-center transition-all cursor-pointer ${
                      jenjang === 'SMP'
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm ring-2 ring-indigo-200 dark:ring-indigo-900'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    SMP / MTs
                  </button>
                </div>
              </div>

              {/* Kelas Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tingkat Kelas ({jenjang})
                </label>
                <div className="flex flex-wrap gap-2">
                  {jenjang === 'SD' ? (
                    ['I', 'II', 'III', 'IV', 'V', 'VI'].map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKelas(k)}
                        className={`w-10 h-10 rounded-xl font-bold text-xs border flex items-center justify-center transition-all cursor-pointer ${
                          kelas === k
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {k}
                      </button>
                    ))
                  ) : (
                    ['VII', 'VIII', 'IX'].map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKelas(k)}
                        className={`px-4 h-10 rounded-xl font-bold text-xs border flex items-center justify-center transition-all cursor-pointer ${
                          kelas === k
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        Kelas {k}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Standar Kurikulum Merdeka: CP & KKTP */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                2. Standar Nasional Kurikulum Merdeka (Fase, CP & KKTP)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {currentFase} ({jenjang} Kelas {kelas})
                </span>
                <button
                  type="button"
                  onClick={() => setShowCPPresets(!showCPPresets)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Rekomendasi CP Resmi BSKAP</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCPPresets ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Dropdown Preset CP Kemendikbud */}
            {showCPPresets && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 space-y-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 dark:border-emerald-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                        Katalog Capaian Pembelajaran Resmi BSKAP (SD & SMP)
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                          {filteredCPPresets.length} Pilihan
                        </span>
                      </h4>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                        Klik salah satu preset untuk otomatis mengisi CP, Elemen, Kelas, Mapel, Topik, & Kasus Data Riil.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCPPresets(false)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-emerald-200 dark:border-slate-700 shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    Tutup Katalog
                  </button>
                </div>

                {/* Legal Reference Verification Banner */}
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/80 text-xs shadow-xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm">
                        Regulasi CP Resmi Kurikulum Merdeka Terkini (SD & SMP)
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-bold tracking-wide">
                        RESMI TERBARU
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                        <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>Aturan Utama (Umum):</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-snug">
                          <strong>Keputusan Kepala BSKAP No. 046/H/KR/2025</strong> tentang Capaian Pembelajaran pada PAUD, Jenjang Dikdas, dan Dikmen.
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                        <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          <span>Aturan Perubahan (Khusus Agama):</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-snug">
                          <strong>Keputusan Kepala BKPDM No. 020 Tahun 2026</strong> tentang Perubahan atas Keputusan Kepala BSKAP No. 046/H/KR/2025.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cpSearchQuery}
                      onChange={(e) => setCpSearchQuery(e.target.value)}
                      placeholder="Cari mata pelajaran, materi, atau kata kunci CP..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {cpSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCpSearchQuery('')}
                        className="text-[10px] text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {/* Fase Quick Filters */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {[
                      { id: 'SEMUA', label: 'Semua Fase' },
                      { id: 'SD', label: 'Semua SD' },
                      { id: 'Fase A', label: 'Fase A (Kls 1-2)' },
                      { id: 'Fase B', label: 'Fase B (Kls 3-4)' },
                      { id: 'Fase C', label: 'Fase C (Kls 5-6)' },
                      { id: 'SMP', label: 'SMP (Fase D)' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setCpFilterFase(f.id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          cpFilterFase === f.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mapel Quick Filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Mapel:
                  </span>
                  {[
                    { id: 'SEMUA', label: 'Semua' },
                    { id: 'Agama', label: 'Pendidikan Agama' },
                    { id: 'IPAS', label: 'IPAS / IPA' },
                    { id: 'Matematika', label: 'Matematika' },
                    { id: 'Bahasa Indonesia', label: 'B. Indonesia' },
                    { id: 'Pancasila', label: 'Pendidikan Pancasila' },
                    { id: 'IPS', label: 'IPS' },
                    { id: 'Inggris', label: 'B. Inggris' },
                    { id: 'Informatika', label: 'Informatika' },
                    { id: 'PJOK', label: 'PJOK' },
                    { id: 'Seni', label: 'Seni & Prakarya' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCpFilterMapel(m.id)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        cpFilterMapel === m.id
                          ? 'bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                          : 'bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Preset Cards Grid */}
                {filteredCPPresets.length === 0 ? (
                  <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-slate-500 dark:text-slate-400">
                    Tidak ditemukan rekomendasi CP yang sesuai filter atau kata kunci &quot;{cpSearchQuery}&quot;.
                    <button
                      type="button"
                      onClick={() => { setCpSearchQuery(''); setCpFilterFase('SEMUA'); setCpFilterMapel('SEMUA'); }}
                      className="ml-2 text-emerald-600 font-bold underline cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {filteredCPPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyCPPreset(preset)}
                        className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                                {preset.jenjang} • {preset.fase} {preset.kelasContoh ? `(Kelas ${preset.kelasContoh})` : ''}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/90 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800">
                                {preset.mataPelajaran}
                              </span>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                                preset.aturanTerkait === 'BKPDM 020/2026'
                                  ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                                  : 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                              }`}>
                                {preset.aturanTerkait || 'BSKAP 046/2025'}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 group-hover:underline font-bold flex items-center gap-0.5 shrink-0">
                              Gunakan <Check className="w-3 h-3" />
                            </span>
                          </div>
                          
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                            {preset.elemenCP}
                          </p>

                          {preset.materiContoh && (
                            <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 line-clamp-1 mb-1.5 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 shrink-0" />
                              <span className="font-semibold">Topik:</span> {preset.materiContoh}
                            </p>
                          )}

                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            {preset.rumusanCP}
                          </p>
                        </div>

                        {preset.dataLokalContoh && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            <Database className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate"><strong className="text-slate-700 dark:text-slate-300">Data Kasus:</strong> {preset.dataLokalContoh}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mata Pelajaran
                </label>
                <select
                  value={mataPelajaran}
                  onChange={(e) => setMataPelajaran(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <optgroup label="Pendidikan Agama & Budi Pekerti (BKPDM 020/2026)">
                    <option value="Pendidikan Agama Islam dan Budi Pekerti">Pendidikan Agama Islam dan Budi Pekerti</option>
                    <option value="Pendidikan Agama Kristen dan Budi Pekerti">Pendidikan Agama Kristen dan Budi Pekerti</option>
                    <option value="Pendidikan Agama Katolik dan Budi Pekerti">Pendidikan Agama Katolik dan Budi Pekerti</option>
                    <option value="Pendidikan Agama Hindu dan Budi Pekerti">Pendidikan Agama Hindu dan Budi Pekerti</option>
                    <option value="Pendidikan Agama Buddha dan Budi Pekerti">Pendidikan Agama Buddha dan Budi Pekerti</option>
                    <option value="Pendidikan Agama Khonghucu dan Budi Pekerti">Pendidikan Agama Khonghucu dan Budi Pekerti</option>
                  </optgroup>
                  <optgroup label="Mata Pelajaran Umum (BSKAP 046/2025)">
                    <option value="IPAS">IPAS (Ilmu Pengetahuan Alam dan Sosial - SD)</option>
                    <option value="IPA">IPA (Ilmu Pengetahuan Alam - SMP)</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="IPS">IPS (Ilmu Pengetahuan Sosial - SMP)</option>
                    <option value="PPKn/Pendidikan Pancasila">PPKn / Pendidikan Pancasila</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                    <option value="Informatika">Informatika (SMP)</option>
                    <option value="PJOK">PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)</option>
                    <option value="Seni Rupa">Seni Rupa</option>
                    <option value="Prakarya">Prakarya (Pengolahan / Rekayasa / Kerajinan)</option>
                    <option value="Lainnya">Lainnya / Proyek Penguatan Profil Pelajar Pancasila (P5)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Elemen Capaian Pembelajaran (CP)
                </label>
                <input
                  type="text"
                  required
                  value={elemenCP}
                  onChange={(e) => setElemenCP(e.target.value)}
                  placeholder="Misal: Keterampilan Proses & Pemahaman IPAS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Rumusan Capaian Pembelajaran (CP Resmi Kemendikbudristek)
              </label>
              <textarea
                rows={2}
                value={capaianPembelajaran}
                onChange={(e) => setCapaianPembelajaran(e.target.value)}
                placeholder="Salin atau ketik rumusan CP untuk Fase ini..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Materi / Topik Pembelajaran
                </label>
                <input
                  type="text"
                  required
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  placeholder="Misal: Siklus Air, Daya Listrik, Perubahan Sosial, dll."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tujuan Pembelajaran (TP) yang Diukur
                </label>
                <input
                  type="text"
                  required
                  value={tujuanPembelajaran}
                  onChange={(e) => setTujuanPembelajaran(e.target.value)}
                  placeholder="Tuliskan tujuan pembelajaran yang ingin diukur..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Standar Interval KKTP Nasional */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Standar Nasional BSKAP
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  Interval Kualitatif & Kuantitatif
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60">
                  <span className="block font-bold text-rose-800 dark:text-rose-300 text-[11px]">Perlu Bimbingan</span>
                  <span className="font-mono text-xs font-extrabold text-rose-700 dark:text-rose-400">0 - 60%</span>
                  <span className="block text-[10px] text-rose-600 dark:text-rose-400/80 mt-0.5">Remedial intensif</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60">
                  <span className="block font-bold text-amber-800 dark:text-amber-300 text-[11px]">Cukup</span>
                  <span className="font-mono text-xs font-extrabold text-amber-700 dark:text-amber-400">61 - 70%</span>
                  <span className="block text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">Pendampingan</span>
                </div>
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900/60">
                  <span className="block font-bold text-sky-800 dark:text-sky-300 text-[11px]">Baik</span>
                  <span className="font-mono text-xs font-extrabold text-sky-700 dark:text-sky-400">71 - 85%</span>
                  <span className="block text-[10px] text-sky-600 dark:text-sky-400/80 mt-0.5">Tuntas mandiri</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="block font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">Sangat Baik</span>
                  <span className="font-mono text-xs font-extrabold text-emerald-700 dark:text-emerald-400">86 - 100%</span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">Siap pengayaan</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Konteks & Data Nyata */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              3. Konteks Kasus & Data Nyata Siswa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilihan Ranah Konteks
                </label>
                <select
                  value={konteks}
                  onChange={(e) => setKonteks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value="lingkungan sekolah">Lingkungan Sekolah</option>
                  <option value="kehidupan sehari-hari">Kehidupan Sehari-hari</option>
                  <option value="keluarga">Keluarga & Rumah</option>
                  <option value="masyarakat">Masyarakat & Komunitas</option>
                  <option value="lingkungan alam">Lingkungan Alam & Ekosistem</option>
                  <option value="teknologi">Teknologi & Digital</option>
                  <option value="ekonomi sederhana">Ekonomi Sederhana & Kantin</option>
                  <option value="kesehatan dan kebiasaan">Kesehatan & Kebiasaan Siswa</option>
                  <option value="budaya lokal">Budaya Lokal & Kearifan Daerah</option>
                  <option value="masalah sosial">Masalah Sosial</option>
                  <option value="lingkungan daerah">Lingkungan Daerah / Kabupaten</option>
                  <option value="bebas">Bebas / Situasi Khusus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gunakan Data Lokal Nyata Siswa?
                </label>
                <div className="flex items-center gap-3 h-[42px]">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="dataLokal"
                      checked={menggunakanDataLokal}
                      onChange={() => setMenggunakanDataLokal(true)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ya, sertakan data nyata</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="dataLokal"
                      checked={!menggunakanDataLokal}
                      onChange={() => setMenggunakanDataLokal(false)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Tidak (Data disimulasikan AI)</span>
                  </label>
                </div>
              </div>
            </div>

            {menggunakanDataLokal && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    Masukkan Data / Kondisi Nyata Siswa:
                  </label>
                  
                  {/* Button Simpan Data Bagian Ini */}
                  <button
                    type="button"
                    onClick={handleSaveDataPreset}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
                    title="Simpan data kasus sekolah ini agar dapat digunakan kembali kapan saja"
                  >
                    {savedPresetFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Data Berhasil Disimpan!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Data Bagian Ini</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={dataLokalDeskripsi}
                  onChange={(e) => setDataLokalDeskripsi(e.target.value)}
                  placeholder="Contoh: Data sampah botol plastik kantin harian, catatan kWh listrik sekolah, harga makanan kantin, hasil pengamatan pot tanaman, jarak rumah siswa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
                />

                {/* Custom Saved Presets (if any) */}
                {customPresets.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                      <span className="flex items-center gap-1">
                        <Save className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Data Tersimpan Milik Anda (Klik untuk gunakan):
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">{customPresets.length} data tersimpan</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {customPresets.map((preset) => (
                        <div
                          key={preset.id}
                          onClick={() => setDataLokalDeskripsi(preset.text)}
                          className={`group flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            dataLokalDeskripsi === preset.text
                              ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                              : 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                          }`}
                        >
                          <span className="truncate max-w-[180px]">{preset.label}</span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                            title="Hapus data tersimpan ini"
                            className="text-slate-400 hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standard Preset Chips */}
                <div className="space-y-1 pt-1">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    Contoh Standar Siap Pakai:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {LOCAL_DATA_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDataLokalDeskripsi(preset.text)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 hover:border-emerald-300 transition-colors cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visualisasi Grafik Nyata Option */}
                <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      <input
                        type="checkbox"
                        checked={sertakanGrafik}
                        onChange={(e) => setSertakanGrafik(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Sertakan Visualisasi Grafik Data Nyata (Diagram Batang / Garis / dsb.)
                      </span>
                    </label>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Aktif & Interaktif
                    </span>
                  </div>

                  {sertakanGrafik && (
                    <div className="pl-6 space-y-1.5">
                      <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Preferensi Format Grafik Kasus:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'otomatis', label: 'Otomatis (AI)', icon: Sparkles },
                          { id: 'bar', label: 'Diagram Batang', icon: BarChart3 },
                          { id: 'line', label: 'Garis Tren', icon: LineChart },
                          { id: 'pie', label: 'Lingkaran (Pie)', icon: PieChart },
                          { id: 'area', label: 'Diagram Area', icon: AreaChart }
                        ].map((item) => {
                          const Icon = item.icon;
                          const isSelected = tipeGrafikPreferensi === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setTipeGrafikPreferensi(item.id as any)}
                              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-[10px] text-center">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Format Soal, Tingkat Kesulitan & Penalaran */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              4. Format Soal, Tingkat Kesulitan & Rubrik
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bentuk Soal
                </label>
                <select
                  value={bentukSoal}
                  onChange={(e) => setBentukSoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value="studi kasus">Studi Kasus (Direkomendasikan)</option>
                  <option value="pemecahan masalah">Pemecahan Masalah</option>
                  <option value="uraian">Uraian Berbasis Bukti</option>
                  <option value="pilihan ganda berbasis kasus">Pilihan Ganda Berbasis Kasus</option>
                  <option value="pilihan ganda kompleks">Pilihan Ganda Kompleks</option>
                  <option value="isian terbuka">Isian Terbuka</option>
                  <option value="proyek mini">Proyek Mini Analisis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tingkat Kesulitan
                </label>
                <select
                  value={tingkatKesulitan}
                  onChange={(e) => setTingkatKesulitan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value="dasar">Dasar (Pemahaman Konkret)</option>
                  <option value="menengah">Menengah (Analisis & Evaluasi)</option>
                  <option value="tinggi">Tinggi (Evaluasi Bukti & Sintesis)</option>
                  <option value="campuran">Campuran Bertingkat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jumlah Soal Kasus (1–20)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={jumlahSoal}
                  onChange={(e) => setJumlahSoal(parseInt(e.target.value) || 2)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Fokus Penalaran Checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Fokus Penalaran Kritis
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'memahami', label: 'Memahami Masalah' },
                  { id: 'menerapkan', label: 'Menerapkan Konsep' },
                  { id: 'menganalisis', label: 'Menganalisis Data' },
                  { id: 'mengevaluasi', label: 'Mengevaluasi Bukti' },
                  { id: 'mencipta', label: 'Mencipta / Solusi' }
                ].map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      fokusPenalaran.includes(item.id)
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={fokusPenalaran.includes(item.id)}
                      onChange={() => toggleFokus(item.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sumber yang Boleh Digunakan & Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Sumber yang Boleh Digunakan Siswa (Open Book)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Buku', 'Catatan', 'Internet', 'Google', 'AI'].map(item => (
                    <label
                      key={item}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                        sumberBoleh.includes(item)
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={sumberBoleh.includes(item)}
                        onChange={() => toggleSumber(item)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>☑ {item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Waktu Pengerjaan (Menit)
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="number"
                    min={10}
                    max={180}
                    step={5}
                    value={waktuPengerjaan}
                    onChange={(e) => setWaktuPengerjaan(parseInt(e.target.value) || 35)}
                    className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Menit dihitung saat mode siswa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-700/20 disabled:opacity-60 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingStep || 'Sedang memproses asesmen...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>GENERATE ASESMEN KONTEKSTUAL</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
              Sistem akan otomatis memverifikasi 10 Aturan Kritis, menghasilkan tabel data kasus, rubrik 1-4 per 5 aspek, dan petunjuk pemandu.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
