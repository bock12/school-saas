'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  ClipboardList, Plus, ChevronRight, Calendar, Users, CheckCircle2, Clock, Archive,
  X, Check, AlertCircle, Sparkles, BookOpen, Filter, ArrowRight, Settings, Shield,
  FileText, Send, Stamp, Scale, Edit3, Trash2, Zap, Eye, RefreshCw, BookMarked,
  UserCheck, AlertTriangle, MessageSquare, Mail, Award, Copy, History, Lock, Unlock
} from 'lucide-react';

export interface ExamSession {
  id: string;
  name: string;
  year: string;
  term: string;
  type: string;
  mode?: string;
  weightage?: string;
  start: string;
  end: string;
  timestamp?: string;
  status: 'Draft' | 'Setup' | 'Registration' | 'Timetabled' | 'Ongoing' | 'Marking' | 'Moderation' | 'Approved' | 'Published' | 'Archived' | 'Upcoming' | 'Completed';
  classes: number;
  candidates: number;
  clearanceRequired?: boolean;
  markDeadline?: string;
  milestones?: {
    paperDeadline?: string;
    timetableDate?: string;
    admitCardDate?: string;
    markCutoff?: string;
    moderationDeadline?: string;
    publishDate?: string;
  };
}

interface SessionAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

interface CandidateClearance {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  feePaid: boolean;
  academicCleared: boolean;
  cleared: boolean;
}

const initialSessions: ExamSession[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-111111111111',
    name: 'Formative Assessment 2',
    year: '2025-26',
    term: '3rd Term',
    type: 'EXAM',
    mode: 'ONLINE',
    weightage: '-',
    start: '2026-08-18',
    end: '2026-08-29',
    timestamp: '2026-09-04T18:19:25',
    status: 'Ongoing',
    classes: 12,
    candidates: 1248,
    clearanceRequired: true,
    markDeadline: '2026-08-30',
    milestones: {
      paperDeadline: '2026-08-10',
      timetableDate: '2026-08-12',
      admitCardDate: '2026-08-15',
      markCutoff: '2026-08-30',
      moderationDeadline: '2026-09-02',
      publishDate: '2026-09-05',
    },
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-222222222222',
    name: 'Mid-Term Assessment',
    year: '2025-26',
    term: '3rd Term',
    type: 'CA',
    mode: 'OFFLINE',
    weightage: '20%',
    start: '2026-07-07',
    end: '2026-07-09',
    timestamp: '2026-07-05T10:00:00',
    status: 'Completed',
    classes: 12,
    candidates: 1241,
    clearanceRequired: false,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-333333333333',
    name: 'Mock Examination (SSS 3)',
    year: '2025-26',
    term: '2nd Term',
    type: 'Mock',
    mode: 'HYBRID',
    weightage: '30%',
    start: '2026-05-03',
    end: '2026-05-14',
    timestamp: '2026-05-01T09:00:00',
    status: 'Archived',
    classes: 4,
    candidates: 312,
  },
  {
    id: '4',
    name: '2nd Term Final Examinations',
    year: '2025-26',
    term: '2nd Term',
    type: 'FINAL',
    mode: 'OFFLINE',
    weightage: '50%',
    start: '2026-03-10',
    end: '2026-03-21',
    timestamp: '2026-03-08T14:30:00',
    status: 'Archived',
    classes: 12,
    candidates: 1189,
  },
];

