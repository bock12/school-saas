'use client';

import { useState } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Check, X, Clock, AlertTriangle, Users } from 'lucide-react';

const demoStudents = [
  { id: '1', name: 'Amara Johnson', admission: 'STU-001', status: 'present' as const },
  { id: '2', name: 'David Okafor', admission: 'STU-002', status: 'present' as const },
  { id: '3', name: 'Sarah Williams', admission: 'STU-003', status: 'absent' as const },
  { id: '4', name: 'Michael Chen', admission: 'STU-004', status: 'present' as const },
  { id: '5', name: 'Fatima Hassan', admission: 'STU-005', status: 'late' as const },
  { id: '6', name: 'James Nguyen', admission: 'STU-006', status: 'present' as const },
  { id: '7', name: 'Priya Sharma', admission: 'STU-007', status: 'present' as const },
  { id: '8', name: 'Emmanuel Adeyemi', admission: 'STU-008', status: 'excused' as const },
  { id: '9', name: 'Lisa Park', admission: 'STU-009', status: 'present' as const },
  { id: '10', name: 'Omar Ali', admission: 'STU-010', status: 'present' as const },
];

type Status = 'present' | 'absent' | 'late' | 'excused';

const statusConfig: Record<Status, { icon: typeof Check; color: string; bg: string; label: string }> = {
  present: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'Present' },
  absent: { icon: X, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', label: 'Absent' },
  late: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Late' },
  excused: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', label: 'Excused' },
};

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState('2026-06-23');
  const [selectedClass, setSelectedClass] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [attendance, setAttendance] = useState<Record<string, Status>>(
    Object.fromEntries(demoStudents.map(s => [s.id, s.status]))
  );

  const toggleStatus = (id: string) => {
    const order: Status[] = ['present', 'absent', 'late', 'excused'];
    const current = attendance[id];
    const next = order[(order.indexOf(current) + 1) % order.length];
    setAttendance({ ...attendance, [id]: next });
  };

  const counts = Object.values(attendance).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  const attendanceRate = Math.round(((counts.present || 0) + (counts.late || 0)) / demoStudents.length * 100);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Attendance</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Mark daily student attendance</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Check className="w-4 h-4" /> Save Attendance
        </button>
      </div>

      {/* Selector Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[10px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Date</label>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))]"><ChevronLeft className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
            <button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))]"><ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Section</label>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>A</option><option>B</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <CalendarCheck className="w-3.5 h-3.5" />
            {attendanceRate}% attendance
          </div>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-tertiary))]">
            <Users className="w-3.5 h-3.5" />
            {demoStudents.length} students
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {(['present', 'absent', 'late', 'excused'] as Status[]).map(status => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <div key={status} className={`rounded-xl border p-4 text-center ${config.bg}`}>
              <Icon className={`w-5 h-5 mx-auto mb-1 ${config.color}`} />
              <p className={`text-2xl font-bold ${config.color}`}>{counts[status] || 0}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Attendance Grid */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 w-12">#</th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">Student</th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">Admission #</th>
                <th className="text-center text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-center text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 w-48">Quick Mark</th>
              </tr>
            </thead>
            <tbody>
              {demoStudents.map((student, i) => {
                const currentStatus = attendance[student.id];
                const config = statusConfig[currentStatus];
                const Icon = config.icon;

                return (
                  <tr key={student.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3 text-xs text-[hsl(var(--text-tertiary))]">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                          {student.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <code className="text-xs font-mono text-[hsl(var(--text-tertiary))]">{student.admission}</code>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleStatus(student.id)} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all hover:scale-105 ${config.bg}`}>
                        <Icon className={`w-3 h-3 ${config.color}`} />
                        {config.label}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {(['present', 'absent', 'late', 'excused'] as Status[]).map(s => {
                          const sc = statusConfig[s];
                          const SIcon = sc.icon;
                          const isActive = currentStatus === s;
                          return (
                            <button
                              key={s}
                              onClick={() => setAttendance({ ...attendance, [student.id]: s })}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? sc.bg + ' border' : 'hover:bg-[hsl(var(--bg-tertiary))]'}`}
                              title={sc.label}
                            >
                              <SIcon className={`w-3.5 h-3.5 ${isActive ? sc.color : 'text-[hsl(var(--text-tertiary))]'}`} />
                            </button>
                          );
                        })}
                      </div>
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
