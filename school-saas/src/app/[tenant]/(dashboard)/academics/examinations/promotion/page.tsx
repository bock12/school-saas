'use client';

import { useState } from 'react';
import { TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

const mockStudentsPromotion = [
  { id: '1', name: 'Sarah Smith', average: 94.2, attendance: 98, compulsoryPassed: 'Yes', failCount: 0, status: 'Promoted' },
  { id: '2', name: 'David Smith', average: 88.5, attendance: 92, compulsoryPassed: 'Yes', failCount: 0, status: 'Promoted' },
  { id: '3', name: 'Tony Johnson', average: 42.1, attendance: 65, compulsoryPassed: 'No', failCount: 3, status: 'Repeat Year' }
];

export default function PromotionPage() {
  const [students, setStudents] = useState(mockStudentsPromotion);

  const handleOverride = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: 'Promoted (Override)' };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Class Promotion Checking Panel</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review computed students pass averages, attendance constraints compliance, and approve promotions overrides.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student Name', 'Academic Average', 'Attendance Rate', 'Compulsory pass', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.average}%</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.attendance}% attendance</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.compulsoryPassed}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      row.status.startsWith('Promoted') ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {row.status === 'Repeat Year' && (
                      <button
                        onClick={() => handleOverride(row.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all text-xs font-semibold"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Manual Override
                      </button>
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
