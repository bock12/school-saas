'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('performance');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Examinations Reports</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review student performance reports, subjects passing percentages, and marking registers.</p>
      </div>

      <div className="glass-card p-1 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'performance', label: 'Subject Performance Ratios', icon: Award },
          { id: 'progress', label: 'Marking Progress', icon: Users },
          { id: 'gpa', label: 'GPA Statistics', icon: BarChart3 }
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
                {activeReport === 'performance' && 'Subject Passing Ratios (Current Term)'}
                {activeReport === 'progress' && 'Marking completion check'}
                {activeReport === 'gpa' && 'GPA distributions indicators'}
              </h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Accurate figures computed from daily live trackers</p>
            </div>
            <span className="text-xs text-[hsl(var(--accent))] font-medium">Export PDF Summary</span>
          </div>

          <div className="h-64 flex items-end justify-between px-4 pt-10 relative">
            {activeReport === 'performance' && (
              <>
                {[
                  { label: 'Mathematics', val: '88% pass', h: 'h-52' },
                  { label: 'English Lang', val: '94% pass', h: 'h-56' },
                  { label: 'Physics Mech', val: '80% pass', h: 'h-44' },
                  { label: 'Chemistry', val: '84% pass', h: 'h-48' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-[hsl(var(--accent)/0.6)] to-[hsl(var(--accent))]`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'progress' && (
              <>
                {[
                  { label: 'Mathematics', val: '100%', h: 'h-60' },
                  { label: 'English Lang', val: '100%', h: 'h-60' },
                  { label: 'Physics Mech', val: '80%', h: 'h-48' },
                  { label: 'Chemistry', val: '50%', h: 'h-30' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-emerald-500/50 to-emerald-500`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'gpa' && (
              <>
                {[
                  { label: '3.5 - 4.0 GPA', val: '40%', h: 'h-60' },
                  { label: '3.0 - 3.4 GPA', val: '50%', h: 'h-48' },
                  { label: '<3.0 GPA', val: '10%', h: 'h-12' }
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
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Average School GPA</span>
              <p className="text-lg font-bold text-emerald-400">3.42 GPA</p>
            </div>
            <div>
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Total Assessed Subjects</span>
              <p className="text-lg font-bold text-[hsl(var(--accent))]">46 Courses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
