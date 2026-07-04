'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Assessment Analytics &amp; Trends</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review student performance growth charts, subject average variances, and failure indicators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA chart */}
        <div className="lg:col-span-2 glass-card p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <div>
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">GPA Distributions (Current Term)</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Accurate figures computed from daily live trackers</p>
            </div>
            <span className="text-xs text-[hsl(var(--accent))] font-medium">Export PDF Summary</span>
          </div>

          <div className="h-64 flex items-end justify-between px-4 pt-10 relative">
            {[
              { label: '3.8 - 4.0 GPA', val: '40%', h: 'h-60' },
              { label: '3.5 - 3.7 GPA', val: '30%', h: 'h-44' },
              { label: '3.0 - 3.4 GPA', val: '20%', h: 'h-32' },
              { label: '2.5 - 2.9 GPA', val: '6%', h: 'h-12' },
              { label: '<2.5 GPA', val: '4%', h: 'h-8' }
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2 w-20 group cursor-pointer">
                <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-[hsl(var(--accent)/0.6)] to-[hsl(var(--accent))]`} />
                <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Indicators card */}
        <div className="glass-card p-5 space-y-4 h-fit text-xs text-[hsl(var(--text-secondary))]">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Summary indicators</h3>
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
