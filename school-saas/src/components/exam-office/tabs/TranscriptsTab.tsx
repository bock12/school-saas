'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Archive, Download, Printer, Search, Award } from 'lucide-react';
import { useState } from 'react';

const certs = [
  { name: 'John Kamara', class: 'SSS 3A', type: 'School Certificate', status: 'Ready', date: 'Aug 22, 2026' },
  { name: 'Aminata Sesay', class: 'SSS 3A', type: 'School Certificate', status: 'Ready', date: 'Aug 22, 2026' },
  { name: 'Mohamed Conteh', class: 'SSS 2A', type: 'Annual Transcript', status: 'Pending', date: '—' },
  { name: 'Fatima Koroma', class: 'SSS 1A', type: 'Annual Transcript', status: 'Ready', date: 'Aug 21, 2026' },
  { name: 'Ibrahim Bangura', class: 'SSS 3A', type: 'School Certificate', status: 'On Hold', date: '—' },
];

export function TranscriptsTab({ officer }: { officer: OfficerData }) {
  const [q, setQ] = useState('');
  const filtered = certs.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Transcripts & Certificates</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Generate official transcripts and school-leaving certificates for students</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Printer className="w-4 h-4" /> Batch Print
        </button>
      </div>

      <div className="glass-card rounded-2xl p-4 border-b border-[hsl(var(--border))] flex items-center gap-3">
        <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by student name..." className="flex-1 bg-transparent text-sm text-[hsl(var(--text-primary))] outline-none placeholder:text-[hsl(var(--text-tertiary))]" />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student', 'Class', 'Document Type', 'Status', 'Issued', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {filtered.map((c, i) => (
                <tr key={i} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{c.name}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{c.class}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
                      {c.type === 'School Certificate' ? <Award className="w-3.5 h-3.5 text-amber-400" /> : <Archive className="w-3.5 h-3.5 text-blue-400" />}
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold ${c.status === 'Ready' ? 'text-emerald-400' : c.status === 'Pending' ? 'text-amber-400' : 'text-red-400'}`}>{c.status}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))]">{c.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {c.status === 'Ready' ? (
                        <>
                          <button className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 font-bold hover:bg-violet-500/25 transition-colors flex items-center gap-1">
                            <Printer className="w-3 h-3" /> Print
                          </button>
                          <button className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-bold hover:text-violet-400 transition-colors flex items-center gap-1">
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </>
                      ) : c.status === 'Pending' ? (
                        <button className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold">Generate</button>
                      ) : (
                        <span className="text-xs text-[hsl(var(--text-tertiary))]">On hold — investigation pending</span>
                      )}
                    </div>
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
