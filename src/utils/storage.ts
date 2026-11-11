import { Assessment, StudentSubmission } from '../types';
import { INITIAL_SAMPLE_ASSESSMENTS } from '../data/sampleAssessments';
import { INITIAL_SAMPLE_SUBMISSIONS } from '../data/sampleSubmissions';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, getDocs, collection, query, limit } from 'firebase/firestore';

const ASSESSMENTS_KEY = 'asesmen_kontekstual_items_v1';
const SUBMISSIONS_KEY = 'asesmen_kontekstual_submissions_v1';

export function getSavedAssessments(): Assessment[] {
  try {
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(INITIAL_SAMPLE_ASSESSMENTS));
      return INITIAL_SAMPLE_ASSESSMENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(INITIAL_SAMPLE_ASSESSMENTS));
      return INITIAL_SAMPLE_ASSESSMENTS;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading assessments from localStorage:', e);
    return INITIAL_SAMPLE_ASSESSMENTS;
  }
}

export function saveAssessment(assessment: Assessment): void {
  const current = getSavedAssessments();
  const index = current.findIndex(a => a.id === assessment.id);
  if (index >= 0) {
    current[index] = assessment;
  } else {
    current.unshift(assessment);
  }
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(current));

  // 1. Save to Firestore Cloud Online
  try {
    const payload = {
      ...assessment,
      userId: auth.currentUser?.uid || 'public',
      updatedAt: new Date().toISOString()
    };
    setDoc(doc(db, 'assessments', assessment.id), payload).catch(err => {
      console.warn('Firestore direct write failed, fallback to server proxy:', err);
    });
  } catch (e) {
    // Ignore
  }

  // 2. Also sync to Express server in background
  try {
    fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    }).catch(err => console.warn('Could not sync assessment to server:', err));
  } catch (e) {
    // Ignore network errors
  }
}

export function deleteAssessment(id: string): void {
  const current = getSavedAssessments();
  const filtered = current.filter(a => a.id !== id);
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(filtered));

  try {
    deleteDoc(doc(db, 'assessments', id)).catch(() => {});
  } catch (e) {}

  try {
    fetch(`/api/assessments/${id}`, { method: 'DELETE' }).catch(err => console.warn('Could not delete on server:', err));
  } catch (e) {
    // Ignore
  }
}

export function getSavedSubmissions(): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SAMPLE_SUBMISSIONS));
      return INITIAL_SAMPLE_SUBMISSIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SAMPLE_SUBMISSIONS));
      return INITIAL_SAMPLE_SUBMISSIONS;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading submissions from localStorage:', e);
    return INITIAL_SAMPLE_SUBMISSIONS;
  }
}

export function saveSubmission(submission: StudentSubmission): void {
  const current = getSavedSubmissions();
  const index = current.findIndex(s => s.id === submission.id);
  if (index >= 0) {
    current[index] = submission;
  } else {
    current.unshift(submission);
  }
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(current));

  // 1. Save directly to Firestore Cloud Online
  try {
    const payload = {
      ...submission,
      syncedAt: new Date().toISOString()
    };
    setDoc(doc(db, 'submissions', submission.id), payload).catch(err => {
      console.warn('Firestore write submission failed:', err);
    });
  } catch (e) {}

  // 2. Also sync to Express server in background
  try {
    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    }).catch(err => console.warn('Could not sync submission to server:', err));
  } catch (e) {
    // Ignore
  }
}

