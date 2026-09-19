import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Assessment, StudentSubmission, KKTPKategori, StudentAnswer, EvaluationItem } from '../types';
import { determineKKTPKategori, generateERaporNarrative } from '../data/kurikulumMerdekaData';

/**
 * Triggers browser download of a generated blob or text file.
 */
export function triggerDownload(content: Blob | string, filename: string, mimeType: string = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Clean string for safe file name
 */
export function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
}

/**
 * Generates an official Microsoft Word (.doc) document for Student Evaluation Report.
 * Uses Microsoft Office HTML format (supported natively by Word, LibreOffice, Google Docs).
 */
export function generateEvaluationReportWord(
  submission: StudentSubmission,
  assessment?: Assessment | null
): void {
  const studentName = submission.studentName || 'Peserta Didik';
  const studentClass = submission.studentClass || '-';
  const assessmentTitle = submission.assessmentTitle || assessment?.judul || 'Asesmen Kontekstual';
  const evalData = submission.evaluation;
  const finalScore = evalData ? evalData.skorAkhir : 80;
  const kktpKategori: KKTPKategori = evalData?.kktpKategori || determineKKTPKategori(finalScore);
  const narrative = evalData?.deskripsieRapor || generateERaporNarrative(
    studentName,
    assessment?.config.tujuanPembelajaran || 'asesmen kontekstual',
    finalScore,
    kktpKategori
  );

  const formattedDate = new Date(submission.timestamp || Date.now()).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mataPelajaran = assessment?.config.mataPelajaran || 'Mata Pelajaran';
  const fase = assessment?.config.fase || 'Fase C / D';
  const jenjang = assessment?.config.jenjang || 'SD / SMP';

  // Questions breakdown table rows
  let questionsHtml = '';
  if (assessment && assessment.questions) {
    questionsHtml = assessment.questions.map((q, idx) => {
      const ans = submission.answers?.[q.id] as StudentAnswer | undefined;
      const qEval = evalData?.evaluasiPerSoal?.[q.id] as EvaluationItem | undefined;
      const score = qEval ? qEval.persentase : 80;

      const integrityWarning = qEval?.integrityWarning?.isSuspicious || ans?.copyPasteDetected;

      return `
        <div style="margin-top: 16pt; margin-bottom: 16pt; page-break-inside: avoid; border: 1pt solid #cbd5e1; border-radius: 6pt; padding: 10pt; background-color: #ffffff;">
          <div style="border-bottom: 1pt solid #e2e8f0; padding-bottom: 6pt; margin-bottom: 8pt;">
            <table style="width: 100%; border: none;">
              <tr>
                <td style="border: none; padding: 0;">
                  <strong style="color: #0f766e; font-size: 11pt;">SOAL KASUS #${idx + 1}: ${q.judulKasus}</strong>
                </td>
                <td style="border: none; padding: 0; text-align: right;">
                  <span style="background-color: #0f172a; color: #ffffff; padding: 3pt 8pt; border-radius: 4pt; font-weight: bold; font-size: 10pt;">
                    Skor: ${score}/100
                  </span>
                </td>
              </tr>
            </table>
          </div>

          ${integrityWarning ? `
            <div style="background-color: #fff1f2; border: 1pt solid #fecdd3; padding: 6pt 10pt; border-radius: 4pt; margin-bottom: 8pt; color: #9f1239; font-size: 9.5pt;">
              <strong>⚠️ Catatan Integritas Guru:</strong> Terindikasi penempelan teks/kemiripan eksternal. Perlu verifikasi pemahaman lisan.
            </div>
          ` : ''}

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8pt; font-size: 10pt;">
            <tr>
              <td style="width: 25%; font-weight: bold; background-color: #f8fafc; border: 1pt solid #cbd5e1; padding: 5pt 8pt;">1. Jawaban / Solusi Siswa:</td>
              <td style="border: 1pt solid #cbd5e1; padding: 5pt 8pt;">${ans?.jawabanSaya || '(Tidak diisi)'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc; border: 1pt solid #cbd5e1; padding: 5pt 8pt;">2. Bukti Kasus yang Dipakai:</td>
              <td style="border: 1pt solid #cbd5e1; padding: 5pt 8pt; color: #065f46;"><strong>${ans?.buktiDigunakan || '(Tidak menyertakan bukti data spesifik)'}</strong></td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc; border: 1pt solid #cbd5e1; padding: 5pt 8pt;">3. Alasan & Penalaran:</td>
              <td style="border: 1pt solid #cbd5e1; padding: 5pt 8pt;">${ans?.alasanSaya || '(Tidak menyertakan alasan)'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc; border: 1pt solid #cbd5e1; padding: 5pt 8pt;">4. Refleksi Keterbatasan:</td>
              <td style="border: 1pt solid #cbd5e1; padding: 5pt 8pt;">${ans?.refleksiSaya || '(Tidak mengisi refleksi)'}</td>
            </tr>
          </table>

          <div style="background-color: #f1f5f9; padding: 6pt 8pt; border-radius: 4pt; font-size: 9pt; margin-bottom: 6pt;">
            <strong>Pencapaian 5 Aspek Rubrik (Skala 1-4):</strong><br/>
            • Pemahaman Masalah: <b>${qEval?.aspekSkor?.pemahamanMasalah ?? 3}/4</b> &nbsp;|&nbsp;
            • Penggunaan Bukti: <b>${qEval?.aspekSkor?.penggunaanBukti ?? 3}/4</b> &nbsp;|&nbsp;
            • Penalaran Logis: <b>${qEval?.aspekSkor?.penalaran ?? 3}/4</b> &nbsp;|&nbsp;
            • Keputusan Solusi: <b>${qEval?.aspekSkor?.keputusanSolusi ?? 3}/4</b> &nbsp;|&nbsp;
            • Refleksi Kritis: <b>${qEval?.aspekSkor?.refleksi ?? 3}/4</b>
          </div>

          ${qEval?.rekomendasi ? `
            <div style="font-size: 9.5pt; color: #334155; margin-top: 4pt;">
              <strong>Rekomendasi Tindak Lanjut Guru:</strong> ${qEval.rekomendasi}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Rapor Evaluasi Siswa - ${studentName}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 21.0cm 29.7cm; /* A4 */
          margin: 2.0cm 2.0cm 2.0cm 2.0cm;
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          color: #0f172a;
          line-height: 1.4;
          font-size: 11pt;
        }
        .header-title {
          text-align: center;
          font-weight: bold;
          font-size: 15pt;
          text-transform: uppercase;
          color: #0f172a;
          margin-bottom: 2pt;
        }
        .header-sub {
          text-align: center;
          font-size: 10pt;
          font-weight: bold;
          color: #0f766e;
          text-transform: uppercase;
          margin-bottom: 12pt;
        }
        hr.divider {
          border: none;
          border-top: 2pt solid #0f172a;
          margin-bottom: 14pt;
        }
        table.meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14pt;
        }
        table.meta-table td {
          padding: 4pt 6pt;
          font-size: 10.5pt;
          border: none;
        }
        .score-box {
          border: 1.5pt solid #0f766e;
          background-color: #f0fdf4;
          padding: 10pt 14pt;
          border-radius: 6pt;
          margin-bottom: 14pt;
        }
        .signature-table {
          width: 100%;
          margin-top: 30pt;
          border: none;
          page-break-inside: avoid;
        }
        .signature-table td {
          border: none;
          text-align: center;
          vertical-align: top;
          padding: 10pt;
          font-size: 10.5pt;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- Header Rapor Resmi -->
        <div class="header-title">RAPOR EVALUASI ASESMEN KONTEKSTUAL & PENALARAN KRITIS</div>
        <div class="header-sub">KURIKULUM MERDEKA • ${jenjang} • ${fase}</div>
        <hr class="divider"/>

        <!-- Biodata Asesmen & Siswa -->
        <table class="meta-table">
          <tr>
            <td style="width: 20%;"><strong>Nama Siswa</strong></td>
            <td style="width: 30%;">: <b>${studentName}</b></td>
            <td style="width: 20%;"><strong>Mata Pelajaran</strong></td>
            <td style="width: 30%;">: ${mataPelajaran}</td>
          </tr>
          <tr>
            <td><strong>Kelas / Fase</strong></td>
            <td>: ${studentClass} (${fase})</td>
            <td><strong>Tanggal Ujian</strong></td>
            <td>: ${formattedDate}</td>
          </tr>
          <tr>
            <td><strong>Judul Asesmen</strong></td>
            <td colspan="3">: <b>${assessmentTitle}</b></td>
          </tr>
          ${assessment?.config.tujuanPembelajaran ? `
          <tr>
            <td><strong>Tujuan Pembelajaran</strong></td>
            <td colspan="3">: ${assessment.config.tujuanPembelajaran}</td>
          </tr>
          ` : ''}
        </table>

        <!-- Ringkasan Hasil & KKTP -->
        <div class="score-box">
          <table style="width: 100%; border: none;">
            <tr>
              <td style="border: none; width: 60%; vertical-align: middle;">
                <span style="font-size: 11pt; color: #166534; font-weight: bold; text-transform: uppercase;">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP):</span><br/>
                <span style="font-size: 16pt; font-weight: bold; color: #0f172a;">${kktpKategori}</span>
                <span style="font-size: 10pt; color: #475569; margin-left: 8pt;">(${kktpKategori === 'Perlu Bimbingan' ? 'Belum Mencapai KKTP - Remedial' : 'Mencapai Ketuntasan KKTP'})</span>
              </td>
              <td style="border: none; width: 40%; text-align: right; vertical-align: middle;">
                <span style="font-size: 10pt; color: #475569; font-weight: bold;">SKOR AKHIR:</span><br/>
                <span style="font-size: 26pt; font-weight: bold; color: #047857; font-family: monospace;">${finalScore}</span>
                <span style="font-size: 14pt; color: #64748b;">/100</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Deskripsi Capaian e-Rapor -->
        <div style="border: 1pt solid #cbd5e1; background-color: #f8fafc; padding: 10pt 12pt; border-radius: 6pt; margin-bottom: 14pt;">
          <strong style="color: #0f766e; font-size: 10.5pt; text-transform: uppercase;">Deskripsi Capaian Kompetensi (e-Rapor Kurikulum Merdeka):</strong>
          <p style="margin-top: 6pt; margin-bottom: 4pt; font-style: italic; line-height: 1.5; font-size: 10.5pt; color: #1e293b;">
            "${narrative}"
          </p>
        </div>

        ${evalData?.catatanUmum ? `
        <div style="border: 1pt solid #e2e8f0; padding: 8pt 10pt; border-radius: 6pt; margin-bottom: 14pt; font-size: 10pt; background-color: #ffffff;">
          <strong>Catatan Evaluasi Guru:</strong><br/>
          ${evalData.catatanUmum}
        </div>
        ` : ''}

        <!-- Detail Per Soal Kasus -->
        <h3 style="font-size: 12pt; font-weight: bold; border-bottom: 1pt solid #0f172a; padding-bottom: 4pt; margin-top: 18pt; margin-bottom: 10pt;">
          RINCIAN EVALUASI PER SOAL KASUS & BUKTI PENALARAN
        </h3>

        ${questionsHtml}

        <!-- Tanda Tangan Pengesahan -->
        <table class="signature-table">
          <tr>
            <td style="width: 50%;">
              Mengetahui,<br/>
              <strong>Orang Tua / Wali Siswa</strong>
              <div style="height: 55pt;"></div>
              ( .................................................... )
            </td>
            <td style="width: 50%;">
              ......................, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
              <strong>Guru Mata Pelajaran</strong>
              <div style="height: 55pt;"></div>
              ( <b>${(assessment?.config as any)?.namaGuru || 'Guru Pengampu'}</b> )<br/>
              <span style="font-size: 9pt; color: #64748b;">NIP. ........................................</span>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const fileName = `Rapor_Evaluasi_${sanitizeFilename(studentName)}_${sanitizeFilename(assessmentTitle)}.doc`;
  triggerDownload(wordHtml, fileName, 'application/msword;charset=utf-8');
}

/**
 * Dedicated, highly reliable vector PDF generator for Assessment Question Sheets.
 * Uses jsPDF directly - 100% immune to CSS oklch errors, iframe sandbox blocks, or canvas limits.
 */
export async function generateAssessmentPdf(
  assessment: Assessment,
  customFilename?: string,
  onProgress?: (status: string) => void
): Promise<void> {
  if (onProgress) onProgress('Menyusun lembar soal PDF...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - 18) {
      pdf.addPage();
      y = margin;
      renderRunningHeader();
    }
  };

  const renderRunningHeader = () => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${assessment.judul || 'Lembar Asesmen'} • Kode: ${assessment.kodeAkses}`, margin, y);
    pdf.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 7;
  };

  // --- KOP LEMBAGA ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text('LEMBAR ASESMEN KONTEKSTUAL & PENALARAN KRITIS', pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  pdf.setFontSize(9);
  pdf.setTextColor(5, 150, 105); // emerald-600
  const subHeader = `KURIKULUM MERDEKA • ${assessment.config.jenjang || 'SD/SMP'} • ${assessment.config.fase || 'FASE C/D'}`;
  pdf.text(subHeader, pageWidth / 2, y, { align: 'center' });
  y += 5;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  const splitTitle = pdf.splitTextToSize(assessment.judul || 'Asesmen Kontekstual', contentWidth);
  pdf.text(splitTitle, pageWidth / 2, y, { align: 'center' });
  y += (splitTitle.length * 5) + 1;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  const metaLine = `Mata Pelajaran: ${assessment.config.mataPelajaran || '-'} | Kelas: ${assessment.config.kelas || '-'} | Waktu: ${assessment.config.waktuPengerjaan || 60} Menit`;
  pdf.text(metaLine, pageWidth / 2, y, { align: 'center' });
  y += 4;

  if (assessment.config.elemenCP) {
    const cpText = pdf.splitTextToSize(`Elemen CP: ${assessment.config.elemenCP}`, contentWidth);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(cpText, pageWidth / 2, y, { align: 'center' });
    y += (cpText.length * 3.5) + 2;
  }

  // Double divider line
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.6);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 1.2;
  pdf.setLineWidth(0.2);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 5;

  // --- IDENTITAS SISWA ---
  checkPageBreak(25);
  pdf.setDrawColor(148, 163, 184); // slate-400
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42);

  const colWidth = contentWidth / 2;
  pdf.text('Nama Siswa  : ................................................................', margin + 4, y + 6);
  pdf.text('Kelas / Rombel: ................................................................', margin + 4, y + 14);

  pdf.text('No. Absen : ............................................', margin + colWidth + 4, y + 6);
  pdf.text(`Kode Akses: ${assessment.kodeAkses}`, margin + colWidth + 4, y + 14);
  y += 24;

  // --- PETUNJUK PENGERJAAN ---
  checkPageBreak(18);
  pdf.setFillColor(236, 253, 245); // emerald-50
  pdf.setDrawColor(167, 243, 208); // emerald-200
  pdf.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(6, 95, 70); // emerald-800
  pdf.text('PETUNJUK PENGERJAAN (OPEN BOOK & BUKTI DATA):', margin + 3, y + 4.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(51, 65, 85);
  pdf.text('1. Anda diperbolehkan membaca catatan, buku teks, atau data informasi yang tersedia.', margin + 3, y + 8.5);
  pdf.text('2. Nilai ditentukan dari kemampuan menganalisis data, memberikan bukti numerik/fakta nyata, dan penalaran logis.', margin + 3, y + 12.5);
  y += 20;

  // --- QUESTIONS ITERATION ---
  for (let idx = 0; idx < assessment.questions.length; idx++) {
    const q = assessment.questions[idx];
    checkPageBreak(40);

    // Kasus Header Bar
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.setDrawColor(203, 213, 225); // slate-300
    pdf.roundedRect(margin, y, contentWidth, 8, 1, 1, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`SOAL KASUS #${idx + 1}: ${q.judulKasus || 'Kasus Kontekstual'}`, margin + 3, y + 5.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`[${q.bentukSoal || 'Studi Kasus'}]`, pageWidth - margin - 3, y + 5.5, { align: 'right' });
    y += 11;

    // Konteks Masalah
    if (q.konteks) {
      checkPageBreak(25);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Konteks Masalah:', margin, y);
      y += 4;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      const splitKonteks = pdf.splitTextToSize(q.konteks, contentWidth);
      pdf.text(splitKonteks, margin, y);
      y += (splitKonteks.length * 3.8) + 3;
    }

    // Data & Informasi
    if (q.dataInformasi?.konten) {
      checkPageBreak(20);
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      
      const splitData = pdf.splitTextToSize(q.dataInformasi.konten, contentWidth - 6);
      const boxHeight = (splitData.length * 3.6) + 7;
      
      checkPageBreak(boxHeight + 2);
      pdf.roundedRect(margin, y, contentWidth, boxHeight, 1, 1, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Data / Informasi Pengamatan:', margin + 3, y + 4.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(splitData, margin + 3, y + 8.5);
      y += boxHeight + 4;
    }

    // Tabel Data (if exists)
    if (q.dataInformasi?.tabelData && q.dataInformasi.tabelData.headers?.length) {
      const headers = q.dataInformasi.tabelData.headers;
      const rows = q.dataInformasi.tabelData.baris || [];
      const numCols = headers.length;
      const tableColWidth = contentWidth / numCols;
      
      checkPageBreak(12 + (rows.length * 6));
      
      // Header Row
      pdf.setFillColor(226, 232, 240);
      pdf.setDrawColor(148, 163, 184);
      pdf.rect(margin, y, contentWidth, 6, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      headers.forEach((h, hIdx) => {
        pdf.text(String(h), margin + (hIdx * tableColWidth) + 2, y + 4.2);
      });
      y += 6;

      // Data Rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      rows.forEach((row, rIdx) => {
        const rowBg = rIdx % 2 === 0 ? 255 : 248;
        pdf.setFillColor(rowBg, rowBg, rowBg);
        pdf.rect(margin, y, contentWidth, 5.5, 'FD');
        row.forEach((cell, cIdx) => {
          pdf.text(String(cell), margin + (cIdx * tableColWidth) + 2, y + 3.8);
        });
        y += 5.5;
      });
      y += 4;
    }

    // Grafik Summary (if exists)
    if (q.dataInformasi?.visualisasiGrafik) {
      const g = q.dataInformasi.visualisasiGrafik;
      checkPageBreak(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`Ringkasan Data Grafik: ${g.judulGrafik || 'Grafik'} (${g.tipeGrafik || 'bar'})`, margin, y);
      y += 4;

      if (g.labels?.length && g.datasets?.length) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(71, 85, 105);
        const dataStr = g.labels.map((lbl, lIdx) => {
          const vals = g.datasets.map(ds => `${ds.nama || 'Data'}: ${ds.nilai[lIdx] ?? '-'}`).join(', ');
          return `${lbl} (${vals})`;
        }).join(' | ');
        const splitGraph = pdf.splitTextToSize(dataStr, contentWidth);
        pdf.text(splitGraph, margin, y);
        y += (splitGraph.length * 3.5) + 3;
      }
    }

    // Pertanyaan Utama & 4 Lembar Isian Siswa
    checkPageBreak(30);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(4, 120, 87); // emerald-700
    pdf.text('A. Pertanyaan Inti & Keputusan:', margin, y);
    y += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    const splitMainQ = pdf.splitTextToSize(q.pertanyaanUtama || 'Berikan analisis Anda...', contentWidth);
    pdf.text(splitMainQ, margin, y);
    y += (splitMainQ.length * 3.8) + 2;

    // Jawaban Box
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, y, contentWidth, 14, 1, 1, 'FD');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('[Tuliskan keputusan atau solusi Anda di sini]', margin + 3, y + 4.5);
    y += 18;

    // Bukti Data Box
    checkPageBreak(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text('B. Bukti Data Spesifik (Kutip angka/fakta dari bacaan):', margin, y);
    y += 3.5;
    pdf.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('[Tuliskan kutipan bukti data/fakta pendukung di sini]', margin + 3, y + 4.5);
    y += 16;

    // Alasan Penalaran Box
    checkPageBreak(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text('C. Alasan Logis (Mengapa bukti tersebut mendukung keputusan Anda?):', margin, y);
    y += 3.5;
    pdf.roundedRect(margin, y, contentWidth, 14, 1, 1, 'FD');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('[Tuliskan alur penalaran Anda secara logis di sini]', margin + 3, y + 4.5);
    y += 18;

    // Refleksi Box
    checkPageBreak(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text('D. Refleksi & Sudut Pandang Lain:', margin, y);
    y += 3.5;
    pdf.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('[Tuliskan kelemahan solusi atau pertimbangan alternatif di sini]', margin + 3, y + 4.5);
    y += 18;
  }

  // --- FOOTER TANDA TANGAN ---
  checkPageBreak(25);
  pdf.setDrawColor(148, 163, 184);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Kode Verifikasi: ${assessment.kodeAkses}`, margin, y);
  pdf.text('Mengetahui Guru Pengampu,', pageWidth - margin - 50, y);
  y += 14;
  pdf.text('( ........................................................... )', pageWidth - margin - 50, y);

  // --- ADD PAGE NUMBERS ---
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  const fileName = customFilename || `Lembar_Soal_${sanitizeFilename(assessment.judul || 'Asesmen')}.pdf`;
  pdf.save(fileName);
}

/**
 * Dedicated, highly reliable vector PDF generator for Student Evaluation Reports.
 */
export async function generateEvaluationReportPdf(
  submission: StudentSubmission,
  assessment?: Assessment | null,
  customFilename?: string,
  onProgress?: (status: string) => void
): Promise<void> {
  if (onProgress) onProgress('Menyusun rapor evaluasi PDF...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - 18) {
      pdf.addPage();
      y = margin;
      renderRunningHeader();
    }
  };

  const renderRunningHeader = () => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Rapor Hasil Evaluasi: ${submission.studentName} • ${assessment?.judul || 'Asesmen'}`, margin, y);
    pdf.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 7;
  };

  const studentName = submission.studentName || 'Peserta Didik';
  const studentClass = submission.studentClass || '-';
  const assessmentTitle = submission.assessmentTitle || assessment?.judul || 'Asesmen Kontekstual';
  const evalData = submission.evaluation;
  const finalScore = evalData ? evalData.skorAkhir : 80;
  const kktpKategori: KKTPKategori = evalData?.kktpKategori || determineKKTPKategori(finalScore);

  // --- HEADER / KOP ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text('RAPOR HASIL EVALUASI ASESMEN PENALARAN KRITIS', pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  pdf.setFontSize(9);
  pdf.setTextColor(5, 150, 105);
  pdf.text('KURIKULUM MERDEKA • SISTEM PENILAIAN RUBRIK 4 TINGKAT KEMAMPUAN', pageWidth / 2, y, { align: 'center' });
  y += 5;

  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.6);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 1.2;
  pdf.setLineWidth(0.2);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 6;

  // --- IDENTITAS & SCORE BADGE ---
  checkPageBreak(32);
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  // Left col: student info
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Nama Siswa', margin + 4, y + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`: ${studentName}`, margin + 28, y + 6);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Kelas / Rombel', margin + 4, y + 12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`: ${studentClass}`, margin + 28, y + 12);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Mata Pelajaran', margin + 4, y + 18);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`: ${assessment?.config.mataPelajaran || '-'} (${assessment?.config.kelas || '-'})`, margin + 28, y + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Judul Asesmen', margin + 4, y + 24);
  pdf.setFont('helvetica', 'normal');
  const splitAsmTitle = pdf.splitTextToSize(`: ${assessmentTitle}`, contentWidth - 75);
  pdf.text(splitAsmTitle[0] || '', margin + 28, y + 24);

  // Right col: Final Score Pill
  const scoreBoxWidth = 45;
  const scoreBoxX = pageWidth - margin - scoreBoxWidth - 3;
  pdf.setFillColor(236, 253, 245);
  pdf.setDrawColor(167, 243, 208);
  pdf.roundedRect(scoreBoxX, y + 3, scoreBoxWidth, 20, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(5, 150, 105);
  pdf.text('NILAI AKHIR', scoreBoxX + (scoreBoxWidth / 2), y + 7, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setTextColor(4, 120, 87);
  pdf.text(String(finalScore), scoreBoxX + (scoreBoxWidth / 2), y + 15, { align: 'center' });

  pdf.setFontSize(7);
  pdf.setTextColor(30, 41, 59);
  pdf.text(kktpKategori, scoreBoxX + (scoreBoxWidth / 2), y + 20, { align: 'center' });
  y += 31;

  // --- BREAKDOWN 4 DIMENSI BERPIKIR KRITIS ---
  checkPageBreak(38);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('1. Capaian 4 Dimensi Berpikir Kritis Siswa', margin, y);
  y += 4.5;

  const dimHeaders = ['Dimensi Penalaran', 'Skor', 'Kategori Capaian'];
  const dimWidths = [90, 30, 60];
  
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.rect(margin, y, contentWidth, 6, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42);
  let curX = margin;
  dimHeaders.forEach((dh, dIdx) => {
    pdf.text(dh, curX + 2, y + 4.2);
    curX += dimWidths[dIdx];
  });
  y += 6;

  const evalItems = evalData?.evaluasiPerSoal ? Object.values(evalData.evaluasiPerSoal) : [];
  const avgAspect = (key: keyof EvaluationItem['aspekSkor']) => {
    if (!evalItems.length) return finalScore;
    const sum = evalItems.reduce((acc, it) => {
      const raw = it.aspekSkor?.[key] ?? 3;
      return acc + Math.round((raw / 4) * 100);
    }, 0);
    return Math.round(sum / evalItems.length);
  };

  const dimensions = [
    { name: 'Kualitas Keputusan & Solusi', score: avgAspect('keputusanSolusi') },
    { name: 'Penggunaan Bukti Data Nyata', score: avgAspect('penggunaanBukti') },
    { name: 'Penalaran & Logika Sebab-Akibat', score: avgAspect('penalaran') },
    { name: 'Refleksi Diri & Sudut Pandang Lain', score: avgAspect('refleksi') }
  ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  dimensions.forEach((dim, rIdx) => {
    const bg = rIdx % 2 === 0 ? 255 : 248;
    pdf.setFillColor(bg, bg, bg);
    pdf.rect(margin, y, contentWidth, 6, 'FD');

    const cat = determineKKTPKategori(dim.score);
    pdf.text(dim.name, margin + 2, y + 4.2);
    pdf.text(`${dim.score} / 100`, margin + dimWidths[0] + 2, y + 4.2);
    pdf.text(cat, margin + dimWidths[0] + dimWidths[1] + 2, y + 4.2);
    y += 6;
  });
  y += 6;

  // --- CATATAN NARATIF E-RAPOR ---
  checkPageBreak(25);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('2. Deskripsi Capaian Kompetensi (e-Rapor Kemendikbudristek)', margin, y);
  y += 4.5;

  const narrativeText = evalData?.deskripsieRapor || generateERaporNarrative(
    studentName,
    assessment?.config.tujuanPembelajaran || 'asesmen kontekstual',
    finalScore,
    kktpKategori
  );

  const splitNarrative = pdf.splitTextToSize(narrativeText, contentWidth - 6);
  const narrativeBoxH = (splitNarrative.length * 3.8) + 7;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, contentWidth, narrativeBoxH, 1.5, 1.5, 'FD');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(51, 65, 85);
  pdf.text(splitNarrative, margin + 3, y + 5);
  y += narrativeBoxH + 6;

  // --- DETAIL EVALUASI PER SOAL KASUS ---
  if (evalData?.evaluasiPerSoal) {
    checkPageBreak(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('3. Evaluasi Detail Per Studi Kasus', margin, y);
    y += 4.5;

    const questionsList = assessment?.questions || [];
    questionsList.forEach((q, qIdx) => {
      const item = evalData.evaluasiPerSoal[q.id];
      if (!item) return;

      checkPageBreak(30);
      pdf.setFillColor(241, 245, 249);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(margin, y, contentWidth, 7, 1, 1, 'FD');

      const caseScore = item.persentase ?? item.skorTotal ?? 75;
      const caseCat = item.kktpKategori || determineKKTPKategori(caseScore);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`Kasus #${qIdx + 1}: ${q.judulKasus || 'Kasus'}`, margin + 3, y + 4.8);
      pdf.text(`Skor: ${caseScore} / 100 (${caseCat})`, pageWidth - margin - 3, y + 4.8, { align: 'right' });
      y += 9;

      // Feedback & Rekomendasi
      const feedback = item.alasanSkor || item.rekomendasi;
      if (feedback) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(51, 65, 85);
        const fbText = pdf.splitTextToSize(`Catatan Evaluasi: ${feedback}`, contentWidth - 4);
        pdf.text(fbText, margin + 2, y);
        y += (fbText.length * 3.5) + 3;
      }
    });
  }

  // --- FOOTER TANDA TANGAN ---
  checkPageBreak(30);
  y += 4;
  pdf.setDrawColor(148, 163, 184);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);

  const sigColWidth = contentWidth / 2;
  pdf.text('Mengetahui, Orang Tua / Wali Siswa', margin, y);
  pdf.text('Guru Pengampu Mata Pelajaran', margin + sigColWidth, y);
  y += 16;
  pdf.text('( ........................................................... )', margin, y);
  pdf.text(`( ${(assessment?.config as any)?.namaGuru || 'Heriansyah, S.Si., S.Pd., M.Pd'} )`, margin + sigColWidth, y);

  // --- ADD PAGE NUMBERS ---
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  const fileName = customFilename || `Rapor_Evaluasi_${sanitizeFilename(studentName)}_${sanitizeFilename(assessmentTitle)}.pdf`;
  pdf.save(fileName);
}

