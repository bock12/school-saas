'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpDown, User, RefreshCw } from 'lucide-react';

export type ExamResultSubject = {
  subject: string;
  Pass: number;
  Average: number;
  Fail: number;
  highlightBadge?: string;
};

const defaultSubjectResults: ExamResultSubject[] = [
  { subject: 'Maths', Pass: 1600, Average: 600, Fail: 450 },
  { subject: 'English', Pass: 700, Average: 1000, Fail: 420, highlightBadge: '59.9%' },
  { subject: 'Mandarin', Pass: 750, Average: 520, Fail: 760 },
  { subject: 'Science', Pass: 720, Average: 980, Fail: 440 },
  { subject: 'Arts', Pass: 1650, Average: 600, Fail: 460 },
  { subject: 'Exercise', Pass: 710, Average: 530, Fail: 120 },
];

export function ExamResultsBarChart({ data = defaultSubjectResults }: { data?: ExamResultSubject[] }) {
  const [filterMode, setFilterMode] = useState<'grade' | 'gender'>('grade');

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-[hsl(var(--border)/0.6)] h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[hsl(var(--border)/0.4)]">
        <div>
          <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Examination Results</h3>
          <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Pass, Average, and Fail breakdown by subject</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMode('grade')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'grade'
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            Grade <ArrowUpDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => setFilterMode('gender')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'gender'
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            Gender <User className="w-3 h-3" />
          </button>

          <button className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend Header Bar */}
      <div className="flex items-center gap-3 sm:gap-4 mb-2 text-[10px] sm:text-xs font-bold flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-violet-600" />
          <span className="text-[hsl(var(--text-secondary))]">Pass</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-500" />
          <span className="text-[hsl(var(--text-secondary))]">Average</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-amber-500" />
          <span className="text-[hsl(var(--text-secondary))]">Fail</span>
        </div>
      </div>

      {/* Recharts Grouped Bar Chart */}
      <div className="w-full min-h-[200px] sm:min-h-[230px] relative">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis
              dataKey="subject"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--text-tertiary))', fontSize: 10 }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--bg-tertiary)/0.3)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                      <p className="font-black text-[hsl(var(--text-primary))]">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                          <span style={{ color: entry.color }} className="font-bold">{entry.name}:</span>
                          <span className="font-black text-[hsl(var(--text-primary))]">{entry.value} candidates</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="Pass" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={9} />
            <Bar dataKey="Average" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={9} />
            <Bar dataKey="Fail" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={9} />
          </BarChart>
        </ResponsiveContainer>

        {/* Dynamic Highlight Badge */}
        <div className="absolute top-6 left-[28%] -translate-x-1/2 pointer-events-none hidden sm:block">
          <div className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-blue-400/50 animate-bounce">
            59.9%
          </div>
        </div>
      </div>
    </div>
  );
}