export function deleteSubmission(submissionId: string): void {
  const current = getSavedSubmissions();
  const filtered = current.filter(s => s.id !== submissionId);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));

  try {
    deleteDoc(doc(db, 'submissions', submissionId)).catch(() => {});
  } catch (e) {}

  try {
    fetch(`/api/submissions/${encodeURIComponent(submissionId)}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Could not sync submission deletion to server:', err));
  } catch (e) {
    // Ignore
  }
}

// ASYNC SERVER & CLOUD SYNC METHODS

/**
 * Fetch an assessment by code or ID from local cache, Firestore cloud, or remote server
 */
export async function fetchAssessmentByCodeOrId(codeOrId: string): Promise<Assessment | null> {
  const cleanTarget = codeOrId.trim();
  if (!cleanTarget) return null;

  // 1. Check local storage first
  const localList = getSavedAssessments();
  const normalizedClean = cleanTarget.toUpperCase().replace(/\s+/g, '');
  const localMatch = localList.find(
    a => (a.id && a.id.toLowerCase() === cleanTarget.toLowerCase()) || 
         (a.kodeAkses && a.kodeAkses.toUpperCase().replace(/\s+/g, '') === normalizedClean)
  );

  if (localMatch) {
    return localMatch;
  }

  // 2. Try fetching directly from Firestore Cloud
  try {
    const directDoc = await getDoc(doc(db, 'assessments', cleanTarget));
    if (directDoc.exists()) {
      const data = directDoc.data() as Assessment;
      saveAssessment(data);
      return data;
    }
  } catch (e) {
    // Fall through to server API
  }

  // 3. Fetch from backend server API
  try {
    const res = await fetch(`/api/assessments/${encodeURIComponent(cleanTarget)}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.assessment) {
        saveAssessment(data.assessment);
        return data.assessment;
      }
    }
  } catch (err) {
    console.warn('Network error while fetching assessment from server:', err);
  }

  return null;
}

/**
 * Sync all assessments with Cloud Firestore & Server
 */
export async function syncAssessmentsWithServer(): Promise<Assessment[]> {
  const local = getSavedAssessments();
  const map = new Map<string, Assessment>();
  local.forEach(a => map.set(a.id, a));

  // 1. Pull from Firestore Cloud
  try {
    const snap = await getDocs(query(collection(db, 'assessments'), limit(50)));
    snap.forEach(d => {
      const item = d.data() as Assessment;
      if (item && item.id) {
        map.set(item.id, item);
      }
    });
  } catch (e) {
    console.warn('Firestore sync assessments warning:', e);
  }

  // 2. Pull from Server API
  try {
    const res = await fetch('/api/assessments');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && Array.isArray(data.assessments)) {
        data.assessments.forEach((a: Assessment) => map.set(a.id, a));
      }
    }
  } catch (e) {
    console.warn('Could not sync assessments from server:', e);
  }

  const merged = Array.from(map.values());
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(merged));
  return merged;
}

/**
 * Sync submissions with Cloud Firestore & Server
 */
export async function syncSubmissionsWithServer(): Promise<StudentSubmission[]> {
  const local = getSavedSubmissions();
  const map = new Map<string, StudentSubmission>();
  local.forEach(s => map.set(s.id, s));

  // 1. Pull from Firestore Cloud
  try {
    const snap = await getDocs(query(collection(db, 'submissions'), limit(50)));
    snap.forEach(d => {
      const item = d.data() as StudentSubmission;
      if (item && item.id) {
        map.set(item.id, item);
      }
    });
  } catch (e) {
    console.warn('Firestore sync submissions warning:', e);
  }

  // 2. Pull from Server API
  try {
    const res = await fetch('/api/submissions');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        data.submissions.forEach((s: StudentSubmission) => map.set(s.id, s));
      }
    }
  } catch (e) {
    console.warn('Could not sync submissions from server:', e);
  }

  const merged = Array.from(map.values());
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(merged));
  return merged;
}

export function getCurrentOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export function getPublicShareOrigin(customBase?: string): string {
  if (customBase && customBase.trim()) {
    return customBase.trim().replace(/\/+$/, '');
  }

  try {
    const savedCustom = localStorage.getItem('custom_share_origin');
    if (savedCustom && savedCustom.trim()) {
      return savedCustom.trim().replace(/\/+$/, '');
    }
  } catch (e) {}

  let origin = getCurrentOrigin();
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }

  return origin;
}

export function buildStudentShareUrl(assessment: Assessment, customOrigin?: string): string {
  let origin = '';
  if (customOrigin && customOrigin.trim()) {
    origin = customOrigin.trim().replace(/\/+$/, '');
  } else {
    try {
      const preferredMode = localStorage.getItem('preferred_share_mode');
      if (preferredMode === 'public') {
        origin = getPublicShareOrigin();
      } else {
        origin = getCurrentOrigin();
      }
    } catch {
      origin = getCurrentOrigin();
    }
  }

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const code = encodeURIComponent(assessment.kodeAkses);
  return `${origin}${pathname}?view=student&code=${code}`;
}

