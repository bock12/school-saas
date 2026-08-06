'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { CheckSquare, X, Clock, User, Search, Save, RotateCcw, Download } from 'lucide-react';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'sick';

interface Student {
  id: string;
  name: string;
  admNo: string;
  status: AttendanceStatus | null;
}

const statusConfig: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  present: { label: 'P', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700' },
  absent: { label: 'A', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700' },
  late: { label: 'L', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700' },
  excused: { label: 'E', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700' },
  sick: { label: 'S', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' },
};

const mockClasses = ['SS2A', 'SS2B', 'SS3A', 'JS3A', 'SS1A'];

function generateStudents(cls: string): Student[] {
  const names = [
    'Adewale Okonkwo', 'Blessing Eze', 'Chukwuemeka Nwosu', 'Damilola Adeyemi',
    'Emmanuel Obi', 'Fatima Ibrahim', 'Grace Okafor', 'Henry Adesanya',
    'Ifeoma Nwachukwu', 'Joshua Adeleke', 'Kelechi Onyeka', 'Lara Babatunde',
    'Musa Aliyu', 'Ngozi Okonkwo', 'Obinna Eze', 'Patricia Ogundimu',
    'Quadri Afolabi', 'Rachael Uzoma', 'Samuel Adebayo', 'Taiwo Olawale',
    'Uche Nnamdi', 'Victoria Akinlade', 'Wasiu Badmus', 'Yetunde Oladeji',
    'Zainab Musa', 'Adaeze Igwe', 'Benjamin Okereke', 'Chioma Achebe',
    'David Fashola', 'Esther Nkemdirim',
  ];
  return names.slice(0, 30 + Math.floor(Math.random() * 10)).map((name, i) => ({
    id: `${cls}-${i + 1}`,
    name,
    admNo: `ADM/${2024 + (i % 3)}/${String(i + 1).padStart(3, '0')}`,
    status: null,
  }));
}

export function AttendanceTab({ teacher }: { teacher: TeacherData }) {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>(generateStudents(mockClasses[0]));
  const [saved, setSaved] = useState(false);

  function handleClassChange(cls: string) {
    setSelectedClass(cls);
    setStudents(generateStudents(cls));
    setSaved(false);
  }

  function mark(id: string, status: AttendanceStatus) {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    setSaved(false);
  }

  function markAll(status: AttendanceStatus) {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
  }

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.admNo.includes(search)
  );

  const counts = {
    present: students.filter((s) => s.status === 'present').length,
    absent: students.filter((s) => s.status === 'absent').length,
    late: students.filter((s) => s.status === 'late').length,
    excused: students.filter((s) => s.status === 'excused').length,
    sick: students.filter((s) => s.status === 'sick').length,
    unmarked: students.filter((s) => !s.status).length,
  };
  const total = students.length;
  const attendanceRate = total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Take Attendance</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Mark daily class attendance quickly and accurately</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => markAll('present')} className="text-xs px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold hover:bg-emerald-500/25 transition-colors">
            Mark All Present
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:scale-105"
            style={{ background: teacher.primaryColor }}
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? 'Saved ✓' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          >
            {mockClasses.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
          <input
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Present', value: counts.present, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Absent', value: counts.absent, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Late', value: counts.late, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Excused', value: counts.excused, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Sick', value: counts.sick, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Unmarked', value: counts.unmarked, color: 'text-[hsl(var(--text-tertiary))]', bg: 'bg-[hsl(var(--bg-tertiary))]' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Rate */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-[hsl(var(--text-secondary))]">Attendance Rate — {selectedClass}</span>
          <span className="text-xl font-black" style={{ color: attendanceRate >= 80 ? '#10b981' : attendanceRate >= 60 ? '#f59e0b' : '#ef4444' }}>
            {attendanceRate}%
          </span>
        </div>
        <div className="h-2 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${attendanceRate}%`, background: attendanceRate >= 80 ? '#10b981' : attendanceRate >= 60 ? '#f59e0b' : '#ef4444' }}
          />
        </div>
        <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">{total} total students</p>
      </div>

      {/* Student List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">#</th>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Student</th>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Adm. No.</th>
                <th className="text-center py-3 px-2 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]" colSpan={5}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {filtered.map((student, idx) => (
                <tr key={student.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <td className="py-2.5 px-4 text-xs text-[hsl(var(--text-tertiary))]">{idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                      </div>
                      <span className="font-semibold text-[hsl(var(--text-primary))] text-xs">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-[hsl(var(--text-tertiary))]">{student.admNo}</td>
                  {(['present', 'absent', 'late', 'excused', 'sick'] as AttendanceStatus[]).map((status) => {
                    const cfg = statusConfig[status];
                    const isSelected = student.status === status;
                    return (
                      <td key={status} className="py-2.5 px-1 text-center">
                        <button
                          onClick={() => mark(student.id, status)}
                          className={`w-8 h-8 rounded-lg text-xs font-black border transition-all hover:scale-110 ${isSelected ? `${cfg.bg} ${cfg.color} border-current shadow-sm` : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:border-current hover:' + cfg.color}`}
                          title={status.charAt(0).toUpperCase() + status.slice(1)}
                        >
                          {cfg.label}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
