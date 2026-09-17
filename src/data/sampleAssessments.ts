import { Assessment } from '../types';

export const INITIAL_SAMPLE_ASSESSMENTS: Assessment[] = [
  {
    id: 'sample-sd-sampah',
    kodeAkses: 'SD-PLASTIK-45',
    judul: 'Asesmen Pengurangan Sampah Plastik di Sekolah',
    dibuatTanggal: '2026-09-15',
    config: {
      jenjang: 'SD',
      kelas: 'V',
      fase: 'Fase C',
      mataPelajaran: 'IPAS',
      elemenCP: 'Keterampilan Proses & Pemahaman IPAS (Lingkungan Hidup)',
      capaianPembelajaran: 'Peserta didik menganalisis hubungan timbal balik antara manusia dengan lingkungan, menyelidiki permasalahan lingkungan sekolah melalui pengumpulan dan analisis data empiris, serta merancang tindakan berkelanjutan berbasis bukti.',
      materi: 'Kelestarian Lingkungan & Pengelolaan Sampah',
      tujuanPembelajaran: 'Peserta didik mampu menganalisis masalah timbulan sampah di sekolah, membandingkan dua opsi solusi berdasarkan data nyata, dan merefleksikan konsekuensi keputusan.',
      kktpInterval: {
        perluBimbingan: '0 - 60%',
        cukup: '61 - 70%',
        baik: '71 - 85%',
        sangatBaik: '86 - 100%'
      },
      kktpDeskripsiKriteria: [
        { aspek: 'Pemahaman Masalah', indikator: 'Mengidentifikasi akar dilema pengelolaan sampah dan aktor yang terlibat di lingkungan sekolah.' },
        { aspek: 'Pemanfaatan Bukti Data', indikator: 'Mengutip minimal 2 data kuantitatif/kualitatif dari tabel audit untuk mendukung usulan.' },
        { aspek: 'Penalaran & Justifikasi', indikator: 'Menjelaskan hubungan sebab-akibat secara logis mengapa solusi pilihan lebih efektif.' },
        { aspek: 'Refleksi & Alternatif', indikator: 'Menyadari potensi kendala/risiko usulan dan merumuskan data tambahan yang dibutuhkan.' }
      ],
      konteks: 'lingkungan sekolah',
      jumlahSoal: 2,
      bentukSoal: 'studi kasus',
      tingkatKesulitan: 'menengah',
      fokusPenalaran: ['menganalisis', 'mengevaluasi', 'mencipta'],
      sumberBoleh: ['Buku', 'Catatan', 'Internet', 'Google', 'AI'],
      waktuPengerjaan: 35,
      menggunakanDataLokal: true,
      dataLokalDeskripsi: 'Data audit harian sampah botol plastik SDN 01 Harmoni dan perbandingan usulan kelas IV dan V'
    },
    questions: [
      {
        id: 'sd-q1',
        nomor: 1,
        judulKasus: 'Dilema Botol Minum vs Tempat Sampah Tambahan',
        konteks: 'Tim Adiwiyata SDN 01 Harmoni mencatat rata-rata 45 botol plastik sekali pakai dibuang setiap hari di area kantin dan lapangan. Dua kelas memberikan usulan berbeda.',
        dataInformasi: {
          tipe: 'teks_campuran',
          konten: 'Hasil audit tim kebersihan sekolah selama seminggu menunjukkan volume sampah terbanyak berasal dari minuman manis botolan yang dibeli saat istirahat pertama (pukul 09.30).',
          kutipanPihak: [
            {
              nama: 'Perwakilan Kelas V (Rani)',
              peran: 'Ketua Kelas V',
              pernyataan: 'Kami mengusulkan aturan wajib membawa botol minum (tumbler) sendiri dari rumah dan sekolah menyediakan dispenser air minum isi ulang di setiap lorong.'
            },
            {
              nama: 'Perwakilan Kelas IV (Doni)',
              peran: 'Ketua Kelas IV',
              pernyataan: 'Kami mengusulkan menambah 5 tempat sampah terpilah khusus botol plastik di sekitar kantin dan lapangan agar siswa mudah membuangnya pada tempatnya.'
            }
          ],
          tabelData: {
            headers: ['Faktor Pertimbangan', 'Usulan Kelas V (Bawa Tumbler)', 'Usulan Kelas IV (Tambah Tong Sampah)'],
            baris: [
              ['Biaya Awal', 'Pengadaan 3 galon & dispenser isi ulang', 'Beli 5 unit tong sampah terpilah'],
              ['Dampak Langsung', 'Mencegah timbulnya botol plastik baru', 'Merapikan botol agar tidak berserakan'],
              ['Tantangan Siswa', 'Bisa lupa membawa botol dari rumah', 'Sampah tetap ada dan harus diangkut petugas']
            ]
          },
          visualisasiGrafik: {
            tipeGrafik: 'line',
            judulGrafik: 'Tren Audit Harian Sampah Botol vs Siswa Membawa Tumbler',
            sumbuX: 'Hari Pengamatan',
            sumbuY: 'Jumlah (Unit / Siswa)',
            labels: ['Senin', 'Selasa', 'Rabu (Sosialisasi)', 'Kamis', 'Jumat'],
            datasets: [
              {
                nama: 'Timbulan Botol Plastik Terbuang',
                nilai: [52, 48, 35, 30, 24],
                warna: '#ef4444'
              },
              {
                nama: 'Siswa Membawa Botol Tumbler Sendiri',
                nilai: [12, 15, 28, 34, 41],
                warna: '#10b981'
              }
            ],
            deskripsiGrafik: 'Grafik membuktikan bahwa peningkatan siswa membawa tumbler berkorelasi kuat dengan penurunan timbulan botol sampah di sekolah.'
          }
        },
        masalah: 'Sekolah ingin mengurangi timbulan sampah plastik secara nyata dengan anggaran terbatas dan keterlibatan aktif siswa.',
        pertanyaanUtama: 'Jika kamu menjadi anggota Tim Kebersihan dan Duta Lingkungan Sekolah, keputusan tindakan mana yang menurutmu paling tepat untuk dijalankan terlebih dahulu?',
        permintaanBukti: 'Gunakan minimal dua data atau perbandingan faktor dari tabel/informasi kasus di atas untuk mendukung keputusanmu.',
        permintaanAlasan: 'Jelaskan mengapa bukti yang kamu pilih membuktikan bahwa usulan tersebut lebih efektif dibandingkan usulan lainnya.',
        refleksi: 'Apa kelemahan atau risiko dari keputusan pilihanmu, dan data apa yang masih perlu kamu kumpulkan untuk memastikan program tersebut berhasil?',
        bentukSoal: 'studi kasus',
        kunciJawaban: 'Jawaban ideal memilih salah satu usulan (atau kombinasi bertahap) dengan menyertakan minimal dua bukti konkret dari tabel (misal: perbedaan dampak mencegah sampah vs merapikan sampah, atau perbandingan biaya dispenser vs tong). Alasan harus menghubungkan bukti dengan tujuan utama sekolah. Refleksi mengidentifikasi risiko (misal: lupa bawa botol) dan data tambahan (misal: kesiapan kantin menjual air galon atau survei kepemilikan tumbler siswa).',
        petunjukPemandu: [
          'Perhatikan tujuan utama sekolah: apakah sekadar "merapikan sampah" atau "mengurangi timbulan sampah"?',
          'Bandingkan dampak jangka panjang dari kedua usulan berdasarkan tabel faktor pertimbangan.',
          'Pikirkan apa yang mungkin terjadi di minggu pertama jika siswa lupa membawa wadah minum.'
        ],
        rubrik: {
          pemahamanMasalah: {
            4: 'Sangat memahami akar masalah timbulan 45 botol plastik dan perbedaan mendasar antara kedua usulan.',
            3: 'Memahami masalah sampah sekolah dan menyebutkan kedua usulan dengan tepat.',
            2: 'Hanya memahami sebagian masalah (misalnya hanya menyebut sampah berserakan).',
            1: 'Tidak memahami masalah utama yang sedang dihadapi sekolah.'
          },
          penggunaanBukti: {
            4: 'Mengutip minimal 2 data spesifik dari tabel/kasus secara akurat dan relevan dengan pilihan.',
            3: 'Mengutip 1 data spesifik atau 2 informasi umum dari kasus.',
            2: 'Menyebutkan bukti tetapi tidak bersumber dari kasus yang diberikan.',
            1: 'Tidak menyertakan bukti sama sekali dari kasus.'
          },
          penalaran: {
            4: 'Hubungan antara data yang dikutip, alasan efektivitas, dan kesimpulan sangat logis dan terstruktur.',
            3: 'Hubungan logis terlihat jelas namun penjelasan masih dapat diperdalam.',
            2: 'Penalaran melompat atau alasan tidak didukung data yang dipilih.',
            1: 'Hanya memberikan opini tanpa alur penalaran yang masuk akal.'
          },
          keputusanSolusi: {
            4: 'Keputusan tindakan dirumuskan secara jelas, realistis, dan menjawab tantangan sekolah.',
            3: 'Keputusan jelas dan dapat dijalankan namun belum mengantisipasi kendala pelaksanaan.',
            2: 'Keputusan kurang realistis atau ambigu.',
            1: 'Tidak menentukan keputusan tindakan.'
          },
          refleksi: {
            4: 'Mengidentifikasi kelemahan pilihan dengan jujur dan menentukan data lanjutan yang krusial dicari.',
            3: 'Menyebutkan kelemahan atau data tambahan yang masih diperlukan.',
            2: 'Refleksi sangat singkat atau hanya mengulang jawaban sebelumnya.',
            1: 'Tidak ada refleksi atau kesadaran akan keterbatasan data.'
          }
        },
        qualityCheck: {
          passed: true,
          checks: [
            { label: 'Soal kontekstual berbasis lingkungan nyata siswa', ok: true },
            { label: 'Tidak dapat dijawab hanya dengan definisi/hafalan', ok: true },
            { label: 'Memerlukan analisis perbandingan data tabel', ok: true },
            { label: 'Menuntut klaim, bukti, dan justifikasi', ok: true },
            { label: 'Pencarian Google/AI saja tidak memberikan jawaban langsung karena terikat data spesifik', ok: true }
          ]
        },
        tingkatKesulitan: 'menengah'
      },
      {
        id: 'sd-q2',
        nomor: 2,
        judulKasus: 'Kebijakan Penjual Minuman Kantin',
        konteks: 'Ibu Eni, pedagang minuman di kantin sekolah, menjual 30 botol teh manis kemasan plastik setiap hari seharga Rp3.000 per botol. Jika sekolah melarang botol plastik, Bu Eni khawatir pendapatannya berkurang.',
        dataInformasi: {
          tipe: 'angka',
          konten: 'Rata-rata keuntungan Bu Eni per botol plastik adalah Rp1.000. Jika beralih menjual teh manis dengan teko dan menuang ke botol minum siswa, modal per gelas hanya Rp800 dan dapat dijual Rp2.000 per porsi isi ulang.',
          tabelData: {
            headers: ['Metode Penjualan', 'Harga Jual', 'Modal Bahan', 'Keuntungan Bersih per Porsi'],
            baris: [
              ['Botol Kemasan Pabrik', 'Rp3.000', 'Rp2.000', 'Rp1.000'],
              ['Isi Ulang Teko (Tumbler)', 'Rp2.000', 'Rp800', 'Rp1.200']
            ]
          },
          visualisasiGrafik: {
            tipeGrafik: 'bar',
            judulGrafik: 'Perbandingan Harga Jual, Modal Bahan & Keuntungan Bersih Bu Eni',
            sumbuX: 'Metode Penjualan',
            sumbuY: 'Nilai (Rupiah)',
            labels: ['Kemasan Botol Pabrik', 'Isi Ulang Teko (Tumbler)'],
            datasets: [
              {
                nama: 'Harga Jual (Rp)',
                nilai: [3000, 2000],
                warna: '#0284c7'
              },
              {
                nama: 'Modal Bahan (Rp)',
                nilai: [2000, 800],
                warna: '#f59e0b'
              },
              {
                nama: 'Keuntungan Bersih (Rp)',
                nilai: [1000, 1200],
                warna: '#10b981'
              }
            ],
            deskripsiGrafik: 'Perhatikan bahwa keuntungan bersih sistem isi ulang teko justru lebih tinggi Rp200/porsi dibandingkan kemasan pabrik, dengan modal yang jauh lebih hemat.'
          }
        },
        masalah: 'Bu Eni ragu apakah sistem isi ulang menguntungkan dan apakah siswa akan tetap membeli.',
        pertanyaanUtama: 'Berdasarkan data keuntungan tersebut, bagaimana kamu meyakinkan Bu Eni bahwa beralih ke sistem isi ulang tidak akan merugikan usahanya?',
        permintaanBukti: 'Tunjukkan perhitungan keuntungan bersih per porsi dari tabel data.',
        permintaanAlasan: 'Jelaskan mengapa harga Rp2.000 justru berpotensi membuat lebih banyak siswa membeli dibandingkan harga Rp3.000.',
        refleksi: 'Informasi apa yang belum diketahui Bu Eni tentang minat siswa membeli teh isi ulang?',
        bentukSoal: 'pemecahan masalah',
        kunciJawaban: 'Siswa menghitung keuntungan per porsi: kemasan pabrik untung Rp1.000, sedangkan isi ulang untung Rp1.200 (lebih besar Rp200 per porsi). Harga jual lebih murah (Rp2.000 vs Rp3.000) membuat siswa lebih mampu menjangkau sehingga volume penjualan bisa naik. Refleksi: belum ada data kepastian berapa siswa yang rutin membawa tumbler dan higienitas teko.',
        petunjukPemandu: [
          'Hitung selisih keuntungan: mana yang menghasilkan uang bersih lebih banyak untuk setiap porsi?',
          'Pikirkan dari sudut pandang uang saku siswa: apakah mereka lebih senang harga Rp2.000 atau Rp3.000?'
        ],
        rubrik: {
          pemahamanMasalah: {
            4: 'Sangat memahami kekhawatiran pedagang dan peluang sistem isi ulang.',
            3: 'Memahami perbandingan harga dan keuntungan.',
            2: 'Hanya melihat harga jual tanpa menghitung keuntungan bersih.',
            1: 'Salah memahami situasi keuangan kantin.'
          },
          penggunaanBukti: {
            4: 'Menggunakan data perbandingan keuntungan Rp1.200 vs Rp1.000 dengan tepat.',
            3: 'Menggunakan data harga jual namun belum lengkap pada keuntungan.',
            2: 'Menyebutkan angka secara keliru.',
            1: 'Tidak menggunakan angka dari data tabel.'
          },
          penalaran: {
            4: 'Menganalisis elastisitas harga sederhana dan margin keuntungan secara logis.',
            3: 'Memberikan alasan logis bahwa siswa suka harga murah.',
            2: 'Alasan kurang meyakinkan.',
            1: 'Tidak ada penjelasan yang masuk akal.'
          },
          keputusanSolusi: {
            4: 'Solusi negosiasi win-win antara kepentingan lingkungan sekolah dan pemasukan kantin.',
            3: 'Solusi baik untuk kantin.',
            2: 'Solusi merugikan salah satu pihak.',
            1: 'Tidak memberikan usulan meyakinkan.'
          },
          refleksi: {
            4: 'Menyadari perlunya survei kepemilikan wadah minum dan kebersihan air teko.',
            3: 'Menyebutkan perlunya tanya ke siswa lain.',
            2: 'Refleksi tidak menyentuh risiko nyata.',
            1: 'Tidak ada refleksi.'
          }
        },
        qualityCheck: {
          passed: true,
          checks: [
            { label: 'Soal kontekstual ekonomi sederhana SD', ok: true },
            { label: 'Memerlukan komputasi dan analisis data nyata', ok: true },
            { label: 'Menilai kemampuan berargumen dengan data', ok: true },
            { label: 'Kunci jawaban dan rubrik adaptif 1-4', ok: true }
          ]
        },
        tingkatKesulitan: 'menengah'
      }
    ]
  },
  {
    id: 'sample-smp-listrik',
    kodeAkses: 'SMP-ENERGI-88',
    judul: 'Asesmen Anomali Konsumsi Energi Listrik Sekolah',
    dibuatTanggal: '2026-09-14',
    config: {
      jenjang: 'SMP',
      kelas: 'VIII',
      fase: 'Fase D',
      mataPelajaran: 'IPA',
      elemenCP: 'Keterampilan Proses & Pemahaman IPA (Energi dan Kelistrikan)',
      capaianPembelajaran: 'Peserta didik memahami konsep energi listrik, daya, dan efisiensinya dalam kehidupan sehari-hari; mampu merancang penyelidikan, menginterpretasi data konsumsi energi, serta mengevaluasi klaim efisiensi energi dengan penalaran ilmiah berbasis bukti.',
      materi: 'Energi Listrik, Daya, & Efisiensi Energi',
      tujuanPembelajaran: 'Peserta didik mampu menganalisis grafik tren penggunaan energi listrik 5 bulan, menguji validitas hipotesis dua pihak berdasarkan bukti parsial, dan merancang rekomendasi berbasis efisiensi.',
      kktpInterval: {
        perluBimbingan: '0 - 60%',
        cukup: '61 - 70%',
        baik: '71 - 85%',
        sangatBaik: '86 - 100%'
      },
      kktpDeskripsiKriteria: [
        { aspek: 'Analisis Anomali Data', indikator: 'Mengidentifikasi lonjakan kWh dan mengorelasikannya dengan faktor cuaca serta beban peralatan.' },
        { aspek: 'Evaluasi Bukti Parsial', indikator: 'Menganalisis kelemahan hipotesis pihak yang hanya mengandalkan satu variabel tanpa melihat data tren.' },
        { aspek: 'Penalaran Ilmiah Multivariabel', indikator: 'Menyusun argumen berbasis interaksi daya, durasi pemakaian, dan suhu lingkungan.' },
        { aspek: 'Rekomendasi & Refleksi', indikator: 'Menyusun protokol penghematan terukur dan mengidentifikasi data logbook yang masih diperlukan.' }
      ],
      konteks: 'lingkungan sekolah',
      jumlahSoal: 2,
      bentukSoal: 'studi kasus',
      tingkatKesulitan: 'tinggi',
      fokusPenalaran: ['menganalisis', 'mengevaluasi', 'mencipta'],
      sumberBoleh: ['Buku', 'Catatan', 'Internet', 'Google', 'AI'],
      waktuPengerjaan: 45,
      menggunakanDataLokal: true,
      dataLokalDeskripsi: 'Data pencatatan kWh meteran listrik SMP Merdeka selama semester genap beserta suhu rata-rata dan jadwal kegiatan'
    },
    questions: [
      {
        id: 'smp-q1',
        nomor: 1,
        judulKasus: 'Misteri Lonjakan Tagihan Listrik di Bulan Oktober',
        konteks: 'SMP Merdeka mencatat konsumsi listrik bulanan selama 5 bulan berturut-turut. Pada bulan Oktober terjadi lonjakan tajam sebesar 42% padahal jumlah siswa, ruang kelas, dan jam belajar tetap sama.',
        dataInformasi: {
          tipe: 'tabel',
          konten: 'Berikut adalah tabel rekapitulasi data energi listrik, rata-rata suhu harian, dan kegiatan sekolah dari Juli sampai November:',
          tabelData: {
            headers: ['Bulan', 'Konsumsi Listrik (kWh)', 'Rata-rata Suhu Siang (°C)', 'Aktivitas Utama Sekolah', 'Penggunaan Lab Komputer'],
            baris: [
              ['Juli', '3.200 kWh', '31°C', 'Awal tahun ajaran baru', 'Normal (10 jam/minggu)'],
              ['Agustus', '3.350 kWh', '32°C', 'Kegiatan Peringatan HUT RI', 'Normal (10 jam/minggu)'],
              ['September', '3.400 kWh', '32.5°C', 'Ujian Tengah Semester', 'Rendah (4 jam/minggu)'],
              ['Oktober', '4.850 kWh', '34.8°C', 'Proyek P5 & Gelar Karya', 'Meningkat (30 jam/minggu)'],
              ['November', '3.600 kWh', '31.5°C', 'Persiapan Ujian Akhir', 'Normal (12 jam/minggu)']
            ]
          },
          visualisasiGrafik: {
            tipeGrafik: 'line',
            judulGrafik: 'Tren Konsumsi Energi Listrik (kWh) vs Jam Penggunaan Lab Komputer',
            sumbuX: 'Bulan Pengamatan',
            sumbuY: 'Konsumsi (kWh)',
            labels: ['Juli', 'Agustus', 'September', 'Oktober (Puncak P5)', 'November'],
            datasets: [
              {
                nama: 'Konsumsi Listrik (kWh)',
                nilai: [3200, 3350, 3400, 4850, 3600],
                warna: '#f59e0b'
              },
              {
                nama: 'Jam Lab Komputer (x100)',
                nilai: [1000, 1000, 400, 3000, 1200],
                warna: '#0284c7'
              }
            ],
            deskripsiGrafik: 'Grafik menunjukkan anomali tajam pada Bulan Oktober di mana konsumsi listrik melonjak ke 4.850 kWh bersamaan dengan kenaikan jam pemakaian lab komputer menjadi 30 jam/minggu.'
          },
          kutipanPihak: [
            {
              nama: 'Pak Joko (Guru Fisika / Pengelola Sarpras)',
              peran: 'Koordinator Sarana & Prasarana',
              pernyataan: 'Penyebab utama lonjakan pasti AC di ruang guru dan kelas yang dipasang pada suhu 16°C terus menerus karena cuaca Oktober sangat terik (34.8°C).'
            },
            {
              nama: 'Bu Maya (Guru Informatika)',
              peran: 'Kepala Lab Komputer',
              pernyataan: 'Saya menduga penyebab utamanya adalah pemakaian 35 unit PC di laboratorium komputer untuk persiapan Proyek P5 yang melonjak hingga 30 jam per minggu.'
            }
          ]
        },
        masalah: 'Dua guru memiliki dugaan berbeda yang masing-masing tampak masuk akal. Kepala Sekolah ingin mengetahui apakah salah satu dugaan sudah dapat diterima secara pasti, atau data apa yang masih kurang.',
        pertanyaanUtama: 'Berdasarkan data yang tersedia pada tabel, apakah salah satu dari kedua dugaan (Pak Joko vs Bu Maya) sudah dapat disimpulkan sebagai penyebab tunggal dengan bukti yang cukup? Jelaskan posisimu!',
        permintaanBukti: 'Kutipkan data suhu, jam operasional komputer, dan lonjakan kWh pada bulan Oktober untuk menguji kedua pendapat.',
        permintaanAlasan: 'Jelaskan mengapa data yang tersedia saat ini belum cukup untuk menyalahkan salah satu faktor secara mutlak.',
        refleksi: 'Data tambahan apa yang spesifik (misalnya spesifikasi watt perangkat atau durasi pemakaian AC) yang harus diukur untuk membuktikan hipotesis tersebut?',
        bentukSoal: 'studi kasus',
        kunciJawaban: 'Siswa yang berpikir kritis akan menyimpulkan: BELUM BISA DITERIMA SEBAGAI PENYEBAB TUNGGAL. Kedua faktor saling berkontribusi. Bukti: Suhu naik ke 34.8°C (mendukung dugaan AC bekerja lebih keras), namun penggunaan Lab Komputer juga naik 3x lipat (dari 10 jam ke 30 jam/minggu). Data belum cukup karena belum ada data daya listrik (Watt) AC vs PC komputer, serta data berapa jam AC dinyalakan per hari. Refleksi: Diperlukan data sub-metering (kWh meter terpisah per zona) atau data spesifikasi daya watt masing-masing beban.',
        petunjukPemandu: [
          'Periksa apakah ada dua variabel yang berubah bersamaan di bulan Oktober.',
          'Apakah kamu sudah tahu berapa Watt daya pendingin ruangan (AC) dibandingkan daya satu unit PC laboratorium?',
          'Ingat: hubungan waktu yang bersamaan (korelasi) belum tentu membuktikan satu-satunya penyebab (kausalitas tunggal).'
        ],
        rubrik: {
          pemahamanMasalah: {
            4: 'Sangat memahami anomali multivariat dan menyadari bahwa korelasi belum membuktikan penyebab tunggal.',
            3: 'Memahami adanya dua variabel yang melonjak di bulan Oktober (suhu dan jam lab).',
            2: 'Hanya memihak salah satu guru tanpa melihat variabel lainnya.',
            1: 'Gagal memahami masalah lonjakan energi.'
          },
          penggunaanBukti: {
            4: 'Mengutip data kenaikan suhu (34.8°C), lonjakan kWh (+1.450 kWh), dan jam lab (30 jam/minggu) secara komprehensif.',
            3: 'Mengutip 2 data pendukung dari tabel secara tepat.',
            2: 'Hanya mengutip 1 data parsial.',
            1: 'Tidak mengutip data tabel.'
          },
          penalaran: {
            4: 'Argumen ilmiah sangat kokoh: membedakan antara hipotesis, bukti pendukung, dan data yang belum lengkap.',
            3: 'Argumen logis namun belum mendalami konsep daya listrik (Watt x Jam).',
            2: 'Penalaran bias atau terburu-buru mengambil kesimpulan.',
            1: 'Penalaran tidak logis.'
          },
          keputusanSolusi: {
            4: 'Menyimpulkan dengan hati-hati bahwa data saat ini belum cukup untuk keputusan tunggal dan merumuskan langkah investigasi terukur.',
            3: 'Keputusan tepat mengakui adanya kontribusi kedua pihak.',
            2: 'Keputusan sepihak tanpa justifikasi.',
            1: 'Tidak ada keputusan.'
          },
          refleksi: {
            4: 'Secara cermat merinci data yang hilang (spesifikasi Watt, jam nyala AC, meteran terpisah) dan dampaknya bagi kesimpulan.',
            3: 'Menyebutkan perlunya mengecek meteran atau watt alat.',
            2: 'Hanya menyebutkan data umum.',
            1: 'Tidak ada refleksi atas keterbatasan data.'
          }
        },
        qualityCheck: {
          passed: true,
          checks: [
            { label: 'Soal kontekstual berbasis fenomena sains & teknologi sekolah', ok: true },
            { label: 'Menghindari jawaban instan AI karena bergantung pada data tabel lokal spesifik', ok: true },
            { label: 'Menguji kemampuan evaluasi bukti dan mendeteksi data yang belum cukup', ok: true },
            { label: 'Mendorong pola Klaim -> Bukti -> Alasan -> Refleksi', ok: true },
            { label: 'Terdapat perspektif ganda (Pak Joko vs Bu Maya)', ok: true }
          ]
        },
        tingkatKesulitan: 'tinggi'
      },
      {
        id: 'smp-q2',
        nomor: 2,
        judulKasus: 'Rekomendasi Kebijakan Efisiensi Energi Sekolah',
        konteks: 'Kepala Sekolah meminta komite perwakilan siswa untuk merumuskan kebijakan efisiensi listrik yang tidak mengorbankan kenyamanan belajar dan kelancaran kegiatan Proyek P5.',
        dataInformasi: {
          tipe: 'pernyataan',
          konten: 'Dari hasil konsultasi teknis, diketahui bahwa 1 unit AC 1 PK mengonsumsi daya rata-rata 750 Watt. Setiap penurunan suhu remote AC sebesar 1°C di bawah 24°C meningkatkan konsumsi daya sekitar 6-8%. Sementara 1 unit PC rata-rata mengonsumsi 180 Watt saat aktif.',
          tabelData: {
            headers: ['Tindakan yang Diusulkan', 'Potensi Penghematan', 'Tantangan Penerapan', 'Konsekuensi'],
            baris: [
              ['Opsi A: Standarisasi Remote AC suhu 24°C-25°C', '15% - 20% beban pendingin', 'Siswa/guru merasa kurang dingin di siang hari terik', 'Mencegah kompresor bekerja non-stop'],
              ['Opsi B: Membatasi jam Lab Komputer maksimal 10 jam/minggu', '10% beban listrik lab', 'Menghambat tenggat waktu proyek digital siswa', 'Siswa harus mengerjakan di rumah masing-masing'],
              ['Opsi C: Penerapan SOP Matikan Perangkat Standby & Ventilasi Alami Pagi Hari', '8% - 12% total beban sekolah', 'Memerlukan disiplin piket kelas setiap hari', 'Membentuk kebiasaan hemat energi jangka panjang']
            ]
          }
        },
        masalah: 'Sekolah harus memilih kombinasi 2 opsi kebijakan terbaik yang paling berdampak besar namun minim dampak negatif terhadap pembelajaran.',
        pertanyaanUtama: 'Jika kamu ketua OSIS yang diminta menyusun nota rekomendasi ke Kepala Sekolah, kombinasi tindakan mana yang kamu usulkan? Jelaskan konsekuensi positif dan mitigasi risiko tantangannya!',
        permintaanBukti: 'Gunakan persentase penghematan dan konsekuensi dari tabel opsi di atas.',
        permintaanAlasan: 'Jelaskan mengapa kombinasi tersebut lebih bijak daripada memangkas jam lab komputer.',
        refleksi: 'Jika bulan depan terjadi gelombang panas ekstrem mencapai 37°C, bagaimana kebijakanmu harus disesuaikan?',
        bentukSoal: 'pemecahan masalah',
        kunciJawaban: 'Rekomendasi ideal menggabungkan Opsi A (hemat besar 15-20% tanpa mematikan AC, hanya kalibrasi suhu) dan Opsi C (kebiasaan positif 8-12%). Menolak Opsi B karena mengorbankan kualitas pembelajaran digital siswa. Mitigasi Opsi A: menggunakan kipas angin tambahan untuk sirkulasi udara sejuk. Refleksi cuaca ekstrem 37°C: suhu AC boleh disesuaikan ke 23°C secara fleksibel demi kesehatan siswa, namun menutup tirai jendela agar panas matahari tidak masuk.',
        petunjukPemandu: [
          'Pertimbangkan prioritas utama sekolah: pendidikan dan kelancaran proyek siswa jangan sampai dirugikan.',
          'Bandingkan potensi penghematan Opsi A (15-20%) vs Opsi B (hanya 10% namun menghambat proyek).',
          'Pikirkan solusi kompromi (mitigasi) saat ruangan terasa agak hangat.'
        ],
        rubrik: {
          pemahamanMasalah: {
            4: 'Memahami keseimbangan antara efisiensi biaya dan hak belajar siswa secara komprehensif.',
            3: 'Memahami trade-off antara hemat energi dan kenyamanan belajar.',
            2: 'Hanya melihat aspek penghematan uang tanpa memedulikan pembelajaran.',
            1: 'Salah menangkap inti masalah.'
          },
          penggunaanBukti: {
            4: 'Menggunakan data potensi penghematan (%) dan rincian konsekuensi secara akurat.',
            3: 'Menyebutkan data penghematan sebagian.',
            2: 'Data yang digunakan tidak relevan.',
            1: 'Tidak ada data pendukung.'
          },
          penalaran: {
            4: 'Penalaran analisis biaya-manfaat (cost-benefit analysis) sangat runtut dan dewasa.',
            3: 'Penalaran cukup baik dalam mempertahankan argumen.',
            2: 'Alasan lemah atau klise.',
            1: 'Tidak ada alur penalaran.'
          },
          keputusanSolusi: {
            4: 'Kombinasi solusi aplikatif, dilengkapi rencana mitigasi tantangan yang matang.',
            3: 'Solusi baik dan bisa diterapkan.',
            2: 'Solusi berpotensi menimbulkan protes siswa/guru.',
            1: 'Tidak ada usulan solusi konkret.'
          },
          refleksi: {
            4: 'Menjawab adaptasi skenario baru (37°C) secara fleksibel dengan pertimbangan kesehatan & sains.',
            3: 'Memberikan penyesuaian sederhana.',
            2: 'Kaku pada aturan awal.',
            1: 'Tidak menjawab refleksi.'
          }
        },
        qualityCheck: {
          passed: true,
          checks: [
            { label: 'Menuntut pengambilan keputusan dan justifikasi dampak', ok: true },
            { label: 'Memiliki simulasi kondisi berubah (refleksi adaptif)', ok: true },
            { label: 'Mengintegrasikan data teknis dengan kebijakan sosial sekolah', ok: true },
            { label: 'Format terbuka dengan multi-solusi yang dapat dipertanggungjawabkan', ok: true }
          ]
        },
        tingkatKesulitan: 'tinggi'
      }
    ]
  }
];
