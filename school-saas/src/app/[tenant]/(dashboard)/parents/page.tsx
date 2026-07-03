'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users, ShieldCheck, DollarSign, Heart, UsersRound, Layers, MessageSquare, UserPlus,
  FileText, LayoutGrid, BarChart3, ChevronRight, UserCheck, ArrowUpRight, Plus, Download, Mail
} from 'lucide-react';

export default function ParentsDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const kpis: {
    label: string;
    value: number;
    change: string;
    up: boolean;
    icon: any;
    color: string;
    bg: string;
    subtitle?: string;
  }[] = [
    { label: 'Total Parents', value: 524, change: '+3.1%', up: true, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Guardians', value: 84, change: '+1.2%', up: true, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Sponsors', value: 12, change: '0', up: true, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Students w/o Guardians', value: 3, change: '-2', up: false, icon: UserPlus, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Pending Rel Requests', value: 8, change: '+1', up: true, icon: Layers, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Portal Users Mobile', value: 412, change: '+6.2%', up: true, icon: UsersRound, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'No Portal Access', value: 18, change: '-4', up: false, icon: UserPlus, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Emergency Contact Missing', value: 2, change: '-1', up: false, icon: Heart, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' }
  ];

  const quickActions = [
    { label: 'Add Parent', desc: 'Register parent profile', href: `/${tenant}/parents/parents`, icon: UserPlus, primary: true },
    { label: 'Add Guardian', desc: 'Register legal guardian', href: `/${tenant}/parents/guardians`, icon: ShieldCheck },
    { label: 'Link Parent', desc: 'Link parent to student', href: `/${tenant}/parents/relationships`, icon: Layers },
    { label: 'Invite Parent Portal', desc: 'Dispatch portal invite email', href: `/${tenant}/parents/portal`, icon: Mail },
    { label: 'Print Parent Cards', desc: 'Batch ID card print', href: `/${tenant}/parents/bulk`, icon: LayoutGrid },
    { label: 'Bulk Import', desc: 'Upload CSV templates', href: `/${tenant}/parents/bulk`, icon: Download },
    { label: 'Send Announcement', desc: 'Dispatch broadcast to parents', href: `/${tenant}/parents/communication`, icon: MessageSquare },
    { label: 'Generate Family Report', desc: 'Consolidated sibling lists', href: `/${tenant}/parents/reports`, icon: FileText }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Parent &amp; Guardian RMS</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Relationship management center, permissions allocation, and portal registration logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
            Active Accounts: 608
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`glass-card p-4 flex flex-col justify-between border hover:scale-[1.02] transition-all cursor-pointer ${kpi.bg}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] tracking-wider truncate mr-2">{kpi.label}</span>
                <Icon className={`w-4 h-4 flex-shrink-0 ${kpi.color}`} />
              </div>
              <div className="flex items-baseline gap-2 mt-auto">
                <p className="text-lg font-bold text-[hsl(var(--text-primary))]">{kpi.value}</p>
                {kpi.change && (
                  <span className={`text-[10px] font-semibold flex items-center ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    <ArrowUpRight className={`w-3 h-3 ${!kpi.up && 'rotate-90'}`} />
                    {kpi.change}
                  </span>
                )}
                {kpi.subtitle && (
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">{kpi.subtitle}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Insights Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts & Graphs Panel */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Parent Demographics</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Relationship distributions and portal active rates</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1">
                Portal Activation: 97.4% <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Custom SVG line/area chart (High Performance/Zero Dep) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Relationship distribution */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Adult Relationships Distribution</p>
                <div className="space-y-2">
                  {[
                    { type: 'Father / Mother (Academic + Finance)', count: 480, pct: '78%' },
                    { type: 'Guardians (Custody & Pickup)', count: 84, pct: '14%' },
                    { type: 'Sponsors (Finance Only)', count: 12, pct: '2%' },
                    { type: 'Emergency Contacts Only', count: 32, pct: '6%' },
                  ].map(d => (
                    <div key={d.type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))] truncate mr-2">{d.type}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))] flex-shrink-0">{d.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-[hsl(var(--accent))]" style={{ width: d.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portal status distribution */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Portal Activation Demographics</p>
                <div className="space-y-2">
                  {[
                    { label: 'Mobile App Active', count: 412, pct: '67%' },
                    { label: 'Web Portal Active', count: 178, pct: '29%' },
                    { label: 'Invited / Pending', count: 18, pct: '3%' },
                    { label: 'Not Invited Yet', count: 10, pct: '1%' },
                  ].map(q => (
                    <div key={q.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))]">{q.label}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))]">{q.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: q.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom mini bar charts for statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Family Group Statements Billing</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '92%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">92%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">SMS Notification Delivery Rate</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '99%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">99%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Meeting Attendance engagement</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '84.2%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">84%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickActions.map(act => (
              <button
                key={act.label}
                onClick={() => router.push(act.href)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left hover:scale-[1.01] hover:border-[hsl(var(--border-hover))] transition-all ${
                  act.primary
                    ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white border-transparent shadow-lg shadow-[hsl(var(--accent)/0.15)]'
                    : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <act.icon className={`w-5 h-5 ${act.primary ? 'text-white' : 'text-[hsl(var(--accent))]'}`} />
                  <div>
                    <p className="text-sm font-semibold">{act.label}</p>
                    <p className={`text-xs mt-0.5 ${act.primary ? 'text-white/80' : 'text-[hsl(var(--text-tertiary))]'}`}>{act.desc}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${act.primary ? 'text-white/85' : 'text-[hsl(var(--text-tertiary))]'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
