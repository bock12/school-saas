'use client';

import { useState, useMemo } from 'react';
import {
  Users, UserPlus, Upload, Search, Building2, School, ShieldCheck,
  Mail, Clock, CheckCircle2, XCircle, MoreHorizontal, Filter, RefreshCw
} from 'lucide-react';
import { AddStaffModal } from './add-staff-modal';
import { BulkImportModal } from './bulk-import-modal';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface StaffRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
  last_login_at: string | null;
  department: string | null;
  job_title: string | null;
  staff_id: string | null;
  phone: string | null;
  schoolName: string;
  schoolSlug: string;
  isOrgLevel: boolean;
}

interface OrgStaffClientProps {
  tenant: string;
  orgId: string;
  orgSlug: string;
  orgName: string;
  allStaff: StaffRow[];
  schools: { id: string; name: string; slug: string }[];
}

type Tab = 'all' | 'org' | 'school_admin' | 'teaching';

const ROLE_CONFIG: Record<string, { label: string; cls: string }> = {
  org_admin:      { label: 'Org Admin',      cls: 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]' },
  super_admin:    { label: 'Super Admin',    cls: 'bg-purple-500/15 text-purple-400' },
  school_admin:   { label: 'School Admin',   cls: 'bg-blue-500/15 text-blue-400' },
  teacher:        { label: 'Teacher',        cls: 'bg-teal-500/15 text-teal-400' },
  coordinator:    { label: 'Coordinator',    cls: 'bg-sky-500/15 text-sky-400' },
  department_head:{ label: 'Dept. Head',     cls: 'bg-indigo-500/15 text-indigo-400' },
  counselor:      { label: 'Counselor',      cls: 'bg-pink-500/15 text-pink-400' },
  librarian:      { label: 'Librarian',      cls: 'bg-amber-500/15 text-amber-400' },
  accountant:     { label: 'Accountant',     cls: 'bg-emerald-500/15 text-emerald-400' },
  nurse:          { label: 'Nurse',          cls: 'bg-red-500/15 text-red-400' },
};

export function OrgStaffClient({ tenant, orgId, orgSlug, orgName, allStaff, schools }: OrgStaffClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all',          label: 'All Staff',    icon: Users },
    { id: 'org',          label: 'Org Admins',   icon: Building2 },
    { id: 'school_admin', label: 'School Admins',icon: School },
    { id: 'teaching',     label: 'Teaching',     icon: ShieldCheck },
  ];

  const filtered = useMemo(() => {
    let list = allStaff;
    if (tab === 'org')          list = list.filter(s => s.role === 'org_admin' || s.role === 'super_admin');
    if (tab === 'school_admin') list = list.filter(s => s.role === 'school_admin');
    if (tab === 'teaching')     list = list.filter(s => ['teacher','coordinator','department_head','counselor','librarian'].includes(s.role ?? ''));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.full_name ?? '').toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q) ||
        (s.department ?? '').toLowerCase().includes(q) ||
        (s.job_title ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStaff, tab, search]);

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelected(new Set(filtered.map(s => s.id)));
  const clearAll = () => setSelected(new Set());


  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[hsl(var(--accent))]" />
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Organization Staff</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Manage all staff for <span className="font-semibold text-[hsl(var(--text-primary))]">{orgName}</span> and its schools.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all font-medium"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Staff',    value: allStaff.length,                                                     color: 'text-[hsl(var(--accent))]',  bg: 'bg-[hsl(var(--accent)/0.1)]', icon: Users },
          { label: 'Org Admins',     value: allStaff.filter(s => s.role === 'org_admin').length,                 color: 'text-purple-400',              bg: 'bg-purple-500/10',             icon: Building2 },
          { label: 'School Admins',  value: allStaff.filter(s => s.role === 'school_admin').length,              color: 'text-blue-400',                bg: 'bg-blue-500/10',               icon: School },
          { label: 'Active',         value: allStaff.filter(s => s.is_active !== false).length,                  color: 'text-emerald-400',             bg: 'bg-emerald-500/10',            icon: CheckCircle2 },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-3 animate-fade-in">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-black text-[hsl(var(--text-primary))]">{stat.value}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs + Search */}
      <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3 border-b border-[hsl(var(--border))]">
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                    tab === t.id
                      ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]'
                      : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]')}>
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search staff…"
              className="w-full h-8 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-[hsl(var(--accent)/0.06)] border-b border-[hsl(var(--border))]">
            <span className="text-xs font-semibold text-[hsl(var(--accent))]">{selected.size} selected</span>
            <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Deactivate</button>
            <button className="text-xs text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">Export</button>
            <button onClick={clearAll} className="ml-auto text-xs text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] flex items-center gap-1 transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        )}

        {/* Select All row */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-2 border-b border-[hsl(var(--border)/0.5)] text-[10px] text-[hsl(var(--text-tertiary))]">
            <input type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={selected.size === filtered.length ? clearAll : selectAll}
              className="rounded" />
            <span>Select all {filtered.length} results</span>
            <span className="ml-auto">{filtered.length} staff</span>
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto opacity-40" />
            <p className="text-sm text-[hsl(var(--text-tertiary))]">No staff found matching your filters.</p>
            <button onClick={() => setShowAddModal(true)}
              className="mx-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              <UserPlus className="w-4 h-4" /> Add First Staff Member
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {filtered.map((staff, idx) => {
              const roleInfo = ROLE_CONFIG[staff.role ?? ''] ?? { label: staff.role ?? 'Staff', cls: 'bg-zinc-500/15 text-zinc-400' };
              const initials = (staff.full_name ?? staff.email ?? 'U').slice(0, 2).toUpperCase();
              return (
                <div key={staff.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors animate-fade-in group"
                  style={{ animationDelay: `${idx * 30}ms` }}>
                  <input type="checkbox" checked={selected.has(staff.id)} onChange={() => toggleSelect(staff.id)} className="rounded flex-shrink-0" />
                  
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--info)/0.3)] flex items-center justify-center text-[11px] font-bold text-[hsl(var(--accent))] flex-shrink-0">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{staff.full_name ?? '—'}</p>
                      {staff.staff_id && <span className="text-[10px] text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-1.5 py-0.5 rounded">{staff.staff_id}</span>}
                    </div>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{staff.email}</span>
                      {staff.department && <><span>·</span><span>{staff.department}</span></>}
                    </p>
                  </div>

                  {/* School badge */}
                  <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                    {staff.isOrgLevel ? (
                      <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-tertiary))]">
                        <Building2 className="w-3 h-3" /> Org Level
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-tertiary))]">
                        <School className="w-3 h-3" /> {staff.schoolName}
                      </span>
                    )}
                  </div>

                  {/* Role badge */}
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${roleInfo.cls}`}>
                    {roleInfo.label}
                  </span>

                  {/* Status */}
                  <div className="hidden md:flex items-center gap-1 text-[11px] flex-shrink-0">
                    {staff.is_active !== false
                      ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Active</span></>
                      : <><XCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">Inactive</span></>}
                  </div>

                  {/* Last login */}
                  <div className="hidden lg:flex items-center gap-1 text-[11px] text-[hsl(var(--text-tertiary))] flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {staff.last_login_at ? formatDate(staff.last_login_at) : 'Never'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddStaffModal
          orgId={orgId}
          orgSlug={orgSlug}
          schools={schools}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => router.refresh()}
        />
      )}
      {showBulkModal && (
        <BulkImportModal
          orgId={orgId}
          orgSlug={orgSlug}
          schools={schools}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );

  function formatDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
