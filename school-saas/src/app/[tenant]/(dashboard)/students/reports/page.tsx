'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Award } from 'lucide-react';

export default function StudentReportsPage() {
  const [activeReport, setActiveReport] = useState('growth');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Student Analytics &amp; Reports</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review operational insights, promotions rates, year-on-year growth, and graduation parameters.</p>
      </div>

      {/* Select active report */}
      <div className="glass-card p-1 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'growth', label: 'Growth Trend', icon: TrendingUp },
          { id: 'occupancy', label: 'Occupancy & Gender', icon: Users },
          { id: 'promotions', label: 'Promotion & Graduation', icon: Award }
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
        {/* Main report graph view */}
        <div className="lg:col-span-2 glass-card p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <div>
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">
                {activeReport === 'growth' && 'Student Growth by Year (2020 - 2026)'}
                {activeReport === 'occupancy' && 'Class Occupancy & Capacity Loading'}
                {activeReport === 'promotions' && 'Promotion & Graduation Rates'}
              </h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Generated directly from lifecycle data</p>
            </div>
            <span className="text-xs text-[hsl(var(--accent))] font-medium">Export PDF</span>
          </div>

          <div className="h-64 flex items-end justify-between px-4 pt-10 relative">
            {activeReport === 'growth' && (
              <>
                {[
                  { yr: '2021', val: 540, h: 'h-24' },
                  { yr: '2022', val: 610, h: 'h-28' },
                  { yr: '2023', val: 690, h: 'h-36' },
                  { yr: '2024', val: 780, h: 'h-44' },
                  { yr: '2025', val: 810, h: 'h-48' },
                  { yr: '2026', val: 842, h: 'h-52' }
                ].map(item => (
                  <div key={item.yr} className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-[hsl(var(--accent)/0.6)] to-[hsl(var(--accent))]`} />
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{item.yr}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'occupancy' && (
              <>
                {[
                  { label: 'Grade 7', val: '88%', h: 'h-44' },
                  { label: 'Grade 8', val: '75%', h: 'h-36' },
                  { label: 'Grade 9', val: '94%', h: 'h-52' },
                  { label: 'Grade 10', val: '82%', h: 'h-40' },
                  { label: 'Grade 11', val: '65%', h: 'h-28' },
                  { label: 'Grade 12', val: '98%', h: 'h-56' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-blue-500/50 to-blue-500`} />
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'promotions' && (
              <>
                {[
                  { yr: '2021', val: '92%', h: 'h-40' },
                  { yr: '2022', val: '94%', h: 'h-44' },
                  { yr: '2023', val: '95%', h: 'h-48' },
                  { yr: '2024', val: '93%', h: 'h-44' },
                  { yr: '2025', val: '94%', h: 'h-48' },
                  { yr: '2026', val: '96%', h: 'h-52' }
                ].map(item => (
                  <div key={item.yr} className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
                    <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                    <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-purple-500/50 to-purple-500`} />
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{item.yr}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Side summary card */}
        <div className="glass-card p-5 space-y-4 h-fit text-xs text-[hsl(var(--text-secondary))]">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Key Indicators</h3>
          <div className="space-y-3">
            <div>
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Pass Ratio (YTD)</span>
              <p className="text-lg font-bold text-emerald-400">96.5%</p>
            </div>
            <div>
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Enrollment Growth</span>
              <p className="text-lg font-bold text-[hsl(var(--accent))]">+14.2% Year-on-Year</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
