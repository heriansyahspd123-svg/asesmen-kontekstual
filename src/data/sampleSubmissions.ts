import { StudentSubmission } from '../types';

export const INITIAL_SAMPLE_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-sample-01',
    assessmentId: 'sample-sd-sampah',
    assessmentTitle: 'Asesmen Pengurangan Sampah Plastik di Sekolah',
    studentName: 'Ahmad Fauzan',
    studentClass: 'Kelas 5A',
    timestamp: '2026-09-16T08:45:00.000Z',
    durasiPengerjaanDetik: 1420,
    answers: {
      'sd-q1': {
        questionId: 'sd-q1',
        jawabanSaya: 'Saya memutuskan untuk memilih dan mendukung usulan dari Rani (Kelas V), yaitu mewajibkan seluruh siswa membawa botol minum (tumbler) sendiri dari rumah dan pihak sekolah menyediakan dispenser air minum isi ulang di setiap lorong kelas.',
        buktiDigunakan: 'Berdasarkan data audit tim kebersihan SDN 01 Harmoni, tercatat rata-rata 45 botol plastik sekali pakai dibuang setiap hari, terutama saat istirahat pukul 09.30. Menambah tempat sampah seperti usul Doni hanya menampung sampah tanpa mengurangi angka 45 botol tersebut.',
        alasanSaya: 'Usul Rani menghentikan sumber timbulan sampah dari akarnya (preventif). Jika 45 botol tidak lagi dibeli, dalam sebulan sekolah dapat mencegah lebih dari 900 botol plastik mencemari lingkungan. Penyediaan dispenser juga menghemat uang jajan siswa.',
        refleksiSaya: 'Kelemahan usulan ini adalah perlu memastikan kebersihan dispenser air dan filter air secara berkala agar higienis. Data yang masih saya perlukan adalah biaya perawatan filter air dan anggaran listrik sekolah.',
        copyPasteDetected: false
      },
      'sd-q2': {
        questionId: 'sd-q2',
        jawabanSaya: 'Tindakan prioritas yang paling tepat adalah Opsi B: Memperbaiki sistem air minum dan dispenser terlebih dahulu sebelum membuat larangan penjualan botol plastik.',
        buktiDigunakan: 'Data menunjukkan 80% siswa membeli minuman karena merasa haus setelah pelajaran olahraga pukul 09.30 dan dispenser air yang ada belum mencukupi untuk 6 kelas.',
        alasanSaya: 'Jika langsung dilarang tanpa ada alternatif air minum gratis yang siap, siswa akan dehidrasi dan kebijakan akan ditolak. Pemenuhan fasilitas dasar harus mendahului sanksi atau larangan.',
        refleksiSaya: 'Data pendukung yang masih kurang adalah kapasitas galon dispenser dan siapa petugas piket yang bertanggung jawab mengganti galon setiap pagi.',
        copyPasteDetected: false
      }
    },
    evaluation: {
      skorAkhir: 92,
      kktpKategori: 'Sangat Baik',
      catatanUmum: 'Siswa menunjukkan kemampuan berpikir kritis yang luar biasa! Analisis berpijak kuat pada data 45 botol/hari dan membedakan antara solusi preventif versus kuratif.',
      deskripsieRapor: 'Ahmad Fauzan menunjukkan penguasaan Sangat Baik dalam menganalisis permasalahan lingkungan sekolah berbasis data riil. Mampu merumuskan keputusan logis yang terbukti melalui data audit dan menyadari aspek higienitas sebagai refleksi tindak lanjut.',
      evaluatedAt: '2026-09-16T08:45:15.000Z',
      evaluasiPerSoal: {
        'sd-q1': {
          skorTotal: 20,
          persentase: 100,
          kktpKategori: 'Sangat Baik',
          aspekSkor: {
            pemahamanMasalah: 4,
            penggunaanBukti: 4,
            penalaran: 4,
            keputusanSolusi: 4,
            refleksi: 4
          },
          alasanSkor: 'Jawaban orisinal dengan penalaran kritis yang runtut. Mengutip angka 45 botol per hari secara akurat dan mengkritisi opsi tandingan secara berbobot.',
          rekomendasi: 'Pertahankan orisinalitas ide dan lanjutkan eksplorasi skema pembiayaan perawatan dispenser.',
          isGenericFlag: false
        },
        'sd-q2': {
          skorTotal: 17,
          persentase: 85,
          kktpKategori: 'Sangat Baik',
          aspekSkor: {
            pemahamanMasalah: 4,
            penggunaanBukti: 3,
            penalaran: 4,
            keputusanSolusi: 3,
            refleksi: 3
          },
          alasanSkor: 'Keputusan memprioritaskan fasilitas sebelum larangan sangat realistis dan empatik.',
          rekomendasi: 'Sebutkan data spesifik kapasitas galon pada lembar refleksi.',
          isGenericFlag: false
        }
      }
    }
  },
  {
    id: 'sub-sample-02',
    assessmentId: 'sample-sd-sampah',
    assessmentTitle: 'Asesmen Pengurangan Sampah Plastik di Sekolah',
    studentName: 'Bima Satria (Terindikasi Copy-Paste)',
    studentClass: 'Kelas 5B',
    timestamp: '2026-09-16T09:12:00.000Z',
    durasiPengerjaanDetik: 420,
    answers: {
      'sd-q1': {
        questionId: 'sd-q1',
        jawabanSaya: 'Pengelolaan sampah adalah pengumpulan, pengangkutan, pemrosesan, pendaur-ulangan, atau pembuangan dari material sampah. Pengelolaan sampah plastik diatur dalam Undang-Undang Nomor 18 Tahun 2008 tentang Pengelolaan Sampah.',
        buktiDigunakan: 'Plastik merupakan polimer sintetik yang sulit terurai di alam bebas dan membutuhkan waktu ratusan tahun menurut ensiklopedia lingkungan hidup.',
        alasanSaya: 'Menurut kunci jawaban guru dan literatur lingkungan hidup, solusi terbaik yang efektif adalah kombinasi penyediaan fasilitas isi ulang air minum dan pemilahan tempat sampah terpadu.',
        refleksiSaya: 'Sampah plastik mencemari ekosistem laut dan darat sehingga harus dimusnahkan dengan teknologi insinerator.',
        copyPasteDetected: true,
        similarityWithKey: 72,
        suspectedSource: 'Kunci Jawaban Guru',
        pasteIncidents: [
          {
            type: 'external_paste',
            field: '1. Jawaban / Keputusan',
            timestamp: '09:05:12',
            charCount: 220,
            previewSnippet: 'Pengelolaan sampah adalah pengumpulan, pengangkutan, pemrosesan, pendaur-ulangan...',
            warningNote: 'Teks definisi ensiklopedia umum (Wikipedia/Google) ditempel langsung.'
          },
          {
            type: 'key_answer_leak',
            field: '3. Alasan / Justifikasi',
            timestamp: '09:08:44',
            charCount: 165,
            previewSnippet: 'Menurut kunci jawaban guru dan literatur lingkungan hidup, solusi terbaik yang efektif...',
            warningNote: 'Terdeteksi frasa dan kemiripan 72% dengan Kunci Jawaban Guru di Beranda.'
          }
        ]
      },
      'sd-q2': {
        questionId: 'sd-q2',
        jawabanSaya: 'Pemanasan global diakibatkan oleh gas rumah kaca seperti karbon dioksida dan metana yang memerangkap panas di atmosfer bumi.',
        buktiDigunakan: 'Data dari internet mengenai perubahan iklim global.',
        alasanSaya: 'Bumi semakin panas karena penggundulan hutan dan polusi industri.',
        refleksiSaya: 'Kita harus menanam sejuta pohon di seluruh dunia.',
        copyPasteDetected: true,
        similarityWithKey: 15,
        suspectedSource: 'Google / Dokumen Luar',
        pasteIncidents: [
          {
            type: 'external_paste',
            field: '1. Jawaban / Keputusan',
            timestamp: '09:10:02',
            charCount: 135,
            previewSnippet: 'Pemanasan global diakibatkan oleh gas rumah kaca seperti karbon dioksida...',
            warningNote: 'Menempelkan artikel Google tentang emisi gas rumah kaca yang tidak menjawab studi kasus sekolah.'
          }
        ]
      }
    },
    evaluation: {
      skorAkhir: 52,
      kktpKategori: 'Perlu Bimbingan',
      catatanUmum: 'PERINGATAN INTEGRITAS: Terdeteksi salin-tempel dari sumber eksternal Google dan Kunci Jawaban Guru. Siswa mengabaikan tabel data lokal 45 botol plastik sekolah dan menggantinya dengan teori umum.',
      deskripsieRapor: 'Bima Satria Perlu Bimbingan dalam menerapkan penalaran kritis kontekstual. Terdeteksi mengutip teks umum dari luar sekolah tanpa menganalisis fakta empiris setempat. Memerlukan bimbingan individual dan konfirmasi lisan.',
      evaluatedAt: '2026-09-16T09:12:10.000Z',
      evaluasiPerSoal: {
        'sd-q1': {
          skorTotal: 10,
          persentase: 50,
          kktpKategori: 'Perlu Bimbingan',
          aspekSkor: {
            pemahamanMasalah: 2,
            penggunaanBukti: 1,
            penalaran: 2,
            keputusanSolusi: 2,
            refleksi: 1
          },
          alasanSkor: 'Terdeteksi salin-tempel teks definisi Wikipedia dan frasa kunci jawaban guru. Tidak ada kutipan data angka tabel 45 botol sekolah.',
          rekomendasi: 'Lakukan wawancara klarifikasi lisan dan minta siswa mengerjakan kembali analisis secara mandiri.',
          isGenericFlag: true,
          genericReason: 'Jawaban bersifat ensiklopedis teoritis dan menyalin sumber luar.',
          integrityWarning: {
            isSuspicious: true,
            flagTitle: 'Peringatan Keras: Terdeteksi Salin-Tempel & Frasa Kunci Jawaban Guru',
            details: 'Siswa menempelkan 2 kali teks dari sumber eksternal (Google dan frasa Kunci Jawaban Guru kemiripan 72%). Angka 45 botol pada tabel diabaikan sama sekali.',
            suggestedTeacherAction: 'Lakukan klarifikasi lisan santai (coaching) untuk menanyakan argumen pribadi siswa dan tugaskan pengerjaan ulang.'
          }
        },
        'sd-q2': {
          skorTotal: 11,
          persentase: 55,
          kktpKategori: 'Perlu Bimbingan',
          aspekSkor: {
            pemahamanMasalah: 2,
            penggunaanBukti: 1,
            penalaran: 2,
            keputusanSolusi: 2,
            refleksi: 1
          },
          alasanSkor: 'Jawaban menyimpang ke pemanasan global global, bukan kasus kantin sekolah SDN 01 Harmoni.',
          rekomendasi: 'Bimbing siswa memfokuskan argumen pada konteks lingkungan sekolah terdekat.',
          isGenericFlag: true,
          genericReason: 'Menyalin jawaban artikel iklim global.',
          integrityWarning: {
            isSuspicious: true,
            flagTitle: 'Peringatan: Teks Copy-Paste dari Artikel Google',
            details: 'Teks yang ditempel membahas pemanasan global global alih-alih data fasilitas dispenser kantin sekolah.',
            suggestedTeacherAction: 'Ingatkan siswa bahwa asesmen open book mencari argumen berbasis data kasus, bukan definisi pencarian Google.'
          }
        }
      }
    }
  }
];
