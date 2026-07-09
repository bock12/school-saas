'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { SearchInput } from '@/components/shared/search-input';
import {
  School, Plus, MoreHorizontal, Eye, Pause, Trash2, Filter,
  Download, ChevronLeft, ChevronRight, Users, Clock, Globe,
} from 'lucide-react';
import Link from 'next/link';
import type { TenantStatus } from '@/types';

interface DemoTenant {
  id: string; name: string; slug: string; plan: string;
  status: TenantStatus; students: number; teachers: number;
  contact_email: string; created_at: string;
}

const demoTenants: DemoTenant[] = [
  { id: '1', name: 'Greenwood Academy', slug: 'greenwood', plan: 'Professional', status: 'active', students: 342, teachers: 28, contact_email: 'admin@greenwood.edu', created_at: '2026-06-20T10:30:00Z' },
  { id: '2', name: 'Sunrise International', slug: 'sunrise', plan: 'Enterprise', status: 'active', students: 1205, teachers: 89, contact_email: 'info@sunrise.edu', created_at: '2026-06-18T08:15:00Z' },
  { id: '3', name: 'Heritage Prep', slug: 'heritage-prep', plan: 'Starter', status: 'trial', students: 67, teachers: 8, contact_email: 'hello@heritage.edu', created_at: '2026-06-15T14:45:00Z' },
  { id: '4', name: 'Oakwood Learning Center', slug: 'oakwood', plan: 'Professional', status: 'past_due', students: 189, teachers: 15, contact_email: 'admin@oakwood.edu', created_at: '2026-06-12T11:20:00Z' },
  { id: '5', name: 'Maple Ridge School', slug: 'maple-ridge', plan: 'Starter', status: 'active', students: 98, teachers: 9, contact_email: 'office@maple.edu', created_at: '2026-06-10T09:00:00Z' },
  { id: '6', name: 'Riverdale Academy', slug: 'riverdale', plan: 'Professional', status: 'suspended', students: 410, teachers: 32, contact_email: 'admin@riverdale.edu', created_at: '2026-05-28T16:30:00Z' },
  { id: '7', name: 'Bright Future School', slug: 'bright-future', plan: 'Enterprise', status: 'active', students: 876, teachers: 64, contact_email: 'info@brightfuture.edu', created_at: '2026-05-15T12:00:00Z' },
  { id: '8', name: 'Summit Academy', slug: 'summit', plan: 'Starter', status: 'trial', students: 45, teachers: 5, contact_email: 'hello@summit.edu', created_at: '2026-06-22T10:00:00Z' },
];

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = demoTenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">School Management</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{demoTenants.length} registered schools</p>
        </div>
        <button onClick={() => setShowOnboarding(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add School
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <SearchInput placeholder="Search schools..." onSearch={setSearch} className="w-full md:w-80" />
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            {['all', 'active', 'trial', 'suspended', 'past_due'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['School', 'Plan', 'Status', 'Students', 'Teachers', 'Registered', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                        {tenant.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{tenant.name}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1"><Globe className="w-3 h-3" />{tenant.slug}.schoolsaas.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{tenant.plan}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={tenant.status} /></td>
                  <td className="px-5 py-3.5"><span className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))]"><Users className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />{tenant.students}</span></td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{tenant.teachers}</td>
                  <td className="px-5 py-3.5"><span className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]"><Clock className="w-3 h-3" />{new Date(tenant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="relative">
                      <button onClick={() => setActiveMenu(activeMenu === tenant.id ? null : tenant.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                      </button>
                      {activeMenu === tenant.id && (
                        <div className="absolute right-0 top-8 w-44 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg z-10 animate-fade-in-scale overflow-hidden p-1">
                          <Link href={`/super-admin/tenants/directory/${tenant.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"><Eye className="w-4 h-4" />View Details</Link>
                          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 transition-all"><Pause className="w-4 h-4" />Suspend</button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] transition-all"><Trash2 className="w-4 h-4" />Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--text-tertiary))]">Showing {filtered.length} of {demoTenants.length} schools</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1 rounded-lg bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-xs font-medium">1</button>
            <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingDialog onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}

function OnboardingDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl animate-fade-in-scale overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Onboard New School</h2>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Step {step} of 3</p>
          <div className="flex gap-1 mt-3">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--bg-tertiary))]'}`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">School Name</label><input type="text" placeholder="e.g., Greenwood Academy" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Subdomain Slug</label><div className="flex"><input type="text" placeholder="greenwood" className="flex-1 h-10 px-3 rounded-l-lg bg-[hsl(var(--bg-tertiary))] border border-r-0 border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /><span className="h-10 px-3 flex items-center rounded-r-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">.schoolsaas.com</span></div></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Contact Email</label><input type="email" placeholder="admin@school.edu" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Country</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Select country</option><option>United States</option><option>United Kingdom</option><option>Nigeria</option><option>Kenya</option><option>India</option></select></div>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-[hsl(var(--text-secondary))]">Select a subscription plan:</p>
              {[{name:'Starter',price:'$29/mo',desc:'Up to 100 students'},{name:'Professional',price:'$79/mo',desc:'Up to 500 students'},{name:'Enterprise',price:'$199/mo',desc:'Up to 5,000 students'}].map(p => (
                <label key={p.name} className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)] cursor-pointer transition-all">
                  <input type="radio" name="plan" className="accent-[hsl(var(--accent))]" />
                  <div className="flex-1"><p className="text-sm font-medium text-[hsl(var(--text-primary))]">{p.name}</p><p className="text-xs text-[hsl(var(--text-tertiary))]">{p.desc}</p></div>
                  <span className="text-sm font-semibold text-[hsl(var(--accent))]">{p.price}</span>
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <>
              <p className="text-sm text-[hsl(var(--text-secondary))]">Create the default school administrator account:</p>
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Admin Full Name</label><input type="text" placeholder="John Doe" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Admin Email</label><input type="email" placeholder="admin@greenwood.edu" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Temporary Password</label><input type="text" defaultValue="Temp@2026!xK" readOnly className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] font-mono focus:outline-none transition-colors" /></div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="px-4 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button onClick={() => step < 3 ? setStep(step + 1) : onClose} className="px-5 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            {step < 3 ? 'Continue' : 'Create School'}
          </button>
        </div>
      </div>
    </div>
  );
}
