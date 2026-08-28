'use client';

import { useState } from 'react';
import {
  GraduationCap, Calendar, Plus, CheckCircle2,
  Trash2, Edit2, Award, BookOpen, Layers, X
} from 'lucide-react';

interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  currentTerm: string;
  isCurrent: boolean;
}

interface GradingScale {
  id: string;
  name: string;
  type: string;
  grades: { letter: string; minScore: number; gpa: number; remark: string }[];
}

const INITIAL_SESSIONS: AcademicSession[] = [
  {
    id: 's1',
    name: '2025/2026 Academic Year',
    startDate: '2025-09-08',
    endDate: '2026-07-24',
    currentTerm: 'Term 1 (First Term)',
    isCurrent: true,
  },
  {
    id: 's2',
    name: '2024/2025 Academic Year',
    startDate: '2024-09-09',
    endDate: '2025-07-25',
    currentTerm: 'Completed',
    isCurrent: false,
  },
];

const INITIAL_SCALES: GradingScale[] = [
  {
    id: 'scale1',
    name: 'WAEC / WASSCE Standard 9-Point Scale',
    type: 'letter_with_gpa',
    grades: [
      { letter: 'A1', minScore: 75, gpa: 4.0, remark: 'Excellent' },
      { letter: 'B2', minScore: 70, gpa: 3.6, remark: 'Very Good' },
      { letter: 'B3', minScore: 65, gpa: 3.2, remark: 'Good' },
      { letter: 'C4', minScore: 60, gpa: 2.8, remark: 'Credit' },
      { letter: 'C5', minScore: 55, gpa: 2.4, remark: 'Credit' },
      { letter: 'C6', minScore: 50, gpa: 2.0, remark: 'Credit' },
      { letter: 'D7', minScore: 45, gpa: 1.6, remark: 'Pass' },
      { letter: 'E8', minScore: 40, gpa: 1.2, remark: 'Pass' },
      { letter: 'F9', minScore: 0,  gpa: 0.0, remark: 'Fail' },
    ],
  },
  {
    id: 'scale2',
    name: 'Primary & Junior Letter Grading (A-F)',
    type: 'standard_letter',
    grades: [
      { letter: 'A', minScore: 80, gpa: 4.0, remark: 'Distinction' },
      { letter: 'B', minScore: 70, gpa: 3.0, remark: 'Merit' },
      { letter: 'C', minScore: 60, gpa: 2.0, remark: 'Pass' },
      { letter: 'D', minScore: 50, gpa: 1.0, remark: 'Needs Improvement' },
      { letter: 'F', minScore: 0,  gpa: 0.0, remark: 'Unsatisfactory' },
    ],
  },
];

export default function AcademicStructure() {
  const [sessions, setSessions] = useState<AcademicSession[]>(INITIAL_SESSIONS);
  const [scales, setScales] = useState<GradingScale[]>(INITIAL_SCALES);
  const [activeScaleId, setActiveScaleId] = useState('scale1');
  const [isAddingSession, setIsAddingSession] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    name: '',
    startDate: '2026-09-07',
    endDate: '2027-07-23',
    currentTerm: 'Term 1',
  });

  const handleAddSession = () => {
    if (!sessionForm.name.trim()) return;
    const newSession: AcademicSession = {
      id: `s-${Date.now()}`,
      name: sessionForm.name,
      startDate: sessionForm.startDate,
      endDate: sessionForm.endDate,
      currentTerm: sessionForm.currentTerm,
      isCurrent: false,
    };
    setSessions(prev => [newSession, ...prev]);
    setIsAddingSession(false);
    setSessionForm({ name: '', startDate: '2026-09-07', endDate: '2027-07-23', currentTerm: 'Term 1' });
  };

  const selectedScale = scales.find(s => s.id === activeScaleId) || scales[0];

  return (
    <div className="space-y-6">
      {/* Academic Sessions & Terms */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Academic Sessions & Term Windows</h4>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Set active academic calendars, terms, and promotion cycles.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingSession(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Academic Year
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map(s => (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                s.isCurrent ? 'bg-[hsl(var(--accent)/0.08)] border-[hsl(var(--accent)/0.4)]' : 'bg-[hsl(var(--bg-tertiary)/0.3)] border-[hsl(var(--border))]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[hsl(var(--text-primary))]">{s.name}</span>
                  {s.isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Active Calendar
                    </span>
                  )}
                </div>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  {s.startDate} → {s.endDate} · <span className="text-[hsl(var(--text-secondary))] font-medium">{s.currentTerm}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!s.isCurrent && (
                  <button
                    type="button"
                    onClick={() => setSessions(prev => prev.map(item => ({ ...item, isCurrent: item.id === s.id })))}
                    className="px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    Set as Current
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grading Scales & Assessment Frameworks */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[hsl(var(--border))]">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Grading Schemes & Weighting Scales</h4>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Define assessment cutoffs, grade remarks, and quality points.</p>
          </div>
        </div>

        {/* Scale selector tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {scales.map(scale => (
            <button
              key={scale.id}
              type="button"
              onClick={() => setActiveScaleId(scale.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeScaleId === scale.id
                  ? 'bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))] shadow-sm'
                  : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              {scale.name}
            </button>
          ))}
        </div>

        {/* Grading Table */}
        <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
          <table className="w-full text-xs">
            <thead className="bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border))]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-[hsl(var(--text-secondary))]">Grade / Letter</th>
                <th className="px-4 py-3 text-left font-bold text-[hsl(var(--text-secondary))]">Min Score (%)</th>
                <th className="px-4 py-3 text-left font-bold text-[hsl(var(--text-secondary))]">Grade Point (GPA)</th>
                <th className="px-4 py-3 text-left font-bold text-[hsl(var(--text-secondary))]">Official Evaluation Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {selectedScale.grades.map((g, idx) => (
                <tr key={idx} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="px-4 py-3 font-black text-[hsl(var(--accent))]">{g.letter}</td>
                  <td className="px-4 py-3 font-semibold text-[hsl(var(--text-primary))]">{g.minScore}%</td>
                  <td className="px-4 py-3 font-mono font-bold text-[hsl(var(--text-secondary))]">{g.gpa.toFixed(1)}</td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--text-secondary))]">{g.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Session Modal */}
      {isAddingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">New Academic Year</h3>
              <button onClick={() => setIsAddingSession(false)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Session Name</label>
                <input
                  type="text"
                  value={sessionForm.name}
                  onChange={e => setSessionForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. 2026/2027 Academic Year"
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Start Date</label>
                  <input
                    type="date"
                    value={sessionForm.startDate}
                    onChange={e => setSessionForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">End Date</label>
                  <input
                    type="date"
                    value={sessionForm.endDate}
                    onChange={e => setSessionForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button onClick={() => setIsAddingSession(false)} className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]">Cancel</button>
              <button onClick={handleAddSession} className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold">Create Year</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
