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
 * Exports an HTML element directly to high-quality PDF using html2canvas and jsPDF.
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

  // Configure high-resolution capture
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    onclone: (clonedDoc) => {
      // Ensure elements marked with print:hidden or buttons are hidden
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
  const margin = 10; // 10mm margin
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
}

/**
 * Reliable print helper that handles iframe constraints.
 */
export function triggerReliablePrint(elementId: string): { success: boolean; fallbackTriggered?: boolean; error?: string } {
  const element = document.getElementById(elementId);
  
  // Try iframe-isolated print first so user only prints the target element, not the entire website navigation
  if (element) {
    try {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;');
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Cetak Rapor Evaluasi Siswa</title>
              <style>
                @page { size: A4; margin: 15mm; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                  color: #0f172a;
                  margin: 0;
                  padding: 10px;
                  font-size: 11pt;
                  line-height: 1.4;
                  background: #fff;
                }
                table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10pt; text-align: left; }
                th { background-color: #f1f5f9; font-weight: bold; }
                button, .no-print { display: none !important; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 3000);
          } catch (printErr) {
            console.warn('Iframe print error:', printErr);
            window.print();
          }
        }, 500);

        return { success: true };
      }
    } catch (err: any) {
      console.warn('Print iframe setup failed, using window.print():', err);
    }
  }

  // Fallback to direct window.print()
  try {
    window.print();
    return { success: true };
  } catch (err: any) {
    console.error('Window print error:', err);
    return { 
      success: false, 
      error: 'Dialog cetak browser dibatasi oleh iframe. Silakan gunakan tombol "Simpan PDF" atau "Simpan Word" di atas untuk mengunduh dokumen langsung.' 
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
