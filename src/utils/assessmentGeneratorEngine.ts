import { Assessment, AssessmentConfig } from '../types';

export function generateAlgorithmicAssessment(config: Partial<AssessmentConfig>): Assessment {
  const isSD = config.jenjang === 'SD';
  const numQuestions = Math.min(Math.max(1, config.jumlahSoal || 2), 10);
  const qList: any[] = [];

  for (let i = 1; i <= numQuestions; i++) {
    if (isSD) {
      qList.push({
        id: `q-gen-sd-${i}-${Date.now()}`,
        nomor: i,
        judulKasus: i === 1 
          ? `Audit Sampah dan Kantin Sehat SDN 04 (${config.materi || 'Lingkungan Hidup'})`
          : `Eksperimen Tanaman Hias & Penyinaran Kelas ${config.kelas || 'V'}`,
        konteks: i === 1 
          ? `Di SDN 04, tim Adiwiyata mendapati tempat sampah kantin penuh dengan wadah plastik setiap jam istirahat.`
          : `Siswa kelas ${config.kelas || 'V'} mengamati dua pot tanaman cabai yang diletakkan di tempat berbeda selama 2 minggu.`,
        dataInformasi: {
          tipe: 'tabel',
          konten: i === 1 
            ? 'Berikut adalah catatan jumlah sampah plastik harian dan survei keinginan siswa:'
            : 'Berikut catatan tinggi tanaman dan intensitas cahaya matahari harian:',
          tabelData: i === 1 ? {
            headers: ['Hari', 'Jumlah Botol Terbuang', 'Siswa yang Bawa Tumbler', 'Kondisi Tempat Sampah'],
            baris: [
              ['Senin', '52 botol', '12 siswa', 'Penuh meluber'],
              ['Selasa', '48 botol', '15 siswa', 'Penuh'],
              ['Rabu', '35 botol', '28 siswa (ada sosialisasi)', 'Cukup rapi'],
              ['Kamis', '30 botol', '34 siswa', 'Rapi']
            ]
          } : {
            headers: ['Kondisi Tanaman', 'Lokasi Pot', 'Cahaya Matahari', 'Tinggi Minggu 1', 'Tinggi Minggu 2'],
            baris: [
              ['Pot A (Dekat Lapangan)', 'Halaman terbuka', 'Terik (6 jam/hari)', '10 cm', '18 cm (daun hijau segar)'],
              ['Pot B (Bawah Tangga)', 'Lorong beratap', 'Teduh (1 jam/hari)', '10 cm', '12 cm (daun agak pucat)']
            ]
          },
          kutipanPihak: [
            {
              nama: 'Dina',
              peran: 'Siswa Pengamat',
              pernyataan: i === 1 ? 'Sosialisasi tumbler terbukti efektif menurunkan sampah dari 52 ke 30!' : 'Cahaya matahari terik membuat tanaman bertambah tinggi 8 cm.'
            },
            {
              nama: 'Budi',
              peran: 'Ketua Regu',
              pernyataan: i === 1 ? 'Tapi hari Kamis masih ada 30 botol, artinya tempat sampah baru tetap dibutuhkan.' : 'Tapi air penyiramannya juga harus dihitung sama atau tidak.'
            }
          ],
          visualisasiGrafik: i === 1 ? {
            tipeGrafik: 'line',
            judulGrafik: 'Tren Sampah Botol Terbuang vs Siswa Membawa Tumbler',
            sumbuX: 'Hari',
            sumbuY: 'Jumlah',
            labels: ['Senin', 'Selasa', 'Rabu (Sosialisasi)', 'Kamis'],
            datasets: [
              { nama: 'Botol Terbuang', nilai: [52, 48, 35, 30], warna: '#ef4444' },
              { nama: 'Siswa Bawa Tumbler', nilai: [12, 15, 28, 34], warna: '#10b981' }
            ],
            deskripsiGrafik: 'Grafik menunjukkan penurunan sampah botol plastik seiring kenaikan siswa yang membawa tumbler.'
          } : {
            tipeGrafik: 'bar',
            judulGrafik: 'Perbandingan Pertumbuhan Tinggi Tanaman (Minggu 1 vs 2)',
            sumbuX: 'Pot Tanaman',
            sumbuY: 'Tinggi (cm)',
            labels: ['Pot A (Terik 6 Jam)', 'Pot B (Teduh 1 Jam)'],
            datasets: [
              { nama: 'Tinggi Minggu 1 (cm)', nilai: [10, 10], warna: '#0284c7' },
              { nama: 'Tinggi Minggu 2 (cm)', nilai: [18, 12], warna: '#10b981' }
            ],
            deskripsiGrafik: 'Grafik perbandingan laju pertumbuhan tanaman pada dua kondisi intensitas cahaya yang berbeda.'
          }
        },
        masalah: i === 1 
          ? 'Bagaimana memilih kebijakan kebersihan yang paling efektif dengan data tren tersebut?'
          : 'Apakah perbedaan pertumbuhan semata-mata karena sinar matahari atau ada faktor yang belum diuji?',
        pertanyaanUtama: i === 1 
          ? 'Berdasarkan tabel di atas, usulan tindakan mana yang paling didukung oleh data? Berikan analisis kritis perbandingan hari Senin dan Kamis!'
          : 'Berdasarkan data pengamatan Pot A dan Pot B, apakah kesimpulan Dina sudah sepenuhnya dapat dibenarkan? Jelaskan pendapatmu!',
        permintaanBukti: 'Kutip minimal dua angka dari tabel untuk mendukung klaimmu.',
        permintaanAlasan: 'Jelaskan mengapa bukti yang kamu pilih menunjukkan hubungan sebab-akibat yang nyata.',
        refleksi: 'Jika kamu diberikan waktu seminggu lagi untuk mengumpulkan data baru, data apa yang paling penting kamu cari?',
        bentukSoal: config.bentukSoal || 'studi kasus',
        kunciJawaban: 'Siswa harus mengutip data penurunan botol plastik atau perbedaan tinggi tanaman, menghubungkannya secara logis dengan klaim, dan menyadari keterbatasan pengamatan.',
        petunjukPemandu: [
          'Perhatikan perubahan angka dari hari pertama sampai hari terakhir.',
          'Bandingkan apakah ada hubungan antara jumlah siswa yang membawa tumbler dengan jumlah botol yang terbuang.',
          'Pikirkan apakah ada hal lain yang belum dicatat di tabel.'
        ],
        rubrik: {
          pemahamanMasalah: {
            4: 'Sangat memahami inti masalah dan membedakan klaim kedua pihak dengan jelas.',
            3: 'Memahami masalah utama.',
            2: 'Hanya memahami sebagian informasi.',
            1: 'Tidak memahami konteks soal.'
          },
          penggunaanBukti: {
            4: 'Mengutip 2 atau lebih data angka spesifik secara tepat dari tabel.',
            3: 'Mengutip 1 data secara tepat.',
            2: 'Menyebutkan data tetapi tidak akurat.',
            1: 'Tidak menyertakan bukti data sama sekali.'
          },
          penalaran: {
            4: 'Alasan sangat logis menghubungkan klaim dengan data kasus.',
            3: 'Alasan cukup logis namun belum mendalam.',
            2: 'Alasan lemah atau melompat.',
            1: 'Tidak ada alur penalaran.'
          },
          keputusanSolusi: {
            4: 'Keputusan tepat, realistis, dan kontekstual.',
            3: 'Keputusan jelas.',
            2: 'Keputusan kurang terarah.',
            1: 'Tidak ada keputusan.'
          },
          refleksi: {
            4: 'Mampu merefleksikan keterbatasan data dan menyebutkan data lanjutan yang krusial.',
            3: 'Menyebutkan refleksi sederhana.',
            2: 'Refleksi sangat minim.',
            1: 'Tidak melakukan refleksi.'
          }
        },
        qualityCheck: {
          passed: true,
          checks: [
            { label: 'Konteks autentik & dekat dengan siswa SD', ok: true },
            { label: 'Menggunakan data tabel konkret', ok: true },
            { label: 'Tidak dapat dijawab dengan hafalan/definisi', ok: true },
            { label: 'Memerlukan analisis data kasus', ok: true },
            { label: 'Rubrik 1-4 lengkap', ok: true }
          ]
        },
        tingkatKesulitan: config.tingkatKesulitan || 'menengah'
      });
    } else {
      // SMP Questions
      qList.push({
        id: `q-gen-smp-${i}-${Date.now()}`,
        nomor: i,
        judulKasus: i === 1 
          ? `Analisis Efisiensi Sumber Daya & Data Komparatif (${config.materi || 'Analisis Fenomena'})`
          : `Studi Kasus Kebijakan Digital dan Konsumsi Fasilitas Sekolah`,
        konteks: `SMP Harapan Bangsa melakukan evaluasi menyeluruh terhadap efektivitas kebijakan pembelajaran dan pemanfaatan fasilitas di lingkungan sekolah selama satu semester.`,
        dataInformasi: {
          tipe: 'tabel',
          konten: 'Tabel catatan komparatif indikator kunci selama 4 periode pengamatan:',
          tabelData: {
            headers: ['Periode', 'Indikator Utama (Unit)', 'Suhu / Kondisi Lingkungan', 'Biaya Operasional (Ribuan Rp)', 'Keluhan Siswa/Guru'],
            baris: [
              ['Bulan 1', '120 Unit', 'Normal (29°C)', 'Rp 4.200', 'Rendah (2 laporan)'],
              ['Bulan 2', '135 Unit', 'Normal (30°C)', 'Rp 4.500', 'Rendah (3 laporan)'],
              ['Bulan 3 (Puncak)', '210 Unit', 'Panas (34°C)', 'Rp 7.800', 'Tinggi (18 laporan)'],
              ['Bulan 4', '140 Unit', 'Sejuk (28°C)', 'Rp 4.700', 'Sedang (4 laporan)']
            ]
          },
          kutipanPihak: [
            {
              nama: 'Narasumber A (Tim Teknis)',
              peran: 'Koordinator Teknis',
              pernyataan: 'Kenaikan drastis pada Bulan 3 disebabkan oleh faktor suhu ekstrem yang memaksa pendingin bekerja pada kapasitas maksimal.'
            },
            {
              nama: 'Narasumber B (Pengurus OSIS)',
              peran: 'Perwakilan Siswa',
              pernyataan: 'Kami mencatat bahwa di Bulan 3 juga terdapat persiapan festival budaya yang menggunakan peralatan tambahan hingga sore hari.'
            }
          ],
          visualisasiGrafik: {
            tipeGrafik: 'bar',
            judulGrafik: 'Fluktuasi Biaya Operasional & Indikator Unit Per Periode',
            sumbuX: 'Periode Pengamatan',
            sumbuY: 'Nilai',
            labels: ['Bulan 1', 'Bulan 2', 'Bulan 3 (Puncak)', 'Bulan 4'],
            datasets: [
              { nama: 'Biaya Operasional (x10 Ribu Rp)', nilai: [420, 450, 780, 470], warna: '#ef4444' },
              { nama: 'Indikator Unit', nilai: [120, 135, 210, 140], warna: '#0284c7' }
            ],
            deskripsiGrafik: 'Terjadi anomali lonjakan signifikan pada Bulan 3, di mana biaya operasional naik drastis dari 450 menjadi 780 ribu rupiah (+73%).'
          }
        },
        masalah: 'Pihak sekolah ingin menentukan akar penyebab lonjakan biaya operasional dan keluhan pada Bulan 3 agar dapat merancang kebijakan preventif.',
        pertanyaanUtama: 'Berdasarkan data tabel dan kedua kesaksian di atas, apakah salah satu narasumber sudah dapat dinyatakan 100% benar? Bagaimana kamu mengevaluasi kedua klaim tersebut secara objektif?',
        permintaanBukti: 'Kutip angka kenaikan unit, biaya operasional, dan suhu dari tabel untuk menguji argumen Narasumber A dan B.',
        permintaanAlasan: 'Jelaskan mengapa korelasi waktu antara suhu panas dan festival tidak serta merta membuktikan salah satunya sebagai penyebab tunggal.',
        refleksi: 'Jika kamu menjadi penasihat kebijakan sekolah, instrumen atau data tambahan apa yang harus dipasang untuk memisahkan dampak kedua faktor tersebut?',
        bentukSoal: config.bentukSoal || 'studi kasus',
        kunciJawaban: 'Siswa harus menyimpulkan bahwa data saat ini bersifat multivariat dan belum cukup untuk menyimpulkan penyebab tunggal. Kedua faktor berpotensi saling memperkuat lonjakan biaya dari Rp4.500 ke Rp7.800 (+73%). Refleksi harus mengusulkan sub-metering atau logbook pemakaian daya alat festival.',
        petunjukPemandu: [
          'Perhatikan apakah ada lebih dari satu faktor yang melonjak tajam pada Bulan 3.',
          'Pikirkan apakah suhu tinggi dan kegiatan festival sama-sama membutuhkan daya listrik.',
          'Ingat perbedaan antara korelasi (kejadian bersamaan) dan kausalitas murni (penyebab pasti).'
        ],
        rubrik: {
          pemahamanMasalah: {
            4: 'Sangat memahami anomali multivariat dan mengidentifikasi bias klaim tunggal.',
            3: 'Memahami masalah lonjakan dan adanya dua faktor pemicu.',
            2: 'Hanya melihat satu sudut pandang narasumber.',
            1: 'Gagal memahami data komparatif.'
          },
          penggunaanBukti: {
            4: 'Mengutip data kenaikan biaya, indikator unit, dan data suhu secara komprehensif.',
            3: 'Mengutip 2 data pendukung dari tabel secara tepat.',
            2: 'Hanya mengutip 1 data parsial.',
            1: 'Tidak mengutip data tabel.'
          },
          penalaran: {
            4: 'Penalaran ilmiah kuat membedakan korelasi vs kausalitas.',
            3: 'Penalaran logis namun belum mendalam.',
            2: 'Penalaran tergesa-gesa menyimpulkan tanpa bukti memadai.',
            1: 'Tidak logis.'
          },
          keputusanSolusi: {
            4: 'Merumuskan rekomendasi kebijakan yang adil dan berbasis bukti investigatif.',
            3: 'Keputusan baik.',
            2: 'Keputusan sepihak.',
            1: 'Tidak ada keputusan.'
          },
          refleksi: {
            4: 'Merinci data teknis yang masih hilang (seperti meteran terpisah) dengan tepat.',
            3: 'Menyebutkan data tambahan yang diperlukan.',
            2: 'Refleksi sangat umum.',
            1: 'Tidak ada refleksi.'
          }
        },
        qualityCheck: {
          passed: true,
          checks: [
            { label: 'Konteks autentik jenjang SMP dengan konflik perspektif', ok: true },
            { label: 'Menuntut analisis multivariat dan evaluasi bukti', ok: true },
            { label: 'Tidak dapat dijawab instan dengan Google/AI tanpa data kasus', ok: true },
            { label: 'Mendorong pola Klaim -> Bukti -> Alasan -> Refleksi', ok: true },
            { label: 'Rubrik penilaian 5 aspek lengkap', ok: true }
          ]
        },
        tingkatKesulitan: config.tingkatKesulitan || 'tinggi'
      });
    }
  }

  const normalizedConfig: AssessmentConfig = {
    jenjang: config.jenjang || 'SD',
    kelas: config.kelas || 'V',
    fase: config.fase || (config.jenjang === 'SD' ? 'Fase C' : 'Fase D'),
    mataPelajaran: config.mataPelajaran || 'IPAS',
    materi: config.materi || 'Konteks Masalah Nyata',
    elemenCP: config.elemenCP,
    capaianPembelajaran: config.capaianPembelajaran,
    kktpInterval: config.kktpInterval,
    kktpDeskripsiKriteria: config.kktpDeskripsiKriteria,
    tujuanPembelajaran: config.tujuanPembelajaran || 'Peserta didik menganalisis data kontekstual dan menarik kesimpulan berbasis bukti.',
    konteks: config.konteks || 'lingkungan sekitar',
    jumlahSoal: numQuestions,
    bentukSoal: config.bentukSoal || 'studi kasus',
    tingkatKesulitan: config.tingkatKesulitan || 'menengah',
    sumberBoleh: Array.isArray(config.sumberBoleh) && config.sumberBoleh.length > 0
      ? config.sumberBoleh
      : ['Buku', 'Catatan', 'Internet', 'Google', 'AI'],
    fokusPenalaran: Array.isArray(config.fokusPenalaran) && config.fokusPenalaran.length > 0
      ? config.fokusPenalaran
      : ['Analisis Data & Bukti', 'Klaim & Justifikasi', 'Refleksi Kritis'],
    waktuPengerjaan: Number(config.waktuPengerjaan) || 45,
    menggunakanDataLokal: Boolean(config.menggunakanDataLokal),
    dataLokalDeskripsi: config.dataLokalDeskripsi,
    sertakanGrafik: Boolean(config.sertakanGrafik),
    tipeGrafikPreferensi: config.tipeGrafikPreferensi || 'otomatis'
  };

  return {
    id: 'asm-' + Date.now(),
    kodeAkses: `${normalizedConfig.jenjang}-${normalizedConfig.kelas}-${Math.floor(100 + Math.random() * 900)}`,
    judul: `Asesmen Kontekstual ${normalizedConfig.mataPelajaran}: ${normalizedConfig.materi || 'Pemecahan Masalah Autentik'}`,
    config: normalizedConfig,
    questions: qList,
    dibuatTanggal: new Date().toISOString().split('T')[0]
  };
}
