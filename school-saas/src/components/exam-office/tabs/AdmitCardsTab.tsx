'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Fingerprint, Printer, QrCode, Download } from 'lucide-react';

const admitCards = [
  { examNo: 'EX-2026-0001', name: 'John Kamara', class: 'SSS 2A', seatNo: 'A-01', center: 'Hall A', generated: true },
  { examNo: 'EX-2026-0002', name: 'Aminata Sesay', class: 'SSS 2A', seatNo: 'A-02', center: 'Hall A', generated: true },
  { examNo: 'EX-2026-0003', name: 'Mohamed Conteh', class: 'SSS 2B', seatNo: 'B-15', center: 'Hall B', generated: false },
  { examNo: 'EX-2026-0004', name: 'Fatima Koroma', class: 'SSS 1A', seatNo: 'C-07', center: 'Hall C', generated: true },
];

export function AdmitCardsTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Admit Cards & Roll Numbers</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Generate exam roll numbers, seat numbers, and printable admit cards with QR verification</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] text-sm font-bold hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] transition-colors">
            <Download className="w-4 h-4" /> Export All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
            <Printer className="w-4 h-4" /> Batch Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Generated', value: admitCards.filter(a => a.generated).length, color: 'text-emerald-400' },
          { label: 'Pending', value: admitCards.filter(a => !a.generated).length, color: 'text-red-400' },
          { label: 'Total', value: admitCards.length, color: 'text-violet-400' }].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Admit Card Registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Exam Number', 'Candidate', 'Class', 'Seat No.', 'Exam Center', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {admitCards.map(a => (
                <tr key={a.examNo} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 font-black text-violet-400">{a.examNo}</td>
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{a.name}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{a.class}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{a.seatNo}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{a.center}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.generated ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      {a.generated ? 'Generated' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 font-bold transition-colors flex items-center gap-1">
                        <Printer className="w-3 h-3" /> Print
                      </button>
                      <button className="p-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors" title="QR Code">
                        <QrCode className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                      </button>
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
