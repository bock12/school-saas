'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { TrendingUp, TrendingDown, BarChart3, Users, Award } from 'lucide-react';

const classData = [
  { class: 'SSS 1A', avg: 72.1, highest: 94, lowest: 38, pass: 86.8, students: 38, color: '#7c3aed' },
  { class: 'SSS 1B', avg: 69.3, highest: 91, lowest: 33, pass: 85.4, students: 41, color: '#4f46e5' },
  { class: 'SSS 2A', avg: 74.8, highest: 96, lowest: 42, pass: 88.6, students: 35, color: '#0891b2' },
  { class: 'SSS 2B', avg: 68.9, highest: 89, lowest: 30, pass: 81.1, students: 37, color: '#059669' },
  { class: 'SSS 3A', avg: 71.5, highest: 93, lowest: 36, pass: 84.4, students: 32, color: '#d97706' },
];

const subjectData = [
  { subject: 'Mathematics', avg: 71.2, passRate: 84.2, trend: 'up' },
  { subject: 'English Language', avg: 74.8, passRate: 89.1, trend: 'up' },
  { subject: 'Physics', avg: 67.3, passRate: 79.4, trend: 'down' },
  { subject: 'Chemistry', avg: 72.1, passRate: 83.7, trend: 'stable' },
  { subject: 'Biology', avg: 69.5, passRate: 81.2, trend: 'up' },
  { subject: 'Further Maths', avg: 63.8, passRate: 72.5, trend: 'down' },
];

const gradeDistribution = [
  { grade: 'A1 (75–100)', count: 142, color: '#10b981' },
  { grade: 'B2–B3 (65–74)', count: 218, color: '#6366f1' },
  { grade: 'C4–C6 (50–64)', count: 287, color: '#f59e0b' },
  { grade: 'D7–E8 (40–49)', count: 119, color: '#f97316' },
  { grade: 'F9 (0–39)', count: 82, color: '#ef4444' },
];
const totalGrades = gradeDistribution.reduce((s, g) => s + g.count, 0);

const maxAvg = Math.max(...classData.map(c => c.avg));

export function AnalyticsTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Performance Analytics</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">School-wide examination performance, subject analysis, and grade distribution</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'School Average', value: `${(classData.reduce((s,c)=>s+c.avg,0)/classData.length).toFixed(1)}%`, icon: BarChart3, color: 'bg-violet-500' },
          { label: 'Overall Pass Rate', value: `${(classData.reduce((s,c)=>s+c.pass,0)/classData.length).toFixed(1)}%`, icon: TrendingUp, color: 'bg-emerald-500' },
          { label: 'Total Candidates', value: classData.reduce((s,c)=>s+c.students,0), icon: Users, color: 'bg-blue-500' },
          { label: 'Top Score', value: `${Math.max(...classData.map(c=>c.highest))}%`, icon: Award, color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-5 h-5 text-white" /></div>
            <div><p className="text-2xl font-black text-[hsl(var(--text-primary))]">{s.value}</p><p className="text-xs text-[hsl(var(--text-secondary))]">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Class performance bar chart */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-5">
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm mb-4">Class Average Scores</h2>
          <div className="space-y-3">
            {classData.map(c => (
              <div key={c.class} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[hsl(var(--text-secondary))] w-12 flex-shrink-0">{c.class}</span>
                <div className="flex-1 h-5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 flex items-center pl-2" style={{ width: `${(c.avg/100)*100}%`, background: c.color }}>
                    <span className="text-[9px] text-white font-black">{c.avg}%</span>
                  </div>
                </div>
                <div className="w-24 text-right flex-shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold">{c.pass}% pass</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade distribution */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm mb-4">Grade Distribution</h2>
          <div className="space-y-3">
            {gradeDistribution.map(g => (
              <div key={g.grade}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))]">{g.grade}</span>
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">{g.count} ({((g.count/totalGrades)*100).toFixed(1)}%)</span>
                </div>
                <div className="h-2.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(g.count/totalGrades)*100}%`, background: g.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject analysis table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Subject Performance Analysis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Subject', 'School Average', 'Pass Rate', 'Trend vs Last Term'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {subjectData.map(s => (
                <tr key={s.subject} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{s.subject}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${s.avg}%` }} />
                      </div>
                      <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{s.avg}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold ${s.passRate >= 85 ? 'text-emerald-400' : s.passRate >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{s.passRate}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 text-xs font-bold ${s.trend === 'up' ? 'text-emerald-400' : s.trend === 'down' ? 'text-red-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                      {s.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : s.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : '—'}
                      {s.trend === 'stable' ? 'No change' : s.trend === 'up' ? 'Improving' : 'Declining'}
                    </span>
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
