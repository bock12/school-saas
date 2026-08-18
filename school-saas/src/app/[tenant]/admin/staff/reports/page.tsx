'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Award, Download, Building, FileSpreadsheet } from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('dept');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Workforce Analytics & Demographic Reports"
        subtitle="Explore department headcount distributions, academic credential tiers, turnover ratios, and attendance trends."
        badge="Export Engine Ready"
        actionButton={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Report (PDF)</span>
          </button>
        }
      />

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-1 bg-[hsl(var(--bg-secondary))] p-1 rounded-2xl border border-[hsl(var(--border))] w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'dept', label: 'Department Headcount', icon: Users },
          { id: 'qualifications', label: 'Academic Qualifications', icon: Award },
          { id: 'attendance', label: 'Weekly Attendance Trends', icon: TrendingUp },
        ].map(rep => (
          <button
            key={rep.id}
            type="button"
            onClick={() => setActiveReport(rep.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeReport === rep.id
                ? 'bg-[hsl(var(--accent))] text-white shadow-md shadow-[hsl(var(--accent)/0.25)]'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <rep.icon className="w-4 h-4" />
            <span>{rep.label}</span>
          </button>
        ))}
      </div>

      {/* Main Analytics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
            <div>
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">
                {activeReport === 'dept' && 'Workforce Distribution by Department'}
                {activeReport === 'qualifications' && 'Academic Credential Demographics'}
                {activeReport === 'attendance' && 'Daily Attendance Percentages (Last 7 Days)'}
              </h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                Computed from live employee registries and verified attendance gates
              </p>
            </div>
            <button type="button" className="text-xs text-[hsl(var(--accent))] font-bold hover:underline flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          {/* Dynamic Responsive Bar Chart */}
          <div className="h-64 flex items-end justify-between px-2 sm:px-6 pt-10 relative">
            {activeReport === 'dept' && (
              <>
                {[
                  { label: 'Admin', val: '18 Staff', height: '60%' },
                  { label: 'Math', val: '14 Staff', height: '48%' },
                  { label: 'Science', val: '16 Staff', height: '54%' },
                  { label: 'Finance', val: '8 Staff', height: '28%' },
                  { label: 'Operations', val: '28 Staff', height: '94%' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-12 sm:w-16 group cursor-pointer">
                    <span className="text-[10px] font-bold text-[hsl(var(--text-primary))] opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.val.split(' ')[0]}
                    </span>
                    <div className="w-full rounded-t-xl bg-gradient-to-t from-[hsl(var(--accent)/0.4)] to-[hsl(var(--accent))] transition-all duration-300 group-hover:brightness-110" style={{ height: item.height }} />
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'qualifications' && (
              <>
                {[
                  { label: 'Doctorate', val: '6 Staff', height: '20%' },
                  { label: 'Masters', val: '24 Staff', height: '50%' },
                  { label: 'Bachelors', val: '48 Staff', height: '100%' },
                  { label: 'Diploma', val: '6 Staff', height: '20%' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-14 sm:w-20 group cursor-pointer">
                    <span className="text-[10px] font-bold text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.val.split(' ')[0]}
                    </span>
                    <div className="w-full rounded-t-xl bg-gradient-to-t from-blue-500/30 to-blue-500 transition-all duration-300 group-hover:brightness-110" style={{ height: item.height }} />
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}

            {activeReport === 'attendance' && (
              <>
                {[
                  { label: 'Mon', val: '91.2%', height: '80%' },
                  { label: 'Tue', val: '92.5%', height: '83%' },
                  { label: 'Wed', val: '94.0%', height: '87%' },
                  { label: 'Thu', val: '94.8%', height: '90%' },
                  { label: 'Fri', val: '95.2%', height: '95%' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 w-12 sm:w-16 group cursor-pointer">
                    <span className="text-[10px] font-bold text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.val}
                    </span>
                    <div className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500/30 to-emerald-500 transition-all duration-300 group-hover:brightness-110" style={{ height: item.height }} />
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold text-center truncate w-full">{item.label}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
              Key Metrics Summary
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Total Active Staff</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">84</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Educator License Compliance</span>
                <span className="font-bold text-emerald-400">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Annual Staff Retention</span>
                <span className="font-bold text-[hsl(var(--accent))]">96.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Average Punctuality Index</span>
                <span className="font-bold text-emerald-400">95.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
