'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Users, Eye, CheckSquare, Award, AlertTriangle, ChevronRight, Star } from 'lucide-react';

const classes = [
  { id: '1', name: 'SS2A', level: 'SS2', department: 'Science', students: 35, attendanceRate: 91, avgScore: 74, isFormMaster: true, subjects: ['Mathematics', 'Further Maths'], lastAttendance: 'Today' },
  { id: '2', name: 'SS2B', level: 'SS2', department: 'Arts', students: 38, attendanceRate: 88, avgScore: 69, isFormMaster: false, subjects: ['Mathematics'], lastAttendance: 'Today' },
  { id: '3', name: 'SS3A', level: 'SS3', department: 'Science', students: 33, attendanceRate: 85, avgScore: 76, isFormMaster: false, subjects: ['Further Maths'], lastAttendance: 'Yesterday' },
  { id: '4', name: 'JS3A', level: 'JS3', department: 'General', students: 41, attendanceRate: 93, avgScore: 71, isFormMaster: false, subjects: ['Mathematics'], lastAttendance: '2 days ago' },
  { id: '5', name: 'SS1A', level: 'SS1', department: 'Commercial', students: 40, attendanceRate: 90, avgScore: 68, isFormMaster: false, subjects: ['Mathematics'], lastAttendance: 'Today' },
];

function getScoreColor(score: number) {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getAttendanceColor(rate: number) {
  if (rate >= 90) return '#10b981';
  if (rate >= 75) return '#f59e0b';
  return '#ef4444';
}

export function ClassesTab({ teacher }: { teacher: TeacherData }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">My Classes</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{classes.length} classes assigned · {classes.reduce((s, c) => s + c.students, 0)} total students</p>
        </div>
        <div className="flex gap-2">
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'}`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Classes', value: classes.length, icon: Users, color: 'bg-indigo-500' },
          { label: 'Form Master', value: classes.filter((c) => c.isFormMaster).length, icon: Star, color: 'bg-amber-500' },
          { label: 'Avg Attendance', value: `${Math.round(classes.reduce((s, c) => s + c.attendanceRate, 0) / classes.length)}%`, icon: CheckSquare, color: 'bg-emerald-500' },
          { label: 'Avg Performance', value: `${Math.round(classes.reduce((s, c) => s + c.avgScore, 0) / classes.length)}%`, icon: Award, color: 'bg-purple-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-[hsl(var(--text-primary))]">{stat.value}</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Classes Grid */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all group">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center">
                    <span className="text-lg font-black text-[hsl(var(--accent))]">{cls.name.substring(0, 2)}</span>
                  </div>
                  <div>
                    <p className="font-black text-[hsl(var(--text-primary))] text-base">{cls.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{cls.department} · {cls.level}</p>
                  </div>
                </div>
                {cls.isFormMaster && (
                  <span className="text-[9px] px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-black flex items-center gap-1">
                    <Star className="w-3 h-3" />Form Master
                  </span>
                )}
              </div>

              {/* Subjects */}
              <div className="flex flex-wrap gap-1 mb-4">
                {cls.subjects.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{s}</span>
                ))}
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                {/* Students */}
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(var(--text-tertiary))]">Students</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{cls.students}</span>
                </div>

                {/* Attendance */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[hsl(var(--text-tertiary))]">Attendance</span>
                    <span className="font-bold" style={{ color: getAttendanceColor(cls.attendanceRate) }}>{cls.attendanceRate}%</span>
                  </div>
                  <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${cls.attendanceRate}%`, background: getAttendanceColor(cls.attendanceRate) }} />
                  </div>
                </div>

                {/* Performance */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[hsl(var(--text-tertiary))]">Avg Score</span>
                    <span className={`font-bold ${getScoreColor(cls.avgScore)}`}>{cls.avgScore}%</span>
                  </div>
                  <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all bg-purple-500" style={{ width: `${cls.avgScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[hsl(var(--border)/0.5)]">
                {[
                  { icon: Eye, label: 'Students' },
                  { icon: CheckSquare, label: 'Attendance' },
                  { icon: Award, label: 'Results' },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button key={action.label} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors group/btn">
                      <Icon className="w-4 h-4 text-[hsl(var(--text-tertiary))] group-hover/btn:text-[hsl(var(--accent))] transition-colors" />
                      <span className="text-[9px] text-[hsl(var(--text-tertiary))] group-hover/btn:text-[hsl(var(--text-secondary))]">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-2 text-center">Last attendance: {cls.lastAttendance}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
                {['Class', 'Department', 'Students', 'Attendance', 'Avg Score', 'Subjects', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[hsl(var(--text-primary))]">{cls.name}</span>
                      {cls.isFormMaster && <Star className="w-3 h-3 text-amber-400" />}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{cls.department}</td>
                  <td className="py-3 px-4 font-semibold text-[hsl(var(--text-primary))]">{cls.students}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-sm" style={{ color: getAttendanceColor(cls.attendanceRate) }}>{cls.attendanceRate}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold text-sm ${getScoreColor(cls.avgScore)}`}>{cls.avgScore}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {cls.subjects.map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--accent))]"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"><CheckSquare className="w-3.5 h-3.5" /></button>
                      <button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"><AlertTriangle className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
