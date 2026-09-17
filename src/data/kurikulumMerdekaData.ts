import { FaseKurikulum, KKTPIntervalConfig, KKTPKategori, KriteriaKetercapaianItem } from '../types';

export interface CapaianPembelajaranPreset {
  jenjang: 'SD' | 'SMP';
  fase: FaseKurikulum;
  mataPelajaran: string;
  elemenCP: string;
  rumusanCP: string;
  tujuanPembelajaranContoh: string;
  indikatorKKTP: KriteriaKetercapaianItem[];
}

export const DEFAULT_KKTP_INTERVALS: KKTPIntervalConfig = {
  perluBimbingan: '0 - 60%',
  cukup: '61 - 70%',
  baik: '71 - 85%',
  sangatBaik: '86 - 100%'
};

export function getFaseByJenjangAndKelas(jenjang: 'SD' | 'SMP', kelas: string): FaseKurikulum {
  const cleanKelas = kelas.trim().toUpperCase();
  if (jenjang === 'SD') {
    if (cleanKelas === '1' || cleanKelas === '2' || cleanKelas === 'I' || cleanKelas === 'II') {
      return 'Fase A';
    }
    if (cleanKelas === '3' || cleanKelas === '4' || cleanKelas === 'III' || cleanKelas === 'IV') {
      return 'Fase B';
    }
    return 'Fase C'; // Default Kelas 5-6 / V-VI
  } else {
    return 'Fase D'; // Default SMP Kelas 7-9 / VII-IX
  }
}

export function determineKKTPKategori(persentase: number): KKTPKategori {
  if (persentase >= 86) return 'Sangat Baik';
  if (persentase >= 71) return 'Baik';
  if (persentase >= 61) return 'Cukup';
  return 'Perlu Bimbingan';
}

export function generateERaporNarrative(
  studentName: string,
  tujuanPembelajaran: string,
  skor: number,
  kategori: KKTPKategori,
  aspekTertinggi?: string,
  aspekTerendah?: string
): string {
  const nama = studentName || 'Peserta didik';
  
  if (kategori === 'Sangat Baik') {
    return `Ananda ${nama} telah mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) dengan predikat Sangat Baik (${skor}%). Sangat cakap dalam ${aspekTertinggi || 'menganalisis bukti data kasus dan merumuskan keputusan logis'}, serta mampu merefleksikan keterbatasan data secara kritis dan mandiri. Siap diberikan pengayaan lanjutan.`;
  }
  if (kategori === 'Baik') {
    return `Ananda ${nama} telah mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) dengan predikat Baik (${skor}%). Mampu ${aspekTertinggi || 'menghubungkan data kasus dengan keputusan secara tepat'}, dan disarankan terus mengasah ${aspekTerendah || 'kedalaman refleksi dan pertimbangan data alternatif'}.`;
  }
  if (kategori === 'Cukup') {
    return `Ananda ${nama} telah mencapai sebagian tujuan pembelajaran dengan predikat Cukup (${skor}%). Menunjukkan pemahaman dasar terhadap masalah kasus, namun memerlukan pendampingan berkala dalam ${aspekTerendah || 'menyaring bukti data angka spesifik serta menyusun justifikasi logis'}.`;
  }
  return `Ananda ${nama} masih memerlukan bimbingan intensif (${skor}% - Belum Tuntas). Belum mampu memanfaatkan data kasus untuk memperkuat klaim keputusan. Diperlukan kegiatan remedial pemahaman studi kasus dan latihan identifikasi bukti konkret.`;
}

