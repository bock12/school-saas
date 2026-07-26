'use client';

import { useState } from 'react';
import {
  Clock, CheckCircle2, AlertCircle, FileText,
  ArrowRight, Eye, Calendar, ClipboardCheck,
  CheckCircle, MessageSquare, BarChart3, Layers, X, Kanban, List, Link2, Award, DollarSign
} from 'lucide-react';
import { progressApplicantStage, rejectApplicant, scheduleApplicantInterview, scheduleApplicantAssessment, toggleApplicantDocsVerified, toggleApplicantFeeCleared, allocateAndMatriculateApplicant } from '../../admissions/actions';
import type { Applicant } from '../../admissions/types';

const stagesList = [
  { name: 'Application', label: '1. Application', desc: 'Online Submission', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'Verification', label: '2. Verification', desc: 'Docs Audit', icon: ClipboardCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { name: 'Interview', label: '3. Interview', desc: 'Face-to-Face', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { name: 'Assessment', label: '4. Assessment', desc: 'Skill Evaluat.', icon: BarChart3, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { name: 'Acceptance', label: '5. Acceptance', desc: 'Offer Sent', icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { name: 'Enrollment', label: '6. Enrollment', desc: 'Fees Paid', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { name: 'Allocation', label: '7. Allocation', desc: 'Class Set', icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const STAGE_REJECTION_PRESETS: Record<string, string[]> = {
  Application: [
    'Incomplete student or parent information submitted. Please update required fields.',
    'Student age does not meet entry criteria for target grade level.',
    'Duplicate application record detected for this academic year.',
  ],
  Verification: [
    'Uploaded Birth Certificate is unreadable or missing official seal. Please re-upload a clear copy.',
    'Academic Transcript / Report Card missing from previous school.',
    'Medical & Immunization records incomplete.',
  ],
  Interview: [
    'Applicant did not meet minimum interview performance requirements.',
    'Missed scheduled interview session without notice. Please contact school to reschedule.',
  ],
  Assessment: [
    'Entrance assessment evaluation score fell below passing threshold.',
    'Placement test incomplete or unsubmitted.',
  ],
  Acceptance: [
    'Offer letter acceptance deadline has lapsed.',
    'Class capacity reached for target grade level.',
  ],
  Enrollment: [
    'Admission / tuition fee payment deadline expired.',
    'Financial clearance documentation incomplete.',
  ],
};

function getSmartDetectedMissingRequirements(app: Applicant): string[] {
  const detected: string[] = [];
  const docs = app.documents || [];
  const birthCert = docs.find((d) => d.type.toLowerCase().includes('birth'));
  const transcript = docs.find((d) => d.type.toLowerCase().includes('transcript') || d.type.toLowerCase().includes('report'));
  const medical = docs.find((d) => d.type.toLowerCase().includes('medical'));
  if (!birthCert || !birthCert.url || !birthCert.name) detected.push('Missing required document: Official Birth Certificate.');
  if (!transcript || !transcript.url || !transcript.name) detected.push('Missing required document: Previous School Academic Transcript / Report Card.');
  if (!medical || !medical.url || !medical.name) detected.push('Missing required document: Medical & Immunization Records.');
  if (!app.prevSchool) detected.push('Missing information: Previous school attended is unrecorded.');
  if (app.stage === 'Interview' && (app.interviewScore === null || app.interviewScore === undefined)) detected.push('Stage requirement unfulfilled: Student interview score has not been recorded.');
  if (app.stage === 'Assessment' && (app.assessmentScore === null || app.assessmentScore === undefined)) detected.push('Stage requirement unfulfilled: Entrance assessment score has not been recorded.');
  if (app.stage === 'Verification' && !app.docsVerified) detected.push('Audit requirement unfulfilled: Document verification audit check pending.');
  return detected;
}

export function ApplicationsPipeline({ serverApplicants, tenantSlug }: { serverApplicants: Applicant[], tenantSlug: string }) {
  const [applicants, setApplicants] = useState<Applicant[]>(serverApplicants);
  const [selectedStage, setSelectedStage] = useState<string>('Application');
  const [showApproveModal, setShowApproveModal] = useState<Applicant | null>(null);
  const [approveComment, setApproveComment] = useState('');
  const [interviewScoreInput, setInterviewScoreInput] = useState<number | ''>(85);
  const [showScheduleModal, setShowScheduleModal] = useState<Applicant | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('Admissions Office, Main Campus');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState<Applicant | null>(null);
  const [scheduleAssessmentDate, setScheduleAssessmentDate] = useState('');
  const [scheduleAssessmentLocation, setScheduleAssessmentLocation] = useState('Computer Lab 2, Main Science Building');
  const [scheduleAssessmentNotes, setScheduleAssessmentNotes] = useState('');
  const [mathScoreInput, setMathScoreInput] = useState<number | ''>(88);
  const [englishScoreInput, setEnglishScoreInput] = useState<number | ''>(90);
  const [scienceScoreInput, setScienceScoreInput] = useState<number | ''>(85);
  const [receiptNumberInput, setReceiptNumberInput] = useState('REC-2026-9812');
  const [paymentMethodInput, setPaymentMethodInput] = useState('Bank Transfer');
  const [selectedAuditApplicant, setSelectedAuditApplicant] = useState<Applicant | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<{ type: string; name: string; url: string } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<Applicant | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');

  // Allocation modal state
  const [showAllocationModal, setShowAllocationModal] = useState<Applicant | null>(null);
  const [isAllocating, setIsAllocating] = useState(false);

  const nextStageMap: Record<string, string> = {
    'Application': 'Verification',
    'Verification': 'Interview',
    'Interview': 'Assessment',
    'Assessment': 'Acceptance',
    'Acceptance': 'Enrollment',
    'Enrollment': 'Allocation',
    'Allocation': 'Allocation',
  };

  const handleProgress = async (appId: string) => {
    const app = applicants.find(a => a.id === appId);
    if (!app) return;
    const nextStage = nextStageMap[app.stage] as any;
    if (!nextStage || nextStage === app.stage) { setShowApproveModal(null); return; }
    setIsSubmitting(true);
    let scores: any = undefined;
    let finalComment = approveComment;
    if (app.stage === 'Interview') {
      scores = { interviewScore: Number(interviewScoreInput) || 85 };
      finalComment = `Interview Score: ${interviewScoreInput || 85}%. ${approveComment}`;
    } else if (app.stage === 'Assessment') {
      const m = Number(mathScoreInput) || 80, e = Number(englishScoreInput) || 80, s = Number(scienceScoreInput) || 80;
      const avg = Math.round((m + e + s) / 3);
      scores = { assessmentScore: avg, assessmentDetails: { mathScore: m, englishScore: e, scienceScore: s, overallScore: avg } };
      finalComment = `Assessment Exam Score: Math ${m}%, English ${e}%, Science ${s}% (Aggregate: ${avg}%). ${approveComment}`;
    } else if (app.stage === 'Enrollment') {
      scores = { paymentCleared: true, receiptNumber: receiptNumberInput, paymentMethod: paymentMethodInput };
      finalComment = `Bursary Financial Fee Settlement Approved. Receipt Ref: ${receiptNumberInput} (${paymentMethodInput}). ${approveComment}`;
    }
    const res = await progressApplicantStage(tenantSlug, appId, app.stage, nextStage, finalComment, scores);
    setIsSubmitting(false);
    if (res.success) {
      setShowApproveModal(null);
      setApproveComment('');
      setApplicants(prev => prev.map(a => a.id === appId ? {
        ...a, stage: nextStage,
        interviewScore: scores?.interviewScore || a.interviewScore,
        assessmentScore: scores?.assessmentScore || a.assessmentScore,
        assessmentDetails: scores?.assessmentDetails || a.assessmentDetails,
        comment: finalComment || a.comment
      } : a));
    } else { alert(res.error); }
  };

  const handleAllocate = async () => {
    if (!showAllocationModal) return;
    setIsAllocating(true);
    const studentIdNumber = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const res = await allocateAndMatriculateApplicant(
      tenantSlug,
      showAllocationModal.id,
      '', // classArm — auto-derived from applicant target_grade
      studentIdNumber,
    );
    setIsAllocating(false);
    if (res.success) {
      setShowAllocationModal(null);
      setApplicants(prev => prev.filter(a => a.id !== showAllocationModal.id));
      alert(`✅ ${showAllocationModal.name} has been successfully enrolled and added to the Active Students registry!\n\nStudent ID: ${studentIdNumber}`);
    } else {
      alert(res.error || 'Allocation failed. Please try again.');
    }
  };

  if (applicants !== serverApplicants) setApplicants(serverApplicants);

  return (
    <>
      <div className="space-y-6 max-w-[1600px] animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Online Applications Pipeline</h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Process online student applications submitted via the public portal through the 7-stage pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-[hsl(var(--bg-tertiary))] p-1 rounded-lg border border-[hsl(var(--border))]">
              <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}>
                <Kanban className="w-4 h-4" /> Kanban
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}>
                <List className="w-4 h-4" /> List
              </button>
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/${tenantSlug}/apply`;
                navigator.clipboard.writeText(url);
                alert('Public Application Link copied!\n\n' + url);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-sm font-semibold hover:bg-[hsl(var(--border))] transition-colors"
            >
              <Link2 className="w-4 h-4" /> Copy Portal Link
            </button>
          </div>
        </div>

        {viewMode === 'kanban' ? (
          <>
            {/* Stage tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {stagesList.map((stg) => {
                const count = applicants.filter(a => a.stage === stg.name).length;
                const isActive = selectedStage === stg.name;
                const Icon = stg.icon;
                return (
                  <div key={stg.name} onClick={() => setSelectedStage(stg.name)}
                    className={`rounded-xl border p-4 text-center cursor-pointer hover:scale-105 transition-all select-none ${isActive ? 'bg-[hsl(var(--accent)/0.12)] border-[hsl(var(--accent))] shadow-md' : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))]'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${stg.bg} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-4 h-4 ${stg.color}`} />
                    </div>
                    <p className="text-xs font-semibold text-[hsl(var(--text-primary))] truncate">{stg.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{stg.desc}</p>
                    <p className={`text-base font-bold mt-2 ${isActive ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-secondary))]'}`}>
                      {count} {count === 1 ? 'applicant' : 'applicants'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Applicants table for current stage */}
            <div className="glass-card">
              <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Stage: {selectedStage}</h3>
                <span className="text-xs text-[hsl(var(--text-tertiary))]">
                  {applicants.filter(a => a.stage === selectedStage).length} applicants in this step
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      {['Applicant', 'Grade', 'Parent/Guardian', 'Docs Audit', 'Assessments/Notes', 'Workflow comments', ''].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.filter(a => a.stage === selectedStage).length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">No applicants in this stage currently.</td></tr>
                    ) : (
                      applicants.filter(a => a.stage === selectedStage).map(app => (
                        <tr key={app.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {app.photoUrl ? <img src={app.photoUrl} alt={app.name} className="w-9 h-9 rounded-full object-cover border border-[hsl(var(--border))]" /> : (
                                <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                                  {app.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{app.name}</p>
                                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Applied: {app.appliedDate}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.grade}</td>
                          <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.parentName}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${app.docsVerified ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                              {app.docsVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-xs space-y-1">
                              {selectedStage === 'Interview' && <p className="text-[hsl(var(--text-secondary))]">Score: <span className="font-semibold text-[hsl(var(--text-primary))]">{app.interviewScore || 'Not graded'}</span></p>}
                              {selectedStage === 'Assessment' && <p className="text-[hsl(var(--text-secondary))]">Score: <span className="font-semibold text-[hsl(var(--text-primary))]">{app.assessmentScore || 'Not graded'}</span></p>}
                              {selectedStage !== 'Interview' && selectedStage !== 'Assessment' && <p className="text-[hsl(var(--text-tertiary))]">Compliant</p>}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] max-w-[250px] truncate" title={app.comment}>{app.comment}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {app.stage === 'Interview' && (
                                <button onClick={() => { setShowScheduleModal(app); setScheduleDate(app.interviewDate || ''); setScheduleLocation(app.interviewLocation || 'Admissions Office, Main Campus'); setScheduleNotes('Please ensure the candidate is accompanied by at least one parent/guardian. Kindly arrive 15 minutes prior.'); }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-all text-xs font-semibold">
                                  <Calendar className="w-3.5 h-3.5" />{app.interviewDate ? 'Reschedule' : 'Schedule'}
                                </button>
                              )}
                              {app.stage === 'Assessment' && (
                                <button onClick={() => { setShowScheduleAssessmentModal(app); setScheduleAssessmentDate(app.assessmentDate || ''); setScheduleAssessmentLocation(app.assessmentLocation || 'Computer Lab 2, Main Science Building'); setScheduleAssessmentNotes(`Candidate must present reference code (APP-${app.id.substring(0, 8).toUpperCase()}).`); }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500 hover:text-white transition-all text-xs font-semibold">
                                  <Calendar className="w-3.5 h-3.5" />{app.assessmentDate ? 'Reschedule' : 'Schedule Exam'}
                                </button>
                              )}
                              <button onClick={() => setSelectedAuditApplicant(app)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--border))] transition-all text-xs font-semibold">
                                <Eye className="w-3.5 h-3.5" /> Inspect
                              </button>
                              {app.status === 'rejected' ? (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Rejected</span>
                              ) : selectedStage !== 'Allocation' ? (
                                <button onClick={() => { setShowApproveModal(app); setApproveComment(''); setInterviewScoreInput(app.interviewScore || 85); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-semibold">
                                  Approve Step <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button onClick={() => setShowAllocationModal(app)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-semibold">
                                  Complete Allocation & Enroll <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    {['Applicant', 'Grade', 'Parent/Guardian', 'Applied Date', 'Documents', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">No online applications found.</td></tr>
                  ) : (
                    applicants.map(app => (
                      <tr key={app.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {app.photoUrl ? <img src={app.photoUrl} alt={app.name} className="w-9 h-9 rounded-full object-cover border border-[hsl(var(--border))]" /> : (
                              <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                                {app.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{app.name}</p>
                              <p className="text-xs text-[hsl(var(--text-tertiary))]">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.grade}</td>
                        <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.parentName}</td>
                        <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{new Date(app.appliedDate).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />{app.docsVerified ? 'Verified' : 'Pending'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${stagesList.find(s => s.name === app.stage)?.bg || 'bg-gray-500/10'} ${stagesList.find(s => s.name === app.stage)?.color || 'text-gray-400'} border-current/20`}>
                            {app.stage}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Approve Workflow Step</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Approve <strong>{showApproveModal.name}</strong> to progress from <strong>{showApproveModal.stage}</strong> to the next stage.
            </p>
            {showApproveModal.stage === 'Interview' && (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Interview Evaluation</h4>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Interview Score (0–100%) *</label>
                  <input type="number" min="0" max="100" value={interviewScoreInput} onChange={e => setInterviewScoreInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
                </div>
              </div>
            )}
            {showApproveModal.stage === 'Assessment' && (
              <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Exam Scores</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">Agg: {Math.round(((Number(mathScoreInput) || 0) + (Number(englishScoreInput) || 0) + (Number(scienceScoreInput) || 0)) / 3)}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[['Math', mathScoreInput, setMathScoreInput], ['English', englishScoreInput, setEnglishScoreInput], ['Science', scienceScoreInput, setScienceScoreInput]].map(([label, val, setter]: any) => (
                    <div key={label as string}>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">{label} (%)</label>
                      <input type="number" min="0" max="100" value={val} onChange={e => setter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showApproveModal.stage === 'Enrollment' && (
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Fee Clearance</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Receipt Ref *</label>
                    <input type="text" value={receiptNumberInput} onChange={e => setReceiptNumberInput(e.target.value)} className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-[hsl(var(--text-primary))]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Payment Method</label>
                    <select value={paymentMethodInput} onChange={e => setPaymentMethodInput(e.target.value)} className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))]">
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Cash Deposit">Cash Deposit</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))]">Workflow Comments / Notes</label>
              <textarea value={approveComment} onChange={e => setApproveComment(e.target.value)} placeholder="Enter approval details or feedback..."
                className="w-full min-h-[80px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowApproveModal(null)} disabled={isSubmitting} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</button>
              <button onClick={() => handleProgress(showApproveModal.id)} disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-90">
                {isSubmitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allocation & Enroll Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Complete Allocation & Enroll
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Allocating <strong>{showAllocationModal.name}</strong> will create an active student record and move them to the Students registry.
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <p className="font-bold mb-1">✅ Class assignment is optional</p>
              <p className="opacity-80">You can enroll the student now without a class and assign one later from their profile.</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowAllocationModal(null)} disabled={isAllocating} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</button>
              <button onClick={handleAllocate} disabled={isAllocating} className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold hover:opacity-90 flex items-center gap-2">
                {isAllocating ? 'Enrolling...' : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm Enrollment</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit / Inspect Modal */}
      {selectedAuditApplicant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-lg">
                  {selectedAuditApplicant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.name}</h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">Grade: <strong>{selectedAuditApplicant.grade}</strong> | Stage: <strong>{selectedAuditApplicant.stage}</strong></p>
                </div>
              </div>
              <button onClick={() => setSelectedAuditApplicant(null)} className="p-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))]">
              {[['DOB', selectedAuditApplicant.dob], ['Gender', selectedAuditApplicant.gender || 'N/A'], ['Parent', selectedAuditApplicant.parentName], ['Applied', selectedAuditApplicant.appliedDate], ['Email', selectedAuditApplicant.email || 'N/A'], ['Phone', selectedAuditApplicant.phone || 'N/A']].map(([l, v]) => (
                <div key={l}><span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold">{l}</span><p className="font-bold text-[hsl(var(--text-primary))]">{v}</p></div>
              ))}
            </div>
            {selectedAuditApplicant.documents && selectedAuditApplicant.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">Submitted Documents</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedAuditApplicant.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex items-center justify-between gap-2">
                      <div><p className="text-xs font-bold text-[hsl(var(--text-primary))]">{doc.type}</p><p className="text-[10px] text-[hsl(var(--text-tertiary))]">{doc.name}</p></div>
                      {doc.url && <button onClick={() => setPreviewingDoc(doc)} className="px-2 py-1 rounded text-[10px] bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-colors flex items-center gap-1"><Eye className="w-3 h-3" /> View</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
              <button onClick={() => { setShowRejectModal(selectedAuditApplicant); setRejectionReasonInput(''); setSelectedAuditApplicant(null); }}
                className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Reject / Request Correction
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSelectedAuditApplicant(null)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Close</button>
                <button onClick={() => { const app = selectedAuditApplicant; setSelectedAuditApplicant(null); setShowApproveModal(app); setApproveComment(''); }}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5">
                  Approve Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-rose-500 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Reject Application</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">Specify the reason for rejecting <strong>{showRejectModal.name}</strong>'s application.</p>
            {STAGE_REJECTION_PRESETS[showRejectModal.stage] && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Quick Presets:</label>
                <div className="flex flex-col gap-1">
                  {STAGE_REJECTION_PRESETS[showRejectModal.stage].map((preset, idx) => (
                    <button key={idx} type="button" onClick={() => setRejectionReasonInput(preset)}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:border-rose-400/50 hover:bg-rose-500/10 transition-all font-medium">
                      • {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))]">Rejection Reason *</label>
              <textarea value={rejectionReasonInput} onChange={e => setRejectionReasonInput(e.target.value)} placeholder="Describe the reason for rejection..."
                className="w-full min-h-[100px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-rose-500" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowRejectModal(null)} disabled={isSubmitting} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]">Cancel</button>
              <button
                onClick={async () => {
                  if (!rejectionReasonInput.trim()) return;
                  setIsSubmitting(true);
                  const res = await rejectApplicant(tenantSlug, showRejectModal.id, rejectionReasonInput);
                  setIsSubmitting(false);
                  if (res.success) {
                    setShowRejectModal(null);
                    setApplicants(prev => prev.map(a => a.id === showRejectModal.id ? { ...a, status: 'rejected', rejectionReason: rejectionReasonInput } : a));
                  } else { alert(res.error); }
                }}
                disabled={isSubmitting || !rejectionReasonInput.trim()}
                className="px-4 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-purple-400 flex items-center gap-2"><Calendar className="w-5 h-5" /> Schedule Interview</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">Set the interview date for <strong>{showScheduleModal.name}</strong>.</p>
            <div className="space-y-3">
              <div><label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Date & Time *</label><input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" /></div>
              <div><label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Location</label><input value={scheduleLocation} onChange={e => setScheduleLocation(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowScheduleModal(null)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]">Cancel</button>
              <button onClick={async () => {
                if (!scheduleDate) return;
                setIsSubmitting(true);
                const res = await scheduleApplicantInterview(tenantSlug, showScheduleModal.id, scheduleDate, scheduleLocation, scheduleNotes);
                setIsSubmitting(false);
                if (res.success) { setShowScheduleModal(null); setApplicants(prev => prev.map(a => a.id === showScheduleModal.id ? { ...a, interviewDate: scheduleDate, interviewLocation: scheduleLocation } : a)); }
                else { alert(res.error); }
              }} disabled={isSubmitting || !scheduleDate} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? 'Saving...' : <><Calendar className="w-3.5 h-3.5" /> Confirm Schedule</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Schedule Modal */}
      {showScheduleAssessmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-pink-400 flex items-center gap-2"><Calendar className="w-5 h-5" /> Schedule Assessment Exam</h3>
            <div className="space-y-3">
              <div><label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Exam Date & Time *</label><input type="datetime-local" value={scheduleAssessmentDate} onChange={e => setScheduleAssessmentDate(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" /></div>
              <div><label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Exam Center</label><input value={scheduleAssessmentLocation} onChange={e => setScheduleAssessmentLocation(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowScheduleAssessmentModal(null)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]">Cancel</button>
              <button onClick={async () => {
                if (!scheduleAssessmentDate) return;
                setIsSubmitting(true);
                const res = await scheduleApplicantAssessment(tenantSlug, showScheduleAssessmentModal.id, scheduleAssessmentDate, scheduleAssessmentLocation, scheduleAssessmentNotes);
                setIsSubmitting(false);
                if (res.success) { setShowScheduleAssessmentModal(null); setApplicants(prev => prev.map(a => a.id === showScheduleAssessmentModal.id ? { ...a, assessmentDate: scheduleAssessmentDate, assessmentLocation: scheduleAssessmentLocation } : a)); }
                else { alert(res.error); }
              }} disabled={isSubmitting || !scheduleAssessmentDate} className="px-4 py-2 rounded-lg bg-pink-600 text-white text-xs font-bold hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? 'Saving...' : <><Calendar className="w-3.5 h-3.5" /> Confirm</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewingDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{previewingDoc.type}: {previewingDoc.name}</h3>
              <button onClick={() => setPreviewingDoc(null)} className="p-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))]"><X className="w-5 h-5" /></button>
            </div>
            <div className="rounded-xl overflow-hidden bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] max-h-[60vh] flex items-center justify-center">
              {previewingDoc.url.startsWith('data:image') || previewingDoc.url.match(/\.(png|jpg|jpeg|gif|webp)$/i)
                ? <img src={previewingDoc.url} alt={previewingDoc.name} className="max-w-full max-h-[60vh] object-contain" />
                : <div className="p-8 text-center text-sm text-[hsl(var(--text-tertiary))]"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><a href={previewingDoc.url} target="_blank" rel="noreferrer" className="text-[hsl(var(--accent))] hover:underline">Open Document →</a></div>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
}
