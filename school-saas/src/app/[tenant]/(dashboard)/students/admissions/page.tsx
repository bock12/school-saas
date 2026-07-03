'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  UserPlus, Clock, CheckCircle2, AlertCircle, FileText, Search, Filter,
  ArrowRight, MoreHorizontal, Eye, Edit2, Calendar, ClipboardCheck,
  CheckCircle, MessageSquare, ChevronRight, Play, BarChart3, Layers
} from 'lucide-react';
import Link from 'next/link';

interface Applicant {
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
}

const initialApplicants: Applicant[] = [
  { id: '1', name: 'Amara Johnson', grade: 'Grade 9', parentName: 'Mrs. Patricia Johnson', appliedDate: 'Jun 28, 2026', dob: 'Mar 12, 2012', stage: 'Application', docsVerified: false, interviewScore: null, assessmentScore: null, comment: 'Application form submitted' },
  { id: '2', name: 'David Okafor', grade: 'Grade 11', parentName: 'Mr. Emeka Okafor', appliedDate: 'Jun 25, 2026', dob: 'Aug 5, 2010', stage: 'Verification', docsVerified: true, interviewScore: null, assessmentScore: null, comment: 'Verified transcript and certificate of birth' },
  { id: '3', name: 'Sarah Williams', grade: 'Grade 7', parentName: 'Ms. Linda Williams', appliedDate: 'Jun 20, 2026', dob: 'Nov 22, 2013', stage: 'Interview', docsVerified: true, interviewScore: 85, assessmentScore: null, comment: 'Excellent presentation during interview' },
  { id: '4', name: 'Michael Chen', grade: 'Grade 10', parentName: 'Mr. Wei Chen', appliedDate: 'Jun 18, 2026', dob: 'Jan 30, 2011', stage: 'Assessment', docsVerified: true, interviewScore: 90, assessmentScore: 88, comment: 'Passed math & science assessments' },
  { id: '5', name: 'Fatima Hassan', grade: 'Grade 8', parentName: 'Mr. Ahmed Hassan', appliedDate: 'Jun 15, 2026', dob: 'Jul 4, 2012', stage: 'Acceptance', docsVerified: true, interviewScore: 92, assessmentScore: 90, comment: 'Offer letter dispatched' },
  { id: '6', name: 'James Nguyen', grade: 'Grade 12', parentName: 'Mrs. Linh Nguyen', appliedDate: 'Jun 10, 2026', dob: 'Feb 14, 2009', stage: 'Enrollment', docsVerified: true, interviewScore: 88, assessmentScore: 85, comment: 'Tuition deposit received' },
  { id: '7', name: 'Priya Sharma', grade: 'Grade 9', parentName: 'Dr. Raj Sharma', appliedDate: 'Jul 1, 2026', dob: 'Sep 18, 2012', stage: 'Allocation', docsVerified: true, interviewScore: 95, assessmentScore: 92, comment: 'Awaiting classroom allocation assignment' },
];

const stagesList = [
  { name: 'Application', label: '1. Application', desc: 'Online Submission', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'Verification', label: '2. Verification', desc: 'Docs Audit', icon: ClipboardCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { name: 'Interview', label: '3. Interview', desc: 'Face-to-Face', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { name: 'Assessment', label: '4. Assessment', desc: 'Skill Evaluat.', icon: BarChart3, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { name: 'Acceptance', label: '5. Acceptance', desc: 'Offer Sent', icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { name: 'Enrollment', label: '6. Enrollment', desc: 'Fees Paid', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { name: 'Allocation', label: '7. Allocation', desc: 'Class Set', icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function AdmissionsPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [selectedStage, setSelectedStage] = useState<string>('Application');
  const [showApproveModal, setShowApproveModal] = useState<Applicant | null>(null);
  const [approveComment, setApproveComment] = useState('');

  const nextStageMap: Record<string, string> = {
    'Application': 'Verification',
    'Verification': 'Interview',
    'Interview': 'Assessment',
    'Assessment': 'Acceptance',
    'Acceptance': 'Enrollment',
    'Enrollment': 'Allocation',
    'Allocation': 'Allocation', // Final
  };

  const handleProgress = (appId: string) => {
    setApplicants(prev => prev.map(app => {
      if (app.id === appId) {
        const nextStage = nextStageMap[app.stage] as any;
        return {
          ...app,
          stage: nextStage,
          comment: `Moved to ${nextStage} stage. ${approveComment ? `Note: ${approveComment}` : ''}`
        };
      }
      return app;
    }));
    setShowApproveModal(null);
    setApproveComment('');
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Admissions Workflow</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Progress applications chronologically through verification, interviews, assessments, and allocations.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto">
          <UserPlus className="w-4 h-4" /> New Application
        </button>
      </div>

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
              className={`rounded-xl border p-4 text-center cursor-pointer hover:scale-105 transition-all select-none ${
                isActive
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
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{app.name}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Applied: {app.appliedDate}</p>
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
                      {selectedStage !== 'Allocation' ? (
                        <button
                          onClick={() => {
                            setShowApproveModal(app);
                            setApproveComment('');
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve comment modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Approve Workflow Step</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Approve <strong>{showApproveModal.name}</strong> to progress from <strong>{showApproveModal.stage}</strong> to the next workflow stage.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))]">Workflow Comments</label>
              <textarea
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                placeholder="Enter approval details or audit comments..."
                className="w-full min-h-[80px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveModal(null)}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProgress(showApproveModal.id)}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-90"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
