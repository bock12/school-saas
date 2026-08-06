'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Download, Save, ChevronDown, Award } from 'lucide-react';

const classes = ['SS2A', 'SS2B', 'SS3A', 'JS3A', 'SS1A'];
const subjects = ['Mathematics', 'Further Mathematics'];

interface Student {
  id: string; name: string; admNo: string;
  ca1: number; ca2: number; ca3: number; midterm: number; exam: number;
}

function calcTotal(s: Student) { return Math.round(s.ca1 * 0.1 + s.ca2 * 0.1 + s.ca3 * 0.1 + s.midterm * 0.2 + s.exam * 0.5); }
function getGrade(total: number) {
  if (total >= 75) return { grade: 'A', color: 'text-emerald-400' };
  if (total >= 65) return { grade: 'B', color: 'text-blue-400' };
  if (total >= 55) return { grade: 'C', color: 'text-amber-400' };
  if (total >= 45) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}

const names = ['Adewale Okonkwo', 'Blessing Eze', 'Chukwuemeka Nwosu', 'Damilola Adeyemi', 'Emmanuel Obi', 'Fatima Ibrahim', 'Grace Okafor', 'Henry Adesanya', 'Ifeoma Nwachukwu', 'Joshua Adeleke', 'Kelechi Onyeka', 'Lara Babatunde', 'Musa Aliyu', 'Ngozi Okonkwo', 'Obinna Eze'];

function generateStudents(): Student[] {
  return names.map((name, i) => ({
    id: String(i + 1), name, admNo: `ADM/2024/${String(i + 1).padStart(3, '0')}`,
    ca1: Math.floor(Math.random() * 20) + 60,
    ca2: Math.floor(Math.random() * 20) + 58,
    ca3: Math.floor(Math.random() * 20) + 55,
    midterm: Math.floor(Math.random() * 30) + 55,
    exam: Math.floor(Math.random() * 30) + 55,
  }));
}

export function GradebookTab({ teacher }: { teacher: TeacherData }) {
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [term, setTerm] = useState('Term 2');
  const [students] = useState<Student[]>(generateStudents());
  const [editMode, setEditMode] = useState(false);

  const totals = students.map((s) => calcTotal(s));
  const avg = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
  const highest = Math.max(...totals);
  const lowest = Math.min(...totals);
  const passCount = totals.filter((t) => t >= 50).length;

  const columns = [
    { key: 'ca1', label: 'CA 1', max: 100, weight: '10%' },
    { key: 'ca2', label: 'CA 2', max: 100, weight: '10%' },
    { key: 'ca3', label: 'CA 3', max: 100, weight: '10%' },
    { key: 'midterm', label: 'Mid-term', max: 100, weight: '20%' },
    { key: 'exam', label: 'Exam', max: 100, weight: '50%' },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Gradebook</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Enter and manage student scores with auto-calculated totals</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${editMode ? 'bg-emerald-500 text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}
          >
            {editMode ? '✓ Editing' : 'Edit Scores'}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3">
        {[
          { label: 'Class', value: selectedClass, options: classes, onChange: setSelectedClass },
          { label: 'Subject', value: selectedSubject, options: subjects, onChange: setSelectedSubject },
          { label: 'Term', value: term, options: ['Term 1', 'Term 2', 'Term 3'], onChange: setTerm },
        ].map((ctrl) => (
          <div key={ctrl.label} className="flex items-center gap-2">
            <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">{ctrl.label}:</label>
            <select
              value={ctrl.value}
              onChange={(e) => ctrl.onChange(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            >
              {ctrl.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Class Average', value: `${avg}%`, color: getGrade(avg).color },
          { label: 'Highest Score', value: `${highest}%`, color: 'text-emerald-400' },
          { label: 'Lowest Score', value: `${lowest}%`, color: 'text-red-400' },
          { label: 'Pass Rate', value: `${Math.round((passCount / students.length) * 100)}%`, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gradebook Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">#</th>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Student</th>
                {columns.map((col) => (
                  <th key={col.key} className="text-center py-3 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
                    <div>{col.label}</div>
                    <div className="text-[9px] font-normal text-[hsl(var(--text-tertiary))] opacity-60">{col.weight}</div>
                  </th>
                ))}
                <th className="text-center py-3 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--accent))]">Total</th>
                <th className="text-center py-3 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Grade</th>
                <th className="text-center py-3 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.4)]">
              {students
                .map((s, i) => ({ ...s, total: calcTotal(s), idx: i }))
                .sort((a, b) => b.total - a.total)
                .map((s, rank) => {
                  const { grade, color } = getGrade(s.total);
                  return (
                    <tr key={s.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                      <td className="py-2.5 px-4 text-xs text-[hsl(var(--text-tertiary))]">{s.idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <div>
                          <p className="font-semibold text-[hsl(var(--text-primary))] text-xs">{s.name}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{s.admNo}</p>
                        </div>
                      </td>
                      {columns.map((col) => (
                        <td key={col.key} className="py-2.5 px-3 text-center">
                          {editMode ? (
                            <input
                              type="number"
                              defaultValue={s[col.key]}
                              min={0} max={col.max}
                              className="w-14 text-center text-xs px-1 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--accent)/0.3)] text-[hsl(var(--text-primary))] focus:outline-none"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">{s[col.key]}</span>
                          )}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-sm font-black text-[hsl(var(--text-primary))]">{s.total}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-sm font-black ${color}`}>{grade}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-xs font-bold text-[hsl(var(--text-tertiary))]">{rank + 1}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                <td colSpan={2} className="py-3 px-4 text-xs font-black text-[hsl(var(--text-secondary))]">Class Average</td>
                {columns.map((col) => {
                  const colAvg = Math.round(students.reduce((s, st) => s + st[col.key], 0) / students.length);
                  return (
                    <td key={col.key} className="py-3 px-3 text-center text-xs font-black text-[hsl(var(--text-primary))]">{colAvg}</td>
                  );
                })}
                <td className="py-3 px-3 text-center text-sm font-black text-[hsl(var(--accent))]">{avg}</td>
                <td className="py-3 px-3 text-center text-sm font-black text-[hsl(var(--accent))]">{getGrade(avg).grade}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {editMode && (
        <div className="flex gap-2 justify-end">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>
            <Save className="w-4 h-4" /> Save All Scores
          </button>
          <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">Cancel</button>
        </div>
      )}
    </div>
  );
}
