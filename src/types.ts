export type FaseKurikulum = 'Fase A' | 'Fase B' | 'Fase C' | 'Fase D' | 'Fase E' | 'Fase F';
export type KKTPKategori = 'Perlu Bimbingan' | 'Cukup' | 'Baik' | 'Sangat Baik';

export interface KKTPIntervalConfig {
  perluBimbingan: string; // "0 - 60%"
  cukup: string; // "61 - 70%"
  baik: string; // "71 - 85%"
  sangatBaik: string; // "86 - 100%"
}

export interface KriteriaKetercapaianItem {
  aspek: string;
  indikator: string;
}

export interface AssessmentConfig {
  jenjang: 'SD' | 'SMP';
  kelas: string;
  mataPelajaran: string;
  materi: string;
  tujuanPembelajaran: string;
  // Kurikulum Merdeka fields
  fase?: FaseKurikulum;
  elemenCP?: string;
  capaianPembelajaran?: string;
  kktpInterval?: KKTPIntervalConfig;
  kktpDeskripsiKriteria?: KriteriaKetercapaianItem[];
  // End Kurikulum Merdeka fields
  konteks: string;
  jumlahSoal: number;
  bentukSoal: string;
  tingkatKesulitan: 'dasar' | 'menengah' | 'tinggi' | 'campuran';
  fokusPenalaran: string[];
  sumberBoleh: string[];
  waktuPengerjaan: number;
  menggunakanDataLokal: boolean;
  dataLokalDeskripsi?: string;
  sertakanGrafik?: boolean;
  tipeGrafikPreferensi?: 'otomatis' | 'bar' | 'line' | 'pie' | 'area';
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area';

export interface VisualisasiGrafikDataset {
  nama: string;
  nilai: number[];
  warna?: string;
}

export interface VisualisasiGrafik {
  tipeGrafik: ChartType;
  judulGrafik: string;
  sumbuX?: string;
  sumbuY?: string;
  labels: string[];
  datasets: VisualisasiGrafikDataset[];
  deskripsiGrafik?: string;
}

export interface DataInformasi {
  tipe: 'tabel' | 'pernyataan' | 'angka' | 'pengamatan' | 'teks_campuran';
  konten: string;
  tabelData?: {
    headers: string[];
    baris: string[][];
  };
  visualisasiGrafik?: VisualisasiGrafik;
  kutipanPihak?: {
    nama: string;
    peran: string;
    pernyataan: string;
  }[];
}

export interface RubrikAspekDetail {
  4: string;
  3: string;
  2: string;
  1: string;
}

export interface RubrikPenilaian {
  pemahamanMasalah: RubrikAspekDetail;
  penggunaanBukti: RubrikAspekDetail;
  penalaran: RubrikAspekDetail;
  keputusanSolusi: RubrikAspekDetail;
  refleksi: RubrikAspekDetail;
}

export interface QualityCheckItem {
  label: string;
  ok: boolean;
  catatan?: string;
}

export interface PilihanJawaban {
  kode: string;
  teks: string;
  analisis?: string;
}

export interface Question {
  id: string;
  nomor: number;
  judulKasus: string;
  konteks: string;
  dataInformasi: DataInformasi;
  masalah: string;
  pertanyaanUtama: string;
  permintaanBukti: string;
  permintaanAlasan: string;
  refleksi: string;
  bentukSoal: string;
  pilihanJawaban?: PilihanJawaban[];
  kunciJawaban: string;
  petunjukPemandu: string[];
  rubrik: RubrikPenilaian;
  qualityCheck: {
    passed: boolean;
    checks: QualityCheckItem[];
  };
  tingkatKesulitan: string;
}

export interface Assessment {
  id: string;
  kodeAkses: string;
  judul: string;
  config: AssessmentConfig;
  questions: Question[];
  dibuatTanggal: string;
}

export interface IntegrityIncident {
  type: 'external_paste' | 'key_answer_leak' | 'empty_evidence';
  field: string;
  timestamp: string;
  charCount: number;
  previewSnippet: string;
  warningNote: string;
}

export interface StudentAnswer {
  questionId: string;
  pilihanGandaKey?: string;
  jawabanSaya: string;
  buktiDigunakan: string;
  alasanSaya: string;
  refleksiSaya: string;
  copyPasteDetected?: boolean;
  pasteIncidents?: IntegrityIncident[];
  similarityWithKey?: number; // 0 - 100%
  suspectedSource?: 'Google / Dokumen Luar' | 'Kunci Jawaban Guru' | 'Teks Soal Kasus' | 'Kombinasi Eksternal';
}

export interface EvaluationItem {
  skorTotal: number; // skala 5-20, converted to 100
  persentase: number;
  kktpKategori?: KKTPKategori;
  aspekSkor: {
    pemahamanMasalah: number;
    penggunaanBukti: number;
    penalaran: number;
    keputusanSolusi: number;
    refleksi: number;
  };
  alasanSkor: string;
  rekomendasi: string;
  isGenericFlag: boolean;
  genericReason?: string;
  integrityWarning?: {
    isSuspicious: boolean;
    flagTitle: string;
    details: string;
    suggestedTeacherAction: string;
  };
}

export interface StudentSubmission {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  studentName: string;
  studentClass: string;
  timestamp: string;
  answers: Record<string, StudentAnswer>;
  durasiPengerjaanDetik?: number;
  evaluation?: {
    evaluasiPerSoal: Record<string, EvaluationItem>;
    skorAkhir: number;
    kktpKategori?: KKTPKategori;
    deskripsieRapor?: string;
    catatanUmum: string;
    evaluatedAt: string;
  };
}
