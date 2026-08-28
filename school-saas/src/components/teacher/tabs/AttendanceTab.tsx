'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import {
  CheckSquare, X, Clock, User, Search, Save, RotateCcw, Download,
  CheckCircle2, AlertTriangle, Users, Calendar, Filter, Sparkles,
  MessageSquare, ChevronRight, Printer, ShieldAlert, Check, FileSpreadsheet,
  LayoutGrid, Table as TableIcon
} from 'lucide-react';

type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'sick';

interface Student {
  id: string;
  name: string;
  admNo: string;
  gender: 'M' | 'F';
  avatarInitials: string;
  status: AttendanceStatus | null;
  note?: string;
}

const statusConfig: Record<AttendanceStatus, { label: string; full: string; color: string; bg: string; activeBg: string; border: string }> = {
  present: {
    label: 'P',
    full: 'Present',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300',
    activeBg: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25',
    border: 'border-emerald-500/30'
  },
  late: {
    label: 'L',
    full: 'Late',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300',
    activeBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/25',
    border: 'border-amber-500/30'
  },
  absent: {
    label: 'A',
    full: 'Absent',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300',
    activeBg: 'bg-rose-500 text-white shadow-md shadow-rose-500/25',
    border: 'border-rose-500/30'
  },
  excused: {
    label: 'E',
    full: 'Excused',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300',
    activeBg: 'bg-blue-500 text-white shadow-md shadow-blue-500/25',
    border: 'border-blue-500/30'
  },
  sick: {
    label: 'S',
    full: 'Sick Bay',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300',
    activeBg: 'bg-purple-500 text-white shadow-md shadow-purple-500/25',
    border: 'border-purple-500/30'
  },
};

const mockClasses = [
  { id: 'SS2A', name: 'SS2A (Senior Secondary 2A)', count: 35, isFormMaster: true },
  { id: 'SS2B', name: 'SS2B (Senior Secondary 2B)', count: 38, isFormMaster: false },
  { id: 'SS3A', name: 'SS3A (Senior Secondary 3A)', count: 33, isFormMaster: false },
  { id: 'JS3A', name: 'JS3A (Junior Secondary 3A)', count: 41, isFormMaster: false },
  { id: 'SS1A', name: 'SS1A (Senior Secondary 1A)', count: 40, isFormMaster: false },
];

const mockPeriods = [
  { id: 'morning', label: 'Morning Roll Call (Whole Day)' },
  { id: 'p1', label: 'Period 1: Mathematics (07:30 – 08:15)' },
  { id: 'p2', label: 'Period 2: Mathematics (08:15 – 09:00)' },
  { id: 'p3', label: 'Period 3: Further Maths (09:15 – 10:00)' },
  { id: 'p4', label: 'Period 4: Mathematics (10:00 – 10:45)' },
  { id: 'p5', label: 'Period 5: Mathematics (12:00 – 12:45)' },
];

const sampleStudentNames = [
  { name: 'Adewale Okonkwo', gender: 'M' as const },
  { name: 'Blessing Eze', gender: 'F' as const },
  { name: 'Chukwuemeka Nwosu', gender: 'M' as const },
  { name: 'Damilola Adeyemi', gender: 'F' as const },
  { name: 'Emmanuel Obi', gender: 'M' as const },
  { name: 'Fatima Ibrahim', gender: 'F' as const },
  { name: 'Grace Okafor', gender: 'F' as const },
  { name: 'Henry Adesanya', gender: 'M' as const },
  { name: 'Ifeoma Nwachukwu', gender: 'F' as const },
  { name: 'Joshua Adeleke', gender: 'M' as const },
  { name: 'Kelechi Onyeka', gender: 'M' as const },
  { name: 'Lara Babatunde', gender: 'F' as const },
  { name: 'Musa Aliyu', gender: 'M' as const },
  { name: 'Ngozi Okonkwo', gender: 'F' as const },
  { name: 'Obinna Eze', gender: 'M' as const },
  { name: 'Patricia Ogundimu', gender: 'F' as const },
  { name: 'Quadri Afolabi', gender: 'M' as const },
  { name: 'Rachael Uzoma', gender: 'F' as const },
  { name: 'Samuel Adebayo', gender: 'M' as const },
  { name: 'Taiwo Olawale', gender: 'M' as const },
  { name: 'Uche Nnamdi', gender: 'M' as const },
  { name: 'Victoria Akinlade', gender: 'F' as const },
  { name: 'Wasiu Badmus', gender: 'M' as const },
  { name: 'Yetunde Oladeji', gender: 'F' as const },
  { name: 'Zainab Musa', gender: 'F' as const },
  { name: 'Adaeze Igwe', gender: 'F' as const },
  { name: 'Benjamin Okereke', gender: 'M' as const },
  { name: 'Chioma Achebe', gender: 'F' as const },
  { name: 'David Fashola', gender: 'M' as const },
  { name: 'Esther Nkemdirim', gender: 'F' as const },
];

