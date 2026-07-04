'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Mail, Bell, Send, Users, Megaphone, AlertTriangle, Plus, Phone, Search,
  ChevronRight, LayoutDashboard, Clock, FileText, ShieldCheck, BarChart3, ClipboardList, Settings,
  CheckCircle2, X
} from 'lucide-react';

export default function CommunicationDashboard() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const kpis = [
    { label: 'Messages Sent Today', value: '1,248', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', subtitle: 'All channels' },
    { label: 'SMS Delivered', value: '584', icon: Phone, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', subtitle: '98.2% delivery' },
    { label: 'Emails Delivered', value: '412', icon: Mail, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', subtitle: '85.4% open rate' },
    { label: 'Push Notifications', value: '252', icon: Bell, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', subtitle: 'Mobile alerts' },
    { label: 'Failed Messages', value: '18', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', subtitle: 'Needs re-send' },
    { label: 'Scheduled Messages', value: '8', icon: Clock, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', subtitle: 'PTA reminder next' },
    { label: 'Emergency Alerts', value: '0', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', subtitle: 'None active' },
    { label: 'Parent Response Rate', value: '84.6%', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', subtitle: 'Avg 2hr reply' },
    { label: 'Unread Internal', value: '12', icon: Mail, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', subtitle: 'HOD inbox' },
    { label: 'Active Conversations', value: '34', icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', subtitle: 'Ongoing chat logs' }
  ];

  const quickActions = [
    { label: 'Send SMS', desc: 'Urgent announcements', href: `/${tenant}/communication/sms`, icon: Phone },
    { label: 'Send Email', desc: 'HTML newsletters or reports', href: `/${tenant}/communication/email`, icon: Mail },
    { label: 'Broadcast Announcement', desc: 'Target grade/class levels', href: `/${tenant}/communication/broadcasts`, icon: Megaphone, primary: true },
    { label: 'Create Notice', desc: 'Post to bulletin notice board', href: `/${tenant}/communication/notice-board`, icon: ClipboardList },
    { label: 'Schedule Message', desc: 'PTA/Invoices reminders queue', href: `/${tenant}/communication/scheduled`, icon: Clock },
    { label: 'Send Emergency Alert', desc: 'High-priority closure notices', href: `/${tenant}/communication/emergency`, icon: AlertTriangle, danger: true },
    { label: 'Create Template', desc: 'Placeholder-based library', href: `/${tenant}/communication/templates`, icon: FileText },
    { label: 'View Delivery Reports', desc: 'Open rates & logs analytics', href: `/${tenant}/communication/delivery-reports`, icon: BarChart3 }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Communication Center Dashboard</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Centralized hub for all inbound and outbound communication channels, automated event triggers, emergency alerts, templates library, and delivery logs.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`glass-card p-4 flex flex-col justify-between border hover:scale-[1.02] transition-all cursor-pointer ${kpi.bg}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))] tracking-wider truncate mr-1">{kpi.label}</span>
                <Icon className={`w-4 h-4 flex-shrink-0 ${kpi.color}`} />
              </div>
              <div className="mt-auto space-y-0.5">
                <p className="text-base font-bold text-[hsl(var(--text-primary))]">{kpi.value}</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Delivery &amp; Engagement Success Trends</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Real-time charts of message volumes and open rates</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1">
                Average Success: 98.4% <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery stats */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Message Volume by Channel (Monthly)</p>
                <div className="space-y-2">
                  {[
                    { channel: 'SMS Outbound Messages', count: '14,240', pct: '65%' },
                    { channel: 'Rich HTML Newsletters', count: '5,820', pct: '25%' },
                    { channel: 'Push Mobile Alerts', count: '2,180', pct: '10%' }
                  ].map(c => (
                    <div key={c.channel} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))] truncate mr-2">{c.channel}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))] flex-shrink-0">{c.count} sent</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-[hsl(var(--accent))]" style={{ width: c.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement statistics */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Parent Response Rates &amp; Reads</p>
                <div className="space-y-2">
                  {[
                    { metric: 'Parent portal read receipts', count: '84.6%', pct: '84.6%' },
                    { metric: 'HTML email click-through rate', count: '42.1%', pct: '42.1%' },
                    { metric: 'Average teacher response delay', count: '12 mins', pct: '95%' }
                  ].map(m => (
                    <div key={m.metric} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))]">{m.metric}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))]">{m.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: m.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">SMS Cost Tracking (Budget)</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '42.8%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">$42.80</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Email Bounce Rate ratio</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '0.4%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">0.4%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Automated Event Triggers</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '100%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">12 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Hub Control Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickActions.map(act => (
              <button
                key={act.label}
                onClick={() => router.push(act.href)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left hover:scale-[1.01] hover:border-[hsl(var(--border-hover))] transition-all ${
                  act.primary
                    ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white border-transparent shadow-lg shadow-[hsl(var(--accent)/0.15)]'
                    : act.danger
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                    : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <act.icon className={`w-5 h-5 ${act.primary ? 'text-white' : act.danger ? 'text-red-400 group-hover:text-white' : 'text-[hsl(var(--accent))]'}`} />
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
