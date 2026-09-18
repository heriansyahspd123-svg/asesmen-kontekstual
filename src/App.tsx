import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { GeneratorForm } from './components/GeneratorForm';
import { AssessmentEditor } from './components/AssessmentEditor';
import { StudentMode } from './components/StudentMode';
import { ResultsView } from './components/ResultsView';
import { TeacherGuideModal } from './components/TeacherGuideModal';
import { PrintAssessmentModal } from './components/PrintAssessmentModal';
import { TeacherIntegrityAuditModal } from './components/TeacherIntegrityModal';
import { ShareStudentLinkModal } from './components/ShareStudentLinkModal';
import { Assessment, StudentSubmission, StudentAnswer } from './types';
import { 
  getSavedAssessments, 
  saveAssessment, 
  getSavedSubmissions, 
  saveSubmission,
  syncAssessmentsWithServer,
  syncSubmissionsWithServer
} from './utils/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | undefined>(undefined);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [printAssessment, setPrintAssessment] = useState<Assessment | null>(null);
  const [isTeacherAuditOpen, setIsTeacherAuditOpen] = useState<boolean>(false);
  const [shareAssessment, setShareAssessment] = useState<Assessment | null>(null);

  // Calculate total flagged submissions for teacher badge
  const totalFlaggedCount = submissions.filter(s => 
    Object.values((s.answers || {}) as Record<string, StudentAnswer>).some(
      (ans: StudentAnswer) => ans.copyPasteDetected || s.evaluation?.evaluasiPerSoal?.[ans.questionId]?.integrityWarning?.isSuspicious
    )
  ).length;

  // Load initial data and handle deep-linking from shared link (Android & Laptop)
  useEffect(() => {
    const loadedAssessments = getSavedAssessments();
    const loadedSubmissions = getSavedSubmissions();
    setAssessments(loadedAssessments);
    setSubmissions(loadedSubmissions);

    // Sync with server in background to support students opening on new devices
    syncAssessmentsWithServer().then(synced => {
      if (synced && synced.length > 0) {
        setAssessments(synced);
      }
    });
    syncSubmissionsWithServer().then(synced => {
      if (synced && synced.length > 0) {
        setSubmissions(synced);
      }
    });

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      const codeParam = urlParams.get('code') || urlParams.get('kode') || urlParams.get('id') || urlParams.get('assessmentId');

      if (viewParam === 'student' || codeParam) {
        setCurrentView('student');
        if (codeParam) {
          setSelectedAssessmentId(codeParam);
        }
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, []);

  const handleNavigate = (view: string, assessmentId?: string) => {
    setCurrentView(view);
    if (assessmentId) {
      setSelectedAssessmentId(assessmentId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssessmentGenerated = (newAssessment: Assessment) => {
    saveAssessment(newAssessment);
    setAssessments(getSavedAssessments());
    setSelectedAssessmentId(newAssessment.id);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssessmentSave = (updated: Assessment) => {
    saveAssessment(updated);
    setAssessments(getSavedAssessments());
  };

  const handleSubmissionSuccess = (submission: StudentSubmission) => {
    saveSubmission(submission);
    setSubmissions(getSavedSubmissions());
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeAssessmentForEditor = assessments.find(a => a.id === selectedAssessmentId) || assessments[0];

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-200 dark:selection:bg-emerald-800 selection:text-emerald-950 dark:selection:text-emerald-100 transition-colors duration-150">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => handleNavigate(view)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAudit={() => setIsTeacherAuditOpen(true)}
        flaggedCount={totalFlaggedCount}
      />



      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenAudit={() => setIsTeacherAuditOpen(true)}
            assessments={assessments}
            flaggedCount={totalFlaggedCount}
            onShare={(asm) => setShareAssessment(asm)}
          />
        )}

        {currentView === 'create' && (
          <GeneratorForm
            onBack={() => handleNavigate('home')}
            onGenerated={handleAssessmentGenerated}
          />
        )}

        {currentView === 'editor' && activeAssessmentForEditor && (
          <AssessmentEditor
            assessment={activeAssessmentForEditor}
            onBack={() => handleNavigate('home')}
            onSave={handleAssessmentSave}
            onPrint={(asm) => setPrintAssessment(asm)}
            onTestAsStudent={(id) => handleNavigate('student', id)}
          />
        )}

        {currentView === 'student' && (
          <StudentMode
            assessments={assessments}
            initialAssessmentId={selectedAssessmentId}
            onBack={() => handleNavigate('home')}
            onSubmitSuccess={handleSubmissionSuccess}
            onShare={(asm) => setShareAssessment(asm)}
          />
        )}

        {currentView === 'results' && (
          <ResultsView
            submissions={submissions}
            assessments={assessments}
            onBack={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Modals */}
      <TeacherGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <PrintAssessmentModal
        assessment={printAssessment}
        isOpen={!!printAssessment}
        onClose={() => setPrintAssessment(null)}
      />

      <TeacherIntegrityAuditModal
        isOpen={isTeacherAuditOpen}
        onClose={() => setIsTeacherAuditOpen(false)}
        submissions={submissions}
        assessments={assessments}
        onSelectSubmissionToView={(subId) => {
          setCurrentView('results');
        }}
      />

      <ShareStudentLinkModal
        assessment={shareAssessment}
        isOpen={!!shareAssessment}
        onClose={() => setShareAssessment(null)}
        onTestNow={(id) => {
          setShareAssessment(null);
          handleNavigate('student', id);
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-6 text-xs text-slate-600 dark:text-slate-400 print:hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-center sm:text-left">
            <span>
              <strong className="text-slate-900 dark:text-white">ASESMEN KONTEKSTUAL</strong> — Open Book & Critical Thinking untuk Guru SD & SMP
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              Konteks Nyata, Analisis Data, Bukti & Refleksi
            </span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 rounded-full text-emerald-900 dark:text-emerald-200 shadow-2xs">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Dikembangkan oleh:</span>
            <span className="font-bold text-slate-900 dark:text-white text-xs tracking-tight">
              Heriansyah, S.Si., S.Pd., M.Pd
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