function generateStudentsForClass(clsId: string): Student[] {
  return sampleStudentNames.map((s, i) => {
    const initials = s.name.split(' ').map(n => n[0]).join('');
    return {
      id: `${clsId}-${i + 1}`,
      name: s.name,
      admNo: `ADM/2024/${String(i + 101).padStart(3, '0')}`,
      gender: s.gender,
      avatarInitials: initials,
      status: i === 1 ? 'present' : i === 7 ? 'late' : i === 14 ? 'absent' : null,
    };
  });
}

export function AttendanceTab({ teacher }: { teacher: TeacherData }) {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(mockPeriods[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [students, setStudents] = useState<Student[]>(generateStudentsForClass(mockClasses[0].id));
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteBuffer, setNoteBuffer] = useState<string>('');

  const currentClassInfo = mockClasses.find(c => c.id === selectedClass) || mockClasses[0];

  function handleClassChange(clsId: string) {
    setSelectedClass(clsId);
    setStudents(generateStudentsForClass(clsId));
    setSavedToast(null);
  }

  function markStatus(id: string, status: AttendanceStatus) {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === id) {
          // Toggle off if clicked same status
          return { ...s, status: s.status === status ? null : status };
        }
        return s;
      })
    );
    setSavedToast(null);
  }

  function markAll(status: AttendanceStatus) {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    setSavedToast(null);
  }

  function markRemainingPresent() {
    setStudents(prev => prev.map(s => ({ ...s, status: s.status || 'present' })));
    setSavedToast(null);
  }

  function resetAll() {
    setStudents(prev => prev.map(s => ({ ...s, status: null })));
    setSavedToast(null);
  }

  function handleSaveAttendance() {
    const present = students.filter(s => s.status === 'present').length;
    const late = students.filter(s => s.status === 'late').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const rate = Math.round(((present + late) / (students.length || 1)) * 100);

    setSavedToast(
      `Attendance saved for ${selectedClass}! (${present} Present, ${late} Late, ${absent} Absent • ${rate}% Attendance Rate)`
    );
    setTimeout(() => setSavedToast(null), 5000);
  }

  function openNoteDialog(student: Student) {
    setEditingNoteId(student.id);
    setNoteBuffer(student.note || '');
  }

  function saveNote() {
    if (editingNoteId) {
      setStudents(prev =>
        prev.map(s => s.id === editingNoteId ? { ...s, note: noteBuffer.trim() || undefined } : s)
      );
      setEditingNoteId(null);
      setNoteBuffer('');
    }
  }

  // Filtered List
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admNo.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'unmarked'
        ? s.status === null
        : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Attendance Counts
  const counts = {
    present: students.filter(s => s.status === 'present').length,
    late: students.filter(s => s.status === 'late').length,
    absent: students.filter(s => s.status === 'absent').length,
    excused: students.filter(s => s.status === 'excused').length,
    sick: students.filter(s => s.status === 'sick').length,
    unmarked: students.filter(s => s.status === null).length,
  };

  const total = students.length;
  const attendanceRate = total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0;

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
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">
                Classroom Attendance Roll Call
              </h1>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                Fast 1-tap student presence tracking with automatic attendance rate indexing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => markAll('present')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={markRemainingPresent}
            className="px-3.5 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Mark Remaining Present</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-black shadow-md shadow-[hsl(var(--accent)/0.25)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Submit Roll Call</span>
          </button>
        </div>
      </div>

      {/* Class & Period Selection Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Class Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">
            Class Roster
          </label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
          >
            {mockClasses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.isFormMaster ? '⭐ [Form Class]' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Period / Session Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">
            Session / Period
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
          >
            {mockPeriods.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">
            Roll Call Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
          />
        </div>
      </div>

      {/* Live Attendance Pulse Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-3.5 rounded-2xl border border-[hsl(var(--border))] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Total Roll</span>
          <p className="text-xl font-black text-[hsl(var(--text-primary))]">{total} Students</p>
          <p className="text-[10px] text-emerald-400 font-semibold">{attendanceRate}% Present</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-[hsl(var(--border))] space-y-1 bg-emerald-500/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Present (P)</span>
          <p className="text-xl font-black text-emerald-400">{counts.present}</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{Math.round((counts.present / (total || 1)) * 100)}% of class</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-[hsl(var(--border))] space-y-1 bg-amber-500/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Late (L)</span>
          <p className="text-xl font-black text-amber-400">{counts.late}</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Tardy arrival</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-[hsl(var(--border))] space-y-1 bg-rose-500/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Absent (A)</span>
          <p className="text-xl font-black text-rose-400">{counts.absent}</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Unexcused</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-[hsl(var(--border))] space-y-1 bg-blue-500/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Excused / Sick</span>
          <p className="text-xl font-black text-blue-400">{counts.excused + counts.sick}</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{counts.excused} Exc • {counts.sick} Sick</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-[hsl(var(--border))] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Unmarked</span>
          <p className="text-xl font-black text-[hsl(var(--text-tertiary))]">{counts.unmarked}</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Awaiting input</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-[hsl(var(--border))] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search student by name or admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: `All (${total})` },
            { id: 'unmarked', label: `Unmarked (${counts.unmarked})` },
            { id: 'present', label: `Present (${counts.present})` },
            { id: 'late', label: `Late (${counts.late})` },
            { id: 'absent', label: `Absent (${counts.absent})` },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="h-6 w-px bg-[hsl(var(--border))] mx-1" />

          {/* View Toggle */}
          <div className="flex items-center p-0.5 bg-[hsl(var(--bg-tertiary))] rounded-xl border border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[hsl(var(--accent))] text-white' : 'text-[hsl(var(--text-tertiary))]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-[hsl(var(--accent))] text-white' : 'text-[hsl(var(--text-tertiary))]'
              }`}
              title="Touch Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ATTENDANCE ROSTER: TABLE VIEW                                            */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="glass-card overflow-hidden rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
                  <th className="py-3.5 px-4 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider w-12 text-center">#</th>
                  <th className="py-3.5 px-4 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Student Name</th>
                  <th className="py-3.5 px-4 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Admission No.</th>
                  <th className="py-3.5 px-4 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Gender</th>
                  <th className="py-3.5 px-4 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-center">
                    Quick Status (P / L / A / E / S)
                  </th>
                  <th className="py-3.5 px-4 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    {/* Index */}
                    <td className="py-3.5 px-4 font-mono text-[hsl(var(--text-tertiary))] text-center">
                      {idx + 1}
                    </td>

                    {/* Student Name & Avatar */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-xs shrink-0">
                          {s.avatarInitials}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{s.name}</p>
                          {s.note && (
                            <p className="text-[10px] text-amber-400 font-semibold truncate max-w-xs">
                              Note: {s.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Admission Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[hsl(var(--text-secondary))]">
                      {s.admNo}
                    </td>

                    {/* Gender */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        s.gender === 'F'
                          ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {s.gender === 'F' ? 'Female' : 'Male'}
                      </span>
                    </td>

                    {/* 5-Button Status Control */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {(['present', 'late', 'absent', 'excused', 'sick'] as AttendanceStatus[]).map((st) => {
                          const conf = statusConfig[st];
                          const isActive = s.status === st;

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => markStatus(s.id, st)}
                              className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center border ${
                                isActive
                                  ? `${conf.activeBg} border-transparent scale-105`
                                  : `${conf.bg} ${conf.border} hover:scale-105 opacity-70 hover:opacity-100`
                              }`}
                              title={conf.full}
                            >
                              {conf.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Remark / Note Button */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => openNoteDialog(s)}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] ${
                          s.note
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                        title="Add Remark"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {s.note ? <span>Edit Note</span> : <span className="hidden sm:inline">Add Note</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ATTENDANCE ROSTER: CARDS GRID VIEW (MOBILE & TOUCH)                       */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map(s => (
            <div
              key={s.id}
              className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-3 hover:border-[hsl(var(--accent)/0.4)] transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-xs shrink-0">
                    {s.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[hsl(var(--text-primary))] truncate">{s.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">{s.admNo} • {s.gender === 'F' ? 'Female' : 'Male'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openNoteDialog(s)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    s.note
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
                  }`}
                  title="Remark"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>

              {s.note && (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                  <strong>Remark:</strong> {s.note}
                </div>
              )}

              {/* Status Buttons Grid */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {(['present', 'late', 'absent', 'excused', 'sick'] as AttendanceStatus[]).map(st => {
                  const conf = statusConfig[st];
                  const isActive = s.status === st;

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => markStatus(s.id, st)}
                      className={`h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center border ${
                        isActive
                          ? `${conf.activeBg} border-transparent scale-105`
                          : `${conf.bg} ${conf.border} opacity-70 hover:opacity-100`
                      }`}
                    >
                      {conf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIALOG: Add / Edit Remark */}
      {editingNoteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[hsl(var(--accent))]" />
                Student Attendance Remark
              </h3>
              <button
                type="button"
                onClick={() => setEditingNoteId(null)}
                className="p-1 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">
                Attendance Note / Excuse Reason
              </label>
              <textarea
                value={noteBuffer}
                onChange={(e) => setNoteBuffer(e.target.value)}
                placeholder="e.g. Arrived late at 08:15 AM with signed clinic permit..."
                rows={3}
                className="w-full p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setEditingNoteId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="px-4 py-1.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Save Remark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
