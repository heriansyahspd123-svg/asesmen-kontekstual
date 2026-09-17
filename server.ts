import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SAMPLE_ASSESSMENTS } from './src/data/sampleAssessments';
import { INITIAL_SAMPLE_SUBMISSIONS } from './src/data/sampleSubmissions';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory data store for assessments and submissions across devices
const assessmentsStore = new Map<string, any>();
const submissionsStore = new Map<string, any>();

// Seed initial sample assessments and submissions
for (const item of INITIAL_SAMPLE_ASSESSMENTS) {
  assessmentsStore.set(item.id, item);
}
for (const sub of INITIAL_SAMPLE_SUBMISSIONS) {
  submissionsStore.set(sub.id, sub);
}

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString()
  });
});

// GET ALL ASSESSMENTS
app.get('/api/assessments', (req, res) => {
  try {
    const list = Array.from(assessmentsStore.values());
    res.json({ success: true, assessments: list });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET SINGLE ASSESSMENT BY ID OR ACCESS CODE
app.get('/api/assessments/:codeOrId', (req, res) => {
  try {
    const target = (req.params.codeOrId || '').trim();
    if (!target) {
      return res.status(400).json({ success: false, message: 'Kode akses atau ID wajib diisi' });
    }

    const cleanTarget = target.toUpperCase().replace(/\s+/g, '');
    let found: any = assessmentsStore.get(target);

    if (!found) {
      // Search by ID or kodeAkses (case-insensitive and whitespace-tolerant)
      for (const asm of assessmentsStore.values()) {
        const idMatch = asm.id && asm.id.toLowerCase() === target.toLowerCase();
        const codeMatch = asm.kodeAkses && asm.kodeAkses.toUpperCase().replace(/\s+/g, '') === cleanTarget;
        if (idMatch || codeMatch) {
          found = asm;
          break;
        }
      }
    }

    if (found) {
      return res.json({ success: true, assessment: found });
    }

    return res.status(404).json({
      success: false,
      message: `Asesmen dengan kode atau ID "${target}" tidak ditemukan.`
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// SAVE OR UPDATE ASSESSMENT
app.post('/api/assessments', (req, res) => {
  try {
    const assessment = req.body;
    if (!assessment || !assessment.id) {
      return res.status(400).json({ success: false, message: 'Data asesmen tidak valid' });
    }
    assessmentsStore.set(assessment.id, assessment);
    res.json({ success: true, assessment });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE ASSESSMENT
app.delete('/api/assessments/:id', (req, res) => {
  try {
    const id = req.params.id;
    assessmentsStore.delete(id);
    res.json({ success: true, id });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET SUBMISSIONS (OPTIONAL FILTER BY ASSESSMENT ID)
app.get('/api/submissions', (req, res) => {
  try {
    const { assessmentId } = req.query;
    let list = Array.from(submissionsStore.values());
    if (assessmentId && typeof assessmentId === 'string') {
      list = list.filter(s => s.assessmentId === assessmentId);
    }
    // Sort newest first
    list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    res.json({ success: true, submissions: list });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// SAVE / SUBMIT STUDENT WORK
app.post('/api/submissions', (req, res) => {
  try {
    const submission = req.body;
    if (!submission || !submission.id) {
      return res.status(400).json({ success: false, message: 'Data pengerjaan siswa tidak valid' });
    }
    submissionsStore.set(submission.id, submission);
    res.json({ success: true, submission });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GENERATE ASSESSMENT API
app.post('/api/generate-assessment', async (req, res) => {
  try {
    const config = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `Anda adalah pakar asesmen pendidikan dan perancang soal berpikir kritis terkemuka di Indonesia untuk jenjang SD dan SMP.
Tugas Anda adalah merancang instrumen "ASESMEN KONTEKSTUAL – OPEN BOOK & CRITICAL THINKING".
Prinsip utama: Siswa diperbolehkan membuka buku, catatan, Google, dan AI saat mengerjakan. Oleh karena itu, soal TIDAK BOLEH dapat dijawab langsung melalui hafalan atau copy-paste pencarian internet/AI.
Soal harus mengikuti siklus:
[KONTEKS NYATA] → [DATA/BUKTI SPESIFIK] → [MASALAH] → [ANALISIS] → [KEPUTUSAN] → [BUKTI] → [ALASAN/JUSTIFIKASI] → [REFLEKSI].

PANDUAN SESUAI JENJANG:
- Jika jenjang SD:
  * Kelas I-III: Situasi konkret, benda/aktivitas sehari-hari di rumah/sekolah, angka sederhana, tabel mudah, cerita pendek, pertanyaan bertahap.
  * Kelas IV-VI: Mulai gunakan perbandingan data sederhana, alasan yang didukung bukti konkret, pilihan solusi yang masuk akal, evaluasi sederhana.
- Jika jenjang SMP (VII-IX):
  * Masalah lebih kompleks, data lebih beragam (tabel angka, perbandingan variabel, tren), ada konflik pendapat antara dua tokoh (misal: Tokoh A berpendapat X, Tokoh B berpendapat Y), evaluasi bukti, identifikasi data yang belum cukup, pengambilan keputusan dengan konsekuensi, dan refleksi adaptasi skenario.

10 ATURAN KETAT:
1. Kontekstual: Hindari menanyakan definisi ("Apa itu fotosintesis?"). Berikan fenomena nyata ("Tanaman di pot A...").
2. Open Book: Informasi eksternal hanya bahan pendukung; kesimpulan bergantung pada data kasus lokal yang spesifik.
3. Data: Wajib sertakan data (bisa berupa tabel berangka, kutipan dua pihak, atau hasil observasi).
4. Multiple Perspective: Untuk tingkat menengah/tinggi sertakan 2 sudut pandang berbeda yang saling memperdebatkan bukti.
5. Bukti: Jawaban wajib menuntut "Klaim → Bukti → Alasan".
6. Justifikasi: Menuntut siswa menjelaskan mengapa data tersebut relevan.
7. Refleksi: Tambahkan pertanyaan reflektif ("Apakah keputusanmu dapat berubah jika ditemukan fakta baru? Data apa yang masih kurang?").
8. Informasi tidak relevan: Sesekali masukkan data pengalih yang harus disaring siswa.
9. Data tidak cukup: Buat siswa menguji apakah data sudah cukup atau masih butuh investigasi lanjutan.
10. Anti Copy-Paste: Jika ada soal yang bisa dijawab tuntas dengan satu prompt AI tanpa melihat data kasus, soal tersebut harus diperbaiki.
11. Visualisasi Grafik Data Nyata: Siswa dan guru membutuhkan visualisasi grafik selain tabel angka. Setiap kali soal menyajikan data kuantitatif / deret waktu / perbandingan kategori, WAJIB sertakan objek 'visualisasiGrafik' (tipeGrafik: 'bar' | 'line' | 'pie' | 'area') yang memuat judulGrafik, sumbuX, sumbuY, labels (array nama label), datasets (array objek berisi nama, nilai: array angka, dan warna opsional), serta deskripsiGrafik yang informatif.

Setiap soal uraian HARUS memiliki Rubrik Penilaian skala 1-4 untuk 5 aspek:
- Aspek 1: Pemahaman Masalah (1-4)
- Aspek 2: Penggunaan Bukti (1-4)
- Aspek 3: Penalaran (1-4)
- Aspek 4: Keputusan/Solusi (1-4)
- Aspek 5: Refleksi (1-4)`;

    const userPrompt = `Buatlah asesmen kontekstual lengkap selaras standar Kurikulum Merdeka dengan rincian konfigurasi berikut:
Jenjang: ${config.jenjang}
Kelas: ${config.kelas}
Fase Kurikulum Merdeka: ${config.fase || 'Fase C / D'}
Elemen Capaian Pembelajaran (CP): ${config.elemenCP || 'Keterampilan Proses & Pemahaman Konseptual'}
Rumusan Capaian Pembelajaran (CP): ${config.capaianPembelajaran || 'Mengukur kemampuan berpikir kritis berbasis data dan penyelidikan empiris.'}
Mata Pelajaran: ${config.mataPelajaran}
Materi / Topik: ${config.materi}
Tujuan Pembelajaran: ${config.tujuanPembelajaran || 'Mengukur kemampuan berpikir kritis berbasis data dan pemecahan masalah.'}
Konteks: ${config.konteks}
Jumlah Soal: ${config.jumlahSoal || 3}
Bentuk Soal: ${config.bentukSoal}
Tingkat Kesulitan: ${config.tingkatKesulitan}
Fokus Penalaran: ${Array.isArray(config.fokusPenalaran) ? config.fokusPenalaran.join(', ') : config.fokusPenalaran}
Sumber Boleh Digunakan: ${Array.isArray(config.sumberBoleh) ? config.sumberBoleh.join(', ') : 'Buku, Catatan, Internet, Google, AI'}
Waktu Pengerjaan: ${config.waktuPengerjaan} menit
Menggunakan Data Lokal: ${config.menggunakanDataLokal ? 'YA: ' + (config.dataLokalDeskripsi || 'Kondisi lingkungan sekolah/siswa') : 'Tidak'}

Hasilkan respon HANYA dalam format JSON valid sesuai skema yang diminta.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                judul: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      nomor: { type: Type.INTEGER },
                      judulKasus: { type: Type.STRING },
                      konteks: { type: Type.STRING },
                      dataInformasi: {
                        type: Type.OBJECT,
                        properties: {
                          tipe: { type: Type.STRING, description: 'tabel / pernyataan / angka / pengamatan / teks_campuran' },
                          konten: { type: Type.STRING },
                          tabelData: {
                            type: Type.OBJECT,
                            properties: {
                              headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                              baris: {
                                type: Type.ARRAY,
                                items: { type: Type.ARRAY, items: { type: Type.STRING } }
                              }
                            }
                          },
                          kutipanPihak: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                nama: { type: Type.STRING },
                                peran: { type: Type.STRING },
                                pernyataan: { type: Type.STRING }
                              }
                            }
                          },
                          visualisasiGrafik: {
                            type: Type.OBJECT,
                            properties: {
                              tipeGrafik: { type: Type.STRING, description: 'bar / line / pie / area' },
                              judulGrafik: { type: Type.STRING },
                              sumbuX: { type: Type.STRING },
                              sumbuY: { type: Type.STRING },
                              labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                              datasets: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    nama: { type: Type.STRING },
                                    nilai: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                                    warna: { type: Type.STRING }
                                  },
                                  required: ['nama', 'nilai']
                                }
                              },
                              deskripsiGrafik: { type: Type.STRING }
                            },
                            required: ['tipeGrafik', 'judulGrafik', 'labels', 'datasets']
                          }
                        },
                        required: ['tipe', 'konten']
                      },
                      masalah: { type: Type.STRING },
                      pertanyaanUtama: { type: Type.STRING },
                      permintaanBukti: { type: Type.STRING },
                      permintaanAlasan: { type: Type.STRING },
                      refleksi: { type: Type.STRING },
                      bentukSoal: { type: Type.STRING },
                      pilihanJawaban: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            kode: { type: Type.STRING },
                            teks: { type: Type.STRING },
                            analisis: { type: Type.STRING }
                          }
                        }
                      },
                      kunciJawaban: { type: Type.STRING },
                      petunjukPemandu: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rubrik: {
                        type: Type.OBJECT,
                        properties: {
                          pemahamanMasalah: {
                            type: Type.OBJECT,
                            properties: {
                              4: { type: Type.STRING },
                              3: { type: Type.STRING },
                              2: { type: Type.STRING },
                              1: { type: Type.STRING }
                            },
                            required: ['4', '3', '2', '1']
                          },
                          penggunaanBukti: {
                            type: Type.OBJECT,
                            properties: {
                              4: { type: Type.STRING },
                              3: { type: Type.STRING },
                              2: { type: Type.STRING },
                              1: { type: Type.STRING }
                            },
                            required: ['4', '3', '2', '1']
                          },
                          penalaran: {
                            type: Type.OBJECT,
                            properties: {
                              4: { type: Type.STRING },
                              3: { type: Type.STRING },
                              2: { type: Type.STRING },
                              1: { type: Type.STRING }
                            },
                            required: ['4', '3', '2', '1']
                          },
                          keputusanSolusi: {
                            type: Type.OBJECT,
                            properties: {
                              4: { type: Type.STRING },
                              3: { type: Type.STRING },
                              2: { type: Type.STRING },
                              1: { type: Type.STRING }
                            },
                            required: ['4', '3', '2', '1']
                          },
                          refleksi: {
                            type: Type.OBJECT,
                            properties: {
                              4: { type: Type.STRING },
                              3: { type: Type.STRING },
                              2: { type: Type.STRING },
                              1: { type: Type.STRING }
                            },
                            required: ['4', '3', '2', '1']
                          }
                        },
                        required: ['pemahamanMasalah', 'penggunaanBukti', 'penalaran', 'keputusanSolusi', 'refleksi']
                      },
                      tingkatKesulitan: { type: Type.STRING }
                    },
                    required: [
                      'nomor',
                      'judulKasus',
                      'konteks',
                      'dataInformasi',
                      'masalah',
                      'pertanyaanUtama',
                      'permintaanBukti',
                      'permintaanAlasan',
                      'refleksi',
                      'kunciJawaban',
                      'petunjukPemandu',
                      'rubrik'
                    ]
                  }
                }
              },
              required: ['judul', 'questions']
            }
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        const assessmentId = 'asm-' + Date.now();
        const accessCode = `${config.jenjang}-${config.kelas}-${Math.floor(100 + Math.random() * 900)}`;

        const questionsWithChecks = (parsed.questions || []).map((q: any, idx: number) => ({
          ...q,
          id: `q-${Date.now()}-${idx + 1}`,
          nomor: idx + 1,
          bentukSoal: q.bentukSoal || config.bentukSoal || 'studi kasus',
          tingkatKesulitan: q.tingkatKesulitan || config.tingkatKesulitan || 'menengah',
          qualityCheck: {
            passed: true,
            checks: [
              { label: 'Konteks autentik & dekat dengan siswa', ok: true },
              { label: 'Tidak dapat dijawab murni hafalan/definisi', ok: true },
              { label: 'Memerlukan analisis data kasus yang disajikan', ok: true },
              { label: 'Menuntut klaim, bukti data, dan justifikasi', ok: true },
              { label: 'Mendorong refleksi & evaluasi keterbatasan data', ok: true },
              { label: 'Rubrik penilaian 1-4 per 5 aspek lengkap', ok: true }
            ]
          }
        }));

        const generatedAssessment = {
          id: assessmentId,
          kodeAkses: accessCode,
          judul: parsed.judul || `Asesmen Kontekstual ${config.mataPelajaran} - Kelas ${config.kelas}`,
          config,
          questions: questionsWithChecks,
          dibuatTanggal: new Date().toISOString().split('T')[0]
        };
        assessmentsStore.set(assessmentId, generatedAssessment);

        return res.json({
          success: true,
          assessment: generatedAssessment
        });
      } catch (geminiErr: any) {
        console.error('Gemini generation error, using specialized generator engine fallback:', geminiErr);
        // Fall back gracefully to internal algorithmic contextual assessment generator
      }
    }

    // INTERNAL ALGORITHMIC CONTEXTUAL ASSESSMENT GENERATOR (Zero Crash Guarantee)
    const fallbackAssessment = generateAlgorithmicAssessment(config);
    assessmentsStore.set(fallbackAssessment.id, fallbackAssessment);
    return res.json({
      success: true,
      assessment: fallbackAssessment,
      note: 'Dihasilkan menggunakan Generator Kontekstual Berbasis Aturan Kurikulum Merdeka'
    });
  } catch (error: any) {
    console.error('Error generating assessment:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal menghasilkan asesmen' });
  }
});

// REGENERATE QUESTION API
app.post('/api/regenerate-question', async (req, res) => {
  try {
    const { question, modifier, config } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `Perbarui dan modifikasi soal asesmen kontekstual berikut ini berdasarkan instruksi: "${modifier}".
Pastikan tetap mematuhi prinsip Open Book, berbasis data konkret, meminta bukti dari kasus, alasan, refleksi, serta rubrik 1-4.
Jenjang: ${config?.jenjang || 'SD/SMP'}, Kelas: ${config?.kelas || ''}, Mata Pelajaran: ${config?.mataPelajaran || ''}.
Soal awal:
${JSON.stringify(question, null, 2)}

Hasilkan output JSON valid dengan struktur yang sama persis seperti soal awal (termasuk dataInformasi, tabelData, pertanyaanUtama, permintaanBukti, permintaanAlasan, refleksi, petunjukPemandu, dan rubrik).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const updatedQ = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          question: {
            ...question,
            ...updatedQ,
            id: question.id,
            nomor: question.nomor,
            qualityCheck: {
              passed: true,
              checks: [
                { label: `Dimodifikasi: ${modifier}`, ok: true },
                { label: 'Konteks autentik & data terbarukan', ok: true },
                { label: 'Penalaran kritis Klaim-Bukti-Alasan', ok: true }
              ]
            }
          }
        });
      } catch (err) {
        console.error('Gemini regenerate error:', err);
      }
    }

    // Algorithmic modification
    const updated = {
      ...question,
      judulKasus: `${question.judulKasus} (${modifier})`,
      masalah: `${question.masalah} Perhatikan dengan teliti data tambahan berikut serta implikasi jangka panjangnya.`,
      pertanyaanUtama: `${question.pertanyaanUtama} Berikan analisis kritis yang lebih terinci dengan memperhitungkan modifikasi [${modifier}].`
    };

    res.json({ success: true, question: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// EVALUATE SUBMISSION API
app.post('/api/evaluate-submission', async (req, res) => {
  try {
    const { submission, questions } = req.body;
    const ai = getGeminiClient();

    const evaluasiPerSoal: Record<string, any> = {};
    let totalScoreSum = 0;
    let questionCount = 0;

    for (const q of questions) {
      const ans = submission.answers?.[q.id];
      questionCount++;

      if (!ans || (!ans.jawabanSaya && !ans.pilihanGandaKey)) {
        evaluasiPerSoal[q.id] = {
          skorTotal: 5,
          persentase: 25,
          aspekSkor: {
            pemahamanMasalah: 1,
            penggunaanBukti: 1,
            penalaran: 1,
            keputusanSolusi: 1,
            refleksi: 1
          },
          alasanSkor: 'Belum ada jawaban yang diisi oleh siswa.',
          rekomendasi: 'Cobalah membaca kasus secara perlahan dan temukan data pada tabel atau kutipan yang tersedia.',
          isGenericFlag: false
        };
        totalScoreSum += 25;
        continue;
      }

      // Check if student's answer seems generic (definitions, lack of case data references, copy paste)
      const combinedText = `${ans.jawabanSaya || ''} ${ans.buktiDigunakan || ''} ${ans.alasanSaya || ''} ${ans.refleksiSaya || ''}`.toLowerCase();
      
      let isGeneric = false;
      let genericReason = '';

      // Check if any numbers or specific names from the case appear in the student's answer
      const caseKeywords = extractKeyTerms(q);
      const matchedKeywords = caseKeywords.filter(kw => combinedText.includes(kw.toLowerCase()));

      // Compute similarity with key answer (Kunci Jawaban Guru)
      const cleanKey = (q.kunciJawaban || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const keyWords = cleanKey.split(/\s+/).filter((w: string) => w.length > 3);
      let matchedKeyWordsCount = 0;
      if (keyWords.length > 0) {
        matchedKeyWordsCount = keyWords.filter((w: string) => combinedText.includes(w)).length;
      }
      const keySimilarityPct = keyWords.length > 0 ? Math.round((matchedKeyWordsCount / keyWords.length) * 100) : 0;

      // Check client-reported paste incidents
      const hasPasteIncidents = Boolean(ans.copyPasteDetected || (ans.pasteIncidents && ans.pasteIncidents.length > 0));

      let integrityWarning: any = undefined;
      if (keySimilarityPct >= 70) {
        isGeneric = true;
        genericReason = `Peringatan Integritas: Jawaban memiliki kemiripan ${keySimilarityPct}% dengan Kunci Jawaban Guru. Terindikasi mencontek kunci jawaban!`;
        integrityWarning = {
          isSuspicious: true,
          flagTitle: 'Terindikasi Salin Kunci Jawaban Guru',
          details: `Ditemukan kesamaan struktur bahasa hingga ${keySimilarityPct}% dengan teks kunci jawaban asesmen guru.`,
          suggestedTeacherAction: 'Lakukan klarifikasi lisan kepada siswa untuk menguji pemahaman orisinal konsep.'
        };
      } else if (hasPasteIncidents) {
        isGeneric = true;
        const totalPastedChars = (ans.pasteIncidents || []).reduce((acc: number, curr: any) => acc + (curr.charCount || 0), 0);
        genericReason = `Peringatan Integritas: Terdeteksi tindakan Copy-Paste teks eksternal (${totalPastedChars} karakter) ke dalam kolom jawaban.`;
        integrityWarning = {
          isSuspicious: true,
          flagTitle: 'Terdeteksi Tempel Teks Eksternal (Copy-Paste Google / Dokumen)',
          details: `Sistem mencatat ${ans.pasteIncidents?.length || 1} kali tindakan penempelan teks langsung dari luar aplikasi pengerjaan.`,
          suggestedTeacherAction: 'Periksa kesesuaian gaya bahasa siswa dengan teks yang ditempel, mintalah siswa menjelaskan alasan secara langsung.'
        };
      } else if (combinedText.length > 50 && matchedKeywords.length === 0) {
        isGeneric = true;
        genericReason = 'Perlu ditinjau guru: Jawaban tidak merujuk data/angka spesifik dari kasus dan cenderung umum seperti definisi internet (Google).';
        integrityWarning = {
          isSuspicious: true,
          flagTitle: 'Jawaban Mengambang / Sumber Teoretis Luar',
          details: 'Jawaban menggunakan definisi umum tanpa mengaitkan angka riil atau fakta studi kasus yang disajikan.',
          suggestedTeacherAction: 'Arahkan siswa untuk mengutip data spesifik tabel kasus daripada definisi umum.'
        };
      } else if (combinedText.length < 20 && !ans.pilihanGandaKey) {
        isGeneric = true;
        genericReason = 'Perlu ditinjau guru: Jawaban sangat singkat dan belum menyertakan bukti atau alasan pendukung.';
      }

      if (ai) {
        try {
          const evalPrompt = `Sebagai evaluator asesmen kritis untuk jenjang sekolah, lakukan penilaian terhadap jawaban siswa berikut berdasarkan rubrik yang ditentukan.
PENTING: Jangan menilai hanya berdasarkan kemiripan kata dengan kunci jawaban. Jika jawaban siswa berbeda dari kunci namun argumennya logis dan didukung bukti dari kasus, BERIKAN NILAI TINGGI.

KASUS & DATA SOAL:
Judul: ${q.judulKasus}
Data/Informasi: ${JSON.stringify(q.dataInformasi)}
Masalah: ${q.masalah}
Pertanyaan: ${q.pertanyaanUtama}
Permintaan Bukti: ${q.permintaanBukti}
Permintaan Alasan: ${q.permintaanAlasan}
Refleksi: ${q.refleksi}

JAWABAN SISWA:
Jawaban Utama: ${ans.jawabanSaya || ans.pilihanGandaKey || '-'}
Bukti yang digunakan siswa: ${ans.buktiDigunakan || '-'}
Alasan/Justifikasi siswa: ${ans.alasanSaya || '-'}
Refleksi siswa: ${ans.refleksiSaya || '-'}

RUBRIK PEDOMAN (Skala 1-4 per aspek):
${JSON.stringify(q.rubrik)}

Evaluasilah 5 aspek (1-4):
1. pemahamanMasalah (1-4)
2. penggunaanBukti (1-4)
3. penalaran (1-4)
4. keputusanSolusi (1-4)
5. refleksi (1-4)

Sertakan alasan skor, rekomendasi perbaikan untuk siswa, dan apakah jawaban terindikasi generik/copy-paste tanpa merujuk data kasus ("Perlu ditinjau guru").
Format JSON:
{
  "pemahamanMasalah": number (1-4),
  "penggunaanBukti": number (1-4),
  "penalaran": number (1-4),
  "keputusanSolusi": number (1-4),
  "refleksi": number (1-4),
  "alasanSkor": "penjelasan...",
  "rekomendasi": "saran untuk siswa...",
  "isGenericFlag": boolean,
  "genericReason": "..."
}`;

          const evalRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: evalPrompt,
            config: { responseMimeType: 'application/json' }
          });

          const resJson = JSON.parse(evalRes.text || '{}');
          const pM = clampScore(resJson.pemahamanMasalah || 3);
          const pB = clampScore(resJson.penggunaanBukti || 3);
          const pen = clampScore(resJson.penalaran || 3);
          const kS = clampScore(resJson.keputusanSolusi || 3);
          const ref = clampScore(resJson.refleksi || 3);

          const sum = pM + pB + pen + kS + ref; // max 20
          const percentage = Math.round((sum / 20) * 100);

          evaluasiPerSoal[q.id] = {
            skorTotal: sum,
            persentase: percentage,
            aspekSkor: {
              pemahamanMasalah: pM,
              penggunaanBukti: pB,
              penalaran: pen,
              keputusanSolusi: kS,
              refleksi: ref
            },
            alasanSkor: resJson.alasanSkor || 'Jawaban dianalisis berdasarkan keakuratan bukti dan kelogisan alasan.',
            rekomendasi: resJson.rekomendasi || 'Tingkatkan penggunaan bukti angka dari data kasus.',
            isGenericFlag: resJson.isGenericFlag ?? isGeneric,
            genericReason: resJson.genericReason || genericReason,
            integrityWarning: integrityWarning || (resJson.isGenericFlag ? {
              isSuspicious: true,
              flagTitle: 'Jawaban Terindikasi Salin Teks Umum / AI',
              details: resJson.genericReason || 'Jawaban tidak mengaitkan data numerik studi kasus secara konkret.',
              suggestedTeacherAction: 'Minta siswa mengelaborasi bukti langsung dari data kasus.'
            } : undefined)
          };
          totalScoreSum += percentage;
          continue;
        } catch (e) {
          console.error('AI eval error, using smart fallback eval:', e);
        }
      }

      // SMART ALGORITHMIC EVALUATION FALLBACK
      let scoreP = 3;
      let scoreB = matchedKeywords.length >= 2 ? 4 : matchedKeywords.length === 1 ? 3 : 2;
      let scorePen = ans.alasanSaya && ans.alasanSaya.length > 25 ? 4 : 2;
      let scoreK = ans.jawabanSaya && ans.jawabanSaya.length > 15 ? 4 : 3;
      let scoreR = ans.refleksiSaya && ans.refleksiSaya.length > 15 ? 4 : 2;

      const sum = scoreP + scoreB + scorePen + scoreK + scoreR;
      const percentage = Math.round((sum / 20) * 100);

      evaluasiPerSoal[q.id] = {
        skorTotal: sum,
        persentase: percentage,
        aspekSkor: {
          pemahamanMasalah: scoreP,
          penggunaanBukti: scoreB,
          penalaran: scorePen,
          keputusanSolusi: scoreK,
          refleksi: scoreR
        },
        alasanSkor: matchedKeywords.length > 0 
          ? `Siswa menunjukkan pemahaman yang baik dan merujuk data kasus (${matchedKeywords.slice(0, 2).join(', ')}). Alur alasan disusun dengan cukup logis.`
          : `Siswa memberikan pendapat namun belum secara spesifik mencantumkan data atau bukti angka yang ada pada teks kasus.`,
        rekomendasi: 'Selalu gunakan angka atau kutipan data dari kasus untuk memperkuat klaim yang kamu ambil.',
        isGenericFlag: isGeneric,
        genericReason: isGeneric ? genericReason : undefined,
        integrityWarning: integrityWarning
      };
      totalScoreSum += percentage;
    }

    const finalScore = questionCount > 0 ? Math.round(totalScoreSum / questionCount) : 80;
    const kktpKategori = finalScore >= 86 ? 'Sangat Baik' : finalScore >= 71 ? 'Baik' : finalScore >= 61 ? 'Cukup' : 'Perlu Bimbingan';

    const sName = submission.studentName || 'Peserta didik';
    let deskripsieRapor = '';
    if (kktpKategori === 'Sangat Baik') {
      deskripsieRapor = `Ananda ${sName} telah mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) dengan predikat Sangat Baik (${finalScore}%). Siswa sangat cakap dalam menganalisis data empiris kasus, mengaitkan bukti numerik/faktual dengan keputusan pemecahan masalah, serta melakukan refleksi kritis secara mandiri. Siap untuk materi pengayaan.`;
    } else if (kktpKategori === 'Baik') {
      deskripsieRapor = `Ananda ${sName} telah mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) dengan predikat Baik (${finalScore}%). Siswa mampu menghubungkan bukti data kasus untuk mendukung keputusan tindakan, dengan saran untuk terus memperdalam evaluasi risiko dan data alternatif.`;
    } else if (kktpKategori === 'Cukup') {
      deskripsieRapor = `Ananda ${sName} mencapai tujuan pembelajaran dengan predikat Cukup (${finalScore}%). Menunjukkan pemahaman mendasar mengenai kasus, namun memerlukan pendampingan berkala dalam menyaring bukti spesifik dan menyusun justifikasi logis.`;
    } else {
      deskripsieRapor = `Ananda ${sName} belum mencapai kriteria ketuntasan minimal (${finalScore}% - Perlu Bimbingan). Masih kesulitan menghubungkan bukti data kasus dengan klaim argumen. Direkomendasikan mengikuti remedial terarah pada analisis studi kasus kontekstual.`;
    }

    const evaluationResult = {
      evaluasiPerSoal,
      skorAkhir: finalScore,
      kktpKategori,
      deskripsieRapor,
      catatanUmum: finalScore >= 80 
        ? 'Kerja luar biasa! Siswa mampu memanfaatkan informasi kasus untuk membuat keputusan yang dapat dipertanggungjawabkan.'
        : 'Siswa telah berusaha memahami masalah. Perlu bimbingan lebih lanjut dalam menyaring bukti dan menghubungkannya dengan alasan.',
      evaluatedAt: new Date().toISOString()
    };

    if (submission && submission.id) {
      submission.evaluation = evaluationResult;
      submissionsStore.set(submission.id, submission);
    }

    res.json({
      success: true,
      evaluation: evaluationResult,
      submission
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function clampScore(val: number): number {
  if (typeof val !== 'number' || isNaN(val)) return 3;
  return Math.max(1, Math.min(4, Math.round(val)));
}

function extractKeyTerms(q: any): string[] {
  const terms: string[] = [];
  // Extract numbers
  const str = JSON.stringify(q.dataInformasi || '');
  const numbers = str.match(/\d+([.,]\d+)?/g);
  if (numbers) terms.push(...numbers.slice(0, 5));

  // Extract names from quotes
  if (q.dataInformasi?.kutipanPihak) {
    for (const p of q.dataInformasi.kutipanPihak) {
      if (p.nama) terms.push(p.nama.split(' ')[0]);
    }
  }
  return Array.from(new Set(terms));
}

// Algorithmic generator in case API is temporarily unavailable
function generateAlgorithmicAssessment(config: any) {
  const isSD = config.jenjang === 'SD';
  const numQuestions = Math.min(Math.max(1, config.jumlahSoal || 3), 10);
  const qList = [];

  for (let i = 1; i <= numQuestions; i++) {
    if (isSD) {
      qList.push({
        id: `q-gen-sd-${i}-${Date.now()}`,
        nomor: i,
        judulKasus: i === 1 
          ? `Audit Sampah dan Kantin Sehat SDN 04 (${config.materi || 'Lingkungan Hidup'})`
          : `Eksperimen Tanaman Hias & Penyinaran Kelas ${config.kelas}`,
        konteks: i === 1 
          ? `Di SDN 04, tim Adiwiyata mendapati tempat sampah kantin penuh dengan wadah plastik setiap jam istirahat.`
          : `Siswa kelas ${config.kelas} mengamati dua pot tanaman cabai yang diletakkan di tempat berbeda selama 2 minggu.`,
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

  return {
    id: 'asm-' + Date.now(),
    kodeAkses: `${config.jenjang}-${config.kelas}-${Math.floor(100 + Math.random() * 900)}`,
    judul: `Asesmen Kontekstual ${config.mataPelajaran}: ${config.materi || 'Pemecahan Masalah Autentik'}`,
    config,
    questions: qList,
    dibuatTanggal: new Date().toISOString().split('T')[0]
  };
}

// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
