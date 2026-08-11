'use client';

import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  MessageSquare, CheckCircle2, XCircle, Clock, Plus, Search,
  X, Check, AlertCircle, Scale, FileText, UserCheck, Shield, Sparkles
} from 'lucide-react';

interface ScoreAppeal {
  id: string;
  student: string;
  rollNo: string;
  class: string;
  subject: string;
  reason: string;
  submittedScore: number;
  expectedScore: number;
  status: 'Under Review' | 'Assigned for Re-marking' | 'Approved — Score Corrected' | 'Rejected';
  date: string;
  feePaid: boolean;
  assignedRemarker?: string;
  remarkerScore?: number;
  justification?: string;
}

const initialAppeals: ScoreAppeal[] = [
  {
    id: 'APP-2026-001',
    student: 'John Kamara',
    rollNo: '2026-SSS3-014',
    class: 'SSS 3A',
    subject: 'Physics',
    reason: 'Section B Question 4 solution skipped during mark aggregation',
    submittedScore: 52,
    expectedScore: 68,
    status: 'Under Review',
    date: 'Aug 24, 2026',
    feePaid: true,
    justification: 'Claim submitted with copy of student answer script booklet.',
  },
  {
    id: 'APP-2026-002',
    student: 'Aminata Sesay',
    rollNo: '2026-SSS3-018',
    class: 'SSS 3A',
    subject: 'Chemistry',
    reason: 'CA 2 practical test score missing from continuous assessment breakdown',
    submittedScore: 61,
    expectedScore: 75,
    status: 'Approved — Score Corrected',
    date: 'Aug 23, 2026',
    feePaid: true,
    assignedRemarker: 'Mr. J. Koroma',
    remarkerScore: 75,
    justification: 'CA 2 lab record sheet verified; 14 marks added to master record.',
  },
  {
    id: 'APP-2026-003',
    student: 'Ibrahim Bangura',
    rollNo: '2026-SSS3-031',
    class: 'SSS 3A',
    subject: 'Mathematics',
    reason: 'Letter grade B3 calculated instead of B2',
    submittedScore: 74,
    expectedScore: 76,
    status: 'Rejected',
    date: 'Aug 22, 2026',
    feePaid: true,
    assignedRemarker: 'Mr. S. Conteh',
    remarkerScore: 74,
    justification: 'Script re-checked; original 74% score verified as accurate.',
  },
];

const statusColors: Record<string, string> = {
  'Under Review': 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  'Assigned for Re-marking': 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  'Approved — Score Corrected': 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  Rejected: 'text-red-400 bg-red-500/15 border-red-500/30',
};

