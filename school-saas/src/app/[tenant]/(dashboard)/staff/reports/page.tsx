'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Award } from 'lucide-react';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('dept');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Staff Insights &amp; Demographics</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review workforce distributions, qualifications counts, and daily attendance records.</p>
      </div>

      <div className="glass-card p-1 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'dept', label: 'By Department', icon: Users },
          { id: 'qualifications', label: 'Qualifications Distribution', icon: Award },
          { id: 'attendance', label: 'Attendance Trends', icon: TrendingUp }
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
                {activeReport === 'dept' && 'Workforce Headcount by Department'}
                {activeReport === 'qualifications' && 'Academic Qualification Demographics'}
                {activeReport === 'attendance' && 'Live Daily Attendance (Last 7 Days)'}
              </h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Accurate figures computed from daily live trackers</p>
            </div>
            <span className="text-xs text-[hsl(var(--accent))] font-medium">Export PDF Summary</span>
          </div>

          <div className="h-64 flex items-end justify-between px-4 pt-10 relative">
            {activeReport === 'dept' && (
              <>
                {[
                  { label: 'Admin', val: 18, h: 'h-24' },
                  { label: 'Math', val: 14, h: 'h-20' },
                  { label: 'Science', val: 16, h: 'h-22' },
                  { label: 'Finance', val: 8, h: 'h-12' },
                  { label: 'Operations', val: 28, h: 'h-40' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-[hsl(var(--accent)/0.6)] to-[hsl(var(--accent))]`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'qualifications' && (
              <>
                {[
                  { label: 'Doctorate', val: 6, h: 'h-12' },
                  { label: 'Masters', val: 24, h: 'h-36' },
                  { label: 'Bachelors', val: 48, h: 'h-52' },
                  { label: 'Diploma', val: 6, h: 'h-12' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-blue-500/50 to-blue-500`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'attendance' && (
              <>
                {[
                  { label: 'Mon', val: '96%', h: 'h-48' },
                  { label: 'Tue', val: '97%', h: 'h-52' },
                  { label: 'Wed', val: '94%', h: 'h-44' },
                  { label: 'Thu', val: '95%', h: 'h-48' },
                  { label: 'Fri', val: '98%', h: 'h-56' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-purple-500/50 to-purple-500`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))]">{item.label}</span>
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
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Total FTE Count</span>
              <p className="text-lg font-bold text-[hsl(var(--text-primary))]">84 Full-Time</p>
            </div>
            <div>
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Retention Rate</span>
              <p className="text-lg font-bold text-emerald-400">98.2% (YTD)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
