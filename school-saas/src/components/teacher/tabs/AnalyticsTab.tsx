'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { TrendingUp, TrendingDown, BarChart3, Users, Award } from 'lucide-react';

const classData = [
  { class: 'SS2A', avg: 74, highest: 91, lowest: 42, pass: 85, attendance: 91, students: 35 },
  { class: 'SS2B', avg: 69, highest: 88, lowest: 38, pass: 78, attendance: 88, students: 38 },
  { class: 'SS3A', avg: 76, highest: 95, lowest: 45, pass: 88, attendance: 85, students: 33 },
  { class: 'JS3A', avg: 71, highest: 89, lowest: 40, pass: 80, attendance: 93, students: 41 },
  { class: 'SS1A', avg: 68, highest: 86, lowest: 35, pass: 75, attendance: 90, students: 40 },
];

const trendData = [
  { term: 'Term 1', avg: 65 }, { term: 'Term 2 CA1', avg: 68 }, { term: 'Term 2 CA2', avg: 71 },
  { term: 'Mid-term', avg: 69 }, { term: 'Current', avg: 72 },
];

const gradeDistribution = [
  { grade: 'A (75–100)', count: 42, color: '#10b981' },
  { grade: 'B (65–74)', count: 55, color: '#6366f1' },
  { grade: 'C (55–64)', count: 38, color: '#f59e0b' },
  { grade: 'D (45–54)', count: 24, color: '#f97316' },
  { grade: 'F (0–44)', count: 28, color: '#ef4444' },
];

const totalStudents = gradeDistribution.reduce((s, g) => s + g.count, 0);

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold text-[hsl(var(--text-secondary))] w-8 text-right">{value}</span>
    </div>
  );
}

function MiniLineChart({ data }: { data: { term: string; avg: number }[] }) {
  const max = Math.max(...data.map((d) => d.avg));
  const min = Math.min(...data.map((d) => d.avg));
  const range = max - min || 1;
  const w = 100 / (data.length - 1);

  const points = data.map((d, i) => ({
    x: i * w,
    y: 100 - ((d.avg - min) / range) * 80 - 10,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-24" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L ${points[points.length - 1].x} 100 L 0 100 Z`} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#6366f1" />
      ))}
    </svg>
  );
}

export function AnalyticsTab({ teacher }: { teacher: TeacherData }) {
  const [view, setView] = useState<'class' | 'trend' | 'distribution'>('class');

  const overallAvg = Math.round(classData.reduce((s, c) => s + c.avg, 0) / classData.length);
  const overallPass = Math.round(classData.reduce((s, c) => s + c.pass, 0) / classData.length);
  const overallAtt = Math.round(classData.reduce((s, c) => s + c.attendance, 0) / classData.length);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Performance Analytics</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Insights across all your classes and subjects</p>
        </div>
        <div className="flex gap-2">
          {(['class', 'trend', 'distribution'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${view === v ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
            >
              {v === 'distribution' ? 'Grades' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overall Avg', value: `${overallAvg}%`, icon: BarChart3, color: 'bg-indigo-500', trend: '+3%' },
          { label: 'Pass Rate', value: `${overallPass}%`, icon: Award, color: 'bg-emerald-500', trend: '+5%' },
          { label: 'Avg Attendance', value: `${overallAtt}%`, icon: Users, color: 'bg-blue-500', trend: '-1%' },
          { label: 'Total Students', value: classData.reduce((s, c) => s + c.students, 0), icon: TrendingUp, color: 'bg-purple-500', trend: '' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {stat.trend && (
                  <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{stat.value}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Class Comparison */}
      {view === 'class' && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-black text-[hsl(var(--text-primary))] mb-4">Class Performance Comparison</h2>
          <div className="space-y-5">
            {classData.map((cls) => (
              <div key={cls.class}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-10 text-xs font-black text-[hsl(var(--accent))]">{cls.class}</span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">{cls.students} students</span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="font-bold text-[hsl(var(--text-primary))]">Avg: <span className="text-indigo-400">{cls.avg}%</span></span>
                    <span className="font-bold text-[hsl(var(--text-primary))]">Pass: <span className="text-emerald-400">{cls.pass}%</span></span>
                    <span className="font-bold text-[hsl(var(--text-primary))]">Att: <span className="text-blue-400">{cls.attendance}%</span></span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Bar value={cls.avg} max={100} color="#6366f1" />
                  <Bar value={cls.pass} max={100} color="#10b981" />
                  <Bar value={cls.attendance} max={100} color="#3b82f6" />
                </div>
              </div>
            ))}
            <div className="flex gap-4 pt-2 border-t border-[hsl(var(--border)/0.5)]">
              {[{ color: '#6366f1', label: 'Avg Score' }, { color: '#10b981', label: 'Pass Rate' }, { color: '#3b82f6', label: 'Attendance' }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Trend */}
      {view === 'trend' && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-black text-[hsl(var(--text-primary))] mb-1">Performance Trend — Current Term</h2>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mb-4">Average score progression across assessments</p>
          <MiniLineChart data={trendData} />
          <div className="flex justify-between mt-2">
            {trendData.map((d) => (
              <div key={d.term} className="text-center">
                <p className="text-xs font-black text-[hsl(var(--text-primary))]">{d.avg}%</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))]">{d.term}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)]">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-[hsl(var(--text-secondary))]">Overall upward trend of <strong className="text-emerald-400">+7%</strong> since Term 1</p>
          </div>
        </div>
      )}

      {/* Grade Distribution */}
      {view === 'distribution' && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-black text-[hsl(var(--text-primary))] mb-4">Grade Distribution — All Classes</h2>
          <div className="space-y-4">
            {gradeDistribution.map((g) => (
              <div key={g.grade}>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-semibold text-[hsl(var(--text-secondary))]">{g.grade}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black" style={{ color: g.color }}>{g.count}</span>
                    <span className="text-[hsl(var(--text-tertiary))]">({Math.round((g.count / totalStudents) * 100)}%)</span>
                  </div>
                </div>
                <div className="h-4 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(g.count / totalStudents) * 100}%`, background: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)]">
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              <strong className="text-[hsl(var(--text-primary))]">{totalStudents}</strong> total students graded ·{' '}
              <strong className="text-emerald-400">{gradeDistribution.slice(0, 3).reduce((s, g) => s + g.count, 0)}</strong> above average (C and above) ·{' '}
              <strong className="text-red-400">{gradeDistribution[4].count}</strong> failing
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