export function AppealsTab({ officer }: { officer: OfficerData }) {
  const [appealsList, setAppealsList] = useState<ScoreAppeal[]>(initialAppeals);
  const [selectedAppeal, setSelectedAppeal] = useState<ScoreAppeal | null>(initialAppeals[0]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    student: '',
    rollNo: '',
    class: 'SSS 3A',
    subject: 'Mathematics',
    submittedScore: 50,
    expectedScore: 70,
    reason: '',
  });

  const filteredAppeals = appealsList.filter(a =>
    a.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student) return;

    const created: ScoreAppeal = {
      id: `APP-2026-00${appealsList.length + 1}`,
      student: formData.student,
      rollNo: formData.rollNo || `2026-SSS-${Math.floor(Math.random() * 90 + 10)}`,
      class: formData.class,
      subject: formData.subject,
      reason: formData.reason || 'Score discrepancy reported by candidate.',
      submittedScore: Number(formData.submittedScore) || 50,
      expectedScore: Number(formData.expectedScore) || 70,
      status: 'Under Review',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      feePaid: true,
    };

    setAppealsList([created, ...appealsList]);
    setSelectedAppeal(created);
    setShowSubmitModal(false);
    setFormData({ student: '', rollNo: '', class: 'SSS 3A', subject: 'Mathematics', submittedScore: 50, expectedScore: 70, reason: '' });
    setSuccessToast(`Score appeal "${created.id}" submitted and queued for review!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleUpdateStatus = (newStatus: ScoreAppeal['status'], justificationText: string, newScore?: number) => {
    if (!selectedAppeal) return;

    const updated = appealsList.map(a => a.id === selectedAppeal.id ? {
      ...a,
      status: newStatus,
      justification: justificationText,
      remarkerScore: newScore ?? a.expectedScore,
    } : a);

    setAppealsList(updated);
    setSelectedAppeal({ ...selectedAppeal, status: newStatus, justification: justificationText, remarkerScore: newScore ?? selectedAppeal.expectedScore });
    setSuccessToast(`Appeal "${selectedAppeal.id}" updated: ${newStatus}`);
    setTimeout(() => setSuccessToast(''), 4000);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Appeals &amp; Score Corrections</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Manage candidate score appeals, assign independent re-markers, and rectify master broadsheet records
          </p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
        >
          <Plus className="w-4 h-4" /> Submit Score Appeal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
          <p className="text-2xl font-black text-amber-400">{appealsList.filter(a => a.status === 'Under Review').length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Pending Review</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
          <p className="text-2xl font-black text-blue-400">{appealsList.filter(a => a.status === 'Assigned for Re-marking').length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Re-marking In Progress</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
          <p className="text-2xl font-black text-emerald-400">{appealsList.filter(a => a.status.includes('Approved')).length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Approved &amp; Corrected</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
          <p className="text-2xl font-black text-red-400">{appealsList.filter(a => a.status === 'Rejected').length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Rejected Appeals</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-3 border border-[hsl(var(--border))]">
        <div className="relative">
          <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search appeals by student name, ref ID, or subject..."
            className="w-full bg-[hsl(var(--bg-tertiary))] text-xs text-[hsl(var(--text-primary))] pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] outline-none font-medium"
          />
        </div>
      </div>

      {/* Appeals Registry Table + Inspector Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
          <div className="p-4 border-b border-[hsl(var(--border))]">
            <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">Candidate Result Appeals Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]">
                  {['Ref ID', 'Candidate Name', 'Subject', 'Recorded', 'Claimed', 'Date', 'Status'].map(h => (
                    <th key={h} className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {filteredAppeals.map(a => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAppeal(a)}
                    className={`hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors cursor-pointer ${
                      selectedAppeal?.id === a.id ? 'bg-violet-600/10 border-l-4 border-l-violet-500' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-xs font-mono font-bold text-violet-400">{a.id}</td>
                    <td className="py-3 px-4 font-bold text-xs text-[hsl(var(--text-primary))]">{a.student}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{a.subject}</td>
                    <td className="py-3 px-4 text-xs font-bold text-red-400">{a.submittedScore}%</td>
                    <td className="py-3 px-4 text-xs font-bold text-emerald-400">{a.expectedScore}%</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">{a.date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[a.status]}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Appeal Inspector Sidebar */}
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--border))] space-y-4">
          {selectedAppeal ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                <span className="text-xs font-mono font-bold text-violet-400">{selectedAppeal.id}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[selectedAppeal.status]}`}>
                  {selectedAppeal.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Candidate', val: selectedAppeal.student },
                  { label: 'Roll Number', val: selectedAppeal.rollNo },
                  { label: 'Class', val: selectedAppeal.class },
                  { label: 'Subject', val: selectedAppeal.subject },
                  { label: 'Recorded Score', val: `${selectedAppeal.submittedScore}%` },
                  { label: 'Claimed Score', val: `${selectedAppeal.expectedScore}%` },
                  { label: 'Fee Clearance', val: selectedAppeal.feePaid ? '✓ Paid ($15 Fee)' : 'Pending Fee' },
                  { label: 'Date Logged', val: selectedAppeal.date },
                ].map(f => (
                  <div key={f.label} className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                    <span className="text-[hsl(var(--text-tertiary))]">{f.label}:</span>
                    <span className="font-bold text-[hsl(var(--text-primary))]">{f.val}</span>
                  </div>
                ))}
              </div>

              {/* Grounds for Appeal */}
              <div className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] text-xs space-y-1">
                <span className="font-bold text-violet-400 block uppercase text-[10px] tracking-wider">Grounds for Appeal</span>
                <p className="text-[hsl(var(--text-secondary))] leading-relaxed">{selectedAppeal.reason}</p>
              </div>

              {/* Re-marker Finding Justification */}
              {selectedAppeal.justification && (
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs space-y-1">
                  <span className="font-bold text-emerald-400 block uppercase text-[10px] tracking-wider">Re-marking Finding</span>
                  <p className="text-violet-200">{selectedAppeal.justification}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[hsl(var(--border))] space-y-2">
                <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Appeal Workflow Actions</p>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleUpdateStatus('Approved — Score Corrected', `Score corrected from ${selectedAppeal.submittedScore}% to ${selectedAppeal.expectedScore}% after re-check.`, selectedAppeal.expectedScore)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span>✓ Approve &amp; Rectify Broadsheet</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Assigned for Re-marking', 'Independent secondary marker assigned to re-grade script.', selectedAppeal.submittedScore)}
                    className="w-full py-2 px-3 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span>📋 Assign Independent Re-marker</span>
                    <Scale className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Rejected', 'Original script re-verified by HOD; no marking error found.', selectedAppeal.submittedScore)}
                    className="w-full py-2 px-3 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span>✗ Reject Appeal</span>
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <MessageSquare className="w-8 h-8 text-[hsl(var(--text-tertiary))] mb-3" />
              <p className="text-sm font-bold text-[hsl(var(--text-secondary))]">Select an appeal</p>
            </div>
          )}
        </div>
      </div>

      {/* ── SUBMIT SCORE APPEAL MODAL ────────────────────────────────── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-lg w-full border border-[hsl(var(--border))] shadow-2xl space-y-4 bg-[hsl(var(--bg-secondary))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-400" />
                <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Submit Result Appeal &amp; Re-mark Request</h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAppeal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.student}
                  onChange={e => setFormData({ ...formData, student: e.target.value })}
                  placeholder="e.g. Samuel Turay"
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-violet-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Roll / Reg Number</label>
                  <input
                    type="text"
                    value={formData.rollNo}
                    onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="2026-SSS3-014"
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Class Cohort</label>
                  <select
                    value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="SSS 1A">SSS 1A</option>
                    <option value="SSS 1B">SSS 1B</option>
                    <option value="SSS 2A">SSS 2A</option>
                    <option value="SSS 2B">SSS 2B</option>
                    <option value="SSS 3A">SSS 3A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Recorded Score %</label>
                  <input
                    type="number"
                    value={formData.submittedScore}
                    onChange={e => setFormData({ ...formData, submittedScore: Number(e.target.value) })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-bold text-red-400 font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Claimed Score %</label>
                  <input
                    type="number"
                    value={formData.expectedScore}
                    onChange={e => setFormData({ ...formData, expectedScore: Number(e.target.value) })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-bold text-emerald-400 font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Subject Title</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Detailed Grounds for Appeal</label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="State specific questions, omitted continuous assessment marks, or calculation discrepancies..."
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-violet-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-end gap-2">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 flex items-center gap-1.5 shadow-md">
                  <Check className="w-4 h-4" /> Submit Appeal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