/**
 * Enhanced exportElementToPdf that attempts high-fidelity capture,
 * with automatic fallback if modern CSS / canvas fails.
 */
export async function exportElementToPdf(
  elementId: string,
  filename: string,
  onProgress?: (status: string) => void
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element dengan ID #${elementId} tidak ditemukan.`);
  }

  if (onProgress) onProgress('Menyiapkan tata letak PDF...');

  try {
    // Configure high-resolution capture with CORS & safe background
    const canvas = await html2canvas(element, {
      scale: 1.8,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth || 900,
      onclone: (clonedDoc) => {
        // Hide interactive buttons & print-hidden tags
        const buttons = clonedDoc.querySelectorAll('button, .no-print');
        buttons.forEach(b => (b as HTMLElement).style.display = 'none');
      }
    });

    if (onProgress) onProgress('Menyusun halaman PDF...');

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const printWidth = pageWidth - (margin * 2);
    const printHeight = (canvas.height * printWidth) / canvas.width;

    let heightLeft = printHeight;
    let position = margin;

    pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
    heightLeft -= (pageHeight - (margin * 2));

    while (heightLeft > 0) {
      position = heightLeft - printHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
      heightLeft -= (pageHeight - (margin * 2));
    }

    if (onProgress) onProgress('Menyimpan berkas...');
    pdf.save(filename);
  } catch (err) {
    console.warn('html2canvas failed, attempting fallback print window or download:', err);
    throw err;
  }
}