export const CAPAIAN_PEMBELAJARAN_PRESETS: CapaianPembelajaranPreset[] = [
  {
    jenjang: 'SD',
    fase: 'Fase C',
    mataPelajaran: 'IPAS',
    elemenCP: 'Keterampilan Proses & Pemahaman IPAS (Lingkungan Hidup)',
    rumusanCP: 'Peserta didik menganalisis hubungan timbal balik antara manusia dengan lingkungan, menyelidiki permasalahan lingkungan sekolah melalui pengumpulan dan analisis data empiris, serta merancang tindakan berkelanjutan berbasis bukti.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis masalah timbulan sampah plastik di sekolah, membandingkan dua opsi solusi berdasarkan data konkret, dan merefleksikan konsekuensi keputusan.',
    indikatorKKTP: [
      { aspek: 'Pemahaman Masalah', indikator: 'Mengidentifikasi akar dilema pengelolaan sampah dan aktor yang terlibat di lingkungan sekolah.' },
      { aspek: 'Pemanfaatan Bukti Data', indikator: 'Mengutip minimal 2 data kuantitatif/kualitatif dari tabel audit untuk mendukung usulan.' },
      { aspek: 'Penalaran & Justifikasi', indikator: 'Menjelaskan hubungan sebab-akibat secara logis mengapa solusi pilihan lebih efektif.' },
      { aspek: 'Refleksi & Alternatif', indikator: 'Menyadari potensi kendala/risiko usulan dan merumuskan data tambahan yang dibutuhkan.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    mataPelajaran: 'Matematika',
    elemenCP: 'Analisis Data dan Peluang',
    rumusanCP: 'Peserta didik dapat mengurutkan, membandingkan, dan menyajikan data faktual lingkungan sekitar dalam bentuk tabel dan diagram batang, serta menginterpretasi data tersebut untuk mengambil keputusan rasional.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menginterpretasikan tabel perbandingan pengeluaran kantin dan merumuskan keputusan alokasi anggaran hemat berbasis rasio data.',
    indikatorKKTP: [
      { aspek: 'Interpretasi Data', indikator: 'Membaca dan membandingkan selisih nilai angka dalam tabel secara tepat.' },
      { aspek: 'Penggunaan Bukti Numerik', indikator: 'Menyertakan perhitungan atau selisih kuantitatif sebagai argumen pendukung.' },
      { aspek: 'Pengambilan Keputusan', indikator: 'Memilih opsi yang paling menguntungkan dan efisien berdasarkan angka.' },
      { aspek: 'Refleksi Validitas', indikator: 'Mengevaluasi apakah data sudah memadai untuk membuat kesimpulan jangka panjang.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    mataPelajaran: 'IPAS',
    elemenCP: 'Keterampilan Proses & Penyelidikan Lingkungan',
    rumusanCP: 'Peserta didik mengamati fenomena alam dan sosial di lingkungan sekitar, mengidentifikasi pola sederhana, mencatat hasil observasi, serta membuat kesimpulan sederhana berdasarkan bukti yang teramati.',
    tujuanPembelajaranContoh: 'Peserta didik mampu membandingkan hasil pengamatan pertumbuhan tanaman di dua tempat berbeda dan menyimpulkan faktor pengaruhnya berdasarkan bukti nyata.',
    indikatorKKTP: [
      { aspek: 'Observasi & Masalah', indikator: 'Menemukan perbedaan nyata kondisi tanaman dari data pengamatan 14 hari.' },
      { aspek: 'Bukti Pengamatan', indikator: 'Menyebutkan tinggi batang dan jumlah daun sebagai bukti perubahan.' },
      { aspek: 'Penalaran Sederhana', indikator: 'Menghubungkan sinar matahari/air dengan laju pertumbuhan tanaman.' },
      { aspek: 'Refleksi Kebiasaan', indikator: 'Merumuskan langkah perawatan tanaman sekolah secara teratur.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    mataPelajaran: 'IPA',
    elemenCP: 'Keterampilan Proses & Pemahaman IPA (Energi dan Kelistrikan)',
    rumusanCP: 'Peserta didik memahami konsep energi listrik, daya, dan efisiensinya dalam kehidupan sehari-hari; mampu merancang penyelidikan, menginterpretasi data konsumsi energi, serta mengevaluasi klaim efisiensi energi dengan penalaran ilmiah berbasis bukti.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis grafik tren penggunaan energi listrik 5 bulan, menguji validitas hipotesis dua pihak berdasarkan bukti parsial, dan merancang rekomendasi efisiensi.',
    indikatorKKTP: [
      { aspek: 'Analisis Anomali Data', indikator: 'Mengidentifikasi lonjakan kWh dan mengorelasikannya dengan faktor cuaca serta beban peralatan.' },
      { aspek: 'Evaluasi Bukti Parsial', indikator: 'Menganalisis kelemahan hipotesis pihak yang hanya mengandalkan satu variabel tanpa melihat data tren.' },
      { aspek: 'Penalaran Ilmiah Multivariabel', indikator: 'Menyusun argumen berbasis interaksi daya, durasi pemakaian, dan suhu lingkungan.' },
      { aspek: 'Rekomendasi & Refleksi', indikator: 'Menyusun protokol penghematan terukur dan mengidentifikasi data logbook yang masih diperlukan.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    mataPelajaran: 'IPS',
    elemenCP: 'Pemahaman Konsep & Keterampilan Proses Sosial-Ekonomi',
    rumusanCP: 'Peserta didik mampu menganalisis permasalahan sosial dan ekonomi di tingkat lokal/komunitas, mengevaluasi konflik kepentingan berbagai kelompok masyarakat dengan pertimbangan data, dan merumuskan resolusi berkelanjutan.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis dampak penataan pedagang kaki lima di sekitar sekolah berdasarkan data omzet dan ketertiban umum.',
    indikatorKKTP: [
      { aspek: 'Identifikasi Kepentingan', indikator: 'Menguraikan sudut pandang pihak pedagang, pengguna jalan, dan pihak sekolah.' },
      { aspek: 'Pemanfaatan Data Lapangan', indikator: 'Mengutip data volume kemacetan dan survei pendapatan warga sekitar.' },
      { aspek: 'Solusi Win-Win', indikator: 'Mengusulkan skema penataan waktu/zonasi yang adil dan berlandaskan data.' },
      { aspek: 'Refleksi Kebijakan', indikator: 'Memprediksi dampak lanjutan bagi kesejahteraan ekonomi keluarga pedagang.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    mataPelajaran: 'Matematika',
    elemenCP: 'Analisis Data dan Peluang',
    rumusanCP: 'Peserta didik dapat menyajikan dan menginterpretasi data menggunakan diagram pencar, garis tren, dan ukuran pemusatan data; mengevaluasi validitas kesimpulan yang dibuat oleh pihak lain berdasarkan data statistik riil.',
    tujuanPembelajaranContoh: 'Peserta didik mampu memverifikasi klaim efektivitas program belajar mandiri berbasis data nilai tryout dan durasi belajar harian siswa.',
    indikatorKKTP: [
      { aspek: 'Interpretasi Tren Statistik', indikator: 'Menemukan pola korelasi atau anomali data dari tabel numerik.' },
      { aspek: 'Verifikasi Klaim', indikator: 'Menunjukkan bukti data yang membantah atau mendukung kesimpulan pihak lain.' },
      { aspek: 'Argumen Kuantitatif', indikator: 'Menggunakan rata-rata, rentang nilai, atau persentase untuk membuktikan klaim.' },
      { aspek: 'Refleksi Bias Data', indikator: 'Menjelaskan potensi bias atau variabel perancu yang belum diperhitungkan.' }
    ]
  }
];
