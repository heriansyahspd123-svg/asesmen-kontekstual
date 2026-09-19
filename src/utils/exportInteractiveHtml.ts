import { Assessment } from '../types';
import { triggerDownload, sanitizeFilename } from './exportReport';

/**
 * Generates a self-contained, offline-ready interactive HTML assessment sheet.
 * Can be opened in any mobile or desktop browser (Chrome, Safari, Edge, etc.)
 * without internet connection, without requiring any Google login, and with zero 403 errors.
 */
export function generateInteractiveHtmlAssessment(assessment: Assessment, teacherWhatsApp: string = ''): void {
  const jsonQuestions = JSON.stringify(Array.isArray(assessment.questions) ? assessment.questions : []);
  const titleEscaped = escapeHtml(assessment.judul || 'Asesmen Kontekstual');
  const mapelEscaped = escapeHtml(assessment.config?.mataPelajaran || '-');
  const kelasEscaped = escapeHtml(assessment.config?.kelas || '-');
  const materiEscaped = escapeHtml(assessment.config?.materi || '-');
  const faseEscaped = escapeHtml(assessment.config?.fase || '-');
  const durasiMenit = assessment.config?.waktuPengerjaan || 60;
  const kodeAkses = escapeHtml(assessment.kodeAkses || '');

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${titleEscaped} - Lembar Asesmen Siswa</title>
  <style>
    :root {
      --primary: #059669;
      --primary-dark: #047857;
      --primary-light: #ecfdf5;
      --primary-border: #a7f3d0;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-400: #94a3b8;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans);
      background-color: #f8fafc;
      color: var(--slate-800);
      line-height: 1.6;
      padding: 16px 12px 60px;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid var(--slate-200);
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #047857 0%, #059669 100%);
      color: #ffffff;
      padding: 24px 20px;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      margin-bottom: 8px;
    }
    .title { font-size: 20px; font-weight: 800; line-height: 1.3; margin-bottom: 6px; }
    .subtitle { font-size: 13px; opacity: 0.9; }
    .creator-tag {
      margin-top: 10px;
      font-size: 11px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.2);
      opacity: 0.95;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 8px;
      background: var(--slate-100);
      padding: 12px 20px;
      border-bottom: 1px solid var(--slate-200);
      font-size: 12px;
    }
    .meta-item strong { display: block; color: var(--slate-600); font-size: 11px; }
    .meta-item span { font-weight: 600; color: var(--slate-900); }

    .identity-card {
      padding: 20px;
      background: #fdfdfd;
      border-bottom: 1px solid var(--slate-200);
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    .input-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--slate-700);
      margin-bottom: 4px;
    }
    .input-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--slate-300);
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      background: #ffffff;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .input-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
    }

    .notice-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 12px;
      margin: 16px 20px;
      font-size: 12px;
      color: #1e40af;
      line-height: 1.5;
    }
    .notice-box strong { font-weight: 700; }

    .questions-wrapper {
      padding: 20px;
    }
    .question-card {
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }
    .question-badge {
      display: inline-block;
      background: var(--primary-light);
      color: var(--primary-dark);
      border: 1px solid var(--primary-border);
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .case-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 8px;
    }
    .context-text {
      font-size: 13px;
      color: var(--slate-700);
      background: var(--slate-50);
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid var(--primary);
      margin-bottom: 14px;
      white-space: pre-wrap;
    }
    .data-table-box {
      overflow-x: auto;
      margin: 12px 0;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid var(--slate-200); text-align: left; }
    th { background: var(--slate-100); font-weight: 700; color: var(--slate-700); }

    .chart-box {
      background: #f8fafc;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 12px;
      margin: 12px 0;
      font-size: 12px;
    }
    .chart-box-title { font-weight: 700; color: var(--slate-800); margin-bottom: 6px; }
    .chart-data-chip {
      display: inline-block;
      background: #ffffff;
      border: 1px solid var(--slate-300);
      padding: 2px 8px;
      border-radius: 4px;
      margin: 2px 4px 2px 0;
      font-family: monospace;
      font-size: 11px;
    }

    .main-question {
      font-size: 14px;
      font-weight: 700;
      color: var(--slate-900);
      margin: 14px 0 10px;
      padding: 10px 12px;
      background: #ecfdf5;
      border-radius: 8px;
      border-left: 4px solid var(--primary);
    }

    .aspect-box {
      margin-top: 14px;
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 12px;
    }
    .aspect-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--slate-800);
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .aspect-hint {
      font-size: 11px;
      color: var(--slate-400);
      font-weight: normal;
    }
    textarea.input-control {
      min-height: 80px;
      resize: vertical;
      line-height: 1.5;
    }

    .action-panel {
      padding: 20px;
      background: #ffffff;
      border-top: 2px solid var(--slate-200);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn-wa {
      background: #25D366;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
    }
    .btn-wa:hover { background: #1ebc59; }
    .btn-secondary {
      background: var(--slate-100);
      color: var(--slate-800);
      border: 1px solid var(--slate-300);
    }
    .btn-secondary:hover { background: var(--slate-200); }

    .sticky-bar {
      position: sticky;
      bottom: 0;
      background: #ffffff;
      border-top: 1px solid var(--slate-200);
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
      z-index: 10;
    }
    .save-indicator {
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    @media print {
      body { background: #ffffff; padding: 0; }
      .container { border: none; box-shadow: none; max-width: 100%; }
      .action-panel, .sticky-bar, .notice-box { display: none !important; }
      .question-card { page-break-inside: avoid; border: 1px solid #94a3b8; }
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Header -->
    <header class="header">
      <span class="badge">ASESMEN KONTEKSTUAL KURIKULUM MERDEKA</span>
      <h1 class="title">${titleEscaped}</h1>
      <p class="subtitle">Mata Pelajaran: <strong>${mapelEscaped}</strong> | Kelas: <strong>${kelasEscaped}</strong> | Kode Akses: <strong>${kodeAkses}</strong></p>
      <div class="creator-tag">
        Penyusun: <strong>Heriansyah, S.Si., S.Pd., M.Pd</strong> &bull; Media Pengerjaan HP Android &amp; Laptop Bebas Kuota Server
      </div>
    </header>

    <!-- Meta Grid -->
    <div class="meta-grid">
      <div class="meta-item">
        <strong>Fase Kurikulum</strong>
        <span>${faseEscaped}</span>
      </div>
      <div class="meta-item">
        <strong>Materi Pokok</strong>
        <span>${materiEscaped}</span>
      </div>
      <div class="meta-item">
        <strong>Durasi Waktu</strong>
        <span>${durasiMenit} Menit</span>
      </div>
      <div class="meta-item">
        <strong>Jumlah Soal</strong>
        <span>${assessment.questions.length} Kasus Berpikir Kritis</span>
      </div>
    </div>

    <!-- Petunjuk -->
    <div class="notice-box">
      <strong>Instruksi Siswa:</strong> Kerjakan seluruh soal berdasarkan bukti data dan penalaran logis kalian sendiri. Hasil jawaban otomatis tersimpan di HP/Laptop ini. Setelah selesai, klik tombol hijau <strong>"Kirim Jawaban ke WhatsApp Guru"</strong> atau cetak/simpan sebagai PDF.
    </div>

    <!-- Identitas Siswa -->
    <section class="identity-card">
      <h2 class="section-title">Identitas Peserta Didik</h2>
      <div class="form-grid">
        <div class="input-group">
          <label for="studentName">Nama Lengkap Siswa *</label>
          <input type="text" id="studentName" class="input-control" placeholder="Tuliskan nama lengkap..." required>
        </div>
        <div class="input-group">
          <label for="studentClass">Kelas / Rombel *</label>
          <input type="text" id="studentClass" class="input-control" value="${kelasEscaped}" placeholder="Contoh: 8A / 8B">
        </div>
        <div class="input-group">
          <label for="studentAbsen">No. Absen</label>
          <input type="text" id="studentAbsen" class="input-control" placeholder="Contoh: 15">
        </div>
        <div class="input-group">
          <label for="teacherPhone">Nomor WhatsApp Guru (Tujuan Pengiriman)</label>
          <input type="tel" id="teacherPhone" class="input-control" value="${escapeHtml(teacherWhatsApp)}" placeholder="Contoh: 08123456789">
        </div>
      </div>
    </section>

    <!-- Soal Pengerjaan -->
    <main class="questions-wrapper" id="questionsContainer">
      <!-- Injected via Script -->
    </main>

    <!-- Tombol Kirim / Aksi -->
    <footer class="action-panel">
      <button type="button" id="btnSubmitWa" class="btn btn-wa">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        <span>Kirim Jawaban Lengkap ke WhatsApp Guru</span>
      </button>

      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button type="button" id="btnPrint" class="btn btn-secondary" style="flex: 1; min-width: 180px;">
          🖨️ Cetak / Simpan PDF
        </button>
        <button type="button" id="btnExportTxt" class="btn btn-secondary" style="flex: 1; min-width: 180px;">
          📄 Download Arsip Jawaban (.txt)
        </button>
      </div>
    </footer>

    <!-- Sticky Bottom Bar -->
    <div class="sticky-bar">
      <span class="save-indicator">
        <span>●</span> <span id="saveStatus">Tersimpan otomatis</span>
      </span>
      <span id="answeredCounter" style="color: var(--slate-600);">0 / ${assessment.questions.length} dijawab</span>
    </div>
  </div>

  <script>
    const questions = ${jsonQuestions};
    const assessmentCode = "${kodeAkses}";
    const storageKey = 'asesmen_student_draft_' + assessmentCode;

    const container = document.getElementById('questionsContainer');
    const studentNameInput = document.getElementById('studentName');
    const studentClassInput = document.getElementById('studentClass');
    const studentAbsenInput = document.getElementById('studentAbsen');
    const teacherPhoneInput = document.getElementById('teacherPhone');
    const saveStatus = document.getElementById('saveStatus');
    const answeredCounter = document.getElementById('answeredCounter');

    // Render questions
    function renderQuestions() {
      let html = '';
      questions.forEach((q, idx) => {
        const num = idx + 1;
        html += \`
          <article class="question-card" id="q-card-\${q.id}">
            <span class="question-badge">KASUS \${num} DARI \${questions.length}</span>
            <h3 class="case-title">\${escapeXml(q.judulKasus || 'Kasus Kontekstual')}</h3>
            
            <div class="context-text">\${escapeXml(q.konteks || '')}</div>
        \`;

        // Data / Tabel
        if (q.dataInformasi) {
          if (q.dataInformasi.konten) {
            html += \`<p style="font-size: 12px; color: var(--slate-600); margin-bottom: 8px;"><strong>Data Informasi:</strong> \${escapeXml(q.dataInformasi.konten)}</p>\`;
          }

          if (q.dataInformasi.tabelData && q.dataInformasi.tabelData.headers) {
            html += \`<div class="data-table-box"><table><thead><tr>\`;
            q.dataInformasi.tabelData.headers.forEach(h => {
              html += \`<th>\${escapeXml(h)}</th>\`;
            });
            html += \`</tr></thead><tbody>\`;
            (q.dataInformasi.tabelData.baris || []).forEach(row => {
              html += \`<tr>\`;
              row.forEach(cell => {
                html += \`<td>\${escapeXml(cell)}</td>\`;
              });
              html += \`</tr>\`;
            });
            html += \`</tbody></table></div>\`;
          }

          if (q.dataInformasi.visualisasiGrafik) {
            const g = q.dataInformasi.visualisasiGrafik;
            html += \`
              <div class="chart-box">
                <div class="chart-box-title">📊 Visualisasi Data: \${escapeXml(g.judulGrafik || 'Grafik')} (\${(g.tipeGrafik || 'bar').toUpperCase()})</div>
                <div>
            \`;
            if (g.labels && g.datasets && g.datasets[0]) {
              g.labels.forEach((lbl, lIdx) => {
                const val = g.datasets[0].nilai[lIdx] !== undefined ? g.datasets[0].nilai[lIdx] : '-';
                html += \`<span class="chart-data-chip"><strong>\${escapeXml(lbl)}:</strong> \${val}</span>\`;
              });
            }
            html += \`</div></div>\`;
          }
        }

        // Pertanyaan Utama
        html += \`
          <div class="main-question">
            <strong>Pertanyaan Inti:</strong> \${escapeXml(q.pertanyaanUtama || '')}
          </div>
        \`;

        // Input 4 Dimensi Berpikir Kritis
        html += \`
          <div class="aspect-box">
            <div class="aspect-label">
              <span>1. Jawaban &amp; Solusi Saya</span>
              <span class="aspect-hint">Jelaskan keputusan atau solusi Anda</span>
            </div>
            <textarea class="input-control ans-field" data-qid="\${q.id}" data-field="jawaban" placeholder="Tuliskan argumen atau keputusan solusi Anda di sini..."></textarea>
          </div>

          <div class="aspect-box">
            <div class="aspect-label">
              <span>2. Bukti Data yang Digunakan</span>
              <span class="aspect-hint">Kutip angka/fakta dari bacaan di atas</span>
            </div>
            <textarea class="input-control ans-field" data-qid="\${q.id}" data-field="bukti" placeholder="Kutip data angka, kalimat, atau tabel yang mendukung keputusan Anda..."></textarea>
          </div>

          <div class="aspect-box">
            <div class="aspect-label">
              <span>3. Alasan &amp; Logika Penalaran</span>
              <span class="aspect-hint">Mengapa bukti tersebut mendukung solusi Anda?</span>
            </div>
            <textarea class="input-control ans-field" data-qid="\${q.id}" data-field="alasan" placeholder="Jelaskan alur penalaran Anda secara logis..."></textarea>
          </div>

          <div class="aspect-box">
            <div class="aspect-label">
              <span>4. Refleksi &amp; Sudut Pandang Lain</span>
              <span class="aspect-hint">Kelemahan atau konsekuensi alternatif</span>
            </div>
            <textarea class="input-control ans-field" data-qid="\${q.id}" data-field="refleksi" placeholder="Tuliskan jika ada sudut pandang lain atau dampak yang perlu diantisipasi..."></textarea>
          </div>
        \`;

        html += \`</article>\`;
      });

      container.innerHTML = html;
      attachEvents();
      loadDraft();
    }

    function escapeXml(unsafe) {
      if (!unsafe) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function attachEvents() {
      const inputs = document.querySelectorAll('.input-control');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          saveDraft();
          updateCounter();
        });
      });

      document.getElementById('btnSubmitWa').addEventListener('click', submitViaWhatsApp);
      document.getElementById('btnPrint').addEventListener('click', () => window.print());
      document.getElementById('btnExportTxt').addEventListener('click', exportTxtFile);
    }

    function saveDraft() {
      const draft = {
        name: studentNameInput.value,
        studentClass: studentClassInput.value,
        absen: studentAbsenInput.value,
        teacherPhone: teacherPhoneInput.value,
        answers: {},
        updatedAt: new Date().toISOString()
      };

      document.querySelectorAll('.ans-field').forEach(el => {
        const qid = el.getAttribute('data-qid');
        const field = el.getAttribute('data-field');
        if (!draft.answers[qid]) draft.answers[qid] = {};
        draft.answers[qid][field] = el.value;
      });

      try {
        localStorage.setItem(storageKey, JSON.stringify(draft));
        saveStatus.textContent = 'Tersimpan otomatis';
        saveStatus.parentElement.style.color = '#059669';
      } catch (e) {
        saveStatus.textContent = 'Gagal menyimpan lokal';
      }
    }

    function loadDraft() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const draft = JSON.parse(raw);
        if (draft.name) studentNameInput.value = draft.name;
        if (draft.studentClass) studentClassInput.value = draft.studentClass;
        if (draft.absen) studentAbsenInput.value = draft.absen;
        if (draft.teacherPhone) teacherPhoneInput.value = draft.teacherPhone;

        if (draft.answers) {
          document.querySelectorAll('.ans-field').forEach(el => {
            const qid = el.getAttribute('data-qid');
            const field = el.getAttribute('data-field');
            if (draft.answers[qid] && draft.answers[qid][field]) {
              el.value = draft.answers[qid][field];
            }
          });
        }
        updateCounter();
      } catch (e) {
        console.warn('Error loading draft', e);
      }
    }

    function updateCounter() {
      let answeredCount = 0;
      questions.forEach(q => {
        const fields = document.querySelectorAll(\`.ans-field[data-qid="\${q.id}"]\`);
        let hasAny = false;
        fields.forEach(f => {
          if (f.value.trim().length > 0) hasAny = true;
        });
        if (hasAny) answeredCount++;
      });
      answeredCounter.textContent = \`\${answeredCount} / \${questions.length} kasus dijawab\`;
    }

    function generateFormattedResultText() {
      const name = studentNameInput.value.trim() || 'Tanpa Nama';
      const kls = studentClassInput.value.trim() || '-';
      const absen = studentAbsenInput.value.trim() || '-';

      let text = \`*LEMBAR JAWABAN ASESMEN BERPIKIR KRITIS*\\n\`;
      text += \`*Asesmen:* ${titleEscaped}\\n\`;
      text += \`*Mata Pelajaran:* ${mapelEscaped} (Kelas ${kelasEscaped})\\n\`;
      text += \`*Penyusun:* Heriansyah, S.Si., S.Pd., M.Pd\\n\`;
      text += \`-----------------------------------------\\n\`;
      text += \`*Nama Siswa:* \${name}\\n\`;
      text += \`*Kelas:* \${kls} | *No. Absen:* \${absen}\\n\`;
      text += \`*Kode Asesmen:* ${kodeAkses}\\n\`;
      text += \`-----------------------------------------\\n\\n\`;

      questions.forEach((q, idx) => {
        const num = idx + 1;
        const jwb = (document.querySelector(\`.ans-field[data-qid="\${q.id}"][data-field="jawaban"]\`) || {}).value || '';
        const bkt = (document.querySelector(\`.ans-field[data-qid="\${q.id}"][data-field="bukti"]\`) || {}).value || '';
        const als = (document.querySelector(\`.ans-field[data-qid="\${q.id}"][data-field="alasan"]\`) || {}).value || '';
        const rfl = (document.querySelector(\`.ans-field[data-qid="\${q.id}"][data-field="refleksi"]\`) || {}).value || '';

        text += \`*SOAL \${num}: \${q.judulKasus || 'Kasus'}*\\n\`;
        text += \`*1. Jawaban & Solusi:*\\n\${jwb.trim() || '(belum diisi)'}\\n\\n\`;
        text += \`*2. Bukti Data Digunakan:*\\n\${bkt.trim() || '(belum diisi)'}\\n\\n\`;
        text += \`*3. Alasan & Penalaran:*\\n\${als.trim() || '(belum diisi)'}\\n\\n\`;
        text += \`*4. Refleksi & Sudut Pandang:*\\n\${rfl.trim() || '(belum diisi)'}\\n\`;
        text += \`=========================================\\n\\n\`;
      });

      return text;
    }

    function submitViaWhatsApp() {
      const name = studentNameInput.value.trim();
      if (!name) {
        alert('Mohon tuliskan Nama Lengkap Siswa terlebih dahulu.');
        studentNameInput.focus();
        return;
      }

      let phone = teacherPhoneInput.value.trim().replace(/[^0-9]/g, '');
      if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
      }

      const formattedText = generateFormattedResultText();
      const encoded = encodeURIComponent(formattedText);

      let waUrl = '';
      if (phone) {
        waUrl = \`https://api.whatsapp.com/send?phone=\${phone}&text=\${encoded}\`;
      } else {
        waUrl = \`https://api.whatsapp.com/send?text=\${encoded}\`;
      }

      window.open(waUrl, '_blank');
    }

    function exportTxtFile() {
      const name = studentNameInput.value.trim() || 'Siswa';
      const text = generateFormattedResultText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`Jawaban_\${name.replace(/\\s+/g, '_')}_${kodeAkses}.txt\`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Initialize
    renderQuestions();
  </script>
</body>
</html>`;

  const filename = `Asesmen_Interaktif_${sanitizeFilename(assessment.config.mataPelajaran)}_${assessment.kodeAkses}.html`;
  triggerDownload(new Blob([htmlContent], { type: 'text/html;charset=utf-8' }), filename, 'text/html');
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
