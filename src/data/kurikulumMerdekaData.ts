import { FaseKurikulum, KKTPIntervalConfig, KKTPKategori, KriteriaKetercapaianItem } from '../types';

export interface CapaianPembelajaranPreset {
  jenjang: 'SD' | 'SMP';
  fase: FaseKurikulum;
  kelasContoh?: string;
  mataPelajaran: string;
  kategoriMapel?: 'IPAS/IPA' | 'Matematika' | 'Bahasa Indonesia' | 'Pendidikan Pancasila' | 'IPS' | 'Informatika' | 'Bahasa Inggris' | 'PJOK' | 'Seni & Prakarya' | 'Pendidikan Agama';
  materiContoh?: string;
  elemenCP: string;
  rumusanCP: string;
  tujuanPembelajaranContoh: string;
  dataLokalContoh?: string;
  dasarHukum?: string;
  aturanTerkait?: 'BSKAP 046/2025' | 'BKPDM 020/2026';
  indikatorKKTP: KriteriaKetercapaianItem[];
}

export const REGULASI_CP_TERBARU = {
  aturanUtama: {
    nomor: 'Keputusan Kepala BSKAP Nomor 046/H/KR/2025',
    tentang: 'Capaian Pembelajaran pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah',
    penerbit: 'Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP) Kemendikbudristek RI',
    tahun: 2025,
    lingkup: 'Mata Pelajaran Umum (SD & SMP: IPAS, IPA, Matematika, Bahasa Indonesia, Pendidikan Pancasila, IPS, Informatika, Bahasa Inggris, PJOK, Seni Rupa, Prakarya)'
  },
  aturanPerubahanAgama: {
    nomor: 'Keputusan Kepala BKPDM Nomor 020 Tahun 2026',
    tentang: 'Perubahan atas Keputusan Kepala BSKAP No. 046/H/KR/2025 tentang Capaian Pembelajaran pada PAUD, Pendidikan Dasar, dan Pendidikan Menengah (Ketentuan Khusus Agama & Budi Pekerti)',
    penerbit: 'Badan Kurikulum, Pelatihan, dan Moderasi (BKPDM)',
    tahun: 2026,
    lingkup: 'Pendidikan Agama dan Budi Pekerti (Islam, Kristen, Katolik, Hindu, Buddha, Khonghucu)'
  }
};

