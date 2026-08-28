'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import {
  Download, Save, ChevronDown, Award, TrendingUp, BarChart3,
  CheckCircle2, Search, Edit3, Eye, FileSpreadsheet, Sparkles,
  AlertCircle, ArrowUpRight, Check, X, Filter, Users
} from 'lucide-react';

const mockClasses = ['SS2A', 'SS2B', 'SS3A', 'JS3A', 'SS1A'];
const mockSubjects = ['Mathematics', 'Further Mathematics', 'Calculus'];
const mockTerms = ['Term 1 (Harmattan)', 'Term 2 (Rain - Current)', 'Term 3 (Trinity)'];

interface StudentScoreRecord {
  id: string;
  name: string;
  admNo: string;
  avatarInitials: string;
  ca1: number;
  ca2: number;
  ca3: number;
  midterm: number;
  exam: number;
  remark?: string;
}

function calcWeightedTotal(s: StudentScoreRecord): number {
  return Math.round(
    (s.ca1 * 0.1) +
    (s.ca2 * 0.1) +
    (s.ca3 * 0.1) +
    (s.midterm * 0.2) +
    (s.exam * 0.5)
  );
}

function getGradeInfo(total: number): { grade: string; remark: string; badgeColor: string } {
  if (total >= 80) return { grade: 'A1', remark: 'Excellent', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  if (total >= 70) return { grade: 'B2', remark: 'Very Good', badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30' };
  if (total >= 65) return { grade: 'B3', remark: 'Good', badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  if (total >= 60) return { grade: 'C4', remark: 'Credit', badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
  if (total >= 55) return { grade: 'C5', remark: 'Credit', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  if (total >= 50) return { grade: 'C6', remark: 'Credit', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  if (total >= 45) return { grade: 'D7', remark: 'Pass', badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
  if (total >= 40) return { grade: 'E8', remark: 'Weak Pass', badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
  return { grade: 'F9', remark: 'Fail', badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
}

const initialNames = [
  'Adewale Okonkwo', 'Blessing Eze', 'Chukwuemeka Nwosu', 'Damilola Adeyemi',
  'Emmanuel Obi', 'Fatima Ibrahim', 'Grace Okafor', 'Henry Adesanya',
  'Ifeoma Nwachukwu', 'Joshua Adeleke', 'Kelechi Onyeka', 'Lara Babatunde',
  'Musa Aliyu', 'Ngozi Okonkwo', 'Obinna Eze', 'Patricia Ogundimu',
  'Quadri Afolabi', 'Rachael Uzoma', 'Samuel Adebayo', 'Taiwo Olawale'
];

function generateStudentRecords(): StudentScoreRecord[] {
  return initialNames.map((name, i) => {
    const initials = name.split(' ').map(n => n[0]).join('');
    return {
      id: String(i + 1),
      name,
      admNo: `ADM/2024/${String(i + 101).padStart(3, '0')}`,
      avatarInitials: initials,
      ca1: Math.min(100, Math.floor(Math.random() * 25) + 65),
      ca2: Math.min(100, Math.floor(Math.random() * 25) + 60),
      ca3: Math.min(100, Math.floor(Math.random() * 25) + 62),
      midterm: Math.min(100, Math.floor(Math.random() * 30) + 55),
      exam: Math.min(100, Math.floor(Math.random() * 30) + 58),
      remark: i === 0 ? 'Consistent high achiever' : undefined,
    };
  });
}

export function GradebookTab({ teacher }: { teacher: TeacherData }) {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0]);
  const [selectedSubject, setSelectedSubject] = useState(mockSubjects[0]);
  const [selectedTerm, setSelectedTerm] = useState(mockTerms[1]);
  const [students, setStudents] = useState<StudentScoreRecord[]>(generateStudentRecords());
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(true);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Update a student score field
  function handleScoreChange(id: string, field: keyof Pick<StudentScoreRecord, 'ca1' | 'ca2' | 'ca3' | 'midterm' | 'exam'>, value: string) {
    const num = Math.max(0, Math.min(100, parseInt(value) || 0));
    setStudents(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: num } : s)
    );
    setSavedToast(null);
  }

  function handleSaveScores() {
    setSavedToast(`Scores saved & broadsheet recalculated for ${selectedClass} - ${selectedSubject}!`);
    setTimeout(() => setSavedToast(null), 5000);
  }

  // Export to CSV
  function handleExportCSV() {
    const headers = ['Rank,Admission No,Student Name,CA1 (10%),CA2 (10%),CA3 (10%),Midterm (20%),Exam (50%),Total (100%),Grade,Remark'];
    const rows = sortedStudents.map((s, idx) => {
      const tot = calcWeightedTotal(s);
      const g = getGradeInfo(tot);
      return `${idx + 1},${s.admNo},"${s.name}",${s.ca1},${s.ca2},${s.ca3},${s.midterm},${s.exam},${tot},${g.grade},"${g.remark}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gradebook_${selectedClass}_${selectedSubject}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Calculate totals and ranking
  const studentsWithTotals = students.map(s => ({
    ...s,
    total: calcWeightedTotal(s),
    gradeInfo: getGradeInfo(calcWeightedTotal(s)),
  }));

  const sortedStudents = [...studentsWithTotals].sort((a, b) => b.total - a.total);

  // Filtered List
  const filteredStudents = sortedStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admNo.toLowerCase().includes(search.toLowerCase())
  );

  // Analytics Metrics
  const totals = studentsWithTotals.map(s => s.total);
  const classAvg = totals.length > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
  const highestScore = totals.length > 0 ? Math.max(...totals) : 0;
  const lowestScore = totals.length > 0 ? Math.min(...totals) : 0;
  const passCount = totals.filter(t => t >= 50).length;
  const passRate = totals.length > 0 ? Math.round((passCount / totals.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {savedToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{savedToast}</span>
          </div>
          <button onClick={() => setSavedToast(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">
                Continuous Assessment &amp; Gradebook
              </h1>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                Enter CA test marks and term exams with automatic weighted totals and letter grading
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleSaveScores}
            className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-black shadow-md shadow-[hsl(var(--accent)/0.25)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save &amp; Recalculate</span>
          </button>
        </div>
      </div>

      {/* Filter & Selection Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Class Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
          >
            {mockClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Subject Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
          >
            {mockSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Term Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Academic Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
          >
            {mockTerms.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Class Performance Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Class Average</span>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{classAvg}%</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Weighted Term Mean</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-emerald-500/5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Pass Rate</span>
          <p className="text-2xl font-black text-emerald-400">{passRate}%</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{passCount} of {students.length} Passing (≥ 50%)</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Highest Score</span>
          <p className="text-2xl font-black text-[hsl(var(--accent))]">{highestScore}%</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Top of class</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Lowest Score</span>
          <p className="text-2xl font-black text-amber-400">{lowestScore}%</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Requires intervention</p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search students in gradebook..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        <div className="text-xs text-[hsl(var(--text-tertiary))] font-mono">
          Weight Formula: <strong>CA1(10%) + CA2(10%) + CA3(10%) + Midterm(20%) + Exam(50%) = Total(100%)</strong>
        </div>
      </div>

      {/* SPREADSHEET GRADEBOOK TABLE */}
      <div className="glass-card overflow-hidden rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
                <th className="py-3.5 px-3 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider w-12 text-center">Rank</th>
                <th className="py-3.5 px-4 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Student</th>
                <th className="py-3.5 px-3 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-center">CA 1 (10%)</th>
                <th className="py-3.5 px-3 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-center">CA 2 (10%)</th>
                <th className="py-3.5 px-3 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-center">CA 3 (10%)</th>
                <th className="py-3.5 px-3 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-center">Midterm (20%)</th>
                <th className="py-3.5 px-3 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-center">Exam (50%)</th>
                <th className="py-3.5 px-3 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-center">Weighted Total</th>
                <th className="py-3.5 px-3 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-center">Grade</th>
                <th className="py-3.5 px-4 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  {/* Rank */}
                  <td className="py-3 px-3 text-center font-mono font-bold text-[hsl(var(--text-tertiary))]">
                    {idx + 1 === 1 ? '🥇 1st' : idx + 1 === 2 ? '🥈 2nd' : idx + 1 === 3 ? '🥉 3rd' : `${idx + 1}th`}
                  </td>

                  {/* Student */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-[11px] shrink-0">
                        {s.avatarInitials}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{s.name}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">{s.admNo}</p>
                      </div>
                    </div>
                  </td>

                  {/* CA 1 */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={s.ca1}
                      onChange={(e) => handleScoreChange(s.id, 'ca1', e.target.value)}
                      className="w-16 h-8 text-center font-mono font-bold rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </td>

                  {/* CA 2 */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={s.ca2}
                      onChange={(e) => handleScoreChange(s.id, 'ca2', e.target.value)}
                      className="w-16 h-8 text-center font-mono font-bold rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </td>

                  {/* CA 3 */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={s.ca3}
                      onChange={(e) => handleScoreChange(s.id, 'ca3', e.target.value)}
                      className="w-16 h-8 text-center font-mono font-bold rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </td>

                  {/* Midterm */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={s.midterm}
                      onChange={(e) => handleScoreChange(s.id, 'midterm', e.target.value)}
                      className="w-16 h-8 text-center font-mono font-bold rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </td>

                  {/* Exam */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={s.exam}
                      onChange={(e) => handleScoreChange(s.id, 'exam', e.target.value)}
                      className="w-16 h-8 text-center font-mono font-bold rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </td>

                  {/* Weighted Total */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="font-mono font-black text-sm text-[hsl(var(--text-primary))]">
                      {s.total}%
                    </span>
                  </td>

                  {/* Grade Badge */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-md border ${s.gradeInfo.badgeColor}`}>
                      {s.gradeInfo.grade}
                    </span>
                  </td>

                  {/* Remark */}
                  <td className="py-3 px-4 whitespace-nowrap text-xs text-[hsl(var(--text-secondary))]">
                    {s.gradeInfo.remark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
