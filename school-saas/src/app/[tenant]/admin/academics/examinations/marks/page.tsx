'use client';

import { useState } from 'react';
import { Edit2, Save, ArrowLeft } from 'lucide-react';

const mockStudentsMarks = [
  { id: '1', name: 'Sarah Smith', caScore: 24, examScore: 68 },
  { id: '2', name: 'David Smith', caScore: 22, examScore: 50 },
  { id: '3', name: 'Amara Johnson', caScore: 28, examScore: 84 }
];

export default function MarksEntryPage() {
  const [marks, setMarks] = useState(mockStudentsMarks);

  const handleScoreChange = (id: string, field: 'caScore' | 'examScore', value: number) => {
    // Validate value bounds (CA max 30, Exam max 70)
    const limit = field === 'caScore' ? 30 : 70;
    if (value < 0 || value > limit) return;

    setMarks(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Secure Marks Entry Desk</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Mathematics (MTH101) • Grade 10 Science Stream</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Save className="w-4 h-4" /> Save Marksheet changes
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student Name', 'Continuous Assessment (CA) /30', 'Final Examination /70', 'Final Score /100'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marks.map((row) => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5">
                    <input
                      type="number"
                      value={row.caScore}
                      onChange={(e) => handleScoreChange(row.id, 'caScore', parseInt(e.target.value) || 0)}
                      className="w-20 h-9 px-2 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <input
                      type="number"
                      value={row.examScore}
                      onChange={(e) => handleScoreChange(row.id, 'examScore', parseInt(e.target.value) || 0)}
                      className="w-20 h-9 px-2 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold text-[hsl(var(--text-primary))]">
                    {row.caScore + row.examScore}/100
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