/**
 * Reliable print helper that handles iframe constraints.
 * Tries direct print, popup print window, and reports if sandboxed.
 */
export function triggerReliablePrint(elementId: string): { success: boolean; fallbackTriggered?: boolean; error?: string } {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, error: 'Elemen dokumen cetak tidak ditemukan.' };
  }

  // Strategy 1: Open a clean, standalone print window
  // This bypasses iframe sandbox restrictions (e.g. 'allow-modals' not granted in preview iframe)
  try {
    const printWindow = window.open('', '_blank', 'width=850,height=900,scrollbars=yes');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="utf-8">
            <title>Cetak Dokumen Resmi Asesmen</title>
            <style>
              @page { size: A4; margin: 12mm; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #0f172a;
                margin: 0;
                padding: 16px;
                font-size: 11pt;
                line-height: 1.4;
                background: #fff;
              }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; }
              th, td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10pt; text-align: left; }
              th { background-color: #f1f5f9; font-weight: bold; }
              button, .no-print { display: none !important; }
              .print-avoid-break { page-break-inside: avoid; }
            </style>
          </head>
          <body>
            ${element.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 350);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      return { success: true };
    }
  } catch (winErr) {
    console.warn('Popup print window failed, trying direct window.print:', winErr);
  }

  // Strategy 2: Direct window.print()
  try {
    window.print();
    return { success: true };
  } catch (err: any) {
    console.error('Window print error:', err);
    return { 
      success: false, 
      error: 'Dialog cetak browser dibatasi oleh iframe. Silakan gunakan tombol "Simpan PDF" atau "Simpan Word" di atas untuk mengunduh dokumen secara langsung.' 
    };
  }
}