export function buildWhatsAppShareText(assessment: Assessment, customOrigin?: string): string {
  const shareUrl = buildStudentShareUrl(assessment, customOrigin);
  return `*ASESMEN KONTEKSTUAL KURIKULUM MERDEKA*\n` +
    `*Karya:* Heriansyah, S.Si., S.Pd., M.Pd\n\n` +
    `Halo anak-anak, silakan kerjakan asesmen berpikir kritis berikut melalui HP Android atau Laptop kalian:\n\n` +
    `📚 *Mata Pelajaran:* ${assessment.config.mataPelajaran}\n` +
    `📝 *Judul Asesmen:* ${assessment.judul}\n` +
    `🏫 *Kelas:* ${assessment.config.jenjang} Kelas ${assessment.config.kelas}\n` +
    `⏱️ *Waktu Pengerjaan:* ${assessment.config.waktuPengerjaan} Menit\n` +
    `🔑 *KODE AKSES:* ${assessment.kodeAkses}\n\n` +
    `🔗 *LINK PENGERJAAN LANGSUNG (KLIK DISINI):*\n${shareUrl}\n\n` +
    `💡 *PETUNJUK SISWA:*\n` +
    `1. Boleh membuka buku, catatan, internet, Google, dan AI (Open Book).\n` +
    `2. Jawaban harus menunjukkan penalaranmu sendiri dan mengutip bukti data kasus.\n` +
    `3. Otomatis menyimpan progres jawaban (Auto-Save) di HP/Laptop.\n\n` +
    `Selamat mengerjakan dengan teliti dan jujur! ✨`;
}

/**
 * Unduh satu asesmen spesifik dalam format file JSON
 */
export function downloadAssessmentAsJSON(assessment: Assessment): void {
  const dataStr = JSON.stringify(assessment, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (assessment.judul || 'asesmen')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 50);
  a.href = url;
  a.download = `asesmen_${safeTitle}_${assessment.kodeAkses || 'data'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Unduh seluruh database aplikasi (Bank Soal & Jawaban Siswa) dalam format file JSON
 */
export function downloadAllDataBackupAsJSON(): void {
  const assessments = getSavedAssessments();
  const submissions = getSavedSubmissions();
  const backupPayload = {
    appName: 'ASESMEN KONTEKSTUAL KURIKULUM MERDEKA',
    author: 'Heriansyah, S.Si., S.Pd., M.Pd',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    totalAssessments: assessments.length,
    totalSubmissions: submissions.length,
    assessments,
    submissions
  };

  const dataStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `backup_asesmen_kontekstual_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Impor data asesmen dari file JSON manual
 */
export function importDataFromJSONString(jsonString: string): { success: boolean; count: number; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    let importedCount = 0;

    // Check if it's a full backup bundle
    if (parsed && Array.isArray(parsed.assessments)) {
      parsed.assessments.forEach((asm: Assessment) => {
        if (asm && asm.id && asm.judul) {
          saveAssessment(asm);
          importedCount++;
        }
      });
      if (Array.isArray(parsed.submissions)) {
        parsed.submissions.forEach((sub: StudentSubmission) => {
          if (sub && sub.id) {
            saveSubmission(sub);
          }
        });
      }
      return {
        success: true,
        count: importedCount,
        message: `Berhasil mengimpor ${importedCount} instrumen asesmen dan ${parsed.submissions?.length || 0} lembar jawaban siswa.`
      };
    }

    // Check if it's a list of assessments
    if (Array.isArray(parsed)) {
      parsed.forEach((asm: Assessment) => {
        if (asm && asm.id && asm.judul) {
          saveAssessment(asm);
          importedCount++;
        }
      });
      return {
        success: true,
        count: importedCount,
        message: `Berhasil mengimpor ${importedCount} instrumen asesmen.`
      };
    }

    // Check if it's a single assessment object
    if (parsed && parsed.id && parsed.judul && Array.isArray(parsed.questions)) {
      saveAssessment(parsed as Assessment);
      return {
        success: true,
        count: 1,
        message: `Berhasil mengimpor asesmen "${parsed.judul}".`
      };
    }

    return {
      success: false,
      count: 0,
      message: 'Format file JSON tidak sesuai struktur instrumen Asesmen Kontekstual.'
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: 'Gagal membaca file JSON: ' + (err.message || 'Format tidak valid')
    };
  }
}
