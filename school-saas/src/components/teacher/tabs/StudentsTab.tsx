'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Search, User, TrendingUp, CheckSquare, AlertTriangle, Eye, MessageSquare, ChevronRight } from 'lucide-react';

const students = [
  { id: '1', name: 'Adewale Okonkwo', class: 'SS2A', admNo: 'ADM/2024/001', attendance: 95, avgScore: 82, behaviour: 'Good', medicalAlert: false, parentName: 'Mr. Okonkwo Emmanuel', photo: null },
  { id: '2', name: 'Blessing Eze', class: 'SS2A', admNo: 'ADM/2024/002', attendance: 88, avgScore: 76, behaviour: 'Excellent', medicalAlert: false, parentName: 'Mrs. Eze Ngozi', photo: null },
  { id: '3', name: 'Chukwuemeka Nwosu', class: 'SS2B', admNo: 'ADM/2024/003', attendance: 72, avgScore: 55, behaviour: 'Satisfactory', medicalAlert: true, parentName: 'Dr. Nwosu Charles', photo: null },
  { id: '4', name: 'Damilola Adeyemi', class: 'SS2A', admNo: 'ADM/2024/004', attendance: 98, avgScore: 91, behaviour: 'Excellent', medicalAlert: false, parentName: 'Mrs. Adeyemi Funke', photo: null },
  { id: '5', name: 'Emmanuel Obi', class: 'SS2B', admNo: 'ADM/2024/005', attendance: 65, avgScore: 48, behaviour: 'Needs Improvement', medicalAlert: false, parentName: 'Mr. Obi Chibuzor', photo: null },
  { id: '6', name: 'Fatima Ibrahim', class: 'SS3A', admNo: 'ADM/2023/012', attendance: 92, avgScore: 79, behaviour: 'Good', medicalAlert: false, parentName: 'Alhaji Ibrahim Musa', photo: null },
  { id: '7', name: 'Grace Okafor', class: 'SS2A', admNo: 'ADM/2024/007', attendance: 90, avgScore: 85, behaviour: 'Excellent', medicalAlert: false, parentName: 'Mrs. Okafor Chioma', photo: null },
  { id: '8', name: 'Henry Adesanya', class: 'JS3A', admNo: 'ADM/2025/003', attendance: 80, avgScore: 63, behaviour: 'Satisfactory', medicalAlert: false, parentName: 'Mr. Adesanya Toyin', photo: null },
];

const behaviourColors: Record<string, string> = {
  Excellent: 'bg-emerald-500/15 text-emerald-400',
  Good: 'bg-blue-500/15 text-blue-400',
  Satisfactory: 'bg-amber-500/15 text-amber-400',
  'Needs Improvement': 'bg-red-500/15 text-red-400',
};

function getScoreColor(score: number) {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

export function StudentsTab({ teacher }: { teacher: TeacherData }) {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);

  const classes = ['All', ...Array.from(new Set(students.map((s) => s.class)))];
  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.admNo.includes(search);
    const matchClass = classFilter === 'All' || s.class === classFilter;
    return matchSearch && matchClass;
  });

  const selectedStudent = students.find((s) => s.id === selected);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Student List</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{students.length} students across {classes.length - 1} classes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
          <input
            placeholder="Search name or admission no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Class:</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          >
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className={`grid gap-5 ${selectedStudent ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Student List */}
        <div className={`space-y-2 ${selectedStudent ? 'lg:col-span-1' : ''}`}>
          {filtered.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelected(selected === student.id ? null : student.id)}
              className={`glass-card rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-md ${selected === student.id ? 'ring-1 ring-[hsl(var(--accent))]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[hsl(var(--accent))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-[hsl(var(--text-primary))] text-sm truncate">{student.name}</p>
                    {student.medicalAlert && <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" title="Medical Alert" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{student.admNo}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{student.class}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-black ${getScoreColor(student.avgScore)}`}>{student.avgScore}%</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{student.attendance}% att</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Student Detail Panel */}
        {selectedStudent && (
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center">
                  <User className="w-8 h-8 text-[hsl(var(--accent))]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[hsl(var(--text-primary))]">{selectedStudent.name}</h2>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{selectedStudent.admNo} · {selectedStudent.class}</p>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${behaviourColors[selectedStudent.behaviour] || 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}>
                      {selectedStudent.behaviour}
                    </span>
                    {selectedStudent.medicalAlert && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-black">⚠ Medical Alert</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xs text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">✕ Close</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Avg Score', value: `${selectedStudent.avgScore}%`, color: getScoreColor(selectedStudent.avgScore) },
                { label: 'Attendance', value: `${selectedStudent.attendance}%`, color: selectedStudent.attendance >= 80 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Behaviour', value: selectedStudent.behaviour.split(' ')[0], color: 'text-[hsl(var(--text-primary))]' },
                { label: 'Parent', value: 'Linked', color: 'text-blue-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[hsl(var(--bg-tertiary)/0.5)] rounded-xl p-3 text-center">
                  <p className={`text-base font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-5">
              <p className="text-xs font-bold text-[hsl(var(--text-secondary))]">Parent / Guardian</p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                <User className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <p className="text-sm text-[hsl(var(--text-primary))] font-semibold">{selectedStudent.parentName}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[hsl(var(--border)/0.5)]">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] font-semibold transition-colors">
                <TrendingUp className="w-3.5 h-3.5" /> Performance
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] font-semibold transition-colors">
                <CheckSquare className="w-3.5 h-3.5" /> Attendance
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] font-semibold transition-colors">
                <AlertTriangle className="w-3.5 h-3.5" /> Behaviour
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] font-semibold transition-colors hover:bg-[hsl(var(--accent)/0.2)]">
                <MessageSquare className="w-3.5 h-3.5" /> Message Parent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
