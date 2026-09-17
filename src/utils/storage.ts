import { Assessment, StudentSubmission } from '../types';
import { INITIAL_SAMPLE_ASSESSMENTS } from '../data/sampleAssessments';
import { INITIAL_SAMPLE_SUBMISSIONS } from '../data/sampleSubmissions';

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

  // Also sync to server in background
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

  // Also sync to server in background
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

// ASYNC SERVER SYNC METHODS

/**
 * Fetch an assessment by code or ID from local cache or remote server
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

  // 2. Fetch from backend server API
  try {
    const res = await fetch(`/api/assessments/${encodeURIComponent(cleanTarget)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.assessment) {
        // Cache to local storage
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
 * Sync all assessments with the server
 */
export async function syncAssessmentsWithServer(): Promise<Assessment[]> {
  try {
    const res = await fetch('/api/assessments');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.assessments)) {
        // Merge server assessments with local
        const local = getSavedAssessments();
        const map = new Map<string, Assessment>();
        local.forEach(a => map.set(a.id, a));
        data.assessments.forEach((a: Assessment) => map.set(a.id, a));
        const merged = Array.from(map.values());
        localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.warn('Could not sync assessments from server:', e);
  }
  return getSavedAssessments();
}

/**
 * Sync submissions with server
 */
export async function syncSubmissionsWithServer(): Promise<StudentSubmission[]> {
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        const local = getSavedSubmissions();
        const map = new Map<string, StudentSubmission>();
        local.forEach(s => map.set(s.id, s));
        data.submissions.forEach((s: StudentSubmission) => map.set(s.id, s));
        const merged = Array.from(map.values());
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.warn('Could not sync submissions from server:', e);
  }
  return getSavedSubmissions();
}

/**
 * Generate a direct link for students to work on Android or Laptop
 */
export function buildStudentShareUrl(assessment: Assessment): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const code = encodeURIComponent(assessment.kodeAkses);
  return `${origin}${pathname}?view=student&code=${code}`;
}

/**
 * Generate formatted text for WhatsApp or classroom chat
 */
export function buildWhatsAppShareText(assessment: Assessment): string {
  const shareUrl = buildStudentShareUrl(assessment);
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
