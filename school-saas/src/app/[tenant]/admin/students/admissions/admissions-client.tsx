'use client';

import { useState } from 'react';
import {
  UserPlus, Clock, CheckCircle2, AlertCircle, FileText, Search, Filter,
  ArrowRight, MoreHorizontal, Eye, Edit2, Calendar, ClipboardCheck,
  CheckCircle, MessageSquare, ChevronRight, Play, BarChart3, Layers, X, Upload, Camera, Kanban, List, Link2, Copy, Award, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { createApplicant, progressApplicantStage, rejectApplicant, scheduleApplicantInterview, scheduleApplicantAssessment, toggleApplicantDocsVerified, toggleApplicantFeeCleared, updateTenantBursarySettings } from './actions';

export interface Applicant {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  appliedDate: string;
  dob: string;
  stage: 'Application' | 'Verification' | 'Interview' | 'Assessment' | 'Acceptance' | 'Enrollment' | 'Allocation';
  docsVerified: boolean;
  interviewScore: number | null;
  assessmentScore: number | null;
  comment: string;
  photoUrl?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  prevSchool?: string;
  documents?: Array<{ type: string; name: string; url: string }>;
  status?: 'active' | 'rejected';
  rejectionReason?: string;
  interviewDate?: string;
  interviewLocation?: string;
  assessmentDate?: string;
  assessmentLocation?: string;
  assessmentDetails?: {
    mathScore?: number;
    englishScore?: number;
    scienceScore?: number;
    overallScore?: number;
  };
  offerAccepted?: boolean;
  acceptedAt?: string;
  parentSignature?: string;
  paymentCleared?: boolean;
  receiptNumber?: string;
  paymentMethod?: string;
  paymentReceiptUrl?: string;
  paymentPhone?: string;
  transactionId?: string;
}

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
  const transcript = docs.find(
    (d) =>
      d.type.toLowerCase().includes('transcript') ||
      d.type.toLowerCase().includes('report')
  );
  const medical = docs.find((d) => d.type.toLowerCase().includes('medical'));

  // 1. Document Inspections
  if (!birthCert || !birthCert.url || !birthCert.name) {
    detected.push('Missing required document: Official Birth Certificate.');
  }
  if (!transcript || !transcript.url || !transcript.name) {
    detected.push('Missing required document: Previous School Academic Transcript / Report Card.');
  }
  if (!medical || !medical.url || !medical.name) {
    detected.push('Missing required document: Medical & Immunization Records.');
  }

  // 2. Personal Record Inspections
  if (!app.prevSchool) {
    detected.push('Missing information: Previous school attended is unrecorded.');
  }

  // 3. Stage-Specific Smart Checks
  if (app.stage === 'Interview' && (app.interviewScore === null || app.interviewScore === undefined)) {
    detected.push('Stage requirement unfulfilled: Student interview score has not been recorded.');
  }
  if (app.stage === 'Assessment' && (app.assessmentScore === null || app.assessmentScore === undefined)) {
    detected.push('Stage requirement unfulfilled: Entrance assessment score has not been recorded.');
  }
  if (app.stage === 'Verification' && !app.docsVerified) {
    detected.push('Audit requirement unfulfilled: Document verification audit check pending.');
  }

  return detected;
}

