'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import {
  Plus, FileText, Clock, Users, CheckSquare, X, Eye, Download,
  CheckCircle2, AlertTriangle, Sparkles, Filter, Search, Award,
  ArrowUpRight, BookOpen, Layers, Edit2, Calendar
} from 'lucide-react';

type AssignmentType = 'homework' | 'quiz' | 'project' | 'group' | 'practical' | 'research';

interface AssignmentItem {
  id: string;
  title: string;
  type: AssignmentType;
  class: string;
  subject: string;
  maxScore: number;
  dueDate: string;
  dueTime: string;
  submitted: number;
  total: number;
  graded: number;
  status: 'open' | 'grading' | 'closed';
  instructions: string;
}

const typeStyles: Record<AssignmentType, { label: string; badge: string }> = {
  homework: { label: 'Homework', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  quiz: { label: 'Class Quiz', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  project: { label: 'Term Project', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  group: { label: 'Group Work', badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  practical: { label: 'Lab Practical', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  research: { label: 'Research Paper', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
};

const mockAssignmentsList: AssignmentItem[] = [
  {
    id: '1',
    title: 'Quadratic Polynomial Factorisation Practice',
    type: 'homework',
    class: 'SS2A',
    subject: 'Mathematics',
    maxScore: 20,
    dueDate: '2026-08-05',
    dueTime: '23:59',
    submitted: 32,
    total: 35,
    graded: 25,
    status: 'grading',
    instructions: 'Complete Exercises 1.2 to 1.4 from textbook Chapter 2. Show all step-by-step working.',
  },
  {
    id: '2',
    title: 'Mid-Term Quick Quiz — Algebraic Proofs',
    type: 'quiz',
    class: 'SS2B',
    subject: 'Mathematics',
    maxScore: 30,
    dueDate: '2026-08-07',
    dueTime: '16:00',
    submitted: 22,
    total: 38,
    graded: 0,
    status: 'open',
    instructions: '15 multiple choice and 3 short theory questions on algebraic simplifications.',
  },
  {
    id: '3',
    title: 'Statistical Variance & Probability Group Lab',
    type: 'group',
    class: 'SS3A',
    subject: 'Further Maths',
    maxScore: 50,
    dueDate: '2026-08-10',
    dueTime: '17:00',
    submitted: 8,
    total: 11,
    graded: 0,
    status: 'open',
    instructions: 'Collect empirical data from 50 respondents and calculate standard deviation and variance.',
  },
  {
    id: '4',
    title: 'Number Theory & Prime Factorisation Thesis',
    type: 'research',
    class: 'SS3A',
    subject: 'Further Maths',
    maxScore: 100,
    dueDate: '2026-07-30',
    dueTime: '23:59',
    submitted: 33,
    total: 33,
    graded: 33,
    status: 'closed',
    instructions: 'Submit a 3-page mathematical paper on RSA encryption and prime number algorithms.',
  },
  {
    id: '5',
    title: 'Practical Trigonometry Incline Angle Measurements',
    type: 'practical',
    class: 'JS3A',
    subject: 'Mathematics',
    maxScore: 25,
    dueDate: '2026-08-12',
    dueTime: '15:30',
    submitted: 12,
    total: 41,
    graded: 0,
    status: 'open',
    instructions: 'Use homemade clinometer to estimate height of school administration flagpole.',
  },
];

interface StudentSubmission {
  id: string;
  studentName: string;
  admNo: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  score: number;
  feedback?: string;
}

const mockSubmissions: StudentSubmission[] = [
  { id: '1', studentName: 'Adewale Okonkwo', admNo: 'ADM/2024/101', submittedAt: 'Yesterday, 4:20 PM', status: 'graded', score: 19, feedback: 'Excellent steps and clean proofs' },
  { id: '2', studentName: 'Blessing Eze', admNo: 'ADM/2024/102', submittedAt: 'Yesterday, 5:10 PM', status: 'graded', score: 18, feedback: 'Great work on question 4' },
  { id: '3', studentName: 'Chukwuemeka Nwosu', admNo: 'ADM/2024/103', submittedAt: 'Today, 8:15 AM', status: 'submitted', score: 0 },
  { id: '4', studentName: 'Damilola Adeyemi', admNo: 'ADM/2024/104', submittedAt: 'Today, 9:00 AM', status: 'submitted', score: 0 },
  { id: '5', studentName: 'Emmanuel Obi', admNo: 'ADM/2024/105', submittedAt: 'Today, 10:30 AM', status: 'submitted', score: 0 },
];

export function AssignmentsTab({ teacher }: { teacher: TeacherData }) {
  const [assignments, setAssignments] = useState<AssignmentItem[]>(mockAssignmentsList);
  const [filter, setFilter] = useState<'all' | 'open' | 'grading' | 'closed'>('all');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeGradingAssignment, setActiveGradingAssignment] = useState<AssignmentItem | null>(null);
  const [submissionsList, setSubmissionsList] = useState<StudentSubmission[]>(mockSubmissions);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AssignmentType>('homework');
  const [newClass, setNewClass] = useState('SS2A');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newMaxScore, setNewMaxScore] = useState('20');
  const [newDueDate, setNewDueDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('23:59');
  const [newInstructions, setNewInstructions] = useState('');

  function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: AssignmentItem = {
      id: String(Date.now()),
      title: newTitle,
      type: newType,
      class: newClass,
      subject: newSubject,
      maxScore: parseInt(newMaxScore) || 20,
      dueDate: newDueDate,
      dueTime: newDueTime,
      submitted: 0,
      total: 35,
      graded: 0,
      status: 'open',
      instructions: newInstructions || 'Follow all standard problem set guidelines.',
    };

    setAssignments(prev => [newItem, ...prev]);
    setShowCreateModal(false);
    setToastMessage(`Assignment "${newTitle}" published for ${newClass}!`);
    setTimeout(() => setToastMessage(null), 5000);

    // Reset Form
    setNewTitle('');
    setNewInstructions('');
  }

  function handleScoreUpdate(submissionId: string, scoreVal: string) {
    const num = parseInt(scoreVal) || 0;
    setSubmissionsList(prev =>
      prev.map(sub => sub.id === submissionId ? { ...sub, score: num, status: 'graded' } : sub)
    );
  }

  function handleSaveGrades() {
    if (activeGradingAssignment) {
      const gradedCount = submissionsList.filter(s => s.status === 'graded').length;
      setAssignments(prev =>
        prev.map(a => a.id === activeGradingAssignment.id ? { ...a, graded: gradedCount } : a)
      );
      setToastMessage(`Grades saved and synced to CA gradebook for ${activeGradingAssignment.title}!`);
      setTimeout(() => setToastMessage(null), 5000);
      setActiveGradingAssignment(null);
    }
  }

  // Filtered List
  const filteredAssignments = assignments.filter(a => {
    const matchStatus = filter === 'all' || a.status === filter;
    const matchClass = classFilter === 'All' || a.class === classFilter;
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.class.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchClass && matchSearch;
  });

  // Summary Metrics
  const openCount = assignments.filter(a => a.status === 'open').length;
  const gradingCount = assignments.filter(a => a.status === 'grading').length;
  const closedCount = assignments.filter(a => a.status === 'closed').length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center font-black">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">
              Assignment &amp; Homework Distribution
            </h1>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Publish classroom assignments, monitor student submissions, grade work, and sync Continuous Assessment (CA)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-black shadow-md shadow-[hsl(var(--accent)/0.25)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Assignment</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-blue-500/5">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Active &amp; Open Submissions</span>
          <p className="text-2xl font-black text-blue-400">{openCount} Tasks</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Accepting student work</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-amber-500/5">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Grading</span>
          <p className="text-2xl font-black text-amber-400">{gradingCount} Tasks</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Submissions awaiting teacher review</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-emerald-500/5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Completed &amp; Graded</span>
          <p className="text-2xl font-black text-emerald-400">{closedCount} Tasks</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Synced to term gradebook</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search assignments by title, class, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
          >
            <option value="All">All Classes</option>
            <option value="SS2A">SS2A</option>
            <option value="SS2B">SS2B</option>
            <option value="SS3A">SS3A</option>
            <option value="JS3A">JS3A</option>
            <option value="SS1A">SS1A</option>
          </select>

          <div className="flex items-center gap-1 p-0.5 bg-[hsl(var(--bg-tertiary))] rounded-xl border border-[hsl(var(--border))]">
            {(['all', 'open', 'grading', 'closed'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filter === st
                    ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                {st === 'grading' ? 'Needs Grading' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Distribution Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map(item => {
          const submissionPct = Math.round((item.submitted / (item.total || 1)) * 100);
          const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'closed';
          const typeConf = typeStyles[item.type] || typeStyles.homework;

          return (
            <div
              key={item.id}
              className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Chips */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${typeConf.badge}`}>
                      {typeConf.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold">
                      {item.class} • {item.subject}
                    </span>
                  </div>

                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                    {item.maxScore} Pts
                  </span>
                </div>

                {/* Title & Instructions */}
                <div>
                  <h3 className="text-base font-black text-[hsl(var(--text-primary))] line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))] line-clamp-2 mt-1">
                    {item.instructions}
                  </p>
                </div>

                {/* Due Date & Submission Pulse */}
                <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[hsl(var(--text-secondary))]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Due: <strong>{new Date(item.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {item.dueTime}</strong></span>
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                        Deadline Passed
                      </span>
                    )}
                  </div>

                  {/* Submission Progress Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[hsl(var(--text-tertiary))]">Submissions Progress</span>
                      <span className="font-bold text-[hsl(var(--text-primary))] font-mono">
                        {item.submitted} of {item.total} ({submissionPct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(var(--bg-secondary))] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          submissionPct >= 80 ? 'bg-emerald-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${submissionPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))] gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  item.status === 'open'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : item.status === 'grading'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {item.status === 'open' ? '● Open' : item.status === 'grading' ? '✎ Needs Grading' : '✓ Closed'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveGradingAssignment(item)}
                    className="px-3 py-1.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Grade &amp; Sync CA</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PUBLISH NEW ASSIGNMENT                                             */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-card w-full max-w-xl rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Publish New Assignment</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">Dispatches task directly to student portals</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Problem Set 3: Quadratic Factorisation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="homework">Homework</option>
                    <option value="quiz">Class Quiz</option>
                    <option value="project">Term Project</option>
                    <option value="group">Group Work</option>
                    <option value="practical">Lab Practical</option>
                    <option value="research">Research Paper</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Class</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="SS2A">SS2A</option>
                    <option value="SS2B">SS2B</option>
                    <option value="SS3A">SS3A</option>
                    <option value="JS3A">JS3A</option>
                    <option value="SS1A">SS1A</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Total Marks / Points</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Due Time</label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Detailed Instructions</label>
                <textarea
                  rows={3}
                  placeholder="State problem numbers, required working format, or attachment instructions..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md transition-all"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GRADE SUBMISSIONS & SYNC TO CA                                     */}
      {/* ========================================================================= */}
      {activeGradingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-card w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
              <div>
                <span className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider">
                  Grading Desk • {activeGradingAssignment.class}
                </span>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">
                  {activeGradingAssignment.title} (Max: {activeGradingAssignment.maxScore} Pts)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGradingAssignment(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                      <th className="py-2.5 px-3 font-bold text-[hsl(var(--text-tertiary))]">Student</th>
                      <th className="py-2.5 px-3 font-bold text-[hsl(var(--text-tertiary))]">Submission Time</th>
                      <th className="py-2.5 px-3 font-bold text-[hsl(var(--text-tertiary))] text-center">Score (/{activeGradingAssignment.maxScore})</th>
                      <th className="py-2.5 px-3 font-bold text-[hsl(var(--text-tertiary))]">Feedback Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {submissionsList.map(sub => (
                      <tr key={sub.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)]">
                        <td className="py-2.5 px-3 whitespace-nowrap font-bold text-[hsl(var(--text-primary))]">
                          {sub.studentName}
                          <span className="block text-[10px] text-[hsl(var(--text-tertiary))] font-mono">{sub.admNo}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[hsl(var(--text-secondary))] font-mono text-[11px]">
                          {sub.submittedAt}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={activeGradingAssignment.maxScore}
                            value={sub.score || ''}
                            placeholder="0"
                            onChange={(e) => handleScoreUpdate(sub.id, e.target.value)}
                            className="w-16 h-8 text-center font-mono font-bold rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            defaultValue={sub.feedback || ''}
                            placeholder="Add quick feedback..."
                            className="w-full h-8 px-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[11px] text-[hsl(var(--text-primary))] focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                <span className="text-xs text-[hsl(var(--text-tertiary))]">
                  Grades will automatically link to student report broadsheets.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveGradingAssignment(null)}
                    className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGrades}
                    className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md"
                  >
                    Save &amp; Sync to Gradebook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
