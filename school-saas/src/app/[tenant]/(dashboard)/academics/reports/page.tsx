'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Award, Calendar } from 'lucide-react';

export default function AcademicReportsPage() {
  const [activeReport, setActiveReport] = useState('workload');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Academic Analytics &amp; Reports</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review subject allocations, teacher workload volume, promotion rules pass rates, and curriculum completion metrics.</p>
      </div>

      <div className="glass-card p-1 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'workload', label: 'Teacher Workload Distribution', icon: Users },
          { id: 'curriculum', label: 'Curriculum Completion Coverage', icon: Award },
          { id: 'promotion', label: 'Promotion Ratios', icon: TrendingUp }
        ].map(rep => (
          <button
            key={rep.id}
            onClick={() => setActiveReport(rep.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeReport === rep.id
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <rep.icon className="w-3.5 h-3.5" /> {rep.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <div>
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">
                {activeReport === 'workload' && 'Teacher Workload Distribution (Periods/Week)'}
                {activeReport === 'curriculum' && 'Weekly Curriculum Completion Percentage'}
                {activeReport === 'promotion' && 'Automated Student Promotion ratios'}
              </h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Accurate figures computed from daily live trackers</p>
            </div>
            <span className="text-xs text-[hsl(var(--accent))] font-medium">Export PDF Summary</span>
          </div>

          <div className="h-64 flex items-end justify-between px-4 pt-10 relative">
            {activeReport === 'workload' && (
              <>
                {[
                  { label: 'John Doe', val: '18 periods', h: 'h-48' },
                  { label: 'Rachel Johnson', val: '16 periods', h: 'h-40' },
                  { label: 'Emeka Okafor', val: '10 periods', h: 'h-24' },
                  { label: 'Linda Williams', val: '22 periods', h: 'h-56' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-[hsl(var(--accent)/0.6)] to-[hsl(var(--accent))]`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'curriculum' && (
              <>
                {[
                  { label: 'Math Dept', val: '88%', h: 'h-52' },
                  { label: 'Science Dept', val: '82%', h: 'h-48' },
                  { label: 'Arts Dept', val: '80%', h: 'h-44' },
                  { label: 'Languages', val: '94%', h: 'h-56' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-emerald-500/50 to-emerald-500`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'promotion' && (
              <>
                {[
                  { label: 'Promoted Regular', val: '92.1%', h: 'h-56' },
                  { label: 'Conditional Pass', val: '5.2%', h: 'h-12' },
                  { label: 'Repeat Year', val: '2.7%', h: 'h-8' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-24 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-blue-500/50 to-blue-500`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4 h-fit text-xs text-[hsl(var(--text-secondary))]">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Summary KPIs</h3>
          <div className="space-y-3">
            <div>
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Curriculum Completion Coverage</span>
              <p className="text-lg font-bold text-emerald-400">84.2%</p>
            </div>
            <div>
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Weekly Periods Taught</span>
              <p className="text-lg font-bold text-[hsl(var(--accent))]">142 Periods</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