export function AdmissionsClient({ serverApplicants, tenantSlug }: { serverApplicants: Applicant[], tenantSlug: string }) {
  const [applicants, setApplicants] = useState<Applicant[]>(serverApplicants);
  const [selectedStage, setSelectedStage] = useState<string>('Application');
  const [showApproveModal, setShowApproveModal] = useState<Applicant | null>(null);
  const [approveComment, setApproveComment] = useState('');
  const [interviewScoreInput, setInterviewScoreInput] = useState<number | ''>(85);

  // Interview Schedule Modal state
  const [showScheduleModal, setShowScheduleModal] = useState<Applicant | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('Admissions Office, Main Campus');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Assessment Schedule & Subject Grading state
  const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState<Applicant | null>(null);
  const [scheduleAssessmentDate, setScheduleAssessmentDate] = useState('');
  const [scheduleAssessmentLocation, setScheduleAssessmentLocation] = useState('Computer Lab 2, Main Science Building');
  const [scheduleAssessmentNotes, setScheduleAssessmentNotes] = useState('');

  const [mathScoreInput, setMathScoreInput] = useState<number | ''>(88);
  const [englishScoreInput, setEnglishScoreInput] = useState<number | ''>(90);
  const [scienceScoreInput, setScienceScoreInput] = useState<number | ''>(85);

  // Enrollment Bursary Clearance state
  const [receiptNumberInput, setReceiptNumberInput] = useState('REC-2026-9812');
  const [paymentMethodInput, setPaymentMethodInput] = useState('Bank Transfer');
  // Bursary Payment Settings Modal state
  const [showBursarySettingsModal, setShowBursarySettingsModal] = useState(false);
  const [bursaryForm, setBursaryForm] = useState({
    bankName: 'Sierra Leone Commercial Bank (SLCB)',
    accountName: 'Albert Academy Admissions Account',
    accountNumber: '0030010928371',
    mobileProviders: 'Orange Money / Africell Afrimoney',
    merchantCode: '88912',
    mobileAccountName: 'Albert Academy Bursary',
    ussdCode: '*144*3*88912*5800#',
    cashBranch: 'SLCB Freetown Main Branch (Cash Desk 3)',
    tuitionFee: 4500,
    registrationFee: 500,
    techKitFee: 800,
    currency: 'SLE'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [selectedAuditApplicant, setSelectedAuditApplicant] = useState<Applicant | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<{ type: string; name: string; url: string } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<Applicant | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');

  const filteredApplicants = applicants.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.parentName.toLowerCase().includes(search.toLowerCase())
  );

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    nin: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sierra Leone',
    grade: 'Grade 7',
    prevSchool: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelation: 'Father',
    photo: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.parentName) return;

    setIsSubmitting(true);
    const formDataObj = new FormData();
    formDataObj.append('tenant', tenantSlug);
    formDataObj.append('first_name', formData.firstName);
    formDataObj.append('last_name', formData.lastName);
    formDataObj.append('dob', formData.dob);
    formDataObj.append('gender', formData.gender);
    formDataObj.append('blood_group', formData.bloodGroup);
    formDataObj.append('nin', formData.nin);
    formDataObj.append('email', formData.email);
    formDataObj.append('phone', formData.phone);
    formDataObj.append('address', formData.address);
    formDataObj.append('city', formData.city);
    formDataObj.append('target_grade', formData.grade);
    formDataObj.append('previous_school', formData.prevSchool);
    formDataObj.append('parent_name', formData.parentName);
    formDataObj.append('parent_phone', formData.parentPhone);
    formDataObj.append('parent_email', formData.parentEmail);
    formDataObj.append('parent_relation', formData.parentRelation);
    if (formData.photo) formDataObj.append('avatar_url', formData.photo);

    const res = await createApplicant(formDataObj);
    setIsSubmitting(false);

    if (res.success) {
      setShowCreateModal(false);
      setFormData({
        firstName: '', lastName: '', dob: '', gender: 'Male', bloodGroup: '', nin: '',
        email: '', phone: '', address: '', city: '', country: 'Nigeria', grade: 'Grade 7',
        prevSchool: '', parentName: '', parentPhone: '', parentEmail: '', parentRelation: 'Father', photo: ''
      });
      // The page will revalidate and we'll receive updated serverApplicants
    } else {
      alert(res.error);
    }
  };

  const nextStageMap: Record<string, string> = {
    'Application': 'Verification',
    'Verification': 'Interview',
    'Interview': 'Assessment',
    'Assessment': 'Acceptance',
    'Acceptance': 'Enrollment',
    'Enrollment': 'Allocation',
    'Allocation': 'Allocation', // Final
  };

  const handleProgress = async (appId: string) => {
    const app = applicants.find(a => a.id === appId);
    if (!app) return;

    const nextStage = nextStageMap[app.stage] as any;
    if (!nextStage || nextStage === app.stage) {
      setShowApproveModal(null);
      return;
    }

    setIsSubmitting(true);
    let scores: any = undefined;
    let finalComment = approveComment;

    if (app.stage === 'Interview') {
      scores = { interviewScore: Number(interviewScoreInput) || 85 };
      finalComment = `Interview Score: ${interviewScoreInput || 85}%. ${approveComment}`;
    } else if (app.stage === 'Assessment') {
      const m = Number(mathScoreInput) || 80;
      const e = Number(englishScoreInput) || 80;
      const s = Number(scienceScoreInput) || 80;
      const avg = Math.round((m + e + s) / 3);
      scores = {
        assessmentScore: avg,
        assessmentDetails: { mathScore: m, englishScore: e, scienceScore: s, overallScore: avg }
      };
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
        ...a,
        stage: nextStage,
        interviewScore: scores?.interviewScore || a.interviewScore,
        assessmentScore: scores?.assessmentScore || a.assessmentScore,
        assessmentDetails: scores?.assessmentDetails || a.assessmentDetails,
        comment: finalComment || a.comment
      } : a));
    } else {
      alert(res.error);
    }
  };

  // Sync state if serverApplicants changes (e.g. after revalidatePath)
  if (applicants !== serverApplicants) {
    setApplicants(serverApplicants);
  }

  return (
    <>
      <div className="space-y-6 max-w-[1600px] animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Admissions Workflow Desk</h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Progress applications chronologically through verification, interviews, assessments, and allocations.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-[hsl(var(--bg-tertiary))] p-1 rounded-lg border border-[hsl(var(--border))]">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
              >
                <Kanban className="w-4 h-4" /> Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
              >
                <List className="w-4 h-4" /> List
              </button>
            </div>
            <Link
              href={`/${tenantSlug}/admin/bursary`}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--accent)/0.15)] border border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))] text-sm font-semibold hover:bg-[hsl(var(--accent)/0.25)] transition-colors"
            >
              <DollarSign className="w-4 h-4" /> Bursary Dashboard
            </Link>
            <button
              onClick={() => setShowBursarySettingsModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-sm font-semibold hover:bg-[hsl(var(--border))] transition-colors"
            >
              ⚙️ Accounts Settings
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/apply`;
                navigator.clipboard.writeText(url);
                alert('Public Application Link copied to clipboard!\n\n' + url);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-sm font-semibold hover:bg-[hsl(var(--border))] transition-colors"
            >
              <Link2 className="w-4 h-4" /> Copy Public Link
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-4 h-4" /> New Application
            </button>
          </div>
        </div>


        {viewMode === 'kanban' ? (
          <>
            {/* Stage progression timeline cards */}

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {stagesList.map((stg) => {
                const count = applicants.filter(a => a.stage === stg.name).length;
                const isActive = selectedStage === stg.name;
                const Icon = stg.icon;
                return (
                  <div
                    key={stg.name}
                    onClick={() => setSelectedStage(stg.name)}
                    className={`rounded-xl border p-4 text-center cursor-pointer hover:scale-105 transition-all select-none ${isActive
                      ? 'bg-[hsl(var(--accent)/0.12)] border-[hsl(var(--accent))] shadow-md'
                      : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))]'
                      }`}
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

            {/* Applicants List in Current Stage */}
            <div className="glass-card">
              <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">
                  Stage: {selectedStage}
                </h3>
                <span className="text-xs text-[hsl(var(--text-tertiary))]">
                  {applicants.filter(a => a.stage === selectedStage).length} applicants currently active in this step
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
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">
                          No applicants in this stage currently. Select another stage above to review candidates.
                        </td>
                      </tr>
                    ) : (
                      applicants.filter(a => a.stage === selectedStage).map(app => (
                        <tr key={app.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {app.photoUrl ? (
                                <img src={app.photoUrl} alt={app.name} className="w-9 h-9 rounded-full object-cover border border-[hsl(var(--border))]" />
                              ) : (
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
                              {app.docsVerified ? 'Verified' : 'Pending Verification'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-xs space-y-1">
                              {selectedStage === 'Interview' && <p className="text-[hsl(var(--text-secondary))]">Interview Score: <span className="font-semibold text-[hsl(var(--text-primary))]">{app.interviewScore || 'Not graded'}</span></p>}
                              {selectedStage === 'Assessment' && <p className="text-[hsl(var(--text-secondary))]">Assessment Score: <span className="font-semibold text-[hsl(var(--text-primary))]">{app.assessmentScore || 'Not graded'}</span></p>}
                              {selectedStage !== 'Interview' && selectedStage !== 'Assessment' && <p className="text-[hsl(var(--text-tertiary))]">Compliant</p>}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] max-w-[250px] truncate" title={app.comment}>
                            {app.comment}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {app.stage === 'Interview' && (
                                <button
                                  onClick={() => {
                                    setShowScheduleModal(app);
                                    setScheduleDate(app.interviewDate || '');
                                    setScheduleLocation(app.interviewLocation || 'Admissions Office, Main Campus');
                                    setScheduleNotes(
                                      `Please ensure the candidate is accompanied by at least one parent/guardian. Kindly arrive 15 minutes prior to the scheduled time at the Admissions Office with the student's original birth certificate.`
                                    );
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-all text-xs font-semibold"
                                  title="Schedule Interview Date & Venue"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  {app.interviewDate ? 'Reschedule' : 'Schedule'}
                                </button>
                              )}
                              {app.stage === 'Assessment' && (
                                <button
                                  onClick={() => {
                                    setShowScheduleAssessmentModal(app);
                                    setScheduleAssessmentDate(app.assessmentDate || '');
                                    setScheduleAssessmentLocation(app.assessmentLocation || 'Computer Lab 2, Main Science Building');
                                    setScheduleAssessmentNotes(
                                      `Candidate must present reference code (APP-${app.id.substring(0, 8).toUpperCase()}). Please bring HB pencils, eraser, ruler, and arrive 20 minutes prior to exam start time.`
                                    );
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500 hover:text-white transition-all text-xs font-semibold"
                                  title="Schedule Entrance Assessment Exam Date & Center"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  {app.assessmentDate ? 'Reschedule' : 'Schedule Exam'}
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedAuditApplicant(app)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--border))] transition-all text-xs font-semibold"
                                title="Inspect application details & uploaded documents"
                              >
                                <Eye className="w-3.5 h-3.5" /> Inspect
                              </button>
                              {app.status === 'rejected' ? (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  Rejected
                                </span>
                              ) : selectedStage !== 'Allocation' ? (
                                <button
                                  onClick={() => {
                                    setShowApproveModal(app);
                                    setApproveComment('');
                                    setInterviewScoreInput(app.interviewScore || 85);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-semibold"
                                >
                                  Approve Step <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => alert(`Allocated & Enrolled ${app.name} to class successfully!`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-semibold"
                                >
                                  Complete Allocation &amp; Enroll <CheckCircle2 className="w-3.5 h-3.5" />
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
          <div className="space-y-6 animate-fade-in">
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
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">No applications found.</td>
                      </tr>
                    ) : (
                      applicants.map(app => (
                        <tr key={app.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {app.photoUrl ? (
                                <img src={app.photoUrl} alt={app.name} className="w-9 h-9 rounded-full object-cover border border-[hsl(var(--border))]" />
                              ) : (
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
                          <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {app.docsVerified ? 'Verified' : 'Pending'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${stagesList.find(s => s.name === app.stage)?.bg || 'bg-gray-500/10'
                              } ${stagesList.find(s => s.name === app.stage)?.color || 'text-gray-400'} border-current/20`}>
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
          </div>
        )}
      </div>

      {/* New Application Creation Modal with Detailed Profile Fields */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
          <div className="glass-card max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-between border-b border-[hsl(var(--border))] p-5 sm:p-6 bg-[hsl(var(--bg-secondary))] z-10">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Student Admission Application Form</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-6 flex-1">
              <form onSubmit={handleCreateApplicant} className="space-y-6">
                {/* Photo Upload Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))]">
                  <div className="relative w-24 h-24 rounded-full bg-[hsl(var(--bg-tertiary))] border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center overflow-hidden group">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-[hsl(var(--text-tertiary))] group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1 font-semibold">Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Upload Student Profile Picture</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Supports PNG, JPG, or JPEG formats. Max weight limit 2.0 MB.</p>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">1. Student Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="e.g. Sarah"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="e.g. Smith"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Gender *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                        placeholder="e.g. O+"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">National ID / NIN</label>
                      <input
                        type="text"
                        value={formData.nin}
                        onChange={(e) => setFormData(prev => ({ ...prev, nin: e.target.value }))}
                        placeholder="e.g. 120492019"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">2. Contact &amp; Residential Location</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Student Personal Email (optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. sarah.smith@mail.com"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Mobile Phone (optional)</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. +234 80 1234 5678"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Home Address *</label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="e.g. 12 Broad Street"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">City/State *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g. Lagos"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">3. Academic Profile</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Target Entry Grade *</label>
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                      >
                        <option>Grade 7</option>
                        <option>Grade 8</option>
                        <option>Grade 9</option>
                        <option>Grade 10</option>
                        <option>Grade 11</option>
                        <option>Grade 12</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Previous School Attended (optional)</label>
                      <input
                        type="text"
                        value={formData.prevSchool}
                        onChange={(e) => setFormData(prev => ({ ...prev, prevSchool: e.target.value }))}
                        placeholder="e.g. Kings College Lagos"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Parent Relationships */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">4. Parent / Legal Guardian Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Parent Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.parentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                        placeholder="e.g. Patricia Smith"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Parent Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.parentPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                        placeholder="e.g. +234 80 9876 5432"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Parent Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.parentEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                        placeholder="e.g. parent.smith@mail.com"
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Relationship Type *</label>
                      <select
                        value={formData.parentRelation}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentRelation: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                      >
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Legal Guardian</option>
                        <option>Sponsor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approve comment modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Approve Workflow Step</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Approve <strong>{showApproveModal.name}</strong> to progress from <strong>{showApproveModal.stage}</strong> to the next workflow stage.
            </p>

            {/* Interview Assessment Inputs */}
            {showApproveModal.stage === 'Interview' && (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" /> Interview Assessment &amp; Evaluation
                </h4>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">
                    Interview Evaluation Score (0 - 100%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={interviewScoreInput}
                    onChange={(e) => setInterviewScoreInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>
            )}

            {/* Entrance Exam Multi-Subject Grading Inputs */}
            {showApproveModal.stage === 'Assessment' && (
              <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" /> Entrance Exam Subject Scores &amp; Placement
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">
                    Aggregate: {Math.round(((Number(mathScoreInput) || 0) + (Number(englishScoreInput) || 0) + (Number(scienceScoreInput) || 0)) / 3)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Math (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={mathScoreInput}
                      onChange={(e) => setMathScoreInput(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">English (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={englishScoreInput}
                      onChange={(e) => setEnglishScoreInput(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Science (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scienceScoreInput}
                      onChange={(e) => setScienceScoreInput(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Enrollment Bursary Fee Clearance Inputs */}
            {showApproveModal.stage === 'Enrollment' && (
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Bursary Fee Settlement &amp; Clearance Verification
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Receipt / Ref Number *</label>
                    <input
                      type="text"
                      value={receiptNumberInput}
                      onChange={(e) => setReceiptNumberInput(e.target.value)}
                      placeholder="e.g. REC-2026-9812"
                      className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Payment Method</label>
                    <select
                      value={paymentMethodInput}
                      onChange={(e) => setPaymentMethodInput(e.target.value)}
                      className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))]"
                    >
                      <option value="Bank Transfer">Bank Transfer / Teller</option>
                      <option value="Mobile Money">Mobile Money Transfer</option>
                      <option value="Cash Deposit">Bank Cash Deposit</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))]">Workflow Comments / Feedback Notes</label>
              <textarea
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                placeholder="Enter approval details or assessment feedback..."
                className="w-full min-h-[80px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveModal(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProgress(showApproveModal.id)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-90"
              >
                {isSubmitting ? 'Approving...' : 'Confirm Approval & Grade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Inspection & Document Audit Modal */}
      {selectedAuditApplicant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-lg">
                  {selectedAuditApplicant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.name}</h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    Target Grade: <strong>{selectedAuditApplicant.grade}</strong> | Stage: <strong>{selectedAuditApplicant.stage}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditApplicant(null)}
                className="p-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rejection Alert */}
            {selectedAuditApplicant.status === 'rejected' && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Application Rejected
                </p>
                <p>Reason: {selectedAuditApplicant.rejectionReason || 'No reason specified.'}</p>
              </div>
            )}

            {/* Dynamic Stage-Specific Inspection Header Banner */}
            <div className="p-4 rounded-xl bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-[hsl(var(--accent))] uppercase tracking-wider">
                  Step {stagesList.findIndex(s => s.name === selectedAuditApplicant.stage) + 1} Audit Focus
                </span>
                <h4 className="text-sm font-bold text-[hsl(var(--text-primary))]">
                  {selectedAuditApplicant.stage === 'Application' && 'Initial Registration Profile & Parent Contact Details'}
                  {selectedAuditApplicant.stage === 'Verification' && 'Supporting Document Authenticity & Verification Audit'}
                  {selectedAuditApplicant.stage === 'Interview' && 'Interview Date Scheduling & Candidate Performance'}
                  {selectedAuditApplicant.stage === 'Assessment' && 'Placement Skill Exam & Evaluation Grading'}
                  {selectedAuditApplicant.stage === 'Acceptance' && 'Admission Offer Generation & Letter Clearance'}
                  {selectedAuditApplicant.stage === 'Enrollment' && 'Financial Clearance & Admission Fee Settlement'}
                  {selectedAuditApplicant.stage === 'Allocation' && 'Final Class Arm Section & Active Student Roster'}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]">
                {selectedAuditApplicant.stage} Stage
              </span>
            </div>

            {/* STAGE 2: VERIFICATION PANEL */}
            {selectedAuditApplicant.stage === 'Verification' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Document Verification Center
                  </h4>
                  <button
                    onClick={async () => {
                      const newStatus = !selectedAuditApplicant.docsVerified;
                      setIsSubmitting(true);
                      const res = await toggleApplicantDocsVerified(tenantSlug, selectedAuditApplicant.id, newStatus);
                      setIsSubmitting(false);
                      if (res.success) {
                        setSelectedAuditApplicant({ ...selectedAuditApplicant, docsVerified: newStatus });
                        setApplicants(prev => prev.map(a => a.id === selectedAuditApplicant.id ? { ...a, docsVerified: newStatus } : a));
                      } else {
                        alert(res.error || 'Failed to update verification');
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${selectedAuditApplicant.docsVerified
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                      }`}
                  >
                    {selectedAuditApplicant.docsVerified ? '✓ Verified (Click to Revoke)' : 'Mark Documents Verified'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(!selectedAuditApplicant.documents || selectedAuditApplicant.documents.length === 0) ? (
                    <p className="text-xs text-[hsl(var(--text-tertiary))] col-span-3 text-center py-2">
                      No documents uploaded yet.
                    </p>
                  ) : (
                    selectedAuditApplicant.documents.map((doc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-2">
                        <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{doc.type}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">{doc.name}</p>
                        {doc.url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewingDoc(doc)}
                            className="w-full py-1 rounded-lg bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-xs font-semibold hover:bg-[hsl(var(--accent))] hover:text-white transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-semibold block text-center">Missing File</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* STAGE 3: INTERVIEW PANEL */}
            {selectedAuditApplicant.stage === 'Interview' && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Interview Schedule &amp; Evaluation
                  </h4>
                  <button
                    onClick={() => {
                      setShowScheduleModal(selectedAuditApplicant);
                      setScheduleDate(selectedAuditApplicant.interviewDate || '');
                      setScheduleLocation(selectedAuditApplicant.interviewLocation || 'Admissions Office, Main Campus');
                      setScheduleNotes(
                        `Please ensure the candidate is accompanied by at least one parent/guardian. Kindly arrive 15 minutes prior to the scheduled time at the Admissions Office with the student's original birth certificate.`
                      );
                    }}
                    className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedAuditApplicant.interviewDate ? 'Reschedule Interview' : 'Schedule Interview'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Scheduled Date &amp; Time</span>
                    <p className="font-bold text-[hsl(var(--text-primary))] mt-0.5">
                      {selectedAuditApplicant.interviewDate
                        ? new Date(selectedAuditApplicant.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                        : 'Not Scheduled Yet'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Interview Score</span>
                    <p className="font-bold text-[hsl(var(--accent))] text-sm mt-0.5">
                      {selectedAuditApplicant.interviewScore !== null && selectedAuditApplicant.interviewScore !== undefined
                        ? `${selectedAuditApplicant.interviewScore}%`
                        : 'Pending Evaluation'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: ASSESSMENT PANEL */}
            {selectedAuditApplicant.stage === 'Assessment' && (
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Entrance Exam &amp; Placement Skill Evaluation
                  </h4>
                  <button
                    onClick={() => {
                      setShowScheduleAssessmentModal(selectedAuditApplicant);
                      setScheduleAssessmentDate(selectedAuditApplicant.assessmentDate || '');
                      setScheduleAssessmentLocation(selectedAuditApplicant.assessmentLocation || 'Computer Lab 2, Main Science Building');
                      setScheduleAssessmentNotes(
                        `Candidate must present reference code (APP-${selectedAuditApplicant.id.substring(0, 8).toUpperCase()}). Please bring HB pencils, eraser, ruler, and arrive 20 minutes prior to exam start time.`
                      );
                    }}
                    className="px-3 py-1 rounded-lg bg-pink-600 text-white text-xs font-bold hover:bg-pink-700 transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedAuditApplicant.assessmentDate ? 'Reschedule Exam' : 'Schedule Exam'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Scheduled Exam Date</span>
                    <p className="font-bold text-[hsl(var(--text-primary))] mt-0.5">
                      {selectedAuditApplicant.assessmentDate
                        ? new Date(selectedAuditApplicant.assessmentDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                        : 'Exam Not Scheduled Yet'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Exam Venue / Center</span>
                    <p className="font-bold text-[hsl(var(--text-primary))] mt-0.5">
                      {selectedAuditApplicant.assessmentLocation || 'Computer Lab 2, Main Campus'}
                    </p>
                  </div>
                </div>

                {/* Score Breakdown if recorded */}
                {selectedAuditApplicant.assessmentDetails && (
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-2">
                    <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">Recorded Subject Performance</span>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-1.5 rounded bg-[hsl(var(--bg-primary))]">
                        <span className="text-[9px] text-[hsl(var(--text-tertiary))] block">Math</span>
                        <span className="font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.assessmentDetails.mathScore}%</span>
                      </div>
                      <div className="p-1.5 rounded bg-[hsl(var(--bg-primary))]">
                        <span className="text-[9px] text-[hsl(var(--text-tertiary))] block">English</span>
                        <span className="font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.assessmentDetails.englishScore}%</span>
                      </div>
                      <div className="p-1.5 rounded bg-[hsl(var(--bg-primary))]">
                        <span className="text-[9px] text-[hsl(var(--text-tertiary))] block">Science</span>
                        <span className="font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.assessmentDetails.scienceScore}%</span>
                      </div>
                      <div className="p-1.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                        <span className="text-[9px] block">Overall</span>
                        <span>{selectedAuditApplicant.assessmentDetails.overallScore}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 5: ACCEPTANCE PANEL */}
            {selectedAuditApplicant.stage === 'Acceptance' && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" /> Admission Offer Status &amp; Parent Acceptance Audit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Parent Offer Status</span>
                    <p className="font-bold text-emerald-400 text-sm mt-0.5">
                      {selectedAuditApplicant.offerAccepted ? '✓ Formally Accepted' : 'Offer Dispatched (Awaiting Acceptance)'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Digital Signature</span>
                    <p className="font-bold text-[hsl(var(--text-primary))] font-mono mt-0.5">
                      {selectedAuditApplicant.parentSignature || 'Pending Signature'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 6: ENROLLMENT PANEL */}
            {selectedAuditApplicant.stage === 'Enrollment' && (
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Bursary Financial Clearance Center
                  </h4>
                  <button
                    onClick={async () => {
                      const newStatus = !selectedAuditApplicant.paymentCleared;
                      setIsSubmitting(true);
                      const res = await toggleApplicantFeeCleared(tenantSlug, selectedAuditApplicant.id, newStatus, 'REC-2026-9812', 'Bank Transfer');
                      setIsSubmitting(false);
                      if (res.success) {
                        setSelectedAuditApplicant({ ...selectedAuditApplicant, paymentCleared: newStatus, receiptNumber: 'REC-2026-9812', paymentMethod: 'Bank Transfer' });
                        setApplicants(prev => prev.map(a => a.id === selectedAuditApplicant.id ? { ...a, paymentCleared: newStatus, receiptNumber: 'REC-2026-9812', paymentMethod: 'Bank Transfer' } : a));
                      } else {
                        alert(res.error || 'Failed to update clearance');
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${selectedAuditApplicant.paymentCleared
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30'
                      }`}
                  >
                    {selectedAuditApplicant.paymentCleared ? '✓ Financial Cleared (Click to Revoke)' : 'Mark Financial Clearance Approved'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Bursary Status</span>
                    <p className="font-bold text-cyan-300 text-sm mt-0.5">
                      {selectedAuditApplicant.paymentCleared ? '✓ Cleared' : 'Pending Fee Settlement'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Transaction Ref / Phone</span>
                    <p className="font-bold text-[hsl(var(--text-primary))] font-mono text-xs mt-0.5">
                      {selectedAuditApplicant.transactionId || selectedAuditApplicant.receiptNumber || 'N/A'}
                    </p>
                    {selectedAuditApplicant.paymentPhone && (
                      <p className="text-[10px] text-[hsl(var(--text-secondary))] font-mono">📱 {selectedAuditApplicant.paymentPhone}</p>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase block">Proof of Payment Receipt</span>
                    {selectedAuditApplicant.paymentReceiptUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewingDoc({ type: 'Payment Receipt Slip', name: 'receipt.png', url: selectedAuditApplicant.paymentReceiptUrl! })}
                        className="mt-1 px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview Receipt Slip
                      </button>
                    ) : (
                      <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-1">No receipt uploaded yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] text-xs space-y-1">
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold">Date of Birth</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.dob}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold">Gender</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.gender || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold">Parent / Guardian</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.parentName}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold">Applied Date</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.appliedDate}</p>
              </div>
              {selectedAuditApplicant.address && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold">Address</span>
                  <p className="font-bold text-[hsl(var(--text-primary))]">{selectedAuditApplicant.address}</p>
                </div>
              )}
            </div>

            {/* Submitted Documents Audit Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> Submitted Supporting Documents
              </h4>

              {(!selectedAuditApplicant.documents || selectedAuditApplicant.documents.length === 0) ? (
                <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] text-center text-xs text-[hsl(var(--text-tertiary))]">
                  No uploaded document files recorded for this applicant.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAuditApplicant.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{doc.type}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate max-w-[150px]">{doc.name}</p>
                      </div>
                      {doc.url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewingDoc(doc)}
                          className="px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-xs font-semibold hover:bg-[hsl(var(--accent))] hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview File
                        </button>
                      ) : (
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))]">No File</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => {
                  setShowRejectModal(selectedAuditApplicant);
                  setRejectionReasonInput('');
                }}
                className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" /> Reject / Request Correction
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAuditApplicant(null)}
                  className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const app = selectedAuditApplicant;
                    setSelectedAuditApplicant(null);
                    setShowApproveModal(app);
                    setApproveComment('');
                  }}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
                >
                  Approve Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Reject Application / Request Info
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Specify the reason for rejecting <strong>{showRejectModal.name}</strong>'s application. This reason will be displayed on the parent's live tracking page.
            </p>
            {/* Smart Detected Missing Requirements */}
            {(() => {
              const smartDetected = getSmartDetectedMissingRequirements(showRejectModal);
              if (smartDetected.length === 0) return null;
              return (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 space-y-2">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    ✨ Smart Detected Missing Requirements ({smartDetected.length})
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {smartDetected.map((text, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (rejectionReasonInput) {
                            setRejectionReasonInput((prev) => `${prev}\n• ${text}`);
                          } else {
                            setRejectionReasonInput(`• ${text}`);
                          }
                        }}
                        className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all font-medium flex items-center justify-between gap-2 group"
                      >
                        <span>• {text}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-400 group-hover:underline shrink-0">+ Add</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Stage Standard Presets */}
            {STAGE_REJECTION_PRESETS[showRejectModal.stage] && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
                  Quick Presets for {showRejectModal.stage} Stage (Click to use):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STAGE_REJECTION_PRESETS[showRejectModal.stage].map((presetText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReasonInput(presetText)}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:border-rose-400/50 hover:bg-rose-500/10 transition-all font-medium"
                    >
                      • {presetText}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))]">Rejection Reason / Required Correction *</label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Select a preset above or type a custom reason..."
                className="w-full min-h-[90px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!rejectionReasonInput.trim()) return;
                  setIsSubmitting(true);
                  const res = await rejectApplicant(tenantSlug, showRejectModal.id, rejectionReasonInput.trim());
                  setIsSubmitting(false);
                  if (res.success) {
                    setApplicants(prev => prev.map(a => a.id === showRejectModal.id ? { ...a, status: 'rejected', rejectionReason: rejectionReasonInput.trim() } : a));
                    setShowRejectModal(null);
                    setSelectedAuditApplicant(null);
                  } else {
                    alert(res.error || 'Failed to reject applicant');
                  }
                }}
                disabled={isSubmitting || !rejectionReasonInput.trim()}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* In-App Document Preview Lightbox Modal */}
      {previewingDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="glass-card max-w-4xl w-full max-h-[92vh] flex flex-col p-6 space-y-4 overflow-hidden border border-[hsl(var(--border))]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">{previewingDoc.type}</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{previewingDoc.name || 'Document File'}</p>
              </div>
              <div className="flex items-center gap-2">
                {previewingDoc.url && (
                  <a
                    href={previewingDoc.url}
                    download={previewingDoc.name || `${previewingDoc.type}.png`}
                    className="px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-xs font-semibold hover:bg-[hsl(var(--accent))] hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 rotate-180" /> Download
                  </a>
                )}
                <button
                  onClick={() => setPreviewingDoc(null)}
                  className="p-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Viewer Body */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/40 rounded-xl p-4 min-h-[300px]">
              {previewingDoc.url ? (
                previewingDoc.url.startsWith('data:application/pdf') || previewingDoc.name?.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={previewingDoc.url}
                    className="w-full h-[70vh] rounded-lg border border-[hsl(var(--border))]"
                    title={previewingDoc.name}
                  />
                ) : (
                  <img
                    src={previewingDoc.url}
                    alt={previewingDoc.name}
                    className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
                  />
                )
              ) : (
                <p className="text-sm text-[hsl(var(--text-tertiary))]">No file content available.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> Schedule Student &amp; Parent Interview
              </h3>
              <button onClick={() => setShowScheduleModal(null)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Set the interview date and location for <strong>{showScheduleModal.name}</strong>. Parent (<strong>{showScheduleModal.parentName}</strong>) will be notified on their status page.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1">Interview Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1">Venue / Meeting Location *</label>
                <input
                  type="text"
                  value={scheduleLocation}
                  onChange={(e) => setScheduleLocation(e.target.value)}
                  placeholder="e.g. Admissions Office, Main Campus or Google Meet Link"
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))]">Auto-Generated Notes &amp; Instructions for Parent</label>
                  <span className="text-[10px] text-purple-400 font-medium">Auto-Generated</span>
                </div>

                {/* Quick Preset Sentences Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setScheduleNotes(prev => prev ? `${prev} Please ensure candidate is accompanied by at least one parent or legal guardian.` : 'Please ensure candidate is accompanied by at least one parent or legal guardian.')}
                    className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] hover:bg-purple-500/20"
                  >
                    + Parent Escort
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleNotes(prev => prev ? `${prev} Kindly bring original birth certificate and previous school report cards.` : 'Kindly bring original birth certificate and previous school report cards.')}
                    className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] hover:bg-purple-500/20"
                  >
                    + Original Documents
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleNotes(prev => prev ? `${prev} Arrive 15 minutes prior to your slot.` : 'Arrive 15 minutes prior to your slot.')}
                    className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] hover:bg-purple-500/20"
                  >
                    + Early Arrival
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleNotes(prev => prev ? `${prev} Join the virtual meeting link 5 minutes before your time slot.` : 'Join the virtual meeting link 5 minutes before your time slot.')}
                    className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] hover:bg-purple-500/20"
                  >
                    + Virtual Link Notice
                  </button>
                </div>

                <textarea
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Please bring original birth certificate copies..."
                  className="w-full min-h-[85px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setShowScheduleModal(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!scheduleDate) {
                    alert('Please select an interview date and time.');
                    return;
                  }
                  setIsSubmitting(true);
                  const res = await scheduleApplicantInterview(tenantSlug, showScheduleModal.id, scheduleDate, scheduleLocation, scheduleNotes);
                  setIsSubmitting(false);

                  if (res.success) {
                    setApplicants(prev => prev.map(a => a.id === showScheduleModal.id ? { ...a, interviewDate: scheduleDate, interviewLocation: scheduleLocation } : a));
                    setShowScheduleModal(null);
                    alert(`Interview scheduled successfully! Parent notification dispatched.`);
                  } else {
                    alert(res.error || 'Failed to schedule interview');
                  }
                }}
                disabled={isSubmitting || !scheduleDate}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Scheduling...' : 'Confirm Schedule & Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Schedule Assessment Exam Modal */}
      {showScheduleAssessmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-400" /> Schedule Entrance Assessment Exam
              </h3>
              <button onClick={() => setShowScheduleAssessmentModal(null)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Set the entrance assessment date and exam center for <strong>{showScheduleAssessmentModal.name}</strong>. Parent (<strong>{showScheduleAssessmentModal.parentName}</strong>) will be notified on their status page.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1">Exam Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  value={scheduleAssessmentDate}
                  onChange={(e) => setScheduleAssessmentDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1">Exam Center / Venue *</label>
                <input
                  type="text"
                  value={scheduleAssessmentLocation}
                  onChange={(e) => setScheduleAssessmentLocation(e.target.value)}
                  placeholder="e.g. Computer Lab 2, Science Complex or Online Link"
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))]">Auto-Generated Candidate Instructions</label>
                  <span className="text-[10px] text-pink-400 font-medium">Auto-Generated</span>
                </div>

                {/* Quick Preset Sentences Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setScheduleAssessmentNotes(prev => prev ? `${prev} Please bring 2B/HB pencils, eraser, ruler, and a sharpener.` : 'Please bring 2B/HB pencils, eraser, ruler, and a sharpener.')}
                    className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[10px] hover:bg-pink-500/20"
                  >
                    + Exam Materials
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleAssessmentNotes(prev => prev ? `${prev} Candidate must present official reference code (APP-${showScheduleAssessmentModal.id.substring(0, 8).toUpperCase()}) upon entry.` : `Candidate must present official reference code (APP-${showScheduleAssessmentModal.id.substring(0, 8).toUpperCase()}) upon entry.`)}
                    className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[10px] hover:bg-pink-500/20"
                  >
                    + Reference Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleAssessmentNotes(prev => prev ? `${prev} Candidates will be seated 20 minutes prior to exam start time.` : 'Candidates will be seated 20 minutes prior to exam start time.')}
                    className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[10px] hover:bg-pink-500/20"
                  >
                    + Seating Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleAssessmentNotes(prev => prev ? `${prev} Scientific calculators are permitted for the Mathematics section.` : 'Scientific calculators are permitted for the Mathematics section.')}
                    className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[10px] hover:bg-pink-500/20"
                  >
                    + Calculator Rule
                  </button>
                </div>

                <textarea
                  value={scheduleAssessmentNotes}
                  onChange={(e) => setScheduleAssessmentNotes(e.target.value)}
                  placeholder="e.g. Bring HB pencils, eraser, and application reference code..."
                  className="w-full min-h-[85px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setShowScheduleAssessmentModal(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!scheduleAssessmentDate) {
                    alert('Please select an exam date and time.');
                    return;
                  }
                  setIsSubmitting(true);
                  const res = await scheduleApplicantAssessment(tenantSlug, showScheduleAssessmentModal.id, scheduleAssessmentDate, scheduleAssessmentLocation, scheduleAssessmentNotes);
                  setIsSubmitting(false);

                  if (res.success) {
                    setApplicants(prev => prev.map(a => a.id === showScheduleAssessmentModal.id ? { ...a, assessmentDate: scheduleAssessmentDate, assessmentLocation: scheduleAssessmentLocation } : a));
                    setShowScheduleAssessmentModal(null);
                    alert(`Entrance Exam scheduled successfully! Parent status page updated.`);
                  } else {
                    alert(res.error || 'Failed to schedule exam');
                  }
                }}
                disabled={isSubmitting || !scheduleAssessmentDate}
                className="px-4 py-2 rounded-lg bg-pink-600 text-white text-xs font-bold hover:bg-pink-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Scheduling...' : 'Confirm Schedule & Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bursary Payment Accounts & Deposit Configuration Modal */}
      {showBursarySettingsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-[hsl(var(--border))] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[hsl(var(--accent))]" /> Configure Bursary Payment Accounts &amp; Deposit Details
              </h3>
              <button onClick={() => setShowBursarySettingsModal(false)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Configure your institution&apos;s custom bank accounts, mobile money merchant codes, cash deposit locations, and fee schedule. These details will be dynamically rendered on the parent application status portal.
            </p>

            <div className="space-y-4 text-xs">
              {/* Bank Accounts Section */}
              <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-3">
                <h4 className="font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  🏛️ Bank Transfer Account Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bursaryForm.bankName}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, bankName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bursaryForm.accountNumber}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, accountNumber: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Account Name / Title</label>
                    <input
                      type="text"
                      value={bursaryForm.accountName}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, accountName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Money Section */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-3">
                <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  📱 Mobile Money Merchant Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Mobile Providers</label>
                    <input
                      type="text"
                      value={bursaryForm.mobileProviders}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, mobileProviders: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Merchant Code / Till ID</label>
                    <input
                      type="text"
                      value={bursaryForm.merchantCode}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, merchantCode: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-cyan-300"
                    />
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Mobile Account Name</label>
                      <input
                        type="text"
                        value={bursaryForm.mobileAccountName}
                        onChange={(e) => setBursaryForm({ ...bursaryForm, mobileAccountName: e.target.value })}
                        className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">USSD Quick Dial Code (*144*3*88912*5800#)</label>
                      <input
                        type="text"
                        value={bursaryForm.ussdCode}
                        onChange={(e) => setBursaryForm({ ...bursaryForm, ussdCode: e.target.value })}
                        placeholder="e.g. *144*3*88912*5800#"
                        className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash Deposit Branch */}
              <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-2">
                <h4 className="font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  🏢 Bank Cash Desk Location
                </h4>
                <input
                  type="text"
                  value={bursaryForm.cashBranch}
                  onChange={(e) => setBursaryForm({ ...bursaryForm, cashBranch: e.target.value })}
                  placeholder="e.g. SLCB Freetown Main Branch (Cash Desk 3)"
                  className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                />
              </div>

              {/* Fee Schedule Amounts */}
              <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-3">
                <h4 className="font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  💰 Fee Schedule Amounts ({bursaryForm.currency})
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Tuition Fee</label>
                    <input
                      type="number"
                      value={bursaryForm.tuitionFee}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, tuitionFee: Number(e.target.value) })}
                      className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Registration Fee</label>
                    <input
                      type="number"
                      value={bursaryForm.registrationFee}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, registrationFee: Number(e.target.value) })}
                      className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Tech Kit Fee</label>
                    <input
                      type="number"
                      value={bursaryForm.techKitFee}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, techKitFee: Number(e.target.value) })}
                      className="w-full h-9 px-2 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setShowBursarySettingsModal(false)}
                disabled={isSavingSettings}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsSavingSettings(true);
                  const res = await updateTenantBursarySettings(tenantSlug, bursaryForm);
                  setIsSavingSettings(false);
                  if (res.success) {
                    setShowBursarySettingsModal(false);
                    alert('Bursary Payment Accounts & Deposit Details updated successfully!');
                  } else {
                    alert(res.error || 'Failed to update bursary settings');
                  }
                }}
                disabled={isSavingSettings}
                className="px-5 py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white font-bold text-xs hover:bg-[hsl(var(--accent-hover))] transition-colors disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving Settings...' : 'Save Bursary Account Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
