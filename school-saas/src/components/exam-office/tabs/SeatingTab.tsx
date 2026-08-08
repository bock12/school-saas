'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Users, Printer, RefreshCw } from 'lucide-react';

// 7-row × 5-col seating grid for Hall A
const seats: (string | null)[][] = [
  ['EX-0001','EX-0002','EX-0003','EX-0004','EX-0005'],
  ['EX-0006','EX-0007','EX-0008','EX-0009','EX-0010'],
  ['EX-0011','EX-0012','EX-0013',null,'EX-0014'],
  ['EX-0015','EX-0016','EX-0017','EX-0018','EX-0019'],
  ['EX-0020','EX-0021','EX-0022','EX-0023','EX-0024'],
  ['EX-0025','EX-0026',null,'EX-0027','EX-0028'],
  ['EX-0029','EX-0030','EX-0031','EX-0032','EX-0033'],
];

export function SeatingTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Seating Arrangements</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Visual exam hall seating plans with automatic randomized allocation and printable charts</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] text-xs font-bold border border-[hsl(var(--border))]">
            <RefreshCw className="w-3.5 h-3.5" /> Randomize
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
            <Printer className="w-4 h-4" /> Print Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-black text-[hsl(var(--text-primary))]">Hall A — Mathematics Examination</h2>
            <span className="text-xs text-[hsl(var(--text-tertiary))]">33 seats / 60 capacity</span>
          </div>

          {/* Invigilator desk */}
          <div className="flex justify-center mb-8">
            <div className="px-8 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-xs font-bold text-violet-400">
              📋 INVIGILATOR DESK
            </div>
          </div>

          {/* Grid */}
          <div className="space-y-4">
            {seats.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-4">
                {row.map((seat, ci) => (
                  <div
                    key={ci}
                    className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center border transition-all ${
                      seat
                        ? 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] hover:border-violet-500/50 cursor-pointer'
                        : 'border-dashed border-[hsl(var(--border)/0.3)] opacity-30'
                    }`}
                  >
                    {seat && (
                      <>
                        <span className="text-[8px] text-[hsl(var(--text-tertiary))] leading-none">{`${ri + 1}-${ci + 1}`}</span>
                        <span className="text-[8px] font-bold text-violet-400 leading-none mt-0.5">{seat.replace('EX-', '')}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-[hsl(var(--text-tertiary))]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] inline-block" /> Allocated</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-dashed border border-[hsl(var(--border)/0.3)] inline-block opacity-30" /> Empty</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="font-black text-[hsl(var(--text-primary))] text-sm mb-3">Seating Settings</h3>
            <div className="space-y-3 text-xs">
              {[
                { label: 'Ordering', value: 'By Exam Number' },
                { label: 'Class Mixing', value: 'Enabled' },
                { label: 'Row Spacing', value: 'Standard' },
                { label: 'Invigilators', value: '2 assigned' },
              ].map(s => (
                <div key={s.label} className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--text-tertiary))]">{s.label}</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
