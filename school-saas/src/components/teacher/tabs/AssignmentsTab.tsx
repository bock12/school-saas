'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Plus, FileText, Clock, Users, CheckSquare, X, Eye, Download } from 'lucide-react';

type AssignmentType = 'homework' | 'quiz' | 'project' | 'group' | 'practical' | 'research';

interface Assignment {
  id: string; title: string; type: AssignmentType; class: string; subject: string;
  dueDate: string; submitted: number; total: number; graded: number; status: 'open' | 'closed' | 'grading';
}

const typeColors: Record<AssignmentType, string> = {
  homework: 'bg-blue-500/15 text-blue-400',
  quiz: 'bg-purple-500/15 text-purple-400',
  project: 'bg-emerald-500/15 text-emerald-400',
  group: 'bg-cyan-500/15 text-cyan-400',
  practical: 'bg-amber-500/15 text-amber-400',
  research: 'bg-rose-500/15 text-rose-400',
};

const mockAssignments: Assignment[] = [
  { id: '1', title: 'Quadratic Equations Exercise', type: 'homework', class: 'SS2A', subject: 'Mathematics', dueDate: '2026-08-05', submitted: 30, total: 35, graded: 25, status: 'grading' },
  { id: '2', title: 'Mid-Term Quiz — Algebra', type: 'quiz', class: 'SS2B', subject: 'Mathematics', dueDate: '2026-08-07', submitted: 20, total: 38, graded: 0, status: 'open' },
  { id: '3', title: 'Statistics Group Project', type: 'group', class: 'SS3A', subject: 'Further Maths', dueDate: '2026-08-10', submitted: 8, total: 11, graded: 0, status: 'open' },
  { id: '4', title: 'Number Theory Research', type: 'research', class: 'SS3A', subject: 'Further Maths', dueDate: '2026-07-30', submitted: 33, total: 33, graded: 33, status: 'closed' },
  { id: '5', title: 'Practical Lab — Measurements', type: 'practical', class: 'JS3A', subject: 'Mathematics', dueDate: '2026-08-12', submitted: 5, total: 41, graded: 0, status: 'open' },
];

export function AssignmentsTab({ teacher }: { teacher: TeacherData }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'grading' | 'closed'>('all');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('homework');

  const filtered = mockAssignments.filter((a) => filter === 'all' || a.status === filter);

  const counts = {
    open: mockAssignments.filter((a) => a.status === 'open').length,
    grading: mockAssignments.filter((a) => a.status === 'grading').length,
    closed: mockAssignments.filter((a) => a.status === 'closed').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Assignments</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Create and manage all assignments for your classes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:scale-105 transition-all"
          style={{ background: teacher.primaryColor }}
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open', value: counts.open, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Needs Grading', value: counts.grading, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Closed', value: counts.closed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--accent)/0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[hsl(var(--text-primary))]">New Assignment</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
          </div>
          {/* Type selector */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2">Assignment Type</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(typeColors) as AssignmentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAssignmentType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${assignmentType === type ? typeColors[type] + ' ring-1 ring-current' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Title</label>
              <input placeholder="Assignment title..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
            </div>
            {[
              { label: 'Class', placeholder: 'e.g. SS2A' },
              { label: 'Due Date', type: 'date' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">{f.label}</label>
                <input type={f.type || 'text'} placeholder={f.placeholder} className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Instructions</label>
              <textarea rows={3} placeholder="Provide clear instructions..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>Publish Assignment</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'open', 'grading', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'}`}
          >
            {f === 'grading' ? 'Needs Grading' : f}
          </button>
        ))}
      </div>

      {/* Assignment List */}
      <div className="space-y-3">
        {filtered.map((a) => {
          const submissionPct = Math.round((a.submitted / a.total) * 100);
          const isOverdue = new Date(a.dueDate) < new Date() && a.status !== 'closed';
          return (
            <div key={a.id} className="glass-card rounded-2xl p-4 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${typeColors[a.type]}`}>{a.type}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-bold">{a.class}</span>
                    {isOverdue && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-black">Overdue</span>}
                  </div>
                  <h3 className="font-black text-[hsl(var(--text-primary))] text-sm">{a.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {a.submitted}/{a.total} submitted</span>
                    {a.graded > 0 && <span className="flex items-center gap-1 text-emerald-400"><CheckSquare className="w-3 h-3" /> {a.graded} graded</span>}
                  </div>
                  {/* Submission bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${submissionPct}%` }} />
                    </div>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{submissionPct}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors font-semibold">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  {a.status === 'grading' && (
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-amber-500/15 text-amber-400 font-bold hover:bg-amber-500/25 transition-colors">
                      Grade
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
