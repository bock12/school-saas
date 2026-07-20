'use client';

import { useState } from 'react';
import { TrendingUp, CheckCircle, ShieldAlert, Award, FileText } from 'lucide-react';

const mockPromotionRuns = [
  { id: '1', year: '2025-2026', source: 'Grade 9', target: 'Grade 10', total: 145, approved: 138, repeated: 7 },
  { id: '2', year: '2025-2026', source: 'Grade 10', target: 'Grade 11', total: 124, approved: 120, repeated: 4 }
];

export default function PromotionsPage() {
  const [minGPA, setMinGPA] = useState(2.0);
  const [minAttendance, setMinAttendance] = useState(85);
  const [feeClearanceRequired, setFeeClearanceRequired] = useState(true);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Class Promotion Engine</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure eligibility and bulk promote students into the next academic year.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Promotion rules panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))] flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[hsl(var(--accent))]" /> Promotion Eligibility Rules</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-[hsl(var(--text-secondary))]">Minimum GPA Required ({minGPA})</span>
                  <span className="text-[hsl(var(--accent))]">Pass mark threshold</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.1"
                  value={minGPA}
                  onChange={(e) => setMinGPA(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[hsl(var(--bg-tertiary))] rounded-lg appearance-none cursor-pointer accent-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-[hsl(var(--text-secondary))]">Minimum Attendance Rate ({minAttendance}%)</span>
                  <span className="text-[hsl(var(--accent))]">Mandatory presence rate</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(parseInt(e.target.value))}
                  className="w-full h-1 bg-[hsl(var(--bg-tertiary))] rounded-lg appearance-none cursor-pointer accent-[hsl(var(--accent))]"
                />
              </div>

              <div className="pt-2 border-t border-[hsl(var(--border))] space-y-3">
                <label className="flex items-center gap-2.5 text-xs text-[hsl(var(--text-secondary))] cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={feeClearanceRequired}
                    onChange={(e) => setFeeClearanceRequired(e.target.checked)}
                    className="accent-[hsl(var(--accent))]"
                  /> Force tuition outstanding balance check (Zero fees due rule)
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[hsl(var(--text-secondary))] cursor-pointer font-semibold">
                  <input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))]" /> Exclude students with active disciplinary suspensions
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[hsl(var(--text-secondary))] cursor-pointer font-semibold">
                  <input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))]" /> Automatically archive previous academic year enrollment histories
                </label>
              </div>
            </div>
          </div>

          {/* Quick promotion runner */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Trigger Bulk Class Promotion</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Source Class (Current Year)</label>
                <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                  <option>Grade 9 (All sections)</option>
                  <option>Grade 10 (All sections)</option>
                  <option>Grade 11 (All sections)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Target Class (Next Year)</label>
                <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
            </div>
            <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-95 transition-opacity">
              Review Eligible Candidates &amp; Promote
            </button>
          </div>
        </div>

        {/* Promotion log records */}
        <div className="glass-card p-5 space-y-4 h-fit">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Promotion Logs (YTD)</h3>
          <div className="space-y-4">
            {mockPromotionRuns.map(run => (
              <div key={run.id} className="p-3.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[hsl(var(--text-primary))]">{run.source} → {run.target}</span>
                  <span className="text-[hsl(var(--text-tertiary))]">{run.year}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))] block">Total Candidates</span>
                    <p className="font-bold text-[hsl(var(--text-primary))] mt-0.5">{run.total}</p>
                  </div>
                  <div>
                    <span className="text-emerald-400 block font-semibold">Promoted</span>
                    <p className="font-bold text-emerald-400 mt-0.5">{run.approved}</p>
                  </div>
                  <div>
                    <span className="text-rose-400 block font-semibold">Repeated</span>
                    <p className="font-bold text-rose-400 mt-0.5">{run.repeated}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
