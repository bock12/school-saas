'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { CheckSquare, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const classes = [
  { class: 'SSS 1A', students: 38, passed: 33, failed: 5, avg: 72.1, highest: 94, lowest: 38, passRate: 86.8, issues: 0, validated: true },
  { class: 'SSS 1B', students: 41, passed: 35, failed: 6, avg: 69.3, highest: 91, lowest: 33, passRate: 85.4, issues: 2, validated: false },
  { class: 'SSS 2A', students: 35, passed: 31, failed: 4, avg: 74.8, highest: 96, lowest: 42, passRate: 88.6, issues: 0, validated: true },
  { class: 'SSS 2B', students: 37, passed: 30, failed: 7, avg: 68.9, highest: 89, lowest: 30, passRate: 81.1, issues: 1, validated: false },
  { class: 'SSS 3A', students: 32, passed: 27, failed: 5, avg: 71.5, highest: 93, lowest: 36, passRate: 84.4, issues: 0, validated: true },
];

export function ValidationTab({ officer }: { officer: OfficerData }) {
  const validated = classes.filter(c => c.validated).length;
  const pending = classes.length - validated;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Result Validation</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Statistical cross-checking, outlier detection, and data integrity verification before approval</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Classes Ready', value: validated, color: 'text-emerald-400' },
          { label: 'Pending Validation', value: pending, color: 'text-amber-400' },
          { label: 'Total Issues', value: classes.reduce((s, c) => s + c.issues, 0), color: 'text-red-400' },
          { label: 'Overall Pass Rate', value: `${(classes.reduce((s, c) => s + c.passRate, 0) / classes.length).toFixed(1)}%`, color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Class', 'Students', 'Passed', 'Failed', 'Average', 'Highest', 'Lowest', 'Pass Rate', 'Issues', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {classes.map(c => (
                <tr key={c.class} className={`hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors ${!c.validated && c.issues > 0 ? 'bg-amber-500/5' : ''}`}>
                  <td className="py-3 px-4 font-black text-[hsl(var(--text-primary))]">{c.class}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{c.students}</td>
                  <td className="py-3 px-4 text-xs font-bold text-emerald-400">{c.passed}</td>
                  <td className="py-3 px-4 text-xs font-bold text-red-400">{c.failed}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{c.avg}%</td>
                  <td className="py-3 px-4 text-xs font-bold text-emerald-400">{c.highest}</td>
                  <td className="py-3 px-4 text-xs font-bold text-red-400">{c.lowest}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{c.passRate}%</td>
                  <td className="py-3 px-4">
                    {c.issues > 0 ? <span className="flex items-center gap-1 text-xs font-bold text-amber-400"><AlertTriangle className="w-3 h-3" />{c.issues}</span>
                      : <span className="text-xs text-[hsl(var(--text-tertiary))]">None</span>}
                  </td>
                  <td className="py-3 px-4">
                    {c.validated ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckSquare className="w-3.5 h-3.5" />Validated</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {!c.validated ? (
                      <button className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 font-bold hover:bg-violet-500/25 transition-colors">Validate</button>
                    ) : (
                      <button className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-bold">View</button>
                    )}
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