export const BSKAP_DECREE_INFO = {
  nomor: 'Keputusan Kepala BSKAP No. 046/H/KR/2025 & Keputusan Kepala BKPDM No. 020 Tahun 2026',
  nomorUtama: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
  nomorAgama: 'Keputusan Kepala BKPDM No. 020 Tahun 2026',
  judul: 'Capaian Pembelajaran PAUD, Pendidikan Dasar, dan Pendidikan Menengah (Aturan Utama Umum & Aturan Perubahan Khusus Agama)',
  tahun: 2026,
  penerbit: 'BSKAP Kemendikbudristek & BKPDM',
  status: 'Regulasi Resmi Terkini Kurikulum Merdeka (BSKAP 046/2025 & BKPDM 020/2026)'
};

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
  // ==========================================
  // SD - FASE A (Kelas I - II)
  // ==========================================
  {
    jenjang: 'SD',
    fase: 'Fase A',
    kelasContoh: 'I',
    mataPelajaran: 'Bahasa Indonesia',
    kategoriMapel: 'Bahasa Indonesia',
    materiContoh: 'Menyimak Informasi Lingkungan Sekolah & Memilah Fakta Gambar',
    elemenCP: 'Menyimak, Membaca dan Memirsa',
    rumusanCP: 'Peserta didik mampu bersikap menjadi penyimak yang baik, memahami informasi dari teks lisan dan tayangan visual sederhana tentang diri dan lingkungan sekitar, serta memaknai kosa kata baru dari teks yang dibacakan.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengidentifikasi fakta kegiatan menjaga kebersihan kelas dari gambar pengamatan dan membedakan tindakan yang sesuai aturan.',
    dataLokalContoh: 'Hasil pengamatan visual 5 sudut kelas: 3 meja kotor dengan bungkus makanan vs sudut baca yang rapi dan bersih.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Menyimak & Mengamati', indikator: 'Menemukan 2 kondisi nyata kebersihan kelas dari media gambar/cerita.' },
      { aspek: 'Pemilahan Fakta', indikator: 'Menunjukkan bukti langsung mana yang termasuk tindakan bersih dan mana yang tidak tertib.' },
      { aspek: 'Pilihan Sikap', indikator: 'Memilih tindakan yang benar dan menyebutkan alasan sederhana.' },
      { aspek: 'Komitmen Diri', indikator: 'Menyebutkan satu janji tindakan nyata untuk merawat kelasnya sendiri.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase A',
    kelasContoh: 'II',
    mataPelajaran: 'Matematika',
    kategoriMapel: 'Matematika',
    materiContoh: 'Bilangan Cacah, Turus & Perbandingan Jumlah Benda',
    elemenCP: 'Bilangan dan Pengukuran Data Sederhana',
    rumusanCP: 'Peserta didik menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 100, mampu membandingkan jumlah benda konkret, serta menyajikan dan menginterpretasikan data turus sederhana dalam kehidupan sehari-hari.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menghitung data turus benda/makanan kesukaan siswa dan membandingkan jumlah terbanyak dan tersedikit berbasis bukti konkret.',
    dataLokalContoh: 'Tabel turus pilihan buah bekal 24 siswa: Pisang (10 anak), Jeruk (8 anak), Apel (6 anak).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Membaca Data Turus', indikator: 'Menghitung total bilangan dari garis turus tanpa kesalahan.' },
      { aspek: 'Perbandingan Jumlah', indikator: 'Menyebutkan selisih jumlah benda terbanyak dan tersedikit secara tepat.' },
      { aspek: 'Pengambilan Keputusan', indikator: 'Menentukan pilihan bekal bersama kelas berdasarkan data terbanyak.' },
      { aspek: 'Refleksi Adil', indikator: 'Menyadari bahwa teman yang memilih buah lain tetap harus dihargai.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase A',
    kelasContoh: 'II',
    mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti',
    kategoriMapel: 'Pendidikan Agama',
    materiContoh: 'Adab Berbagi Bekal, Tolong Menolong & Huruf Hijaiyah',
    elemenCP: "Al-Qur'an dan Hadis serta Akhlak Terpuji",
    rumusanCP: "Peserta didik terbiasa membaca basmalah dan doa sebelum beraktivitas; mengenal huruf hijaiyah berharakat; serta meneladani akhlak mulia dalam bersikap santun, jujur, dan gemar menolong sesama teman di lingkungan rumah dan sekolah.",
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis situasi teman yang lupa membawa makanan bekal dan mempraktikkan adab tolong menolong berbagi makanan secara tulus dan sopan.',
    dataLokalContoh: 'Catatan kejadian jam istirahat: 2 teman tidak membawa bekal duduk menyendiri, sementara beberapa siswa memiliki porsi makanan berlebih.',
    dasarHukum: 'Keputusan Kepala BKPDM No. 020 Tahun 2026 jo. BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BKPDM 020/2026',
    indikatorKKTP: [
      { aspek: 'Identifikasi Kebutuhan Teman', indikator: 'Mengenali tanda teman yang membutuhkan pertolongan tanpa merasa malu.' },
      { aspek: 'Adab Berbagi Islami', indikator: 'Mempraktikkan cara berbagi makanan dengan tangan kanan dan ucapan yang santun.' },
      { aspek: 'Keteladanan Akhlak', indikator: 'Menunjukkan keikhlasan tanpa mengungkit-ungkit atau mengejek teman.' },
      { aspek: 'Refleksi Syukur', indikator: 'Mengucapkan alhamdulillah atas rezeki makanan yang dinikmati bersama.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase A',
    kelasContoh: 'II',
    mataPelajaran: 'PPKn/Pendidikan Pancasila',
    kategoriMapel: 'Pendidikan Pancasila',
    materiContoh: 'Aturan Kesepakatan Kelas & Disiplin Belajar',
    elemenCP: 'Aturan dan Norma di Rumah & Sekolah',
    rumusanCP: 'Peserta didik mampu mengenal dan menceritakan simbol dan sila-sila Pancasila, mengidentifikasi dan mematuhi aturan di rumah dan di sekolah, serta menunjukkan sikap gotong royong dalam keberagaman.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengevaluasi situasi ketertiban saat bermain di halaman sekolah dan menyepakati aturan bersama berdasarkan pengamatan harian.',
    dataLokalContoh: 'Catatan 3 kali kejadian antrean mainan ayunan yang berebut saat istirahat pertama.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Mengenali Masalah', indikator: 'Menyebutkan penyebab mainan ayunan cepat rusak atau membuat teman menangis.' },
      { aspek: 'Penggunaan Bukti Kejadian', indikator: 'Mengaitkan aturan antre bergiliran dengan kenyamanan bermain.' },
      { aspek: 'Solusi Kesepakatan', indikator: 'Mengusulkan batas waktu bergiliran (misal 5 menit) secara adil.' },
      { aspek: 'Refleksi Diri', indikator: 'Bersedia mematuhi aturan gantian main tanpa harus diingatkan guru.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase A',
    kelasContoh: 'I',
    mataPelajaran: 'PJOK',
    kategoriMapel: 'PJOK',
    materiContoh: 'Pola Gerak Dasar & Kebiasaan Cuci Tangan Sehat',
    elemenCP: 'Pengetahuan Gerak & Pemanfaatan Gerak',
    rumusanCP: 'Peserta didik dapat menunjukkan kemampuan dalam menirukan aktivitas pola gerak dasar lokomotor dan non-lokomotor; memahami prosedur bergerak dengan benar; serta menerapkan pola perilaku hidup sehat seperti menjaga kebersihan tangan dan kuku sebelum makan.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengidentifikasi langkah mencuci tangan 6 langkah berbasis sabun dan membedakan kondisi tangan bersih vs kotor setelah berolahraga.',
    dataLokalContoh: 'Checklist kebiasaan 24 siswa: 9 anak langsung memegang makanan bekal tanpa cuci tangan setelah pelajaran lari di lapangan rumput.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Identifikasi Kebiasaan Sehat', indikator: 'Menunjukkan urutan 6 langkah mencuci tangan dengan sabun secara benar.' },
      { aspek: 'Pengamatan Bukti Kuman', indikator: 'Menghubungkan kotoran tanah di kuku dengan risiko sakit perut.' },
      { aspek: 'Pilihan Tindakan', indikator: 'Memilih untuk selalu mencuci tangan sebelum membuka bekal.' },
      { aspek: 'Komitmen Hidup Bersih', indikator: 'Saling mengingatkan teman sebangku sebelum istirahat makan.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase A',
    kelasContoh: 'II',
    mataPelajaran: 'Seni Rupa',
    kategoriMapel: 'Seni & Prakarya',
    materiContoh: 'Eksplorasi Garis, Bentuk & Warna Bahan Alami',
    elemenCP: 'Mengalami dan Menciptakan',
    rumusanCP: 'Peserta didik mampu mengamati, mengeksplorasi, dan mengenali elemen rupa (garis, bentuk bidang, warna primer dan sekunder) di lingkungan sekitar; menggunakan berbagai alat dan bahan alami sederhana untuk menuangkan ide secara visual.',
    tujuanPembelajaranContoh: 'Peserta didik mampu memilah bentuk daun dan bahan alam di halaman sekolah untuk membuat komposisi cetak rupa berpola teratur.',
    dataLokalContoh: 'Pengumpulan 4 jenis bentuk daun gugur (lonjong, menjari, menyirip, bulat) di taman sekolah untuk karya cetak alami.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Eksplorasi Bentuk Daun', indikator: 'Membedakan minimal 3 bentuk tulang daun alami yang ditemukan di sekolah.' },
      { aspek: 'Penerapan Pola Rupa', indikator: 'Menyusun cap cetakan daun dengan variasi warna primer secara seimbang.' },
      { aspek: 'Kerapian & Ketelitian', indikator: 'Menjaga kebersihan meja kerja dan merapikan sisa bahan alami setelah berkarya.' },
      { aspek: 'Apresiasi Karya', indikator: 'Menceritakan keunikan pola cetak yang telah dibuat di depan teman kelas.' }
    ]
  },

  // ==========================================
  // SD - FASE B (Kelas III - IV)
  // ==========================================
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti',
    kategoriMapel: 'Pendidikan Agama',
    materiContoh: 'Adab Berwudhu, Hemat Air & Kebersihan Tempat Ibadah',
    elemenCP: 'Fikih Ibadah dan Akhlak Terpuji',
    rumusanCP: 'Peserta didik memahami rukun, syarat, dan tata cara bersuci (taharah) dan salat fardu; membiasakan perilaku hemat sumber daya air dalam beribadah; serta merawat kesucian sarana ibadah di sekolah dan lingkungan sekitar.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengevaluasi data debit pemborosan air wudhu musala sekolah dan merancang kesepakatan adab berhemat air wudhu berbasis sunnah rasul.',
    dataLokalContoh: 'Audit air musala: Kran dibuka penuh menghabiskan 4 liter air/anak vs kran dibuka sedang hanya 1.2 liter air/anak, dengan 90 siswa salat zuhur.',
    dasarHukum: 'Keputusan Kepala BKPDM No. 020 Tahun 2026 jo. BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BKPDM 020/2026',
    indikatorKKTP: [
      { aspek: 'Pemahaman Syariat & Sunnah', indikator: 'Menjelaskan anjuran tidak berlebih-lebihan (israf) saat mengambil air wudhu.' },
      { aspek: 'Analisis Bukti Pemborosan', indikator: 'Menghitung total liter air yang terselamatkan jika seluruh siswa mengecilkan putaran kran.' },
      { aspek: 'Rencana Aksi Hemat', indikator: 'Merumuskan stiker pengingat adab wudhu hemat air di tempat wudhu sekolah.' },
      { aspek: 'Refleksi Tanggung Jawab', indikator: 'Berkomitmen mematikan kran wudhu yang masih menetes secara mandiri.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'IPAS',
    kategoriMapel: 'IPAS/IPA',
    materiContoh: 'Pertumbuhan Tanaman & Kebutuhan Makhluk Hidup',
    elemenCP: 'Keterampilan Proses & Penyelidikan Lingkungan',
    rumusanCP: 'Peserta didik mengamati fenomena alam dan sosial di lingkungan sekitar, mengidentifikasi pola sederhana, mencatat hasil observasi, serta membuat kesimpulan sederhana berdasarkan bukti yang teramati.',
    tujuanPembelajaranContoh: 'Peserta didik mampu membandingkan hasil pengamatan pertumbuhan tanaman di dua tempat berbeda dan menyimpulkan faktor pengaruhnya berdasarkan bukti nyata.',
    dataLokalContoh: 'Tabel tinggi tanaman cabai hari ke-1 sampai ke-14: Pot A (kena matahari) = 18 cm, Pot B (di lorong teduh) = 8 cm pucat.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Observasi & Masalah', indikator: 'Menemukan perbedaan nyata kondisi fisik tanaman dari data pengamatan 14 hari.' },
      { aspek: 'Bukti Pengamatan', indikator: 'Mengutip angka tinggi batang dan warna daun sebagai bukti perbandingan.' },
      { aspek: 'Penalaran Sebab-Akibat', indikator: 'Menjelaskan hubungan intensitas cahaya matahari terhadap laju fotosintesis.' },
      { aspek: 'Refleksi Kebiasaan', indikator: 'Merumuskan jadwal penyiraman dan pemindahan pot tanaman sekolah secara teratur.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'IPAS',
    kategoriMapel: 'IPAS/IPA',
    materiContoh: 'Wujud Zat, Perubahan Suhu & Pencairan Es',
    elemenCP: 'Pemahaman IPAS (Materi dan Energi)',
    rumusanCP: 'Peserta didik mengidentifikasi wujud zat (padat, cair, gas), mengamati proses perubahan wujud zat dalam kehidupan sehari-hari, dan menyelidiki pemanfaatan energi panas dan gerak di lingkungan sekitar.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis tabel laju pencairan es di bawah terik vs teduh dan menyimpulkan pengaruh suhu lingkungan berdasarkan data waktu.',
    dataLokalContoh: 'Data menit melelehnya 100 gram es batu: di lapangan terik (12 menit), di dalam kelas (28 menit), di dalam wadah termos (110 menit).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Membaca Data Waktu', indikator: 'Mengidentifikasi wadah yang paling cepat dan paling lambat mencairkan es.' },
      { aspek: 'Bukti Pengaruh Kalor', indikator: 'Menghubungkan perbedaan suhu udara luar kelas dengan kecepatan meleleh.' },
      { aspek: 'Aplikasi Praktis', indikator: 'Merekomendasikan tempat penyimpanan es lilin pedagang kantin agar tidak cepat cair.' },
      { aspek: 'Refleksi Percobaan', indikator: 'Menyebutkan faktor lain (seperti angin atau penutup) yang memengaruhi data.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'Matematika',
    kategoriMapel: 'Matematika',
    materiContoh: 'Pengukuran Berat Sampah & Diagram Batang',
    elemenCP: 'Pengukuran dan Penyajian Data',
    rumusanCP: 'Peserta didik dapat mengukur panjang dan berat benda menggunakan satuan baku, serta menyajikan dan menginterpretasikan data dalam bentuk diagram batang tegak dan mendatar untuk memecahkan masalah kontekstual.',
    tujuanPembelajaranContoh: 'Peserta didik mampu membaca diagram batang timbulan sampah kelas IV dan V serta merumuskan keputusan pemenang lomba kebersihan berbasis data akurat.',
    dataLokalContoh: 'Data timbangan sampah anorganik 5 hari: Kelas IVA = 12 kg, IVB = 7 kg, VA = 15 kg, VB = 6 kg.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Interpretasi Diagram', indikator: 'Menemukan kelas dengan timbulan sampah terendah dan tertinggi secara tepat.' },
      { aspek: 'Komputasi Selisih', indikator: 'Menghitung selisih kilogram sampah antarkelas secara akurat.' },
      { aspek: 'Justifikasi Juara', indikator: 'Menjelaskan mengapa kelas dengan sampah paling sedikit layak menjadi teladan.' },
      { aspek: 'Refleksi Konsistensi', indikator: 'Mengevaluasi apakah data 5 hari sudah cukup adil untuk lomba tahunan.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'Bahasa Indonesia',
    kategoriMapel: 'Bahasa Indonesia',
    materiContoh: 'Teks Prosedur & Petunjuk Kerja Berbasis Fakta',
    elemenCP: 'Membaca, Memirsa dan Menulis Teks Petunjuk',
    rumusanCP: 'Peserta didik mampu memahami ide pokok dan ide pendukung pada teks informatif, menyajikan petunjuk langkah-langkah kerja yang terstruktur, dan membedakan informasi faktual dengan rekaan.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengevaluasi kejelasan teks petunjuk pembuatan pupuk kompos daun sekolah dan memperbaiki langkah yang terlewat berdasarkan hasil uji coba nyata.',
    dataLokalContoh: 'Lembar petunjuk kompos daun 4 langkah vs catatan kegagalan karena daun kering tidak disiram air EM4.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Identifikasi Kesalahan', indikator: 'Menemukan langkah yang hilang pada teks petunjuk pembuatan kompos.' },
      { aspek: 'Pemanfaatan Fakta Uji Coba', indikator: 'Mengaitkan kegagalan pembusukan dengan kurangnya kelembapan kompos.' },
      { aspek: 'Perbaikan Teks Petunjuk', indikator: 'Menulis ulang urutan langkah yang jelas dan runtut menggunakan kata kerja aktif.' },
      { aspek: 'Refleksi Kejelasan', indikator: 'Menilai apakah petunjuk yang baru dapat dipahami oleh siswa kelas lain.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'PPKn/Pendidikan Pancasila',
    kategoriMapel: 'Pendidikan Pancasila',
    materiContoh: 'Gotong Royong & Pembagian Beban Kerja Kelompok',
    elemenCP: 'Gotong Royong dan Keberagaman Karakteristik',
    rumusanCP: 'Peserta didik mampu mengenal identitas diri dan teman, menghargai keberagaman budaya, suku bangsa, dan agama di lingkungan sekolah, serta menerapkan nilai gotong royong dalam menyelesaikan tugas kelompok secara adil.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis dilema pembagian tugas piket kebersihan kelas agar adil bagi semua anggota berdasarkan beban kerja nyata.',
    dataLokalContoh: 'Tabel piket: 2 anak menyapu seluruh aula besar sementara 3 anak hanya menghapus papan tulis kecil.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Deteksi Ketidakadilan', indikator: 'Menemukan ketimpangan waktu pengerjaan antara menyapu aula vs menghapus papan.' },
      { aspek: 'Analisis Bukti Beban Kerja', indikator: 'Menghitung estimasi menit yang dihabiskan masing-masing anggota piket.' },
      { aspek: 'Solusi Rekomposisi Tugas', indikator: 'Menyusun ulang jadwal piket yang merata sesuai kemampuan fisik anggota.' },
      { aspek: 'Refleksi Kerjasama', indikator: 'Menjelaskan arti penting gotong royong saling membantu bila teman belum selesai.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'Bahasa Inggris',
    kategoriMapel: 'Bahasa Inggris',
    materiContoh: 'Classroom Objects & Simple Price Inquiry',
    elemenCP: 'Menyimak - Berbicara (Listening - Speaking)',
    rumusanCP: 'Peserta didik menggunakan bahasa Inggris sederhana untuk berinteraksi dalam situasi kelas; mengidentifikasi benda-benda di sekitar ruang kelas, menghitung jumlah benda, dan memahami instruksi lisan sederhana dengan bantuan visual.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menghitung dan mendeskripsikan inventaris benda kelas dalam bahasa Inggris serta membandingkan data ketersediaan kursi dan meja belajar.',
    dataLokalContoh: 'Classroom inventory checklist: 28 desks, 32 student chairs (excess 4 chairs), 2 whiteboard markers, 1 clock.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Vocabulary & Identification', indikator: 'Menyebutkan nama-nama perabot kelas dalam bahasa Inggris dengan pelafalan jelas.' },
      { aspek: 'Number & Inventory Check', indikator: 'Menghitung dan membandingkan jumlah meja vs kursi secara akurat.' },
      { aspek: 'Formulating English Statement', indikator: 'Menyusun kalimat sederhana deskripsi ruangan (misal: "There are 28 desks in the room").' },
      { aspek: 'Collaborative Care', indikator: 'Mengusulkan pemindahan kursi berlebih ke ruang perpustakaan.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'PJOK',
    kategoriMapel: 'PJOK',
    materiContoh: 'Kebugaran Jasmani Dasar & Pengukuran Denyut Nadi',
    elemenCP: 'Pengetahuan Gerak & Pemanfaatan Gerak',
    rumusanCP: 'Peserta didik dapat mempraktikkan variasi dan kombinasi pola gerak dasar secara mandiri; memahami konsep aktivitas jasmani untuk kebugaran tubuh; mengukur denyut nadi sederhana saat istirahat dan setelah beraktivitas fisik; serta menjaga kebersihan lingkungan olahraga.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis perbedaan denyut nadi sebelum dan sesudah lari bolak-balik 5 menit serta merumuskan aturan pemanasan yang aman.',
    dataLokalContoh: 'Tabel denyut nadi 6 siswa: Saat duduk istirahat (rata-rata 82 bpm) vs Setelah lari shuttle run (rata-rata 138 bpm).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Keterampilan Mengukur Nadi', indikator: 'Menghitung denyut nadi di pergelangan tangan atau leher selama 15 detik dikali 4.' },
      { aspek: 'Analisis Respon Jantung', indikator: 'Menjelaskan mengapa denyut jantung berdegup lebih kencang saat bergerak aktif.' },
      { aspek: 'Pentingnya Pemanasan', indikator: 'Mengaitkan pemanasan bertahap dengan pencegahan cedera otot.' },
      { aspek: 'Refleksi Kebugaran', indikator: 'Mencatat frekuensi berolahraga di luar jam sekolah (minimal 3x seminggu).' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase B',
    kelasContoh: 'IV',
    mataPelajaran: 'Seni Rupa',
    kategoriMapel: 'Seni & Prakarya',
    materiContoh: 'Pemanfaatan Sampah Kertas Jadi Karya Mozaik Simetris',
    elemenCP: 'Menciptakan dan Berpikir Artistik',
    rumusanCP: 'Peserta didik mampu mengidentifikasi dan memadukan unsur rupa (garis, bentuk simetris, warna komplementer, dan tekstur) dari benda-benda sekitar; menghasilkan karya dua dimensi dengan memanfaatkan bahan daur ulang ramah lingkungan.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mendesain karya mozaik satwa nusantara menggunakan potongan kertas brosur bekas dan menerapkan prinsip komposisi seimbang.',
    dataLokalContoh: 'Pengumpulan 2 kg limbah kertas majalah/brosur bekas di kantor guru untuk bahan guntingan mozaik satwa.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Prinsip Keseimbangan Bentuk', indikator: 'Menggambar sketsa pola satwa nusantara dengan proporsi yang tepat.' },
      { aspek: 'Kombinasi Warna Mozaik', indikator: 'Memadukan gradasi warna potongan kertas daur ulang secara harmonis.' },
      { aspek: 'Ketelitian Menempel', indikator: 'Menempelkan sobekan kertas rapat tanpa keluar dari garis batas gambar.' },
      { aspek: 'Refleksi Daur Ulang', indikator: 'Menjelaskan manfaat mengurangi limbah kertas melalui kreasi seni.' }
    ]
  },

  // ==========================================
  // SD - FASE C (Kelas V - VI)
  // ==========================================
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'V',
    mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti',
    kategoriMapel: 'Pendidikan Agama',
    materiContoh: 'Keberagaman, Toleransi Antarumat Beragama & Menghargai Pendapat',
    elemenCP: "Al-Qur'an dan Hadis serta Akhlak Terpuji (Toleransi & Kebinekaan)",
    rumusanCP: 'Peserta didik memahami pesan pokok ayat Al-Qur\'an tentang penciptaan manusia berbangsa-bangsa untuk saling mengenal (ta\'aruf); menunjukkan sikap saling menghargai perbedaan latar belakang agama, suku, dan budaya; serta menjunjung tinggi persaudaraan dan keadilan dalam kehidupan bermasyarakat.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis kasus kesalahpahaman antarkelompok siswa berbeda latar belakang dan merumuskan langkah tabayyun serta dialog damai berbasis nilai persaudaraan.',
    dataLokalContoh: 'Insiden selisih paham jadwal latihan pentas seni antar kelompok yang bertepatan dengan waktu ibadah teman beragama lain.',
    dasarHukum: 'Keputusan Kepala BKPDM No. 020 Tahun 2026 jo. BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BKPDM 020/2026',
    indikatorKKTP: [
      { aspek: 'Pemahaman Makna Ta\'aruf', indikator: 'Menjelaskan hikmah keberagaman sebagai sunnatullah yang harus disikapi dengan bijak.' },
      { aspek: 'Prinsip Tabayyun', indikator: 'Mempraktikkan cara memverifikasi informasi secara langsung sebelum menarik prasangka negatif.' },
      { aspek: 'Musyawarah & Toleransi', indikator: 'Menyusun jadwal kegiatan bersama yang menghormati waktu ibadah seluruh anggota.' },
      { aspek: 'Refleksi Akhlak Mulia', indikator: 'Berkomitmen menjadi juru damai saat terjadi perselisihan antarteman di sekolah.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'V',
    mataPelajaran: 'IPAS',
    kategoriMapel: 'IPAS/IPA',
    materiContoh: 'Kelestarian Lingkungan & Pengelolaan Sampah Plastik',
    elemenCP: 'Keterampilan Proses & Pemahaman IPAS (Lingkungan Hidup)',
    rumusanCP: 'Peserta didik menganalisis hubungan timbal balik antara manusia dengan lingkungan, menyelidiki permasalahan lingkungan sekolah melalui pengumpulan dan analisis data empiris, serta merancang tindakan berkelanjutan berbasis bukti.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis masalah timbulan sampah plastik di sekolah, membandingkan dua opsi solusi berdasarkan data konkret, dan merefleksikan konsekuensi keputusan.',
    dataLokalContoh: 'Data timbulan 50 botol plastik per hari di kantin, perbandingan biaya membeli tong sampah baru vs kampanye membawa tumbler sendiri.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Pemahaman Masalah', indikator: 'Mengidentifikasi akar dilema pengelolaan sampah dan aktor yang terlibat di lingkungan sekolah.' },
      { aspek: 'Pemanfaatan Bukti Data', indikator: 'Mengutip minimal 2 data kuantitatif dari tabel audit untuk mendukung usulan.' },
      { aspek: 'Penalaran & Justifikasi', indikator: 'Menjelaskan hubungan sebab-akibat secara logis mengapa solusi pilihan lebih efektif.' },
      { aspek: 'Refleksi & Alternatif', indikator: 'Menyadari potensi kendala usulan dan merumuskan data tambahan yang dibutuhkan.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'V',
    mataPelajaran: 'IPAS',
    kategoriMapel: 'IPAS/IPA',
    materiContoh: 'Nutrisi Makanan Kantin & Sistem Pencernaan Sehat',
    elemenCP: 'Pemahaman IPAS (Sains Hayati & Tubuh Manusia)',
    rumusanCP: 'Peserta didik memahami sistem organ tubuh manusia (pernapasan, pencernaan, peredaran darah) dan cara memelihara kesehatannya, serta menganalisis kandungan nutrisi makanan yang dikonsumsi sehari-hari.',
    tujuanPembelajaranContoh: 'Peserta didik mampu membandingkan menu kantin tinggi minyak/gula vs menu gizi seimbang berdasarkan data kalori dan dampaknya terhadap konsentrasi belajar siswa.',
    dataLokalContoh: 'Daftar jajanan kantin: Gorengan (250 kkal, lemak tinggi, serat 0g) vs Gado-gado mini (180 kkal, sayur, serat 4g), dan catatan keluhan kantuk siswa jam ke-5.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Analisis Kandungan Gizi', indikator: 'Menjelaskan perbedaan zat gizi (lemak jenuh, gula, serat) dari menu jajanan.' },
      { aspek: 'Hubungan dengan Tubuh', indikator: 'Mengaitkan konsumsi lemak berlebih dengan penurunan oksigen ke otak dan rasa kantuk.' },
      { aspek: 'Rekomendasi Menu Kantin', indikator: 'Merumuskan 2 usulan menu terjangkau yang bergizi seimbang untuk kantin sekolah.' },
      { aspek: 'Refleksi Pola Makan', indikator: 'Mengevaluasi kebiasaan sarapan diri sendiri dan dampaknya saat belajar.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'V',
    mataPelajaran: 'Matematika',
    kategoriMapel: 'Matematika',
    materiContoh: 'Analisis Data, Diagram Batang Ganda & Nilai Rata-rata',
    elemenCP: 'Analisis Data dan Peluang',
    rumusanCP: 'Peserta didik dapat mengurutkan, membandingkan, dan menyajikan data faktual lingkungan sekitar dalam bentuk tabel dan diagram batang ganda, menentukan nilai rata-rata (mean), modus, serta menginterpretasi data tersebut untuk mengambil keputusan rasional.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menginterpretasikan tabel perbandingan pengeluaran kantin dan merumuskan keputusan alokasi anggaran hemat berbasis rasio data.',
    dataLokalContoh: 'Tabel pengeluaran uang saku harian siswa (Rp5.000 - Rp15.000) dan alokasi untuk jajan vs menabung selama 4 minggu.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Interpretasi Data', indikator: 'Membaca dan membandingkan selisih nilai angka dalam tabel secara tepat.' },
      { aspek: 'Penggunaan Bukti Numerik', indikator: 'Menyertakan perhitungan nilai rata-rata atau selisih kuantitatif sebagai argumen pendukung.' },
      { aspek: 'Pengambilan Keputusan', indikator: 'Memilih opsi yang paling menguntungkan dan efisien berdasarkan angka riil.' },
      { aspek: 'Refleksi Validitas', indikator: 'Mengevaluasi apakah data sudah memadai untuk membuat kesimpulan jangka panjang.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'VI',
    mataPelajaran: 'Matematika',
    kategoriMapel: 'Matematika',
    materiContoh: 'Rasio, Kecepatan, Debit Air & Efisiensi Sumber Daya',
    elemenCP: 'Bilangan, Pengukuran dan Rasio',
    rumusanCP: 'Peserta didik dapat menyelesaikan masalah yang berkaitan dengan rasio, proporsi, kecepatan sebagai perbandingan jarak terhadap waktu, serta debit sebagai perbandingan volume terhadap waktu dalam kehidupan nyata.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menghitung debit pemborosan air dari keran wudhu yang bocor dan menghitung potensi liter air yang dapat diselamatkan dalam sebulan.',
    dataLokalContoh: 'Uji ember: 1 keran bocor menampung 1.5 liter air dalam waktu 10 menit, dengan total 8 keran bocor di sekolah.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Perhitungan Debit', indikator: 'Menghitung debit tetesan air per menit dan mengonversinya ke satuan liter per jam/hari.' },
      { aspek: 'Ekstrapolasi Data', indikator: 'Menghitung akumulasi pemborosan air untuk seluruh keran selama 30 hari.' },
      { aspek: 'Analisis Biaya', indikator: 'Mengaitkan liter air yang terbuang dengan tarif tagihan PDAM sekolah.' },
      { aspek: 'Rencana Konservasi', indikator: 'Menyusun usulan perbaikan seal keran dan jadwal piket cek keran sebelum pulang.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'V',
    mataPelajaran: 'Bahasa Indonesia',
    kategoriMapel: 'Bahasa Indonesia',
    materiContoh: 'Fakta vs Opini & Teks Argumentasi Lingkungan',
    elemenCP: 'Membaca Memirsa (Fakta vs Opini, Teks Argumentasi)',
    rumusanCP: 'Peserta didik mampu membaca kata-kata baru dengan fasih, mengidentifikasi ide pokok dan pesan dari teks eksplanasi atau argumentasi, membedakan antara fakta objektif dan opini subjektif, serta menyusun sanggahan berbasis bukti.',
    tujuanPembelajaranContoh: 'Peserta didik mampu membedakan fakta data dan klaim opini dalam selebaran kampanye lingkungan sekolah serta menuliskan paragraf tanggapan kritis.',
    dataLokalContoh: 'Selebaran: "Kantin kita paling kotor sedunia (opini)" vs "Ditemukan 12 lalat di dekat tempat sampah terbuka (fakta)".',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Klasifikasi Kalimat', indikator: 'Memisahkan minimal 2 kalimat fakta dan 2 kalimat opini dari teks stimulus.' },
      { aspek: 'Identifikasi Bukti', indikator: 'Menjelaskan mengapa suatu pernyataan dikategorikan fakta (memiliki angka/verifikasi).' },
      { aspek: 'Penyusunan Argumen', indikator: 'Menulis tanggapan logis dengan kalimat efektif untuk meluruskan opini berlebihan.' },
      { aspek: 'Refleksi Kritis', indikator: 'Menyadari bahwa judul provokatif sering menggunakan opini yang belum tentu benar.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'VI',
    mataPelajaran: 'PPKn/Pendidikan Pancasila',
    kategoriMapel: 'Pendidikan Pancasila',
    materiContoh: 'Musyawarah Mufakat & Hak-Kewajiban Penggunaan Fasilitas',
    elemenCP: 'Musyawarah dan Pemenuhan Hak & Kewajiban',
    rumusanCP: 'Peserta didik mampu memahami dan menyajikan bentuk-bentuk hak dan kewajiban warga negara, mempraktikkan musyawarah untuk mencapai mufakat dalam kehidupan sehari-hari di sekolah dan masyarakat, serta menghargai keputusan bersama.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis perdebatan alokasi uang kas kelas dan merumuskan kompromi mufakat yang berkeadilan berdasarkan data kebutuhan kelas.',
    dataLokalContoh: 'Saldo kas Rp450.000: Perdebatan antara membeli bola futsal baru (Rp200.000) vs membeli dispenser air minum kelas (Rp300.000).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Identifikasi Kepentingan', indikator: 'Menguraikan argumen pendukung kelompok hobi olahraga vs kebutuhan air minum harian.' },
      { aspek: 'Kategori Hak & Kebutuhan', indikator: 'Membedakan kebutuhan primer seluruh siswa dengan keinginan rekreasi sebagian siswa.' },
      { aspek: 'Rumusan Solusi Mufakat', indikator: 'Merancang skema cicilan atau opsi kompromi win-win yang disetujui bersama.' },
      { aspek: 'Refleksi Kepatuhan', indikator: 'Menyatakan komitmen untuk menghormati hasil musyawarah meskipun berbeda dari usulan awal.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'VI',
    mataPelajaran: 'Bahasa Inggris',
    kategoriMapel: 'Bahasa Inggris',
    materiContoh: 'Reading Nutrition Facts & Healthy Canteen Choices',
    elemenCP: 'Membaca - Memirsa (Reading - Viewing)',
    rumusanCP: 'Peserta didik memahami kata-kata yang sering digunakan dalam kehidupan sehari-hari; membaca dan merespons teks informatif pendek sederhana berupa deskripsi benda, daftar harga, atau tabel gizi menu dengan bantuan ilustrasi visual.',
    tujuanPembelajaranContoh: 'Peserta didik mampu membandingkan label informasi nilai gizi 2 minuman kemasan dalam bahasa Inggris dan memilih opsi yang lebih sehat berdasarkan fakta gula/kalori.',
    dataLokalContoh: 'Nutrition label comparison: Drink A "Fresh Milk" (Sugar: 6g, Calcium: 25%) vs Drink B "Boba Sweet Tea" (Sugar: 32g, Calcium: 0%).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Information Extraction', indikator: 'Menemukan angka kandungan gula (sugar) dan vitamin dari tabel label kemasan berbahasa Inggris.' },
      { aspek: 'Comparative Evaluation', indikator: 'Membandingkan dampak kelebihan gula terhadap kesehatan gigi dan berat badan.' },
      { aspek: 'Formulating Recommendation', indikator: 'Menuliskan 1 kalimat rekomendasi pilihan minuman terbaik untuk teman sekolah.' },
      { aspek: 'Critical Health Literacy', indikator: 'Menyadari bahwa klaim rasa buah sering kali mengandung lebih banyak pemanis sintetis.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'V',
    mataPelajaran: 'PJOK',
    kategoriMapel: 'PJOK',
    materiContoh: 'Daya Tahan Jantung-Paru & Status Kebugaran Jasmani',
    elemenCP: 'Pemanfaatan Gerak & Pengetahuan Gerak',
    rumusanCP: 'Peserta didik mampu mempraktikkan keterampilan gerak spesifik dalam berbagai aktivitas kebugaran; memahami prinsip dasar latihan daya tahan jantung dan paru-paru; mengukur hasil tes lari/jalan; serta merancang jadwal aktivitas fisik harian berbasis data mandiri.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengevaluasi data waktu tempuh tes lari 600 meter dan menentukan kategori kebugaran serta program latihan jalan cepat teratur.',
    dataLokalContoh: 'Data tes lari 600 meter 28 siswa: 8 siswa kategori bugar (<3.5 menit), 12 siswa kategori sedang (3.5 - 4.5 menit), 8 siswa kelelahan (>5 menit).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Interpretasi Waktu Tempuh', indikator: 'Mengelompokkan hasil catatan waktu tempuh siswa ke dalam tabel standar kebugaran jasmani.' },
      { aspek: 'Analisis Faktor Kebugaran', indikator: 'Mengaitkan kebiasaan jalan kaki ke sekolah dengan catatan waktu tempuh yang lebih prima.' },
      { aspek: 'Perancangan Program Latihan', indikator: 'Menyusun jadwal jalan sehat bertahap 20 menit per hari untuk siswa kelompok kurang bugar.' },
      { aspek: 'Refleksi Pola Hidup', indikator: 'Mengevaluasi waktu layar (screen time) HP yang mengurangi jam aktivitas fisik bermain di luar.' }
    ]
  },
  {
    jenjang: 'SD',
    fase: 'Fase C',
    kelasContoh: 'VI',
    mataPelajaran: 'Seni Rupa',
    kategoriMapel: 'Seni & Prakarya',
    materiContoh: 'Prinsip Keseimbangan & Desain Poster Edukasi Lingkungan',
    elemenCP: 'Berdampak dan Menciptakan',
    rumusanCP: 'Peserta didik mampu menganalisis masalah lingkungan sekitar dan merancang karya seni visual dua dimensi (poster kampanye, infografis) dengan menerapkan prinsip keseimbangan, kontras warna, dan hierarki visual agar pesan tersampaikan secara persuasif.',
    tujuanPembelajaranContoh: 'Peserta didik mampu membandingkan 2 rancangan poster hemat energi sekolah dan menyempurnakan tata letak (layout) agar lebih menarik dan efektif menggerakkan warga sekolah.',
    dataLokalContoh: 'Survei uji keterbacaan 2 poster di mading: Poster A (kontras tinggi, gambar dominan) dibaca 45 siswa vs Poster B (teks rapat tanpa ilustrasi) hanya dibaca 6 siswa.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Analisis Kontras & Hierarki', indikator: 'Menjelaskan peran pemilihan warna kontras dan ukuran judul terhadap daya tarik pembaca.' },
      { aspek: 'Keseimbangan Komposisi', indikator: 'Menata letak gambar ilustrasi dan teks agar tidak berat sebelah (asimetris harmonis).' },
      { aspek: 'Revisi Desain Berbasis Data', indikator: 'Memperbaiki tata letak poster B agar pesan mematikan saklar lampu terbaca seketika.' },
      { aspek: 'Dampak Sosial Karya', indikator: 'Menjelaskan bagaimana sebuah poster seni rupa dapat mengubah perilaku hemat energi.' }
    ]
  },

  // ==========================================
  // SMP - FASE D (Kelas VII - IX)
  // ==========================================
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti',
    kategoriMapel: 'Pendidikan Agama',
    materiContoh: 'Integritas Akademik, Menghindari Berita Bohong (Hoaks) & Tabayyun Digital',
    elemenCP: "Al-Qur'an, Hadis, dan Akhlak Terpuji (Etika Komunikasi & Kejujuran)",
    rumusanCP: 'Peserta didik memahami kandungan ayat Al-Qur\'an dan hadis tentang kejujuran, amanah, dan larangan menyebarkan kabar bohong/fitnah; mempraktikkan budaya tabayyun (verifikasi) dalam bermedia digital; serta meneladani akhlak rasul dalam menjaga lisan dan jemari dari ujaran kebencian.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis peredaran kabar bohong (hoaks) yang memicu kegaduhan antarsiswa di grup WhatsApp sekolah dan merumuskan panduan tabayyun verifikasi berita sesuai syariat Islam.',
    dataLokalContoh: 'Kasus viral tangkapan layar pesan berantai palsu tentang pembatalan study tour sekolah yang memicu protes 60 siswa sebelum dikonfirmasi ke pihak guru.',
    dasarHukum: 'Keputusan Kepala BKPDM No. 020 Tahun 2026 jo. BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BKPDM 020/2026',
    indikatorKKTP: [
      { aspek: 'Kajian Dalil Tabayyun', indikator: 'Menjelaskan pesan pokok QS. Al-Hujurat ayat 6 tentang kewajiban memeriksa kebenaran berita dari orang fasik.' },
      { aspek: 'Analisis Bukti Digital', indikator: 'Mengidentifikasi ciri-ciri pesan provokatif tanpa sumber jelas (URL palsu, judul sensasional, desakan viralkan).' },
      { aspek: 'Perumusan Solusi Islami', indikator: 'Menyusun langkah klarifikasi santun (tabayyun) kepada pihak berwenang sebelum membagikan ulang.' },
      { aspek: 'Refleksi Akhlak Digital', indikator: 'Berkomitmen menjadi agen penyebar kedamaian dan penangkal hoaks di lingkungan sekolah.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'IPA',
    kategoriMapel: 'IPAS/IPA',
    materiContoh: 'Energi Listrik, Daya (Watt) & Efisiensi Konsumsi Energi',
    elemenCP: 'Keterampilan Proses & Pemahaman IPA (Energi dan Kelistrikan)',
    rumusanCP: 'Peserta didik memahami konsep energi listrik, daya, dan efisiensinya dalam kehidupan sehari-hari; mampu merancang penyelidikan, menginterpretasi data konsumsi energi, serta mengevaluasi klaim efisiensi energi dengan penalaran ilmiah berbasis bukti.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis grafik tren penggunaan energi listrik 5 bulan, menguji validitas hipotesis dua pihak berdasarkan bukti parsial, dan merancang rekomendasi efisiensi.',
    dataLokalContoh: 'Catatan kWh meteran 5 bulan SMP Merdeka dengan anomali lonjakan 42% pada bulan Oktober saat suhu 34.8°C dan kegiatan Lab Komputer P5.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
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
    kelasContoh: 'VII',
    mataPelajaran: 'IPA',
    kategoriMapel: 'IPAS/IPA',
    materiContoh: 'Ekosistem, Indikator Kualitas Air & Pencemaran Lingkungan',
    elemenCP: 'Pemahaman IPA (Ekologi dan Keanekaragaman Hayati)',
    rumusanCP: 'Peserta didik mampu mengidentifikasi interaksi antarmakhluk hidup dan lingkungannya dalam ekosistem, merancang upaya-upaya mencegah dan mengatasi pencemaran lingkungan, serta mengevaluasi dampak aktivitas manusia terhadap keanekaragaman hayati.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis data pH, kekeruhan (NTU), dan keberadaan bioindikator di hulu vs hilir saluran air sekolah untuk menentukan sumber pencemaran limbah detergen/kantin.',
    dataLokalContoh: 'Uji sampel 3 titik: Hulu selokan (pH 7.1, jentik capung ada, NTU 5) vs Muara kantin (pH 9.2, berbusa detergen, NTU 48, bioindikator mati).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Interpretasi Parameter Fisiko-Kimia', indikator: 'Menganalisis arti lonjakan pH basa dan kekeruhan tinggi bagi kelangsungan organisme air.' },
      { aspek: 'Penentuan Sumber Pencemar', indikator: 'Menunjuk aktivitas pencucian piring kantin tanpa bak penangkap lemak (grease trap) sebagai faktor utama.' },
      { aspek: 'Solusi Teknologi Ramah Lingkungan', indikator: 'Merancang instalasi penyaring sederhana (ijuk, pasir, arang aktif) sebelum air dibuang ke selokan.' },
      { aspek: 'Refleksi Dampak Sistemik', indikator: 'Menjelaskan efek akumulasi limbah detergen terhadap biota sungai di hilir pemukiman.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'IPA',
    kategoriMapel: 'IPAS/IPA',
    materiContoh: 'Zat Aditif Makanan, Uji Boraks/Formalin & Gaya Hidup Sehat',
    elemenCP: 'Pemahaman IPA (Zat dan Sifatnya, Zat Aditif)',
    rumusanCP: 'Peserta didik memahami sifat fisika dan kimia zat, membedakan zat aditif alami dan buatan pada makanan dan minuman, serta menganalisis dampak penggunaan zat aditif dan zat adiktif bagi kesehatan manusia.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengevaluasi data hasil uji laboratorium sederhana jajanan sekolah dan merumuskan rekomendasi regulasi kantin sehat berbasis bukti ilmiah.',
    dataLokalContoh: 'Uji kunyit & tusuk gigi pada 5 sampel bakso: Sampel A & D berubah warna merah kecokelatan pekat (positif pengawet sintetis).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Analisis Hasil Reaksi Kimia', indikator: 'Menjelaskan perubahan warna kurkumin saat bereaksi dengan zat aditif boraks.' },
      { aspek: 'Evaluasi Risiko Kesehatan', indikator: 'Menjelaskan bahaya konsumsi zat pengawet non-pangan bagi fungsi ginjal dan hati.' },
      { aspek: 'Rekomendasi Kebijakan Sekolah', indikator: 'Mengusulkan sertifikasi higienis berkala bagi mitra pedagang kantin.' },
      { aspek: 'Refleksi Perilaku Konsumen', indikator: 'Mengenali ciri visual makanan berpengawet (terlalu kenyal/tahan berhari-hari).' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'Matematika',
    kategoriMapel: 'Matematika',
    materiContoh: 'Statistika, Garis Tren & Korelasi Waktu Belajar vs Nilai',
    elemenCP: 'Analisis Data dan Peluang',
    rumusanCP: 'Peserta didik dapat menyajikan dan menginterpretasi data menggunakan diagram pencar, garis tren, dan ukuran pemusatan data; mengevaluasi validitas kesimpulan yang dibuat oleh pihak lain berdasarkan data statistik riil.',
    tujuanPembelajaranContoh: 'Peserta didik mampu memverifikasi klaim efektivitas program belajar mandiri berbasis data nilai tryout dan durasi belajar harian siswa.',
    dataLokalContoh: 'Data 30 siswa: Hubungan jam belajar mandiri (0.5 - 3 jam) dengan perolehan nilai, serta anomali 2 siswa yang belajar 4 jam namun kurang tidur sehingga nilainya turun.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Interpretasi Tren Statistik', indikator: 'Menemukan pola korelasi positif serta mengidentifikasi titik pencilan (outlier) anomali.' },
      { aspek: 'Verifikasi Klaim', indikator: 'Menunjukkan bukti data yang membantah klaim sepihak bahwa semakin lama jam belajar pasti semakin tinggi nilainya.' },
      { aspek: 'Argumen Kuantitatif', indikator: 'Menggunakan rata-rata, rentang nilai, atau kuartil untuk membuktikan argumen.' },
      { aspek: 'Refleksi Bias & Variabel Perancu', indikator: 'Menjelaskan variabel lain seperti kualitas tidur dan efektivitas metode belajar.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'Matematika',
    kategoriMapel: 'Matematika',
    materiContoh: 'Sistem Persamaan Linier Dua Variabel (SPLDV) Kontekstual',
    elemenCP: 'Aljabar dan Pola Hubungan',
    rumusanCP: 'Peserta didik dapat mengenali, memprediksi, dan menggeneralisasi pola dalam bentuk susunan benda dan bilangan; menyatakan situasi ke dalam bentuk aljabar; serta menggunakan fungsi linier dan sistem persamaan untuk memodelkan masalah sehari-hari.',
    tujuanPembelajaranContoh: 'Peserta didik mampu memodelkan biaya sewa tenda dan perlengkapan kemah pramuka ke dalam bentuk SPLDV dan menentukan opsi biaya paling murah berdasarkan data kuota peserta.',
    dataLokalContoh: 'Paket A (4 tenda regu + 2 tenda pembina = Rp640.000) vs Paket B (2 tenda regu + 3 tenda pembina = Rp520.000).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Pemodelan Aljabar', indikator: 'Menerjemahkan kalimat soal cerita ke dalam variabel x dan y dengan persamaan tepat.' },
      { aspek: 'Penyelesaian Sistem Persamaan', indikator: 'Menemukan harga satuan masing-masing tenda menggunakan metode eliminasi/substitusi.' },
      { aspek: 'Optimasi Anggaran', indikator: 'Menghitung total biaya paket terbaik untuk kebutuhan 12 tenda regu.' },
      { aspek: 'Refleksi Batasan Dana', indikator: 'Mengevaluasi jika ada biaya tambahan sewa terpal yang belum masuk ke dalam model.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'Matematika',
    kategoriMapel: 'Matematika',
    materiContoh: 'Geometri Ruang, Teorema Pythagoras & Ventilasi Sehat',
    elemenCP: 'Geometri dan Pengukuran Bangun',
    rumusanCP: 'Peserta didik dapat menerapkan teorema Pythagoras dalam menyelesaikan masalah (termasuk jarak antara dua titik); menentukan luas permukaan dan volume bangun ruang sisi datar serta sisi lengkung untuk memecahkan masalah praktis.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menghitung volume sirkulasi udara ruang kelas dan merancang rasio kebutuhan luas jendela ventilasi sehat berbasis rumus geometri dan standar kesehatan.',
    dataLokalContoh: 'Ukuran ruang kelas 8 x 7 x 3.5 meter (kapasitas 32 siswa), standar ventilasi minimal 15% dari luas lantai menurut Dinkes.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Perhitungan Volume & Luas', indikator: 'Menghitung volume ruang kelas (m³) dan luas lantai dasar secara presisi.' },
      { aspek: 'Penerapan Standar Kesehatan', indikator: 'Menghitung luas bukaan jendela yang wajib ada (minimal 8.4 m²).' },
      { aspek: 'Evaluasi Kondisi Eksisting', indikator: 'Membandingkan luas jendela nyata (hanya 4.2 m²) dan dampak pengap terhadap konsentrasi belajar.' },
      { aspek: 'Rekomendasi Arsitektural', indikator: 'Mengusulkan penambahan roster udara atau exhaust fan berdasarkan defisit volume.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VII',
    mataPelajaran: 'IPS',
    kategoriMapel: 'IPS',
    materiContoh: 'Ekonomi Pasar, Penawaran-Permintaan & Pedagang Sekolah',
    elemenCP: 'Pemahaman Konsep & Keterampilan Proses Sosial-Ekonomi',
    rumusanCP: 'Peserta didik mampu menganalisis permasalahan sosial dan ekonomi di tingkat lokal/komunitas, mengevaluasi konflik kepentingan berbagai kelompok masyarakat dengan pertimbangan data, dan merumuskan resolusi berkelanjutan.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis dampak penataan pedagang kaki lima di sekitar gerbang sekolah berdasarkan data omzet, arus lalu lintas, dan keamanan pangan.',
    dataLokalContoh: 'Survei 15 pedagang gerobak: omzet harian Rp150.000 - Rp350.000 vs data kemacetan 20 menit saat jam bubaran sekolah.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Identifikasi Kepentingan', indikator: 'Menguraikan sudut pandang pihak pedagang, pengguna jalan, dan pihak sekolah.' },
      { aspek: 'Pemanfaatan Data Lapangan', indikator: 'Mengutip data durasi kemacetan dan kebutuhan nafkah pedagang secara seimbang.' },
      { aspek: 'Solusi Resolusi Berkeadilan', indikator: 'Mengusulkan skema zonasi dan pembagian jam jualan yang tidak mematikan rezeki pedagang.' },
      { aspek: 'Refleksi Kebijakan Publik', indikator: 'Memprediksi dampak jangka panjang bagi ketertiban dan citra sekolah.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'IPS',
    kategoriMapel: 'IPS',
    materiContoh: 'Konektivitas Keruangan, Resapan Air & Dampak Urbanisasi',
    elemenCP: 'Keruangan, Konektivitas Antar-Ruang dan Lingkungan',
    rumusanCP: 'Peserta didik mampu mengidentifikasi kondisi geografis Indonesia dan pengaruhnya terhadap aktivitas sosial-budaya dan ekonomi, serta menganalisis fenomena perubahan lingkungan lokal berbasis data spasial atau statistik.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis alih fungsi lahan resapan air menjadi perumahan/parkir terhadap frekuensi genangan air di sekitar sekolah.',
    dataLokalContoh: 'Peta tutupan lahan 2018 vs 2024: Ruang terbuka hijau turun dari 45% menjadi 15%, titik genangan air naik dari 1 titik menjadi 5 titik.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Membaca Perubahan Spasial', indikator: 'Menjelaskan persentase penyusutan area resapan air dari data komparasi.' },
      { aspek: 'Analisis Sebab-Akibat', indikator: 'Menghubungkan hilangnya tutupan tanah berpori dengan percepatan debit limpasan air hujan.' },
      { aspek: 'Mitigasi Bencana Lokal', indikator: 'Mengusulkan program lubang biopori dan paving block berpori di area sekolah.' },
      { aspek: 'Refleksi Tanggung Jawab Warga', indikator: 'Mengevaluasi peran kebiasaan membuang sampah sembarangan ke selokan pemukiman.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'IX',
    mataPelajaran: 'Bahasa Indonesia',
    kategoriMapel: 'Bahasa Indonesia',
    materiContoh: 'Teks Tanggapan Kritis Fenomena Penggunaan Gadget di Sekolah',
    elemenCP: 'Membaca, Memirsa dan Menulis Tanggapan Kritis',
    rumusanCP: 'Peserta didik mampu mengevaluasi gagasan, pikiran, pandangan, arahan atau pesan dari berbagai tipe teks; membandingkan isi teks yang berbeda sudut pandang; serta menyusun teks tanggapan kritis berbasis argumen logis dan data pendukung.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengevaluasi data durasi penggunaan media sosial vs capaian belajar dan menyusun teks tanggapan kritis yang objektif terhadap kebijakan larangan membawa HP ke sekolah.',
    dataLokalContoh: 'Survei OSIS: 78% siswa memakai HP untuk belajar/mencari materi, namun 42% mengaku terdistraksi notifikasi game saat jam pelajaran.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Analisis Dua Sisi Data', indikator: 'Menguraikan manfaat edukatif HP vs dampak negatif distraksi digital secara seimbang.' },
      { aspek: 'Penyusunan Argumen Kritis', indikator: 'Menyusun argumen sanggahan terhadap kebijakan larangan total menggunakan data survei.' },
      { aspek: 'Rekomendasi Kebijakan Bijak', indikator: 'Mengusulkan loker penyimpanan HP yang hanya dibuka saat instruksi guru.' },
      { aspek: 'Refleksi Disiplin Diri', indikator: 'Menyadari pentingnya kemampuan regulasi diri (self-regulation) di era digital.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VII',
    mataPelajaran: 'Bahasa Indonesia',
    kategoriMapel: 'Bahasa Indonesia',
    materiContoh: 'Teks Laporan Hasil Observasi (LHO) Sanitasi & UKS Sekolah',
    elemenCP: 'Menulis Teks Laporan Hasil Observasi Berbasis Data',
    rumusanCP: 'Peserta didik mampu menulis gagasan, pikiran, pandangan, arahan atau pesan tertulis untuk berbagai tujuan secara logis, kritis, dan kreatif dalam bentuk teks laporan hasil observasi yang didukung data faktual dan istilah teknis yang tepat.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menyusun bagian deskripsi manfaat dan simpulan laporan observasi fasilitas sanitasi sekolah berdasarkan tabel checklist audit kebersihan.',
    dataLokalContoh: 'Audit UKS dan Toilet: 6 keran berfungsi dari 10 keran, ketersediaan sabun cuci tangan 30%, catatan 14 siswa izin sakit perut bulan lalu.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Struktur Teks LHO', indikator: 'Menyusun bagian deskripsi bagian dan deskripsi manfaat dengan koherensi tinggi.' },
      { aspek: 'Integrasi Data Faktual', indikator: 'Menyertakan persentase ketersediaan fasilitas dan data rekam medik UKS secara akurat.' },
      { aspek: 'Penggunaan Istilah Teknis', indikator: 'Menggunakan istilah ilmiah seperti sanitasi, higienitas, dan transmisi bakteri secara tepat.' },
      { aspek: 'Rekomendasi Aksi', indikator: 'Merumuskan langkah perbaikan fasilitas untuk manajemen sekolah.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'PPKn/Pendidikan Pancasila',
    kategoriMapel: 'Pendidikan Pancasila',
    materiContoh: 'Ketaatan Hukum, Anti-Perundungan (Bullying) & Restorative Justice',
    elemenCP: 'UUD 1945, Ketaatan Norma Hukum dan Hak Asasi',
    rumusanCP: 'Peserta didik mampu menjelaskan kedudukan Pancasila sebagai dasar negara; mengidentifikasi hubungan antara norma, hak, dan kewajiban; serta menganalisis kasus pelanggaran hak dan pengingkaran kewajiban di lingkungan masyarakat dengan penalaran hukum yang adil.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis kronologi kasus perselisihan/perundungan siber antarsiswa berbasis bukti kesaksian dan merumuskan putusan penyelesaian yang adil serta mendidik.',
    dataLokalContoh: 'Tangkapan layar komentar bernada mengejek di grup media sosial kelas yang menyebabkan 1 siswa enggan masuk sekolah selama 4 hari.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Identifikasi Pelanggaran Norma', indikator: 'Menjelaskan hak korban atas rasa aman yang terlanggar sesuai norma hukum dan kesepakatan sekolah.' },
      { aspek: 'Analisis Bukti Digital', indikator: 'Memeriksa rekam jejak percakapan untuk membedakan lelucon bercanda dengan tindakan intimidasi berulang.' },
      { aspek: 'Penerapan Keadilan Restoratif', indikator: 'Merumuskan sanksi edukatif yang menumbuhkan empati dan pemulihan trauma bagi korban.' },
      { aspek: 'Refleksi Solidaritas Teman', indikator: 'Menilai peran teman sebaya (bystander) yang membiarkan atau justru ikut menertawakan.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'Informatika',
    kategoriMapel: 'Informatika',
    materiContoh: 'Analisis Data Spreadsheet, Validasi Data & Visualisasi Grafik',
    elemenCP: 'Analisis Data (AD) dan Dampak Sosial Informatika (DSI)',
    rumusanCP: 'Peserta didik mampu mengolah, memvisualisasikan, dan menganalisis data volumetrik sederhana menggunakan perkakas pengolah lembar kerja (spreadsheet); mengevaluasi keabsahan data; serta memahami etika berbagi data dan keamanan informasi pribadi.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mendeteksi kesalahan input/rumus pada lembar kerja data peminjaman buku perpustakaan dan merancang grafik tren yang representatif.',
    dataLokalContoh: 'Data 100 entri logbook perpustakaan dengan anomali 15 data tanpa tanggal kembali dan penulisan nama ganda.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Deteksi Anomali Data', indikator: 'Menemukan baris data yang cacat, tidak lengkap, atau memiliki tipe data yang salah.' },
      { aspek: 'Pengolah Rumus Logika', indikator: 'Menggunakan fungsi COUNTIF atau AVERAGE untuk menyaring data yang valid.' },
      { aspek: 'Visualisasi Data Akurat', indikator: 'Memilih jenis chart (diagram batang vs garis) yang paling tepat untuk tren bulanan.' },
      { aspek: 'Refleksi Etika Informasi', indikator: 'Menjelaskan pentingnya menyamarkan NISN/data pribadi siswa saat mempublikasikan rekap.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'Bahasa Inggris',
    kategoriMapel: 'Bahasa Inggris',
    materiContoh: 'Analyzing Informational Report & Fact-Checking Evidence',
    elemenCP: 'Reading and Viewing (Informational & Expository Texts)',
    rumusanCP: 'Peserta didik mampu membaca dan merespons teks familiar dan tidak familiar yang mengandung struktur yang telah dipelajari dan kosakata yang familiar secara mandiri; mencari dan mengevaluasi detil spesifik dan gagasan utama dalam teks faktual/informasional.',
    tujuanPembelajaranContoh: 'Peserta didik mampu mengekstrak bukti numerik dari infografis kebiasaan sarapan pagi berbahasa Inggris dan membandingkan klaim argumen dengan data yang tersaji.',
    dataLokalContoh: 'Infographic: "65% of students who skip breakfast report feeling fatigued by 10 AM, compared to 15% of regular breakfast eaters."',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Text Comprehension', indikator: 'Mengidentifikasi gagasan utama laporan kesehatan dan data persentase kunci.' },
      { aspek: 'Evidence Comparison', indikator: 'Membandingkan kelompok siswa yang sarapan vs tidak sarapan berdasarkan angka konkret.' },
      { aspek: 'Drawing Conclusion', indikator: 'Menyusun kesimpulan logis dalam bahasa Inggris sederhana yang didukung bukti teks.' },
      { aspek: 'Critical Reflection', indikator: 'Mengevaluasi apakah survei lokal sekolah mereka menunjukkan kecenderungan yang sama.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'PJOK',
    kategoriMapel: 'PJOK',
    materiContoh: 'Tes Kebugaran Jasmani Indonesia (TKJI) & Indeks Massa Tubuh (IMT)',
    elemenCP: 'Pemanfaatan Gerak & Pengembangan Karakter',
    rumusanCP: 'Peserta didik mampu menganalisis keterampilan gerak spesifik berbagai cabang olahraga; merancang program peningkatan kebugaran jasmani pribadi berdasarkan hasil pengukuran parameter fisik (IMT, daya tahan kardiovaskular, kelincahan); serta menginternalisasi sportivitas dan kerja sama tim.',
    tujuanPembelajaranContoh: 'Peserta didik mampu menganalisis rekap data tes kebugaran jasmani kelas (lari 1.200m, baring duduk, gantung angkat tubuh) dan menyusun rencana latihan fisik mandiri 4 minggu.',
    dataLokalContoh: 'Rekap data TKJI 32 siswa kelas VIII: 11 siswa kategori kurang bugar dengan rata-rata screen time >4 jam per hari dan konsumsi air putih <1 liter.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Analisis Profil Fisik', indikator: 'Menghitung Indeks Massa Tubuh (IMT) dan mengkorelasikannya dengan skor tes daya tahan.' },
      { aspek: 'Korelasi Pola Hidup', indikator: 'Mengidentifikasi hubungan antara waktu duduk menatap layar HP dengan penurunan kebugaran.' },
      { aspek: 'Program Latihan Personal', indikator: 'Menyusun target peningkatan frekuensi joging dan senam kebugaran bertahap 3x seminggu.' },
      { aspek: 'Refleksi Tanggung Jawab', indikator: 'Berkomitmen mencatat jurnal aktivitas fisik harian secara jujur.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'Seni Rupa',
    kategoriMapel: 'Seni & Prakarya',
    materiContoh: 'Menggambar Perspektif Ruang & Evaluasi Desain Fasilitas',
    elemenCP: 'Berpikir dan Bekerja Artistik & Merefleksikan',
    rumusanCP: 'Peserta didik mampu menerapkan kaidah menggambar bentuk dan perspektif (satu atau dua titik lenyap) untuk menggambarkan ruang arsitektural; mengevaluasi karya seni rupa berdasarkan kriteria estetika formal dan konteks fungsinya di masyarakat.',
    tujuanPembelajaranContoh: 'Peserta didik mampu merancang gambar perspektif tata letak kantin/selasar sekolah dengan menerapkan titik lenyap yang presisi serta mengevaluasi aspek kenyamanan visual dan sirkulasi gerak.',
    dataLokalContoh: 'Pengamatan kepadatan selasar saat jam istirahat: penempatan tempat sampah yang menghalangi jalur pintu keluar kantin.',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Penerapan Titik Lenyap', indikator: 'Menarik garis proyeksi perspektif satu/dua titik lenyap secara proporsional dan akurat.' },
      { aspek: 'Proporsi & Kedalaman Ruang', indikator: 'Menggambarkan skala perabot bangku dan lorong secara proporsional terhadap ukuran manusia.' },
      { aspek: 'Evaluasi Fungsi Tata Ruang', indikator: 'Menjelaskan alasan pemindahan lokasi tempat sampah pada gambar desain baru.' },
      { aspek: 'Apresiasi & Refleksi Desain', indikator: 'Menilai keselarasan estetika visual dengan keamanan jalur evakuasi sekolah.' }
    ]
  },
  {
    jenjang: 'SMP',
    fase: 'Fase D',
    kelasContoh: 'VIII',
    mataPelajaran: 'Prakarya (Pengolahan/Rekayasa)',
    kategoriMapel: 'Seni & Prakarya',
    materiContoh: 'Rekayasa Teknologi Filtrasi Air Bersih Berbahan Alami',
    elemenCP: 'Observasi dan Eksplorasi, Desain/Perencanaan, dan Produksi',
    rumusanCP: 'Peserta didik mampu mengeksplorasi potensi bahan alam dan buatan di lingkungan lokal; merancang, memodifikasi, dan membuat produk teknologi tepat guna (rekayasa penjernih air/alat hemat energi) atau olahan pangan komoditas lokal; serta mengevaluasi nilai guna dan dampak lingkungan dari produk tersebut.',
    tujuanPembelajaranContoh: 'Peserta didik mampu membandingkan efisiensi 3 susunan lapisan media filter (ijuk, pasir kuarsa, arang aktif, kerikil) dalam menurunkan kekeruhan air bak cuci tangan sekolah.',
    dataLokalContoh: 'Data uji laboratorium sederhana: Filter A (penurunan kekeruhan 75%), Filter B (hanya 40% karena lapisan arang terlalu tipis), Filter C (tersumbat pasir halus).',
    dasarHukum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
    aturanTerkait: 'BSKAP 046/2025',
    indikatorKKTP: [
      { aspek: 'Analisis Karakter Bahan Filter', indikator: 'Menjelaskan fungsi adsorpsi arang aktif terhadap bau dan fungsi penyaringan fisik ijuk/pasir.' },
      { aspek: 'Evaluasi Data Uji Kekeruhan', indikator: 'Menganalisis penyebab kegagalan laju aliran pada Filter C berdasarkan ukuran pori media.' },
      { aspek: 'Optimalisasi Desain Susunan', indikator: 'Menentukan urutan ketebalan lapisan media yang paling efektif dan tahan lama.' },
      { aspek: 'Refleksi Keberlanjutan', indikator: 'Merancang jadwal pencucian/penggantian media arang secara berkala menggunakan limbah tempurung kelapa.' }
    ]
  }
];
