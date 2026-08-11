'use client';

import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  BookOpen, Lock, Eye, Upload, Plus, CheckCircle2, AlertTriangle, Clock,
  X, Check, FileText, Shield, Sparkles, Download, Key, Send, Search, Filter
} from 'lucide-react';
import { useState } from 'react';

interface QuestionPaper {
  id: string;
  subject: string;
  class: string;
  teacher: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Locked';
  version: string;
  updated: string;
  questions: number;
  marks: number;
  hash: string;
  sections: { title: string; count: number; marks: number }[];
}

const initialPapers: QuestionPaper[] = [
  {
    id: '1',
    subject: 'Mathematics',
    class: 'SSS 2A/B/C',
    teacher: 'Mr. S. Conteh',
    status: 'Locked',
    version: 'v3',
    updated: '2 days ago',
    questions: 50,
    marks: 100,
    hash: '0x7F89A4B2C9E104FA',
    sections: [
      { title: 'Section A: Multiple Choice Questions', count: 40, marks: 40 },
      { title: 'Section B: Theory & Problem Solving', count: 10, marks: 60 },
    ],
  },
  {
    id: '2',
    subject: 'English Language',
    class: 'SSS 1A/B',
    teacher: 'Mr. A. Kamara',
    status: 'Under Review',
    version: 'v2',
    updated: '4 days ago',
    questions: 60,
    marks: 100,
    hash: '0x3E109B42A7C12DF8',
    sections: [
      { title: 'Section A: Comprehension & Grammar', count: 50, marks: 50 },
      { title: 'Section B: Essay & Summary Writing', count: 10, marks: 50 },
    ],
  },
  {
    id: '3',
    subject: 'Physics',
    class: 'SSS 3A',
    teacher: 'Mrs. M. Bangura',
    status: 'Draft',
    version: 'v1',
    updated: '1 week ago',
    questions: 40,
    marks: 100,
    hash: '0x991A0B2C4F7721AA',
    sections: [
      { title: 'Section A: Objective Mechanics', count: 30, marks: 30 },
      { title: 'Section B: Practical Calculations', count: 10, marks: 70 },
    ],
  },
  {
    id: '4',
    subject: 'Chemistry',
    class: 'SSS 2A/B/C',
    teacher: 'Mr. J. Koroma',
    status: 'Approved',
    version: 'v2',
    updated: '3 days ago',
    questions: 50,
    marks: 100,
    hash: '0x55FA1039BB88102C',
    sections: [
      { title: 'Section A: General Chemistry MCQs', count: 40, marks: 40 },
      { title: 'Section B: Organic & Quantitative Equations', count: 10, marks: 60 },
    ],
  },
  {
    id: '5',
    subject: 'Biology',
    class: 'SSS 3A/B',
    teacher: 'Dr. F. Cole',
    status: 'Draft',
    version: 'v1',
    updated: '5 days ago',
    questions: 50,
    marks: 100,
    hash: '0x12CC98FF33109AB4',
    sections: [
      { title: 'Section A: Botany & Genetics MCQs', count: 40, marks: 40 },
      { title: 'Section B: Physiology Theory Essays', count: 10, marks: 60 },
    ],
  },
];

const statusIcons: Record<string, any> = { Locked: Lock, 'Under Review': Eye, Draft: Clock, Approved: CheckCircle2 };
const statusColors: Record<string, string> = {
  Locked: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  'Under Review': 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  Draft: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
  Approved: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
};

