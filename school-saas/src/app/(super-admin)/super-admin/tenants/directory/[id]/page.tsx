'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/status-badge';
import { StatCard } from '@/components/super-admin/stat-card';
import {
  Users, GraduationCap, HardDrive, ArrowLeft, Mail, Phone, MapPin, Globe,
  Calendar, CreditCard, Pause, Trash2, RefreshCw, Loader2, AlertCircle, Play, X, Plus
} from 'lucide-react';
import Link from 'next/link';
import { getImpersonationLink } from '../actions';
import { NodeFormModal, NodeFormData } from '@/features/tenant-management/components/NodeFormModal';
import { hierarchyApi } from '@/features/tenant-management/api/hierarchy.api';

interface TenantData {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  is_standalone_school: boolean;
  status: string;
  students_count: number;
  users_count: number;
  storage_used: number;
  max_students: number | null;
  max_teachers: number | null;
  max_storage_gb: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
  created_at: string;
  subscription_start: string | null;
  subscription_end: string | null;
  plan_id: string | null;
  subscription_plans: {
    name: string;
    max_storage_gb: number;
    max_students: number;
    price_monthly: number;
  } | null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function TenantDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantDetailContent />
    </QueryClientProvider>
  );
}

function TenantDetailContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
  const [isEditTenantModalOpen, setIsEditTenantModalOpen] = useState(false);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const { data: tenant, isLoading, error } = useQuery<TenantData>({
    queryKey: ['tenant-detail', id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          id, name, slug, type, is_standalone_school, status, students_count, users_count, storage_used,
          max_students, max_teachers, max_storage_gb,
          contact_email, contact_phone, address, city, country, created_at, region,
          subscription_start, subscription_end, plan_id,
          subscription_plans (
            name,
            max_storage_gb,
            max_students,
            price_monthly
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      
      const raw = data as any;
      return {
        ...raw,
        subscription_plans: Array.isArray(raw.subscription_plans) 
          ? raw.subscription_plans[0] 
          : raw.subscription_plans
      } as TenantData;
    },
    enabled: !!id,
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (updates: Partial<TenantData>) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', id] });
      setIsEditTenantModalOpen(false);
      setActionError(null);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const suspendMutation = useMutation({
    mutationFn: async () => {
      if (!tenant) return;
      const supabase = createClient();
      const newStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
      const { error } = await supabase.from('tenants').update({ status: newStatus }).eq('id', id);
      if (error) throw new Error(error.message);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('audit_logs').insert({
          tenant_id: id,
          actor_id: user.id,
          action: newStatus === 'suspended' ? 'tenant_suspended' : 'tenant_reactivated',
          entity_type: 'tenant',
          entity_id: id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', id] });
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.from('tenants').update({ status: 'deleted' }).eq('id', id);
      if (error) throw new Error(error.message);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('audit_logs').insert({
          tenant_id: id,
          actor_id: user.id,
          action: 'tenant_deleted',
          entity_type: 'tenant',
          entity_id: id,
        });
      }
    },
    onSuccess: () => {
      router.push('/super-admin/tenants/directory');
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const changePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('tenants')
        .update({ plan_id: planId })
        .eq('id', id);
      if (error) throw new Error(error.message);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('audit_logs').insert({
          tenant_id: id,
          actor_id: user.id,
          action: 'plan_changed',
          entity_type: 'tenant',
          entity_id: id,
          metadata: { new_plan_id: planId }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', id] });
      setIsPlanModalOpen(false);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const updateLimitsMutation = useMutation({
    mutationFn: async (limits: { max_students: number | null, max_teachers: number | null, max_storage_gb: number | null }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('tenants')
        .update(limits)
        .eq('id', id);
      if (error) throw new Error(error.message);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('audit_logs').insert({
          tenant_id: id,
          actor_id: user.id,
          action: 'limits_changed',
          entity_type: 'tenant',
          entity_id: id,
          metadata: { limits }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', id] });
      setIsLimitsModalOpen(false);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const addChildMutation = useMutation({
    mutationFn: async (data: NodeFormData) => {
      await hierarchyApi.createNode({
        name: data.name,
        type: data.type,
        parentId: data.parentId,
        slug: data.slug,
        plan: data.plan,
        region: data.region,
        isStandaloneSchool: data.isStandaloneSchool,
        schoolType: data.schoolType,
        schoolLevels: data.schoolLevels,
        schoolShifts: data.schoolShifts,
        address: data.address,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', id] });
      setIsAddChildModalOpen(false);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const handleImpersonate = async () => {
    setIsImpersonating(true);
    setActionError(null);
    try {
      const supabase = createClient();
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      
      const url = await getImpersonationLink(id, session?.access_token);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to generate impersonation link.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to authenticate or generate link');
      setIsImpersonating(false);
    }
  };

  const { data: auditLogs = [], isLoading: isLogsLoading } = useQuery({
    queryKey: ['tenant-audit-logs', id],
    queryFn: async () => {
      const supabase = createClient();
      // Use raw SQL or RPC if the foreign key join doesn't work out of the box with profiles because of auth.users
      // In this DB, actor_id points to auth.users, and profiles is a separate table pointing to auth.users.
      // So actor_id -> profiles might require a specific foreign key relationship name if defined.
      // Let's try the standard way, and if it fails, just fetch logs and then fetch profiles manually.
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsError) throw new Error(logsError.message);
      if (!logs || logs.length === 0) return [];

      const actorIds = Array.from(new Set(logs.map(l => l.actor_id).filter(Boolean)));
      if (actorIds.length === 0) return logs.map(l => ({ ...l, actor: { name: 'System', role: 'system' } }));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', actorIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return logs.map(log => {
        const p = log.actor_id ? profileMap.get(log.actor_id) : null;
        return {
          ...log,
          actor: p ? { name: `${p.first_name} ${p.last_name}`, role: p.role } : { name: 'Unknown User', role: 'unknown' }
        };
      });
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[hsl(var(--accent))] animate-spin" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Error Loading Tenant</h3>
        <p className="text-sm text-[hsl(var(--text-tertiary))]">{error?.message || 'Tenant not found.'}</p>
        <Link href="/super-admin/tenants/directory" className="px-4 py-2 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-elevated))] rounded-xl text-sm font-bold border border-[hsl(var(--border))] transition-colors">
          Back to Directory
        </Link>
      </div>
    );
  }

  const planInfo = tenant.subscription_plans || {
    name: 'Trial',
    max_storage_gb: 10,
    max_students: 100,
    price_monthly: 0,
  };

  const formattedAddress = [tenant.address, tenant.city, tenant.country].filter(Boolean).join(', ') || 'No address provided';



  return (
    <div className="space-y-6">
      <Link href="/super-admin/tenants/directory" className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Schools
      </Link>

      {actionError && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionError}
        </div>
      )}

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-lg font-bold">
              {tenant.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">{tenant.name}</h1>
              {tenant.slug ? (
                <p className="text-sm text-[hsl(var(--text-tertiary))] flex items-center gap-1.5 mt-0.5">
                  <Globe className="w-3.5 h-3.5" />
                  {tenant.slug}.schoolsaas.com
                </p>
              ) : (
                <p className="text-sm text-[hsl(var(--text-tertiary))] italic mt-0.5">No custom domain/subdomain</p>
              )}
              <div className="mt-2"><StatusBadge status={tenant.status as any} /></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImpersonate}
              disabled={isImpersonating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {isImpersonating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              {isImpersonating ? 'Connecting...' : 'Log in as Tenant'}
            </button>
            <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />
            {!tenant.is_standalone_school && tenant.type !== 'campus' && (
              <button
                onClick={() => setIsAddChildModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-teal-500/20 text-teal-400 hover:bg-teal-500/10 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Child
              </button>
            )}
            <button
              onClick={() => suspendMutation.mutate()}
              disabled={suspendMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all disabled:opacity-50"
              style={{
                color: tenant.status === 'suspended' ? 'hsl(var(--success))' : 'hsl(60 80% 60%)',
                borderColor: tenant.status === 'suspended' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 0, 0.2)'
              }}
            >
              {tenant.status === 'suspended' ? <><Play className="w-4 h-4" /> Reactivate</> : <><Pause className="w-4 h-4" /> Suspend</>}
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${tenant.name}?`)) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] border border-red-500/20 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Students" value={String(tenant.students_count ?? 0)} icon={Users} accentColor="hsl(250, 90%, 65%)" />
        <StatCard title="Total Staff / Users" value={String(tenant.users_count ?? 0)} icon={GraduationCap} accentColor="hsl(142, 71%, 45%)" />
        <StatCard title="Storage Used" value={`${tenant.storage_used ?? 0} GB`} subtitle={`of ${planInfo.max_storage_gb} GB`} icon={HardDrive} accentColor="hsl(38, 92%, 50%)" />
        <StatCard title="Plan" value={planInfo.name} icon={CreditCard} accentColor="hsl(217, 91%, 60%)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contact Info */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Contact Information</h2>
            <button
              onClick={() => setIsEditTenantModalOpen(true)}
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Edit Profile
            </button>
          </div>
          <div className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: tenant.contact_email || '—' },
              { icon: Phone, label: 'Phone', value: tenant.contact_phone || '—' },
              { icon: MapPin, label: 'Address', value: formattedAddress },
              { icon: Globe, label: 'Region', value: tenant.region || '—' },
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
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Change Plan
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-[hsl(var(--text-primary))]">{planInfo.name}</span>
              <span className="text-lg font-bold text-[hsl(var(--accent))]">${planInfo.price_monthly}/mo</span>
            </div>
            <div className="space-y-2 text-xs text-[hsl(var(--text-tertiary))]">
              <div className="flex justify-between">
                <span>Start Date</span>
                <span className="text-[hsl(var(--text-secondary))]">
                  {tenant.subscription_start ? new Date(tenant.subscription_start).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Renewal Date</span>
                <span className="text-[hsl(var(--text-secondary))]">
                  {tenant.subscription_end ? new Date(tenant.subscription_end).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Limits & Quotas */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Limits & Quotas</h2>
            <button
              onClick={() => setIsLimitsModalOpen(true)}
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Edit Limits
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
            <div className="space-y-4">
              {[
                { label: 'Max Students', override: tenant.max_students, planLimit: planInfo.max_students },
                { label: 'Max Teachers', override: tenant.max_teachers, planLimit: 20 },
                { label: 'Max Storage (GB)', override: tenant.max_storage_gb, planLimit: planInfo.max_storage_gb },
              ].map(limit => (
                <div key={limit.label} className="flex justify-between items-center text-xs">
                  <span className="text-[hsl(var(--text-tertiary))]">{limit.label}</span>
                  <div className="flex items-center gap-2">
                    {limit.override !== null && limit.override !== limit.planLimit && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                        Overridden
                      </span>
                    )}
                    <span className="text-sm font-bold text-[hsl(var(--text-primary))]">
                      {limit.override !== null ? limit.override : limit.planLimit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Recent Activity</h2>
          {isLogsLoading && <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--text-tertiary))]" />}
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {auditLogs.length === 0 && !isLogsLoading ? (
            <div className="px-5 py-6 text-center text-sm text-[hsl(var(--text-tertiary))]">
              No recent activity recorded.
            </div>
          ) : (
            auditLogs.map((log: any) => (
              <div key={log.id} className="px-5 py-3 flex items-center justify-between table-row-hover transition-colors">
                <div>
                  <p className="text-sm text-[hsl(var(--text-primary))] capitalize">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">
                    by <span className="font-medium text-[hsl(var(--text-secondary))]">{log.actor?.name}</span> ({log.actor?.role.replace(/_/g, ' ')})
                  </p>
                </div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] text-right">
                  {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Change Plan Modal */}
      <ChangePlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        currentPlanId={tenant.plan_id}
        onSelect={(pId) => changePlanMutation.mutate(pId)}
        isPending={changePlanMutation.isPending}
      />

      {/* Edit Limits Modal */}
      <EditLimitsModal
        isOpen={isLimitsModalOpen}
        onClose={() => setIsLimitsModalOpen(false)}
        tenant={tenant}
        plan={planInfo}
        onSave={(limits) => updateLimitsMutation.mutate(limits)}
        isPending={updateLimitsMutation.isPending}
      />

      <NodeFormModal
        isOpen={isAddChildModalOpen}
        parentNode={tenant as any}
        onClose={() => setIsAddChildModalOpen(false)}
        onSubmit={(data) => addChildMutation.mutate(data)}
        isSubmitting={addChildMutation.isPending}
        submitError={actionError}
      />

      <EditTenantModal
        isOpen={isEditTenantModalOpen}
        onClose={() => setIsEditTenantModalOpen(false)}
        tenant={tenant}
        onSave={(updates) => updateTenantMutation.mutate(updates)}
        isPending={updateTenantMutation.isPending}
      />
    </div>
  );
}

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: string | null;
  onSelect: (planId: string) => void;
  isPending: boolean;
}

function ChangePlanModal({ isOpen, onClose, currentPlanId, onSelect, isPending }: ChangePlanModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(currentPlanId);

  const { data: availablePlans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, price_monthly, description, max_students, max_storage_gb')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: isOpen,
  });

  React.useEffect(() => {
    setSelectedPlanId(currentPlanId);
  }, [currentPlanId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl p-6 space-y-4 animate-fade-in-scale">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Change Subscription Plan</h3>
          <button onClick={onClose} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {isLoading ? (
            <div className="text-center py-4 text-xs text-[hsl(var(--text-tertiary))] animate-pulse">Loading plans...</div>
          ) : availablePlans.map(p => (
            <label
              key={p.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlanId === p.id
                  ? 'border-[hsl(var(--accent)/0.6)] bg-[hsl(var(--accent)/0.06)]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'
              }`}
            >
              <input
                type="radio"
                name="change-plan"
                checked={selectedPlanId === p.id}
                onChange={() => setSelectedPlanId(p.id)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedPlanId === p.id ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]' : 'border-[hsl(var(--border))]'
              }`}>
                {selectedPlanId === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                  {p.name}
                  {currentPlanId === p.id && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] uppercase tracking-wider">Current</span>
                  )}
                </p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{p.description || `Up to ${p.max_students} students, ${p.max_storage_gb}GB storage`}</p>
              </div>
              <span className="text-xs font-bold text-[hsl(var(--accent))]">${p.price_monthly}/mo</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedPlanId && onSelect(selectedPlanId)}
            disabled={isPending || !selectedPlanId || selectedPlanId === currentPlanId}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isPending ? 'Updating…' : 'Update Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditLimitsModal({ 
  isOpen, 
  onClose, 
  tenant, 
  plan, 
  onSave, 
  isPending 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  tenant: TenantData; 
  plan: any; 
  onSave: (limits: any) => void; 
  isPending: boolean; 
}) {
  const [limits, setLimits] = useState({
    max_students: tenant.max_students ?? plan.max_students,
    max_teachers: tenant.max_teachers ?? 20,
    max_storage_gb: tenant.max_storage_gb ?? plan.max_storage_gb,
  });

  React.useEffect(() => {
    if (isOpen) {
      setLimits({
        max_students: tenant.max_students ?? plan.max_students,
        max_teachers: tenant.max_teachers ?? 20,
        max_storage_gb: tenant.max_storage_gb ?? plan.max_storage_gb,
      });
    }
  }, [isOpen, tenant, plan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl p-6 space-y-5 animate-fade-in-scale">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Edit Limits & Quotas</h3>
          <button onClick={onClose} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Max Students <span className="lowercase font-normal text-[hsl(var(--text-tertiary))]">(Plan: {plan.max_students})</span>
            </label>
            <input 
              type="number" 
              value={limits.max_students}
              onChange={(e) => setLimits(p => ({ ...p, max_students: parseInt(e.target.value) || 0 }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Max Teachers <span className="lowercase font-normal text-[hsl(var(--text-tertiary))]">(Default: 20)</span>
            </label>
            <input 
              type="number" 
              value={limits.max_teachers}
              onChange={(e) => setLimits(p => ({ ...p, max_teachers: parseInt(e.target.value) || 0 }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Max Storage (GB) <span className="lowercase font-normal text-[hsl(var(--text-tertiary))]">(Plan: {plan.max_storage_gb})</span>
            </label>
            <input 
              type="number" 
              value={limits.max_storage_gb}
              onChange={(e) => setLimits(p => ({ ...p, max_storage_gb: parseInt(e.target.value) || 0 }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({
              max_students: limits.max_students === plan.max_students ? null : limits.max_students,
              max_teachers: limits.max_teachers === 20 ? null : limits.max_teachers,
              max_storage_gb: limits.max_storage_gb === plan.max_storage_gb ? null : limits.max_storage_gb,
            })}
            disabled={isPending}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isPending ? 'Saving…' : 'Save Limits'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTenantModal({
  isOpen,
  onClose,
  tenant,
  onSave,
  isPending
}: {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantData;
  onSave: (updates: Partial<TenantData>) => void;
  isPending: boolean;
}) {
  const [data, setData] = useState({
    name: tenant.name,
    slug: tenant.slug || '',
    contact_email: tenant.contact_email || '',
    contact_phone: tenant.contact_phone || '',
    address: tenant.address || '',
    city: tenant.city || '',
    country: tenant.country || '',
    region: tenant.region || '',
  });

  React.useEffect(() => {
    if (isOpen) {
      setData({
        name: tenant.name,
        slug: tenant.slug || '',
        contact_email: tenant.contact_email || '',
        contact_phone: tenant.contact_phone || '',
        address: tenant.address || '',
        city: tenant.city || '',
        country: tenant.country || '',
        region: tenant.region || '',
      });
    }
  }, [isOpen, tenant]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl p-6 space-y-5 animate-fade-in-scale max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Edit Profile</h3>
          <button onClick={onClose} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Tenant Name *
            </label>
            <input 
              type="text" 
              value={data.name}
              onChange={(e) => setData(p => ({ ...p, name: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Slug (Subdomain)
            </label>
            <div className="flex">
              <input 
                type="text" 
                value={data.slug}
                onChange={(e) => setData(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                className="w-full h-9 px-3 rounded-l-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
              <div className="h-9 px-3 flex items-center bg-[hsl(var(--bg-elevated))] border border-l-0 border-[hsl(var(--border))] rounded-r-xl text-sm text-[hsl(var(--text-tertiary))]">
                .schoolsaas.com
              </div>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Contact Email
            </label>
            <input 
              type="email" 
              value={data.contact_email}
              onChange={(e) => setData(p => ({ ...p, contact_email: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Contact Phone
            </label>
            <input 
              type="text" 
              value={data.contact_phone}
              onChange={(e) => setData(p => ({ ...p, contact_phone: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Address
            </label>
            <input 
              type="text" 
              value={data.address}
              onChange={(e) => setData(p => ({ ...p, address: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              City
            </label>
            <input 
              type="text" 
              value={data.city}
              onChange={(e) => setData(p => ({ ...p, city: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Country
            </label>
            <select
              value={data.country}
              onChange={(e) => setData(p => ({ ...p, country: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            >
              <option value="">Select Country...</option>
              {['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'United States', 'United Kingdom', 'India', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
              Region
            </label>
            <select
              value={data.region}
              onChange={(e) => setData(p => ({ ...p, region: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            >
              <option value="">Select Region...</option>
              {['US East (N. Virginia)', 'US West (Oregon)', 'EU (Frankfurt)', 'EU (Ireland)', 'Asia Pacific (Singapore)', 'Africa (Cape Town)'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!data.name.trim()) return alert('Name is required');
              onSave({
                name: data.name,
                slug: data.slug || null,
                contact_email: data.contact_email || null,
                contact_phone: data.contact_phone || null,
                address: data.address || null,
                city: data.city || null,
                country: data.country || null,
                region: data.region || null,
              });
            }}
            disabled={isPending}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