/**
 * Generates an official Microsoft Word (.doc) for Question Assessment Sheet.
 */
export function generateAssessmentWord(assessment: Assessment): void {
  const title = assessment.judul || 'Lembar Asesmen Kontekstual';
  const mataPelajaran = assessment.config.mataPelajaran || 'Mata Pelajaran';
  const fase = assessment.config.fase || 'Fase C / D';
  const jenjang = assessment.config.jenjang || 'SD / SMP';

  const questionsHtml = assessment.questions.map((q, idx) => `
    <div style="margin-top: 18pt; margin-bottom: 18pt; page-break-inside: avoid; border: 1pt solid #cbd5e1; padding: 12pt; border-radius: 6pt;">
      <h3 style="color: #0f766e; font-size: 12pt; margin-top: 0;">SOAL KASUS #${idx + 1}: ${q.judulKasus}</h3>
      <p style="font-size: 10.5pt; line-height: 1.5; color: #334155; margin-bottom: 8pt;">
        <b>Konteks Masalah:</b><br/>${q.konteks}
      </p>

      <div style="background-color: #f8fafc; border: 1pt solid #e2e8f0; padding: 8pt; border-radius: 4pt; margin-bottom: 8pt; font-size: 10pt;">
        <b>Data & Informasi Kunci:</b><br/>
        ${q.dataInformasi.konten || ''}
      </div>

      <p style="font-size: 10.5pt; line-height: 1.5; margin-bottom: 8pt;">
        <b>Pertanyaan Utama:</b><br/>${q.pertanyaanUtama}
      </p>

      <div style="border: 1pt dashed #94a3b8; background-color: #fafafa; padding: 10pt; min-height: 50pt; margin-bottom: 8pt; font-size: 9.5pt; color: #64748b;">
        [ LEMBAR JAWABAN & KEPUTUSAN SISWA ]
      </div>

      <div style="border: 1pt dashed #94a3b8; background-color: #fafafa; padding: 10pt; min-height: 40pt; margin-bottom: 8pt; font-size: 9.5pt; color: #64748b;">
        [ BUKTI DARI KASUS YANG DIGUNAKAN (Wajib kutip angka/fakta) ]
      </div>

      <div style="border: 1pt dashed #94a3b8; background-color: #fafafa; padding: 10pt; min-height: 40pt; font-size: 9.5pt; color: #64748b;">
        [ ALASAN / JUSTIFIKASI & REFLEKSI KETERBATASAN ]
      </div>
    </div>
  `).join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; color: #0f172a; line-height: 1.4; }
        .kop-title { text-align: center; font-weight: bold; font-size: 15pt; text-transform: uppercase; }
        .kop-sub { text-align: center; font-weight: bold; color: #0f766e; font-size: 10pt; text-transform: uppercase; margin-bottom: 10pt; }
        table.meta { width: 100%; border: none; margin-bottom: 12pt; }
        table.meta td { border: none; padding: 4pt; font-size: 10.5pt; }
      </style>
    </head>
    <body>
      <div class="kop-title">LEMBAR ASESMEN KONTEKSTUAL & PENALARAN KRITIS</div>
      <div class="kop-sub">KURIKULUM MERDEKA • ${jenjang} • ${fase}</div>
      <hr style="border-top: 2pt solid #0f172a;"/>

      <table class="meta">
        <tr>
          <td style="width: 20%;"><strong>Mata Pelajaran</strong></td>
          <td style="width: 40%;">: ${mataPelajaran}</td>
          <td style="width: 20%;"><strong>Nama Siswa</strong></td>
          <td style="width: 20%;">: ...................................</td>
        </tr>
        <tr>
          <td><strong>Kelas / Fase</strong></td>
          <td>: ${fase}</td>
          <td><strong>Kelas / No. Absen</strong></td>
          <td>: ......... / .........</td>
        </tr>
        <tr>
          <td><strong>Judul Kasus</strong></td>
          <td colspan="3">: <b>${title}</b></td>
        </tr>
      </table>

      ${questionsHtml}
    </body>
    </html>
  `;

  const fileName = `Lembar_Soal_${sanitizeFilename(title)}.doc`;
  triggerDownload(wordHtml, fileName, 'application/msword;charset=utf-8');
}

/**
 * Generates an official Indonesian Kurikulum Merdeka Grade Recap Spreadsheet (CSV format with UTF-8 BOM for Excel)
 */
export function generateClassSummaryCsv(
  submissions: StudentSubmission[],
  assessments: Assessment[],
  filteredTitle?: string
): void {
  if (!submissions || submissions.length === 0) {
    alert('Belum ada data nilai peserta didik untuk diekspor.');
    return;
  }

  // Header row
  const headers = [
    'No',
    'Nama Peserta Didik',
    'Kelas',
    'Judul Asesmen',
    'Mata Pelajaran',
    'Waktu Pengumpulan',
    'Skor Akhir (0-100)',
    'Kategori KKTP',
    'Status Integritas',
    'Catatan / Narasi e-Rapor'
  ];

  const rows = submissions.map((sub, idx) => {
    const asm = assessments.find(a => a.id === sub.assessmentId);
    const evalData = sub.evaluation;
    const finalScore = evalData ? evalData.skorAkhir : 80;
    const kktp = evalData?.kktpKategori || determineKKTPKategori(finalScore);
    const narrative = evalData?.deskripsieRapor || generateERaporNarrative(
      sub.studentName || 'Peserta Didik',
      asm?.config.tujuanPembelajaran || 'asesmen kontekstual',
      finalScore,
      kktp
    );

    // Check integrity flags
    const answerMap = (sub.answers || {}) as Record<string, StudentAnswer>;
    const hasPaste = Object.values(answerMap).some(ans => ans.copyPasteDetected);
    const statusIntegritas = hasPaste ? 'Terdeteksi Salin-Tempel' : 'Aman & Autentik';

    const formattedDate = new Date(sub.timestamp || Date.now()).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return [
      String(idx + 1),
      `"${(sub.studentName || '-').replace(/"/g, '""')}"`,
      `"${(sub.studentClass || '-').replace(/"/g, '""')}"`,
      `"${(sub.assessmentTitle || asm?.judul || '-').replace(/"/g, '""')}"`,
      `"${(asm?.config.mataPelajaran || '-').replace(/"/g, '""')}"`,
      `"${formattedDate}"`,
      String(finalScore),
      `"${kktp}"`,
      `"${statusIntegritas}"`,
      `"${narrative.replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ].join(';');
  });

  // UTF-8 BOM \uFEFF ensures Excel displays Indonesian characters properly
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const filename = `Rekap_Nilai_${sanitizeFilename(filteredTitle || 'Kelas')}_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8');
}
