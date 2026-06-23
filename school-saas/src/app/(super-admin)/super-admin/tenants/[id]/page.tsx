'use client';

import { StatusBadge } from '@/components/shared/status-badge';
import { StatCard } from '@/components/super-admin/stat-card';
import { Users, GraduationCap, HardDrive, ArrowLeft, Mail, Phone, MapPin, Globe, Calendar, CreditCard, Pause, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const tenant = {
  id: '1', name: 'Greenwood Academy', slug: 'greenwood', plan: 'Professional', status: 'active' as const,
  students: 342, teachers: 28, storage_used: 3.2, max_storage: 10,
  contact_email: 'admin@greenwood.edu', contact_phone: '+1 555-0123',
  address: '123 Oak Street, Springfield', city: 'Springfield', country: 'United States',
  created_at: '2026-01-15T10:30:00Z', subscription_start: '2026-01-15T10:30:00Z', subscription_end: '2027-01-15T10:30:00Z',
  primary_color: '#6366f1',
};

const auditLogs = [
  { id: '1', action: 'User login', actor: 'John Admin', time: '2 hours ago' },
  { id: '2', action: 'Student added', actor: 'Jane Teacher', time: '5 hours ago' },
  { id: '3', action: 'Fee invoice generated', actor: 'System', time: '1 day ago' },
  { id: '4', action: 'Class schedule updated', actor: 'John Admin', time: '2 days ago' },
];

export default function TenantDetailPage() {
  return (
    <div className="space-y-6 max-w-[1200px]">
      <Link href="/super-admin/tenants" className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Schools
      </Link>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-lg font-bold">GA</div>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">{tenant.name}</h1>
              <p className="text-sm text-[hsl(var(--text-tertiary))] flex items-center gap-1.5 mt-0.5"><Globe className="w-3.5 h-3.5" />{tenant.slug}.schoolsaas.com</p>
              <div className="mt-2"><StatusBadge status={tenant.status} /></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-all"><Pause className="w-4 h-4" />Suspend</button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] border border-red-500/20 transition-all"><Trash2 className="w-4 h-4" />Delete</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Students" value={String(tenant.students)} icon={Users} accentColor="hsl(250, 90%, 65%)" />
        <StatCard title="Teachers" value={String(tenant.teachers)} icon={GraduationCap} accentColor="hsl(142, 71%, 45%)" />
        <StatCard title="Storage Used" value={`${tenant.storage_used} GB`} subtitle={`of ${tenant.max_storage} GB`} icon={HardDrive} accentColor="hsl(38, 92%, 50%)" />
        <StatCard title="Plan" value={tenant.plan} icon={CreditCard} accentColor="hsl(217, 91%, 60%)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-4">Contact Information</h2>
          <div className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: tenant.contact_email },
              { icon: Phone, label: 'Phone', value: tenant.contact_phone },
              { icon: MapPin, label: 'Address', value: `${tenant.address}, ${tenant.city}` },
              { icon: Globe, label: 'Country', value: tenant.country },
              { icon: Calendar, label: 'Registered', value: new Date(tenant.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-2">
                <item.icon className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <span className="text-xs text-[hsl(var(--text-tertiary))] w-20">{item.label}</span>
                <span className="text-sm text-[hsl(var(--text-primary))]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Subscription</h2>
            <button className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"><RefreshCw className="w-3 h-3" />Change Plan</button>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-[hsl(var(--text-primary))]">{tenant.plan}</span>
              <span className="text-lg font-bold text-[hsl(var(--accent))]">$79/mo</span>
            </div>
            <div className="space-y-2 text-xs text-[hsl(var(--text-tertiary))]">
              <div className="flex justify-between"><span>Start Date</span><span className="text-[hsl(var(--text-secondary))]">{new Date(tenant.subscription_start).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Renewal Date</span><span className="text-[hsl(var(--text-secondary))]">{new Date(tenant.subscription_end).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Max Students</span><span className="text-[hsl(var(--text-secondary))]">500</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="glass-card">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Recent Activity</h2>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {auditLogs.map(log => (
            <div key={log.id} className="px-5 py-3 flex items-center justify-between table-row-hover transition-colors">
              <div><p className="text-sm text-[hsl(var(--text-primary))]">{log.action}</p><p className="text-xs text-[hsl(var(--text-tertiary))]">by {log.actor}</p></div>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
