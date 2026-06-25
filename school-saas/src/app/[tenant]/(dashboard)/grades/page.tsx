'use client';

import { useState } from 'react';
import { BarChart3, Save } from 'lucide-react';

const demoStudents = [
  { id: '1', name: 'Amara Johnson', admission: 'STU-001', score: 92, max: 100, grade: 'A' },
  { id: '2', name: 'David Okafor', admission: 'STU-002', score: 78, max: 100, grade: 'B+' },
  { id: '3', name: 'Sarah Williams', admission: 'STU-003', score: 85, max: 100, grade: 'A-' },
  { id: '4', name: 'Michael Chen', admission: 'STU-004', score: 65, max: 100, grade: 'B-' },
  { id: '5', name: 'Fatima Hassan', admission: 'STU-005', score: 91, max: 100, grade: 'A' },
  { id: '6', name: 'James Nguyen', admission: 'STU-006', score: 73, max: 100, grade: 'B' },
  { id: '7', name: 'Priya Sharma', admission: 'STU-007', score: 88, max: 100, grade: 'A-' },
  { id: '8', name: 'Emmanuel Adeyemi', admission: 'STU-008', score: 56, max: 100, grade: 'C+' },
  { id: '9', name: 'Lisa Park', admission: 'STU-009', score: 95, max: 100, grade: 'A+' },
  { id: '10', name: 'Omar Ali', admission: 'STU-010', score: 70, max: 100, grade: 'B' },
];

function getGradeColor(grade: string) {
  if (grade.startsWith('A')) return 'bg-emerald-500/15 text-emerald-400';
  if (grade.startsWith('B')) return 'bg-blue-500/15 text-blue-400';
  if (grade.startsWith('C')) return 'bg-amber-500/15 text-amber-400';
  if (grade.startsWith('D')) return 'bg-orange-500/15 text-orange-400';
  return 'bg-red-500/15 text-red-400';
}

function getScoreGrade(score: number): string {
  if (score >= 93) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 87) return 'A-';
  if (score >= 83) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 77) return 'B-';
  if (score >= 73) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 67) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
}

export default function GradesPage() {
  const [selectedClass, setSelectedClass] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [grades, setGrades] = useState<Record<string, { score: number; grade: string }>>(
    Object.fromEntries(demoStudents.map(s => [s.id, { score: s.score, grade: s.grade }]))
  );

  const updateScore = (id: string, scoreStr: string) => {
    const score = parseInt(scoreStr) || 0;
    const grade = getScoreGrade(Math.min(100, Math.max(0, score)));
    setGrades({ ...grades, [id]: { score, grade } });
  };

  const scores = Object.values(grades).map(g => g.score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  const passing = scores.filter(s => s >= 60).length;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Grades & Assessment</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Enter and manage student grades</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" /> Save Grades
        </button>
      </div>

      {/* Selectors */}
      <div className="glass-card p-4 flex flex-wrap items-end gap-4">
        {[
          { label: 'Class', value: selectedClass, onChange: setSelectedClass, options: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
          { label: 'Section', value: selectedSection, onChange: setSelectedSection, options: ['A', 'B'] },
          { label: 'Subject', value: selectedSubject, onChange: setSelectedSubject, options: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History'] },
          { label: 'Term', value: selectedTerm, onChange: setSelectedTerm, options: ['Term 1', 'Term 2', 'Term 3'] },
        ].map(sel => (
          <div key={sel.label}>
            <label className="block text-[10px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">{sel.label}</label>
            <select value={sel.value} onChange={e => sel.onChange(e.target.value)} className="h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
              {sel.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Class Average', value: `${avg}%`, color: 'hsl(var(--accent))' },
          { label: 'Highest Score', value: `${highest}%`, color: 'hsl(142, 71%, 45%)' },
          { label: 'Lowest Score', value: `${lowest}%`, color: 'hsl(0, 84%, 60%)' },
          { label: 'Pass Rate', value: `${Math.round(passing / demoStudents.length * 100)}%`, color: 'hsl(38, 92%, 50%)' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Grades Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[hsl(var(--accent))]" />
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">{selectedSubject}</span>
          <span className="text-xs text-[hsl(var(--text-tertiary))]">— {selectedClass} Section {selectedSection} — {selectedTerm}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 w-12">#</th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">Student</th>
                <th className="text-center text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 w-32">Score (/100)</th>
                <th className="text-center text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 w-20">Grade</th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">Progress</th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 w-48">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {demoStudents.map((student, i) => {
                const g = grades[student.id];
                return (
                  <tr key={student.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3 text-xs text-[hsl(var(--text-tertiary))]">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                          {student.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{student.name}</p>
                          <code className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{student.admission}</code>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={g.score}
                        onChange={e => updateScore(student.id, e.target.value)}
                        className="w-20 h-8 px-2 text-center rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] font-mono focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${getGradeColor(g.grade)}`}>
                        {g.grade}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-tertiary))]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${g.score >= 80 ? 'bg-emerald-400' : g.score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(100, g.score)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        className="w-full h-8 px-2 rounded-lg bg-transparent border-0 text-xs text-[hsl(var(--text-secondary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