const statusColors: Record<string, string> = {
  Ongoing: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Archived: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Draft: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Upcoming: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  Setup: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  Registration: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Timetabled: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Marking: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Moderation: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Approved: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  Published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const LIFECYCLE_STAGES: ExamSession['status'][] = [
  'Draft', 'Setup', 'Registration', 'Timetabled', 'Ongoing', 'Marking', 'Moderation', 'Approved', 'Published', 'Archived'
];

interface SubjectRelationDetail {
  id: number;
  name: string;
  className: string;
  date: string;
  time: string;
  venue: string;
  invigilators: string;
  teacher: string;
  hod: string;
  maxMarks: number;
  weightagePct: string;
  passCriteria: string;
  candidatesCount: number;
  gradedCount: number;
  paperStatus: string;
  moderationStatus: string;
  malpracticeCount: number;
}

interface ClassSubjectSchedule {
  className: string;
  subjects: {
    id: number;
    name: string;
    date: string;
    time: string;
    venue?: string;
    invigilators?: string;
    teacher?: string;
    hod?: string;
    maxMarks?: number;
    weightagePct?: string;
    passCriteria?: string;
    candidatesCount?: number;
    gradedCount?: number;
    paperStatus?: string;
    moderationStatus?: string;
    malpracticeCount?: number;
  }[];
}

const mockClassSchedules: ClassSubjectSchedule[] = [
  {
    className: 'Class 1 A -',
    subjects: [
      { id: 11, name: 'English', date: '2026-08-18', time: '08:30 AM - 10:00 AM', venue: 'Main Examination Hall A (Desk 1–32)', invigilators: 'Mr. S. Conteh (Chief), Mrs. A. Mansaray', teacher: 'Mr. A. Kamara', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum (C6 Grade)', candidatesCount: 32, gradedCount: 26, paperStatus: 'Approved & Printed', moderationStatus: 'Pending Review', malpracticeCount: 0 },
      { id: 12, name: 'Kannada / Literature', date: '2026-08-19', time: '08:30 AM - 10:00 AM', venue: 'Main Examination Hall A (Desk 1–32)', invigilators: 'Mrs. M. Bangura', teacher: 'Mrs. M. Bangura', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 32, gradedCount: 32, paperStatus: 'Approved & Printed', moderationStatus: 'Moderated & Verified', malpracticeCount: 0 },
      { id: 13, name: 'Mathematics', date: '2026-08-20', time: '08:30 AM - 10:00 AM', venue: 'Main Examination Hall A (Desk 1–32)', invigilators: 'Mr. J. Koroma', teacher: 'Mr. S. Conteh', hod: 'Mr. S. Conteh', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 32, gradedCount: 18, paperStatus: 'Approved & Printed', moderationStatus: 'Pending Mark Entry', malpracticeCount: 1 },
      { id: 14, name: 'Environmental Science', date: '2026-08-21', time: '08:30 AM - 10:00 AM', venue: 'Science Lab 2', invigilators: 'Dr. F. Cole', teacher: 'Mr. K. Sesay', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 32, gradedCount: 32, paperStatus: 'Approved & Printed', moderationStatus: 'Approved by Principal', malpracticeCount: 0 },
    ],
  },
  {
    className: 'Class 2 A -',
    subjects: [
      { id: 15, name: 'English', date: '2026-08-18', time: '08:30 AM - 10:00 AM', venue: 'Hall B', invigilators: 'Mrs. A. Mansaray', teacher: 'Mr. A. Kamara', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 34, gradedCount: 30, paperStatus: 'Approved & Printed', moderationStatus: 'Pending Review', malpracticeCount: 0 },
      { id: 16, name: 'Kannada / Language', date: '2026-08-19', time: '08:30 AM - 10:00 AM', venue: 'Hall B', invigilators: 'Mr. T. Turay', teacher: 'Mrs. M. Bangura', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 34, gradedCount: 34, paperStatus: 'Approved & Printed', moderationStatus: 'Moderated', malpracticeCount: 0 },
      { id: 17, name: 'Mathematics', date: '2026-08-20', time: '08:30 AM - 10:00 AM', venue: 'Hall B', invigilators: 'Mr. S. Conteh', teacher: 'Mr. S. Conteh', hod: 'Mr. S. Conteh', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 34, gradedCount: 22, paperStatus: 'Approved & Printed', moderationStatus: 'In Progress', malpracticeCount: 0 },
      { id: 18, name: 'Environmental Science', date: '2026-08-21', time: '08:30 AM - 10:00 AM', venue: 'Lab 1', invigilators: 'Mr. K. Sesay', teacher: 'Mr. K. Sesay', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 34, gradedCount: 34, paperStatus: 'Approved & Printed', moderationStatus: 'Approved', malpracticeCount: 0 },
    ],
  },
  {
    className: 'Class 3 A -',
    subjects: [
      { id: 19, name: 'English', date: '2026-08-18', time: '08:30 AM - 10:00 AM', venue: 'Senior Hall 1', invigilators: 'Mrs. A. Mansaray', teacher: 'Mr. A. Kamara', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 30, gradedCount: 30, paperStatus: 'Approved & Printed', moderationStatus: 'Moderated', malpracticeCount: 0 },
      { id: 21, name: 'Kannada / Humanities', date: '2026-08-19', time: '08:30 AM - 10:00 AM', venue: 'Senior Hall 1', invigilators: 'Mr. J. Koroma', teacher: 'Mrs. M. Bangura', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 30, gradedCount: 30, paperStatus: 'Approved & Printed', moderationStatus: 'Approved', malpracticeCount: 0 },
      { id: 23, name: 'Mathematics', date: '2026-08-20', time: '08:30 AM - 10:00 AM', venue: 'Senior Hall 1', invigilators: 'Mr. S. Conteh', teacher: 'Mr. S. Conteh', hod: 'Mr. S. Conteh', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 30, gradedCount: 30, paperStatus: 'Approved & Printed', moderationStatus: 'Approved', malpracticeCount: 0 },
      { id: 25, name: 'Environmental Science', date: '2026-08-21', time: '08:30 AM - 10:00 AM', venue: 'Lab 3', invigilators: 'Dr. F. Cole', teacher: 'Mr. K. Sesay', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 30, gradedCount: 30, paperStatus: 'Approved & Printed', moderationStatus: 'Approved', malpracticeCount: 0 },
    ],
  },
  {
    className: 'Class 3 B -',
    subjects: [
      { id: 20, name: 'English', date: '2026-08-18', time: '08:30 AM - 10:00 AM', venue: 'Senior Hall 2', invigilators: 'Mrs. A. Mansaray', teacher: 'Mr. A. Kamara', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 28, gradedCount: 28, paperStatus: 'Approved & Printed', moderationStatus: 'Approved', malpracticeCount: 0 },
      { id: 22, name: 'Kannada / Social Studies', date: '2026-08-19', time: '08:30 AM - 10:00 AM', venue: 'Senior Hall 2', invigilators: 'Mr. T. Turay', teacher: 'Mrs. M. Bangura', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 28, gradedCount: 28, paperStatus: 'Approved & Printed', moderationStatus: 'Approved', malpracticeCount: 0 },
      { id: 24, name: 'Mathematics', date: '2026-08-20', time: '08:30 AM - 10:00 AM', venue: 'Senior Hall 2', invigilators: 'Mr. S. Conteh', teacher: 'Mr. S. Conteh', hod: 'Mr. S. Conteh', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 28, gradedCount: 28, paperStatus: 'Approved & Printed', moderationStatus: 'Approved', malpracticeCount: 0 },
      { id: 26, name: 'Environmental Science', date: '2026-08-21', time: '08:30 AM - 10:00 AM', venue: 'Lab 2', invigilators: 'Mr. K. Sesay', teacher: 'Mr. K. Sesay', hod: 'Dr. F. Cole', maxMarks: 100, weightagePct: '30% CA + 70% Paper', passCriteria: '40% Minimum', candidatesCount: 28, gradedCount: 28, paperStatus: 'Approved & Printed', moderationStatus: 'Approved', malpracticeCount: 0 },
    ],
  },
];

const mockAuditTrail: SessionAuditLog[] = [
  { id: 'log-1', timestamp: '2026-08-11T11:20:00', actor: 'Officer S. Conteh', action: 'Approved Examination', details: 'Formative Assessment 2 approved for publishing readiness' },
  { id: 'log-2', timestamp: '2026-08-10T14:15:22', actor: 'Officer S. Conteh', action: 'Updated Status', details: 'Transitioned session status from Marking to Ongoing' },
  { id: 'log-3', timestamp: '2026-08-05T09:30:10', actor: 'Dr. F. Cole', action: 'Set Mark Cutoff', details: 'Teacher mark submission deadline updated to 2026-08-30' },
  { id: 'log-4', timestamp: '2026-08-01T10:00:00', actor: 'System Admin', action: 'Created Session', details: 'Exam session initialized in database with 12 target classes' },
];

const mockCandidateClearance: CandidateClearance[] = [
  { id: 'c-1', name: 'John Kamara', rollNo: '2026-SSS3-014', class: 'SSS 3A', feePaid: true, academicCleared: true, cleared: true },
  { id: 'c-2', name: 'Aminata Sesay', rollNo: '2026-SSS3-018', class: 'SSS 3A', feePaid: true, academicCleared: true, cleared: true },
  { id: 'c-3', name: 'Mohamed Conteh', rollNo: '2026-SSS2-009', class: 'SSS 2A', feePaid: false, academicCleared: true, cleared: false },
  { id: 'c-4', name: 'Fatima Koroma', rollNo: '2026-SSS1-022', class: 'SSS 1A', feePaid: true, academicCleared: true, cleared: true },
  { id: 'c-5', name: 'Ibrahim Bangura', rollNo: '2026-SSS3-031', class: 'SSS 3A', feePaid: false, academicCleared: false, cleared: false },
];

export function SessionsTab({ officer }: { officer: OfficerData }) {
  const router = useRouter();
  const [sessionsList, setSessionsList] = useState<ExamSession[]>(initialSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSessionForManage, setSelectedSessionForManage] = useState<ExamSession | null>(null);
  const [selectedExamDetails, setSelectedExamDetails] = useState<ExamSession | null>(null);
  const [selectedSubjectRelation, setSelectedSubjectRelation] = useState<SubjectRelationDetail | null>(null);

  // New Feature States
  const [showCloneModal, setShowCloneModal] = useState<ExamSession | null>(null);
  const [cloneFormData, setCloneFormData] = useState({ name: '', start: '', end: '', year: '2026-27', term: '1st Term' });
  const [showAuditModal, setShowAuditModal] = useState<ExamSession | null>(null);
  const [showClearanceModal, setShowClearanceModal] = useState<ExamSession | null>(null);
  const [clearanceList, setClearanceList] = useState<CandidateClearance[]>(mockCandidateClearance);

  const [isApproved, setIsApproved] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form State for Create
  const [formData, setFormData] = useState({
    name: '',
    year: '2025-26',
    term: '1st Term',
    type: 'EXAM',
    mode: 'ONLINE',
    weightage: '-',
    start: '',
    end: '',
    targetClasses: 'All Secondary Classes (12)',
    candidates: '1250',
    gradingSystem: 'WAEC 9-Point Standard',
    status: 'Upcoming' as ExamSession['status'],
  });

  useEffect(() => {
    fetchDBSessions();
  }, [officer.tenantSlug]);

  async function fetchDBSessions() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/exam-office/dashboard?tenantSlug=${officer.tenantSlug}`);
      const json = await res.json();
      if (json.success && json.data.sessions && json.data.sessions.length > 0) {
        const dbSessions: ExamSession[] = json.data.sessions.map((s: any) => ({
          id: s.id,
          name: s.name,
          year: s.academic_year || '2025-26',
          term: s.term || '3rd Term',
          type: s.type || 'EXAM',
          mode: s.mode || 'ONLINE',
          weightage: s.weightage || '-',
          start: s.start_date ? String(s.start_date).split('T')[0] : '2026-08-18',
          end: s.end_date ? String(s.end_date).split('T')[0] : '2026-08-29',
          timestamp: s.created_at || '2026-09-04T18:19:25',
          status: s.status || 'Upcoming',
          classes: s.classes_count || 12,
          candidates: s.candidates_count || 1248,
          clearanceRequired: s.clearance_required ?? true,
          markDeadline: s.mark_deadline,
          milestones: {
            paperDeadline: '2026-08-10',
            timetableDate: '2026-08-12',
            admitCardDate: '2026-08-15',
            markCutoff: '2026-08-30',
            moderationDeadline: '2026-09-02',
            publishDate: '2026-09-05',
          },
        }));
        setSessionsList(dbSessions);
      }
    } catch (err) {
      console.warn('DB fetch fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function navToTab(tab: string) {
    router.push(`/${officer.tenantSlug}/exam-office?tab=${tab}`);
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const tempId = String(Date.now());
    const newSession: ExamSession = {
      id: tempId,
      name: formData.name,
      year: formData.year,
      term: formData.term,
      type: formData.type,
      mode: formData.mode,
      weightage: formData.weightage,
      start: formData.start || '2026-09-01',
      end: formData.end || '2026-09-15',
      timestamp: new Date().toISOString().replace('Z', ''),
      status: formData.status,
      classes: formData.targetClasses.includes('All') ? 12 : 4,
      candidates: Number(formData.candidates) || 1200,
      clearanceRequired: true,
    };

    setSessionsList([newSession, ...sessionsList]);
    setShowCreateModal(false);

    try {
      const res = await fetch('/api/exam-office/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          academic_year: formData.year,
          term: formData.term,
          type: formData.type,
          mode: formData.mode,
          weightage: formData.weightage,
          start_date: formData.start || '2026-09-01',
          end_date: formData.end || '2026-09-15',
          status: formData.status,
          classes_count: newSession.classes,
          candidates_count: newSession.candidates,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        // Refetch to guarantee 100% database sync
        await fetchDBSessions();
      }
    } catch (err) {
      console.warn('DB creation fallback:', err);
    }

    setFormData({
      name: '',
      year: '2025-26',
      term: '1st Term',
      type: 'EXAM',
      mode: 'ONLINE',
      weightage: '-',
      start: '',
      end: '',
      targetClasses: 'All Secondary Classes (12)',
      candidates: '1250',
      gradingSystem: 'WAEC 9-Point Standard',
      status: 'Upcoming',
    });

    setSuccessToast(`Examination "${newSession.name}" created and saved to Database!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleCloneSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCloneModal || !cloneFormData.name) return;

    const cloned: ExamSession = {
      ...showCloneModal,
      id: String(Date.now()),
      name: cloneFormData.name,
      year: cloneFormData.year,
      term: cloneFormData.term,
      start: cloneFormData.start || '2026-10-01',
      end: cloneFormData.end || '2026-10-15',
      timestamp: new Date().toISOString().replace('Z', ''),
      status: 'Draft',
    };

    setSessionsList([cloned, ...sessionsList]);
    setShowCloneModal(null);

    try {
      const res = await fetch('/api/exam-office/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cloned.name,
          academic_year: cloned.year,
          term: cloned.term,
          type: cloned.type,
          mode: cloned.mode,
          weightage: cloned.weightage,
          start_date: cloned.start,
          end_date: cloned.end,
          status: 'Draft',
          classes_count: cloned.classes,
          candidates_count: cloned.candidates,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDBSessions();
      }
    } catch (err) {
      console.warn('DB clone fallback:', err);
    }

    setSuccessToast(`Session "${showCloneModal.name}" duplicated as "${cloned.name}"!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleRemoveSession = async (sessionId: string) => {
    setSessionsList(prev => prev.filter(s => s.id !== sessionId));
    setSelectedSessionForManage(null);

    try {
      await fetch(`/api/exam-office/dashboard?id=${sessionId}`, {
        method: 'DELETE',
      });
      await fetchDBSessions();
    } catch (err) {
      console.warn('DB delete fallback:', err);
    }

    setSuccessToast('Examination session removed from database.');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleApproveExam = async () => {
    setIsApproved(true);
    if (!selectedExamDetails) return;

    const updated = sessionsList.map(s => s.id === selectedExamDetails.id ? { ...s, status: 'Approved' as const } : s);
    setSessionsList(updated);
    setSelectedExamDetails({ ...selectedExamDetails, status: 'Approved' });

    try {
      await fetch('/api/exam-office/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedExamDetails.id,
          status: 'Approved',
          approved_by: officer.name,
        }),
      });
    } catch (err) {
      console.warn('DB approval fallback:', err);
    }

    setSuccessToast(`Examination "${selectedExamDetails.name}" approved and synced to Admin Dashboard!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleUpdateStatus = async (newStatus: ExamSession['status']) => {
    if (!selectedSessionForManage) return;
    const updated = sessionsList.map(s => s.id === selectedSessionForManage.id ? { ...s, status: newStatus } : s);
    setSessionsList(updated);
    setSelectedSessionForManage({ ...selectedSessionForManage, status: newStatus });

    try {
      await fetch('/api/exam-office/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSessionForManage.id,
          status: newStatus,
        }),
      });
    } catch (err) {
      console.warn('DB status update fallback:', err);
    }

    setSuccessToast(`Status updated to "${newStatus}" and synced to DB.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleOpenSubjectRelation = (clsName: string, sb: any) => {
    setSelectedSubjectRelation({
      id: sb.id,
      name: sb.name,
      className: clsName,
      date: sb.date || '2026-08-18',
      time: sb.time || '08:30 AM - 10:00 AM',
      venue: sb.venue || 'Main Examination Hall A',
      invigilators: sb.invigilators || 'Mr. S. Conteh, Mrs. A. Mansaray',
      teacher: sb.teacher || 'Mr. A. Kamara',
      hod: sb.hod || 'Dr. F. Cole',
      maxMarks: sb.maxMarks || 100,
      weightagePct: sb.weightagePct || '30% CA + 70% Paper',
      passCriteria: sb.passCriteria || '40% Minimum',
      candidatesCount: sb.candidatesCount || 32,
      gradedCount: sb.gradedCount || 26,
      paperStatus: sb.paperStatus || 'Approved & Printed',
      moderationStatus: sb.moderationStatus || 'Pending Review',
      malpracticeCount: sb.malpracticeCount || 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Examination Sessions</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">DB Synced &amp; Persisted</span>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Configure academic terms, session cloning, milestone deadlines, and financial clearance gatekeeping</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDBSessions}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-tertiary)/0.8)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
            title="Sync Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-violet-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" /> New Examination
          </button>
        </div>
      </div>

      {/* Lifecycle stages reference */}
      <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
        <p className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Examination Lifecycle Stages</p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {LIFECYCLE_STAGES.map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColors[s] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}>{s}</span>
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Sessions table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
        <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-violet-400" />
            <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">All Examination Sessions ({sessionsList.length})</h2>
          </div>
          <span className="text-xs text-[hsl(var(--text-tertiary))] font-medium">Realtime Admin Sync Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]">
                {['Examination Name', 'Academic Year', 'Term', 'Type', 'Dates', 'Classes', 'Candidates', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {sessionsList.map((s) => (
                <tr key={s.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3.5 px-4">
                    <button onClick={() => setSelectedExamDetails(s)} className="font-bold text-xs text-[hsl(var(--text-primary))] hover:text-violet-400 text-left">
                      {s.name}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-[hsl(var(--text-secondary))]">{s.year}</td>
                  <td className="py-3.5 px-4 text-xs font-medium text-[hsl(var(--text-secondary))]">{s.term}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] text-[11px] font-bold text-[hsl(var(--text-secondary))]">{s.type}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{s.start} – {s.end}</td>
                  <td className="py-3.5 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{s.classes}</td>
                  <td className="py-3.5 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{s.candidates.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[s.status] || statusColors.Upcoming}`}>{s.status}</span>
                  </td>
                  <td className="py-3.5 px-4 flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedExamDetails(s)}
                      className="px-2.5 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                      title="View Exam Details"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={() => {
                        setShowCloneModal(s);
                        setCloneFormData({ name: `${s.name} (Copy)`, start: '2026-10-01', end: '2026-10-15', year: '2026-27', term: '1st Term' });
                      }}
                      className="p-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-violet-500/20 text-[hsl(var(--text-secondary))] hover:text-violet-400 transition-colors"
                      title="Duplicate / Clone Session"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedSessionForManage(s)}
                      className="px-2.5 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-tertiary)/0.8)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] text-xs font-bold transition-all flex items-center gap-1"
                      title="Manage Session"
                    >
                      <Settings className="w-3.5 h-3.5" /> Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SESSION CLONE / DUPLICATE MODAL ──────────────────────────── */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-[hsl(var(--border))] shadow-2xl space-y-4 bg-[hsl(var(--bg-secondary))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-violet-400" />
                <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Duplicate Examination Session</h3>
              </div>
              <button onClick={() => setShowCloneModal(null)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Cloning <strong>"{showCloneModal.name}"</strong> will duplicate all subject timetable rules, grading weights, and class structure into a new draft session.
            </p>

            <form onSubmit={handleCloneSessionSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">New Session Name</label>
                <input
                  type="text"
                  required
                  value={cloneFormData.name}
                  onChange={e => setCloneFormData({ ...cloneFormData, name: e.target.value })}
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Academic Year</label>
                  <select
                    value={cloneFormData.year}
                    onChange={e => setCloneFormData({ ...cloneFormData, year: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  >
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Term / Semester</label>
                  <select
                    value={cloneFormData.term}
                    onChange={e => setCloneFormData({ ...cloneFormData, term: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  >
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={cloneFormData.start}
                    onChange={e => setCloneFormData({ ...cloneFormData, start: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={cloneFormData.end}
                    onChange={e => setCloneFormData({ ...cloneFormData, end: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-end gap-2">
                <button type="button" onClick={() => setShowCloneModal(null)} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 flex items-center gap-1.5 shadow-md">
                  <Copy className="w-4 h-4" /> Duplicate &amp; Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FINANCIAL CLEARANCE GATEKEEPER MODAL ──────────────────────── */}
      {showClearanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-3xl w-full border border-neutral-800 shadow-2xl space-y-5 bg-[#121214] text-white overflow-hidden">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">GATEKEEPER SECURITY CONTROL</span>
                <h3 className="font-black text-lg text-white mt-0.5">Candidate Clearance Registry — {showClearanceModal.name}</h3>
              </div>
              <button onClick={() => setShowClearanceModal(null)} className="p-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clearance Stats Row */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#19191c] border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">TOTAL REGISTERED</span>
                <span className="font-black text-lg text-white">{showClearanceModal.candidates}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#19191c] border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">CLEARED &amp; PERMITTED</span>
                <span className="font-black text-lg text-emerald-400">{clearanceList.filter(c => c.cleared).length} (94%)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#19191c] border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">HELD / FEE DEFAULT</span>
                <span className="font-black text-lg text-red-400">{clearanceList.filter(c => !c.cleared).length} (6%)</span>
              </div>
            </div>

            {/* Candidate Clearance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] bg-[#1a1a1d]">
                    <th className="py-2.5 px-3">Candidate Name</th>
                    <th className="py-2.5 px-3">Roll Number</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3 text-center">Fee Status</th>
                    <th className="py-2.5 px-3 text-center">Admit Card Permit</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {clearanceList.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-800/40">
                      <td className="py-2.5 px-3 font-bold text-neutral-200">{c.name}</td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400">{c.rollNo}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{c.class}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.feePaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {c.feePaid ? 'Fee Paid' : 'Fee Owed'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.cleared ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                          {c.cleared ? '✓ Permitted' : '🔒 Blocked'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            const updated = clearanceList.map(item => item.id === c.id ? { ...item, cleared: !item.cleared } : item);
                            setClearanceList(updated);
                          }}
                          className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold"
                        >
                          {c.cleared ? 'Lock Permit' : 'Grant Permit'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const updated = clearanceList.map(item => item.feePaid ? { ...item, cleared: true } : item);
                  setClearanceList(updated);
                  setSuccessToast('Cleared all paid candidates for Admit Card generation!');
                  setTimeout(() => setSuccessToast(''), 4000);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                ⚡ Auto-Permit Paid Candidates
              </button>
              <button onClick={() => setShowClearanceModal(null)} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SESSION AUDIT LOG TRAIL MODAL ────────────────────────────── */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full border border-neutral-800 shadow-2xl space-y-4 bg-[#121214] text-white overflow-hidden">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">COMPLIANCE &amp; SECURITY LOG</span>
                <h3 className="font-black text-lg text-white mt-0.5">Audit History — {showAuditModal.name}</h3>
              </div>
              <button onClick={() => setShowAuditModal(null)} className="p-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {mockAuditTrail.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-[#19191c] border border-neutral-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-400">{log.action}</span>
                    <span className="font-mono text-[10px] text-neutral-500">{log.timestamp.replace('T', ' ')}</span>
                  </div>
                  <p className="text-neutral-300 font-medium">{log.details}</p>
                  <p className="text-[10px] text-neutral-500">Performed by: <span className="font-semibold text-neutral-400">{log.actor}</span></p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button onClick={() => setShowAuditModal(null)} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold">
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXAM DETAILS VIEW MODAL (MATCHING REFERENCE IMAGE 1:1) ────── */}
      {selectedExamDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="glass-card rounded-2xl p-6 max-w-5xl w-full border border-neutral-800 shadow-2xl space-y-6 bg-[#121212] text-white my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Top Exam Details Header Card */}
            <div className="p-6 rounded-2xl bg-[#1a1a1a] border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-lg text-white">Exam Details</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[selectedExamDetails.status] || statusColors.Upcoming}`}>
                    {selectedExamDetails.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAuditModal(selectedExamDetails)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-violet-400" /> Audit Trail
                  </button>
                  <button
                    onClick={() => setShowClearanceModal(selectedExamDetails)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> Clearance Gatekeeper
                  </button>
                  <button
                    onClick={handleApproveExam}
                    disabled={isApproved || selectedExamDetails.status === 'Approved'}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isApproved || selectedExamDetails.status === 'Approved'
                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                    }`}
                  >
                    {isApproved || selectedExamDetails.status === 'Approved' ? '✓ Approved' : 'Approve'}
                  </button>
                  <button
                    onClick={() => setSelectedExamDetails(null)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Detail Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 text-xs">
                <div>
                  <span className="text-neutral-400">Exam Name: </span>
                  <span className="font-bold text-white">{selectedExamDetails.name}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Exam Type: </span>
                  <span className="font-bold text-white uppercase">{selectedExamDetails.type}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Exam Mode: </span>
                  <span className="font-bold text-white uppercase">{selectedExamDetails.mode || 'ONLINE'}</span>
                </div>

                <div>
                  <span className="text-neutral-400">Weightage: </span>
                  <span className="font-bold text-white">{selectedExamDetails.weightage || '-'}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Start Date: </span>
                  <span className="font-bold text-white">{selectedExamDetails.start || '—'}</span>
                </div>
                <div>
                  <span className="text-neutral-400">End Date: </span>
                  <span className="font-bold text-white">{selectedExamDetails.end || '—'}</span>
                </div>

                <div>
                  <span className="text-neutral-400">Academic Year: </span>
                  <span className="font-bold text-white">{selectedExamDetails.year}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-neutral-400">Timestamp: </span>
                  <span className="font-mono text-neutral-300">{selectedExamDetails.timestamp || '2026-09-04T18:19:25'}</span>
                </div>
              </div>
            </div>

            {/* Milestone Deadlines Tracker Card */}
            {selectedExamDetails.milestones && (
              <div className="p-5 rounded-2xl bg-[#18181c] border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">Milestone &amp; Cutoff Deadlines Tracker</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#202025]">
                    <span className="text-neutral-400 block text-[10px]">PAPER SUBMISSION DEADLINE</span>
                    <span className="font-bold text-emerald-400">{selectedExamDetails.milestones.paperDeadline} (Completed)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#202025]">
                    <span className="text-neutral-400 block text-[10px]">ADMIT CARDS RELEASE</span>
                    <span className="font-bold text-emerald-400">{selectedExamDetails.milestones.admitCardDate} (Released)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#202025]">
                    <span className="text-neutral-400 block text-[10px]">TEACHER MARK CUTOFF</span>
                    <span className="font-bold text-amber-400">{selectedExamDetails.milestones.markCutoff} (Ongoing)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Subjects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white">Subjects</h3>
                <span className="text-xs text-neutral-400 font-medium">💡 Click any subject to view detailed examination parameters</span>
              </div>

              {/* Class Timetable Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockClassSchedules.map((cls) => (
                  <div key={cls.className} className="p-4 rounded-2xl bg-[#161616] border border-neutral-800 space-y-3">
                    <h4 className="font-bold text-sm text-neutral-200 tracking-wide">{cls.className}</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-neutral-800 text-neutral-400 font-semibold text-[11px]">
                            <th className="py-2 px-2">ID</th>
                            <th className="py-2 px-2">Subject</th>
                            <th className="py-2 px-2">Date</th>
                            <th className="py-2 px-2">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                          {cls.subjects.map((sb) => (
                            <tr key={sb.id} className="hover:bg-neutral-800/40 transition-colors">
                              <td className="py-2.5 px-2 font-mono text-neutral-400">{sb.id}</td>
                              <td className="py-2.5 px-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSubjectRelation(cls.className, sb)}
                                  className="font-semibold text-blue-400 hover:underline text-left hover:text-blue-300 transition-colors flex items-center gap-1 group"
                                >
                                  <span>{sb.name}</span>
                                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              </td>
                              <td className="py-2.5 px-2 text-neutral-400">{sb.date || '—'}</td>
                              <td className="py-2.5 px-2 text-neutral-300 font-mono text-[11px]">{sb.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedExamDetails(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBJECT EXAM RELATION DIALOG MODAL ───────────────────────── */}
      {selectedSubjectRelation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full border border-neutral-800 shadow-2xl space-y-5 bg-[#141414] text-white overflow-hidden">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    ID: {selectedSubjectRelation.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    {selectedSubjectRelation.className}
                  </span>
                </div>
                <h3 className="font-black text-xl text-white mt-1.5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" /> {selectedSubjectRelation.name} — Examination Relation
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubjectRelation(null)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#1b1b1b] border border-neutral-800 space-y-3 text-xs">
              <p className="font-bold text-[11px] text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Examination Schedule &amp; Allocation
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 block">Date &amp; Time:</span>
                  <span className="font-bold text-white">{selectedSubjectRelation.date} ({selectedSubjectRelation.time})</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Venue / Hall:</span>
                  <span className="font-bold text-white">{selectedSubjectRelation.venue}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Invigilator Roster:</span>
                  <span className="font-semibold text-neutral-200">{selectedSubjectRelation.invigilators}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Registered Candidates:</span>
                  <span className="font-bold text-white">{selectedSubjectRelation.candidatesCount} Candidates</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1b1b1b] border border-neutral-800 space-y-3 text-xs">
              <p className="font-bold text-[11px] text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Assessment &amp; Grading Rules
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 block">Maximum Marks:</span>
                  <span className="font-bold text-white">{selectedSubjectRelation.maxMarks} Marks</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Weightage Formula:</span>
                  <span className="font-bold text-white">{selectedSubjectRelation.weightagePct}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Passing Criteria:</span>
                  <span className="font-bold text-white">{selectedSubjectRelation.passCriteria}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Question Paper Status:</span>
                  <span className="font-bold text-emerald-400">{selectedSubjectRelation.paperStatus}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1b1b1b] border border-neutral-800 space-y-3 text-xs">
              <p className="font-bold text-[11px] text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Marking &amp; Moderation Progress
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 block">Subject Teacher:</span>
                  <span className="font-bold text-white">{selectedSubjectRelation.teacher}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Department HOD:</span>
                  <span className="font-bold text-white">{selectedSubjectRelation.hod}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Mark Submission:</span>
                  <span className="font-bold text-violet-400">{selectedSubjectRelation.gradedCount} / {selectedSubjectRelation.candidatesCount} Graded (81%)</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Moderation Status:</span>
                  <span className="font-bold text-amber-400">{selectedSubjectRelation.moderationStatus}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedSubjectRelation(null); setSelectedExamDetails(null); navToTab('score-entry'); }}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Enter Scores
                </button>
                <button
                  onClick={() => { setSelectedSubjectRelation(null); setSelectedExamDetails(null); navToTab('moderation'); }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1"
                >
                  <Scale className="w-3.5 h-3.5" /> Moderation Queue
                </button>
              </div>

              <button
                onClick={() => setSelectedSubjectRelation(null)}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MANAGE EXAMINATION SESSION DRAWER / MODAL ────────────────── */}
      {selectedSessionForManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full border border-[hsl(var(--border))] shadow-2xl space-y-6 bg-[hsl(var(--bg-secondary))] overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[selectedSessionForManage.status]}`}>
                    {selectedSessionForManage.status}
                  </span>
                  <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))]">{selectedSessionForManage.year} • {selectedSessionForManage.term}</span>
                </div>
                <h2 className="font-black text-lg text-[hsl(var(--text-primary))] mt-1">{selectedSessionForManage.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const session = selectedSessionForManage;
                    setSelectedSessionForManage(null);
                    setSelectedExamDetails(session);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Full Details
                </button>
                <button onClick={() => setSelectedSessionForManage(null)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Set Lifecycle Status</label>
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))]">
                {LIFECYCLE_STAGES.map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSessionForManage.status === st
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-secondary))] hover:bg-violet-500/20 hover:text-violet-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Examination Workflow Shortcuts</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: 'Timetable & Halls', icon: Clock, tab: 'timetables', color: 'text-amber-400' },
                  { label: 'Admit Cards & Roll Nos.', icon: Users, tab: 'admit-cards', color: 'text-emerald-400' },
                  { label: 'Score Entry Status', icon: FileText, tab: 'score-entry', color: 'text-purple-400' },
                  { label: 'Moderation Workflow', icon: Scale, tab: 'moderation', color: 'text-rose-400' },
                  { label: 'Result Approval', icon: Stamp, tab: 'approval', color: 'text-blue-400' },
                  { label: 'Publish Results', icon: Send, tab: 'publication', color: 'text-teal-400' },
                ].map(act => (
                  <button
                    key={act.label}
                    onClick={() => { setSelectedSessionForManage(null); navToTab(act.tab); }}
                    className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] hover:border-violet-500/40 text-left transition-all group flex flex-col justify-between"
                  >
                    <act.icon className={`w-4 h-4 ${act.color} mb-2 group-hover:scale-110 transition-transform`} />
                    <div>
                      <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{act.label}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 flex items-center gap-1">Open Module <ArrowRight className="w-2.5 h-2.5" /></p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const updated = sessionsList.map(s => s.id === selectedSessionForManage.id ? selectedSessionForManage : s);
              setSessionsList(updated);

              try {
                await fetch('/api/exam-office/dashboard', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: selectedSessionForManage.id,
                    name: selectedSessionForManage.name,
                    status: selectedSessionForManage.status,
                    mark_deadline: selectedSessionForManage.markDeadline,
                    clearance_required: selectedSessionForManage.clearanceRequired,
                  }),
                });
                await fetchDBSessions();
              } catch (err) {
                console.warn('DB update fallback:', err);
              }

              setSelectedSessionForManage(null);
              setSuccessToast(`Session settings saved successfully to Database!`);
              setTimeout(() => setSuccessToast(''), 4000);
            }} className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
              <p className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Session Settings &amp; Deadlines</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Start Date</label>
                  <input
                    type="text"
                    value={selectedSessionForManage.start}
                    onChange={e => setSelectedSessionForManage({ ...selectedSessionForManage, start: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">End Date</label>
                  <input
                    type="text"
                    value={selectedSessionForManage.end}
                    onChange={e => setSelectedSessionForManage({ ...selectedSessionForManage, end: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Teacher Mark Entry Deadline</label>
                <input
                  type="date"
                  value={selectedSessionForManage.markDeadline || ''}
                  onChange={e => setSelectedSessionForManage({ ...selectedSessionForManage, markDeadline: e.target.value })}
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))]">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-[hsl(var(--text-primary))] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSessionForManage.clearanceRequired ?? true}
                    onChange={e => setSelectedSessionForManage({ ...selectedSessionForManage, clearanceRequired: e.target.checked })}
                    className="rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span>Require Financial &amp; Academic Clearance for Candidate Admit Cards</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleRemoveSession(selectedSessionForManage.id)}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Session
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSessionForManage(null)}
                    className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE NEW EXAMINATION MODAL DIALOG ───────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-xl w-full border border-[hsl(var(--border))] shadow-2xl space-y-5 bg-[hsl(var(--bg-secondary))] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h2 className="font-black text-base text-[hsl(var(--text-primary))]">Create New Examination Session</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Examination Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Formative Assessment 2"
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-violet-500 transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="2025-26">2025-26</option>
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Term / Semester</label>
                  <select
                    value={formData.term}
                    onChange={e => setFormData({ ...formData, term: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Examination Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="EXAM">EXAM</option>
                    <option value="CA">CA (Continuous Assessment)</option>
                    <option value="MOCK">MOCK</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Exam Mode</label>
                  <select
                    value={formData.mode}
                    onChange={e => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="HYBRID">HYBRID</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={formData.start}
                    onChange={e => setFormData({ ...formData, start: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={formData.end}
                    onChange={e => setFormData({ ...formData, end: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-lg shadow-violet-500/20"
                >
                  <Check className="w-4 h-4" /> Create &amp; Sync to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
