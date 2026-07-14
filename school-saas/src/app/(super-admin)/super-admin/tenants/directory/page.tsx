'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  School, Plus, MoreHorizontal, Eye, Pause, Trash2, Filter,
  Download, ChevronLeft, ChevronRight, Users, Clock, Globe,
  GraduationCap, Check, X, AlertCircle, Play, Search, GitMerge, UploadCloud,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TenantStatus = 'active' | 'suspended' | 'past_due' | 'trial' | 'deleted' | 'provisioning' | 'pending' | 'archived';

interface Tenant {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  status: TenantStatus;
  students_count: number;
  users_count: number;
  region: string | null;
  contact_email: string | null;
  created_at: string;
  parent_id: string | null;
  parent?: { name: string } | null;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function fetchTenants(search: string, status: string): Promise<Tenant[]> {
  const supabase = createClient();
  let q = supabase
    .from('tenants')
    .select('id,name,slug,type,status,students_count,users_count,region,contact_email,created_at,parent_id,parent:parent_id(name)')
    .order('created_at', { ascending: false });

  if (search) q = q.ilike('name', `%${search}%`);
  if (status !== 'all') {
    q = q.eq('status', status);
  } else {
    q = q.neq('status', 'deleted');
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    ...row,
    parent: Array.isArray(row.parent) ? row.parent[0] : row.parent,
  })) as Tenant[];
}

async function updateStatus(id: string, status: TenantStatus) {
  const supabase = createClient();
  const { error } = await supabase.from('tenants').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

async function deleteTenant(id: string) {
  const supabase = createClient();
  // Hard-delete from database
  const { error } = await supabase.from('tenants').delete().eq('id', id);
  if (error) throw new Error(error.message);
}


// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const PLANS = [
  { value: 'starter',      label: 'Starter',      price: '$29/mo',   desc: 'Up to 100 students' },
  { value: 'pro',          label: 'Professional',  price: '$79/mo',   desc: 'Up to 500 students' },
  { value: 'enterprise',   label: 'Enterprise',    price: '$199/mo',  desc: 'Unlimited students' },
];

const REGIONS = [
  'US East (N. Virginia)', 'US West (Oregon)', 'EU (Frankfurt)',
  'EU (Ireland)', 'Asia Pacific (Singapore)', 'Africa (Cape Town)',
];

const COUNTRIES = ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'United States', 'United Kingdom', 'India', 'Other'];

function slugify(v: string) {
  return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function DirectoryPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DirectoryContent />
    </QueryClientProvider>
  );
}

function DirectoryContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Tenant | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['directory-tenants', search, statusFilter],
    queryFn: () => fetchTenants(search, statusFilter),
    refetchInterval: 30_000,
  });

  const totalPages = Math.max(1, Math.ceil(tenants.length / PAGE_SIZE));
  const paginated = tenants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const suspendMutation = useMutation({
    mutationFn: (t: Tenant) =>
      updateStatus(t.id, t.status === 'suspended' ? 'active' : 'suspended'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory-tenants'] });
      setActiveMenu(null);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory-tenants'] });
      setConfirmDelete(null);
      setActiveMenu(null);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">Tenant Directory</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            {isLoading ? 'Loading…' : `${tenants.length} tenant${tenants.length !== 1 ? 's' : ''} registered`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/super-admin/tenants/bulk-import"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Import
          </Link>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <Link
            href="/super-admin/tenants/provisioning"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Tenant
          </Link>
        </div>
      </div>

      {/* Error bar */}
      {actionError && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-3">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] pointer-events-none" />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search tenants…"
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] flex-shrink-0" />
            {['all', 'active', 'trial', 'suspended', 'past_due', 'archived'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  statusFilter === s
                    ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]'
                    : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                )}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card">
        <div className="w-full pb-24">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Tenant', 'Type', 'Parent', 'Status', 'Students', 'Region', 'Registered', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-[hsl(var(--border)/0.4)] animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <GraduationCap className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">No tenants found</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
                      {search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first tenant to get started.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map(tenant => (
                  <tr
                    key={tenant.id}
                    className="border-b border-[hsl(var(--border)/0.4)] hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors"
                    onClick={() => setActiveMenu(null)}
                  >
                    {/* School name + domain */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-black flex-shrink-0">
                          {tenant.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{tenant.name}</p>
                          {tenant.slug ? (
                            <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 truncate">
                              <Globe className="w-3 h-3 flex-shrink-0" />
                              {tenant.slug}.schoolsaas.com
                            </p>
                          ) : (
                            <p className="text-xs text-[hsl(var(--text-tertiary))] italic">No domain assigned</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] capitalize">
                        {tenant.type}
                      </span>
                    </td>

                    {/* Parent */}
                    <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">
                      {tenant.parent ? tenant.parent.name : <span className="italic text-[hsl(var(--text-tertiary))]">Standalone</span>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5"><StatusBadge status={tenant.status} /></td>

                    {/* Students */}
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))]">
                        <Users className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                        {(tenant.students_count ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Region */}
                    <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">
                      {tenant.region ?? '—'}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                        <Clock className="w-3 h-3" />
                        {new Date(tenant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Actions menu */}
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === tenant.id ? null : tenant.id)}
                          className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                        </button>

                        {activeMenu === tenant.id && (
                          <div className="absolute right-0 top-9 w-48 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-xl z-20 animate-fade-in-scale overflow-hidden p-1">
                            <Link
                              href={`/super-admin/tenants/directory/${tenant.id}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </Link>

                            <Link
                              href={`/super-admin/tenants/hierarchy`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                            >
                              <GitMerge className="w-4 h-4" /> View in Hierarchy
                            </Link>

                            <button
                              onClick={() => suspendMutation.mutate(tenant)}
                              disabled={suspendMutation.isPending}
                              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                              style={{ color: tenant.status === 'suspended' ? 'hsl(var(--success))' : 'hsl(60 80% 60%)' }}
                            >
                              {tenant.status === 'suspended'
                                ? <><Play className="w-4 h-4" /> Reactivate</>
                                : <><Pause className="w-4 h-4" /> Suspend</>
                              }
                            </button>

                            <div className="my-1 border-t border-[hsl(var(--border)/0.5)]" />

                            <button
                              onClick={() => setConfirmDelete(tenant)}
                              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
          <p className="text-xs text-[hsl(var(--text-tertiary))]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, tenants.length)} to {Math.min(page * PAGE_SIZE, tenants.length)} of {tenants.length} tenants
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[hsl(var(--text-primary))]">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl p-6 space-y-4 animate-fade-in-scale">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Delete {confirmDelete.name}?</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1.5 leading-relaxed">
                This will soft-delete the school and mark it as deleted. This action can be reversed by a database administrator.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