export function QuestionBankTab({ officer }: { officer: OfficerData }) {
  const [papersList, setPapersList] = useState<QuestionPaper[]>(initialPapers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPaperForReview, setSelectedPaperForReview] = useState<QuestionPaper | null>(null);
  const [successToast, setSuccessToast] = useState('');

  // Upload Form state
  const [newPaperForm, setNewPaperForm] = useState({
    subject: '',
    targetClass: 'SSS 1A',
    teacher: officer.name,
    questions: 50,
    marks: 100,
    fileName: 'question_paper_draft.pdf',
  });

  const filteredPapers = papersList.filter(p => {
    const matchesSearch = p.subject.toLowerCase().includes(searchQuery.toLowerCase()) || p.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedStatusFilter === 'All' || p.status === selectedStatusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUploadPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaperForm.subject) return;

    const created: QuestionPaper = {
      id: String(Date.now()),
      subject: newPaperForm.subject,
      class: newPaperForm.targetClass,
      teacher: newPaperForm.teacher,
      status: 'Under Review',
      version: 'v1',
      updated: 'Just now',
      questions: Number(newPaperForm.questions) || 50,
      marks: Number(newPaperForm.marks) || 100,
      hash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      sections: [
        { title: 'Section A: Multiple Choice Questions', count: 40, marks: 40 },
        { title: 'Section B: Theory & Problem Solving', count: 10, marks: 60 },
      ],
    };

    setPapersList([created, ...papersList]);
    setShowUploadModal(false);
    setNewPaperForm({ subject: '', targetClass: 'SSS 1A', teacher: officer.name, questions: 50, marks: 100, fileName: 'question_paper_draft.pdf' });
    setSuccessToast(`Question paper for "${created.subject}" uploaded and submitted for moderation review!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleUpdatePaperStatus = (paperId: string, newStatus: QuestionPaper['status']) => {
    const updated = papersList.map(p => p.id === paperId ? { ...p, status: newStatus } : p);
    setPapersList(updated);
    if (selectedPaperForReview && selectedPaperForReview.id === paperId) {
      setSelectedPaperForReview({ ...selectedPaperForReview, status: newStatus });
    }
    setSuccessToast(`Paper status updated to "${newStatus}"!`);
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
            <BookOpen className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Question Papers &amp; Document Security</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Secure question paper bank, version control, AES-256 paper locking, and HOD moderation approval
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
        >
          <Upload className="w-4 h-4" /> Upload New Question Paper
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Papers', value: papersList.length, color: 'bg-indigo-500' },
          { label: 'Approved & Locked', value: papersList.filter(p => p.status === 'Locked' || p.status === 'Approved').length, color: 'bg-emerald-500' },
          { label: 'Under Review', value: papersList.filter(p => p.status === 'Under Review').length, color: 'bg-amber-500' },
          { label: 'Drafts Pending', value: papersList.filter(p => p.status === 'Draft').length, color: 'bg-red-500' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-[hsl(var(--border))]">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0 text-white shadow-md`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-[hsl(var(--text-primary))]">{s.value}</p>
              <p className="text-xs text-[hsl(var(--text-secondary))]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-3 border border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search papers by subject title or teacher..."
            className="w-full bg-[hsl(var(--bg-tertiary))] text-xs text-[hsl(var(--text-primary))] pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] outline-none focus:border-violet-500 transition-colors font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          {['All', 'Locked', 'Approved', 'Under Review', 'Draft'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatusFilter === st
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Question Papers Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">Question Paper Registry ({filteredPapers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]">
                {['Subject', 'Class Cohort', 'Author / Teacher', 'Questions', 'Max Marks', 'Version', 'Security Hash', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {filteredPapers.map((p) => {
                const StatusIcon = statusIcons[p.status] || Clock;
                return (
                  <tr key={p.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-xs text-[hsl(var(--text-primary))]">{p.subject}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[hsl(var(--text-secondary))]">{p.class}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[hsl(var(--text-secondary))]">{p.teacher}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{p.questions}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{p.marks}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[hsl(var(--text-tertiary))]">{p.version}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[10px] text-[hsl(var(--text-tertiary))]">{p.hash}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[p.status]}`}>
                        <StatusIcon className="w-3 h-3" />{p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedPaperForReview(p)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-violet-600/15 text-violet-300 font-bold hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── QUESTION PAPER MODERATION & SECURITY DIALOG ──────────────── */}
      {selectedPaperForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full border border-neutral-800 shadow-2xl space-y-5 bg-[#121214] text-white overflow-hidden">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[selectedPaperForReview.status]}`}>
                    {selectedPaperForReview.status}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">HASH: {selectedPaperForReview.hash}</span>
                </div>
                <h3 className="font-black text-lg text-white mt-1">{selectedPaperForReview.subject} — Paper Moderation</h3>
              </div>
              <button onClick={() => setSelectedPaperForReview(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#19191c] border border-neutral-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 block">Target Cohort:</span>
                  <span className="font-bold text-white">{selectedPaperForReview.class}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Author / Subject Teacher:</span>
                  <span className="font-bold text-white">{selectedPaperForReview.teacher}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Questions Count:</span>
                  <span className="font-bold text-white">{selectedPaperForReview.questions} Questions</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Maximum Marks:</span>
                  <span className="font-bold text-white">{selectedPaperForReview.marks} Marks</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Question Paper Sections</p>
              <div className="space-y-2">
                {selectedPaperForReview.sections.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1a1a1e] border border-neutral-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-200">{sec.title}</span>
                    <span className="font-mono text-violet-400 font-semibold">{sec.count} Questions • {sec.marks} Marks</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Moderation Controls</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleUpdatePaperStatus(selectedPaperForReview.id, 'Approved')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve for Printing
                </button>
                <button
                  onClick={() => handleUpdatePaperStatus(selectedPaperForReview.id, 'Locked')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Lock className="w-4 h-4" /> Lock &amp; Encrypt (AES-256)
                </button>
                <button
                  onClick={() => handleUpdatePaperStatus(selectedPaperForReview.id, 'Draft')}
                  className="px-4 py-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-600 hover:text-white"
                >
                  Request Revision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD QUESTION PAPER MODAL ─────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-lg w-full border border-[hsl(var(--border))] shadow-2xl space-y-4 bg-[hsl(var(--bg-secondary))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Upload Question Paper</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadPaper} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Subject Title</label>
                <input
                  type="text"
                  required
                  value={newPaperForm.subject}
                  onChange={e => setNewPaperForm({ ...newPaperForm, subject: e.target.value })}
                  placeholder="e.g. Further Mathematics"
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-violet-500 transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Target Class Cohort</label>
                  <select
                    value={newPaperForm.targetClass}
                    onChange={e => setNewPaperForm({ ...newPaperForm, targetClass: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  >
                    <option value="SSS 1A">SSS 1A</option>
                    <option value="SSS 1B">SSS 1B</option>
                    <option value="SSS 2A/B/C">SSS 2A/B/C</option>
                    <option value="SSS 3A/B">SSS 3A/B</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Author / Teacher</label>
                  <input
                    type="text"
                    value={newPaperForm.teacher}
                    onChange={e => setNewPaperForm({ ...newPaperForm, teacher: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-[hsl(var(--border))] text-center bg-[hsl(var(--bg-tertiary)/0.3)] space-y-1">
                <Upload className="w-6 h-6 text-violet-400 mx-auto" />
                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Click to select PDF or Word document</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Supports PDF, DOCX, OMR Key format up to 25MB</p>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-end gap-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 flex items-center gap-1.5 shadow-md">
                  <Upload className="w-4 h-4" /> Upload for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
