'use client';
import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Award, Plus, Edit2, Trash2 } from 'lucide-react';

const gradingSystems = [
  {
    id: '1', name: 'Senior Secondary Grading (WAEC Style)', classes: 'SSS 1–3', active: true,
    grades: [
      { grade: 'A1', min: 75, max: 100, points: 4.0, remark: 'Excellent' },
      { grade: 'B2', min: 70, max: 74, points: 3.5, remark: 'Very Good' },
      { grade: 'B3', min: 65, max: 69, points: 3.0, remark: 'Good' },
      { grade: 'C4', min: 60, max: 64, points: 2.5, remark: 'Credit' },
      { grade: 'C5', min: 55, max: 59, points: 2.0, remark: 'Credit' },
      { grade: 'C6', min: 50, max: 54, points: 1.5, remark: 'Credit' },
      { grade: 'D7', min: 45, max: 49, points: 1.0, remark: 'Pass' },
      { grade: 'E8', min: 40, max: 44, points: 0.5, remark: 'Pass' },
      { grade: 'F9', min: 0, max: 39, points: 0.0, remark: 'Fail' },
    ],
    weighting: { ca1: 10, ca2: 10, exam: 80 },
  },
];

export function GradingSystemsTab({ officer }: { officer: OfficerData }) {
  const [selected, setSelected] = useState(gradingSystems[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Grading Systems</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Configure grade boundaries, points, and assessment weightings per class level</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Grading System
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-3">
          {gradingSystems.map((gs) => (
            <button key={gs.id} onClick={() => setSelected(gs)} className={`w-full p-4 rounded-2xl border text-left transition-all ${selected.id === gs.id ? 'border-violet-500/50 bg-violet-500/10' : 'glass-card border-[hsl(var(--border))] hover:border-violet-500/30'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{gs.name}</p>
                {gs.active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">Active</span>}
              </div>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Applies to: {gs.classes}</p>
            </button>
          ))}
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" />
                <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">{selected.name}</h2>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
              </div>
            </div>

            {/* Weighting */}
            <div className="flex gap-3 mb-5">
              {Object.entries(selected.weighting).map(([k, v]) => (
                <div key={k} className="flex-1 p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] text-center">
                  <p className="text-xl font-black text-[hsl(var(--text-primary))]">{v}%</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] uppercase font-bold mt-0.5">{k}</p>
                </div>
              ))}
            </div>

            {/* Grade table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    {['Grade', 'Min %', 'Max %', 'Grade Points', 'Remark', ''].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {selected.grades.map((g) => (
                    <tr key={g.grade} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                      <td className="py-2.5 px-3 font-black text-[hsl(var(--text-primary))]">{g.grade}</td>
                      <td className="py-2.5 px-3 text-xs text-[hsl(var(--text-secondary))]">{g.min}</td>
                      <td className="py-2.5 px-3 text-xs text-[hsl(var(--text-secondary))]">{g.max}</td>
                      <td className="py-2.5 px-3 text-xs font-bold text-violet-400">{g.points.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-xs text-[hsl(var(--text-secondary))]">{g.remark}</td>
                      <td className="py-2.5 px-3"><button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))]"><Edit2 className="w-3 h-3 text-[hsl(var(--text-tertiary))]" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
