'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { ScrollText, Download, Printer, Search } from 'lucide-react';
import { useState } from 'react';

const classes = [
  { class: 'SSS 1A', exam: 'End-of-Term 2026', students: 38, subjects: 9, generated: true },
  { class: 'SSS 1B', exam: 'End-of-Term 2026', students: 41, subjects: 9, generated: true },
  { class: 'SSS 2A', exam: 'End-of-Term 2026', students: 35, subjects: 9, generated: false },
  { class: 'SSS 2B', exam: 'End-of-Term 2026', students: 37, subjects: 9, generated: false },
  { class: 'SSS 3A', exam: 'End-of-Term 2026', students: 32, subjects: 9, generated: true },
];

// Simulated broadsheet data for SSS 1A
const broadsheetStudents = [
  { name: 'John Kamara', pos: 1, maths: 89, eng: 82, sci: 78, bio: 75, chem: 80, total: 404, avg: 80.8, grade: 'A1' },
  { name: 'Aminata Sesay', pos: 2, maths: 85, eng: 88, sci: 72, bio: 79, chem: 74, total: 398, avg: 79.6, grade: 'B2' },
  { name: 'Fatima Koroma', pos: 3, maths: 76, eng: 80, sci: 74, bio: 71, chem: 78, total: 379, avg: 75.8, grade: 'B2' },
  { name: 'Ibrahim Bangura', pos: 5, maths: 68, eng: 72, sci: 65, bio: 60, chem: 63, total: 328, avg: 65.6, grade: 'B3' },
];

export function BroadsheetsTab({ officer }: { officer: OfficerData }) {
  const [selected, setSelected] = useState<string | null>('SSS 1A');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Master Broadsheets</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Full class broadsheets with all subjects, scores, positions, and grade aggregates</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] text-xs font-bold border border-[hsl(var(--border))]">
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
            <Printer className="w-4 h-4" /> Print Broadsheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="space-y-2">
          {classes.map(c => (
            <button key={c.class} onClick={() => setSelected(c.class)} className={`w-full p-3.5 rounded-xl text-left border transition-all ${selected === c.class ? 'border-violet-500/50 bg-violet-500/10' : 'glass-card border-[hsl(var(--border))] hover:border-violet-500/30'}`}>
              <div className="flex items-center justify-between">
                <p className="font-black text-sm text-[hsl(var(--text-primary))]">{c.class}</p>
                {c.generated ? (
                  <span className="text-[10px] font-bold text-emerald-400">✓ Ready</span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400">Pending</span>
                )}
              </div>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{c.students} students • {c.subjects} subjects</p>
            </button>
          ))}
        </div>

        <div className="xl:col-span-3 glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[hsl(var(--border))] flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-violet-400" />
            <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">{selected} — End-of-Term 2026</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Pos', 'Student', 'Maths', 'English', 'Science', 'Biology', 'Chemistry', 'Total', 'Average', 'Grade'].map(h => (
                    <th key={h} className="text-center py-3 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {broadsheetStudents.map(s => (
                  <tr key={s.name} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-xs font-black text-violet-400">{s.pos}</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[hsl(var(--text-primary))] whitespace-nowrap">{s.name}</td>
                    {[s.maths, s.eng, s.sci, s.bio, s.chem].map((v, vi) => (
                      <td key={vi} className="py-2.5 px-3 text-center">
                        <span className={`text-xs font-bold ${v >= 75 ? 'text-emerald-400' : v >= 50 ? 'text-[hsl(var(--text-primary))]' : 'text-red-400'}`}>{v}</span>
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center text-xs font-black text-[hsl(var(--text-primary))]">{s.total}</td>
                    <td className="py-2.5 px-3 text-center text-xs font-black text-violet-400">{s.avg}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-xs font-black ${s.avg >= 75 ? 'text-emerald-400' : 'text-blue-400'}`}>{s.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
