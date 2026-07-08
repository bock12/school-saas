'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  School, CreditCard, DollarSign, Users, ArrowRight, Plus,
  Megaphone, TrendingUp, Clock, Shield, Cpu, Layers, Brain,
  Search, ShieldAlert, Heart, HardDrive, RefreshCw, Radio,
  Send, Save, Eye, Edit3, Trash2, Key, CheckCircle2, Lock,
  PlusCircle, UserX, AlertTriangle, MessageSquare, ToggleLeft, ToggleRight,
  Database, Server, Ban, CheckSquare, Download, Play, HelpCircle, Loader2
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Suspense } from 'react';

// Mock initial tenants data
const initialTenants = [
  { id: '1', name: 'Greenwood Academy', slug: 'greenwood', plan: 'Professional', status: 'active', students: 342, teachers: 28, users: 412, storage: '12 GB', expiry: '2027-06-20', dbSchema: 'sch_greenwood' },
  { id: '2', name: 'Sunrise International', slug: 'sunrise', plan: 'Enterprise', status: 'active', students: 1205, teachers: 89, users: 1540, storage: '48 GB', expiry: '2028-02-15', dbSchema: 'sch_sunrise' },
  { id: '3', name: 'Heritage Prep', slug: 'heritage-prep', plan: 'Starter', status: 'trial', students: 67, teachers: 8, users: 85, storage: '1.8 GB', expiry: '2026-08-15', dbSchema: 'sch_heritage' },
  { id: '4', name: 'Oakwood Learning Center', slug: 'oakwood', plan: 'Professional', status: 'past_due', students: 189, teachers: 15, users: 220, storage: '8 GB', expiry: '2026-07-28', dbSchema: 'sch_oakwood' },
  { id: '5', name: 'Maple Ridge School', slug: 'maple-ridge', plan: 'Starter', status: 'active', students: 98, teachers: 9, users: 110, storage: '2.5 GB', expiry: '2027-01-10', dbSchema: 'sch_maple' },
  { id: '6', name: 'Riverdale Academy', slug: 'riverdale', plan: 'Professional', status: 'suspended', students: 410, teachers: 32, users: 512, storage: '15 GB', expiry: '2026-05-28', dbSchema: 'sch_riverdale' }
];

// Mock support tickets
const initialTickets = [
  { id: 't-101', school: 'Greenwood Academy', title: 'Payment integration failing at checkout', status: 'critical', time: '10 mins ago', category: 'billing' },
  { id: 't-102', school: 'Heritage Prep', title: 'Staff import fails CSV header verification', status: 'open', time: '2 hours ago', category: 'onboarding' },
  { id: 't-103', school: 'Sunrise International', title: 'SSO configuration mapping validation failed', status: 'critical', time: '4 hours ago', category: 'security' },
  { id: 't-104', school: 'Maple Ridge School', title: 'LMS quiz results report exports slow down', status: 'resolved', time: '1 day ago', category: 'performance' }
];

function SuperAdminControlCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Dynamic console active selection
  const consoleParam = searchParams.get('console') || 'executive';
  
  const [tenants, setTenants] = useState(initialTenants);
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  
  // Interactive action logs
  const [notif, setNotif] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  
  // Form controls
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolPlan, setNewSchoolPlan] = useState('Starter');
  const [newSchoolSlug, setNewSchoolSlug] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Broadcast announcement
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastChannel, setBroadcastChannel] = useState('email');
  const [broadcastMessage, setBroadcastMessage] = useState('Scheduled system maintenance notice...');

  // Support reply state
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('Checking the logs. Will get back with a fix soon.');

  // Global feature flags
  const [featureFlags, setFeatureFlags] = useState({
    library: true,
    hostel: true,
    transport: true,
    aiAssistant: true,
    payroll: false,
    inventory: true,
    finance: true,
    lms: true
  });

  // Security Policy
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Trigger Notification Helper
  const triggerNotification = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 4000);
  };

  // Onboard new school database provisioning workflow simulator
  const handleOnboardSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolSlug) return;
    
    setWorking(true);
    triggerNotification(`Initializing database provisioning pipeline for ${newSchoolName}...`);
    
    setTimeout(() => {
      // Step 2: Provision db schema
      triggerNotification(`Database Schema [sch_${newSchoolSlug}] created successfully. Applying academic templates...`);
      
      setTimeout(() => {
        // Step 3: Register Tenant metadata
        const newSchool = {
          id: String(tenants.length + 1),
          name: newSchoolName,
          slug: newSchoolSlug.toLowerCase().replace(/\s+/g, '-'),
          plan: newSchoolPlan,
          status: 'trial' as const,
          students: 0,
          teachers: 0,
          users: 1,
          storage: '0.1 GB',
          expiry: '2026-09-08',
          dbSchema: `sch_${newSchoolSlug.toLowerCase()}`
        };
        setTenants(prev => [...prev, newSchool]);
        setWorking(false);
        setShowAddModal(false);
        setNewSchoolName('');
        setNewSchoolSlug('');
        triggerNotification(`New school "${newSchoolName}" is fully provisioned and ready! Admin credentials generated.`);
      }, 1500);
    }, 1500);
  };

  // Suspends, Reactivate, deletes schools
  const handleTenantAction = (id: string, action: 'suspend' | 'reactivate' | 'archive' | 'impersonate') => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        if (action === 'suspend') return { ...t, status: 'suspended' };
        if (action === 'reactivate') return { ...t, status: 'active' };
      }
      return t;
    }));
    
    if (action === 'impersonate') {
      triggerNotification(`Accessing secure administrative session. Logging impersonation action to Platform Audit log...`);
      setTimeout(() => {
        router.push(`/${tenants.find(t => t.id === id)?.slug}/dashboard`);
      }, 1200);
    } else {
      triggerNotification(`Tenant ID ${id} set to status: ${action === 'suspend' ? 'SUSPENDED' : 'ACTIVE'}.`);
    }
  };

  // Backups triggering
  const handleBackupTrigger = () => {
    setWorking(true);
    triggerNotification('Dispatching backup script to AWS S3 & GCP cold storage nodes...');
    setTimeout(() => {
      setWorking(false);
      triggerNotification('Daily backup completed successfully! SNAPSHOT-20260708.sql created.');
    }, 2000);
  };

  // Support Reply Action
  const handleResolveTicket = (id: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) return { ...t, status: 'resolved' };
      return t;
    }));
    setActiveTicketId(null);
    triggerNotification(`Support reply sent and ticket #${id} status updated to RESOLVED.`);
  };

  return (
    <div className="space-y-6 max-w-[1400px] animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-2">
            <Shield className="w-7 h-7 text-[hsl(var(--accent))]" />
            Super Admin Control Center
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            Cross-tenant system manager, DB provisioning automation, billing schedules, and AI analytics dashboards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shadow-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All 56 Node clusters active
          </span>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {notif}
        </div>
      )}

      {/* Dynamic Selector toolbar for Consoles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl p-2.5">
        {[
          { key: 'executive', label: 'Executive Intelligence', desc: 'KPIs, AI forecasts', icon: Brain },
          { key: 'business_tenants', label: 'Business Ops', desc: 'Tenants & Billing', icon: DollarSign },
          { key: 'platform_health', label: 'Platform Ops', desc: 'System monitor, Backups', icon: Cpu },
          { key: 'customer_users', label: 'Customer Admin', desc: 'HelpDesk, Feature Flags', icon: Megaphone }
        ].map(cons => {
          const isActive = consoleParam.startsWith(cons.key.split('_')[0]);
          return (
            <button
              key={cons.key}
              onClick={() => router.push(`/super-admin?console=${cons.key}`)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                isActive
                  ? 'bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white border-transparent shadow-lg shadow-[hsl(var(--accent)/0.12)]'
                  : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              <cons.icon className="w-5 h-5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-xs truncate">{cons.label}</p>
                <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-white/80' : 'text-[hsl(var(--text-tertiary))]'}`}>{cons.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* CONSOLE DISPLAY CONDITIONAL SWITCH */}

      {/* 1. EXECUTIVE INTELLIGENCE CONSOLE */}
      {consoleParam.startsWith('executive') || consoleParam === 'ai' ? (
        <div className="space-y-8">
          {/* Platform status grid KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Platform Total Tenants', val: '56 Schools', desc: '48 Active • 8 Trial/Suspended', icon: School },
              { title: 'Daily Active Users (DAU)', val: '12,847 Users', desc: '4,120 logged in today', icon: Users },
              { title: 'Platform MRR / ARR', val: '$18,400 / $220.8k', desc: '98% Payment success rate', icon: DollarSign },
              { title: 'Cluster CPU Usage', val: '24.1% Average', desc: 'Memory: 41% • DB Nodes OK', icon: Cpu }
            ].map(kpi => (
              <div key={kpi.title} className="glass-card p-5 border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{kpi.title}</span>
                  <div className="p-2 rounded-lg bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
                    <kpi.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{kpi.val}</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{kpi.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* System growth and analytics projections SVG */}
            <div className="xl:col-span-2 glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">SaaS Revenue Growth Trend</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Platform MRR growth curves and customer acquisitions monthly.</p>
              </div>
              <div className="h-60 w-full relative pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="50" x2="500" y2="50" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <path d="M 0 180 Q 125 140 250 90 T 500 40 L 500 200 L 0 200 Z" fill="url(#mrrGrad)" />
                  <path d="M 0 180 Q 125 140 250 90 T 500 40" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" />
                  <circle cx="250" cy="90" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                  <circle cx="500" cy="40" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-[hsl(var(--text-tertiary))] pt-1">
                  <span>Q1</span>
                  <span>Q2</span>
                  <span>Q3 (Current)</span>
                  <span>Target Forecast</span>
                </div>
              </div>
            </div>

            {/* AI Platform Insights panel */}
            <div className="glass-card p-6 border border-indigo-500/20 bg-indigo-500/5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-indigo-400">AI Platform Insights</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-950/20 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-indigo-300">Customer Churn Warning Alert</p>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
                    <strong>Riverdale Academy</strong> has shown a 45% decline in login trends over the last 30 days. Recommend outreach.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-950/20 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-indigo-300">Infrastructure Scaler Suggestion</p>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
                    Database traffic spikes expected at Q3 final exams. Suggest spin up of 2 backup replication nodes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-950/20 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-indigo-300">Pricing Optimization Optimizer</p>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
                    8 trials expiring next week. Auto-dispatch 10% coupon promo to increase conversions.
                  </p>
                  <button onClick={() => triggerNotification('Coupons promo sent to trial candidates!')} className="mt-2 py-1 px-3 bg-indigo-600 text-white rounded font-bold text-[10px] hover:opacity-90">
                    Apply Suggestion
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : null}

      {/* 2. BUSINESS OPERATIONS CONSOLE */}
      {consoleParam.startsWith('business') ? (
        <div className="space-y-8">
          
          {/* Tenant registries listing */}
          <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Registered Tenants &amp; Organizations</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Complete database schemas, expiry details, and owner permissions.</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" /> Provision New School
              </button>
            </div>

            {/* Tenants list table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    {['Tenant School', 'Subscription Plan', 'Usage / Storage', 'Expiry Date', 'Status', ''].map(h => (
                      <th key={h} className="text-left font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
                            {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-[hsl(var(--text-primary))]">{t.name}</p>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">DB Schema: {t.dbSchema}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-[hsl(var(--text-primary))]">{t.plan}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[hsl(var(--text-secondary))]">{t.users} users logged</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{t.storage} quota used</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-[hsl(var(--text-secondary))]">{t.expiry}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          t.status === 'trial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleTenantAction(t.id, 'impersonate')} className="p-1.5 hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] rounded border border-[hsl(var(--border))]" title="Impersonate School Admin">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {t.status === 'active' ? (
                            <button onClick={() => handleTenantAction(t.id, 'suspend')} className="p-1.5 hover:bg-[hsl(var(--bg-tertiary))] text-rose-400 rounded border border-[hsl(var(--border))]" title="Suspend Tenant">
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => handleTenantAction(t.id, 'reactivate')} className="p-1.5 hover:bg-[hsl(var(--bg-tertiary))] text-emerald-400 rounded border border-[hsl(var(--border))]" title="Reactivate Tenant">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing plan limits editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[hsl(var(--accent))]" /> Subscription Tier Configurator
              </h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Edit platform plans storage quotas and fee schedules globally.</p>
              
              <div className="space-y-3 text-xs">
                {[
                  { plan: 'Starter tier package', users: '100 max users', storage: '5 GB max quota' },
                  { plan: 'Professional tier package', users: '1000 max users', storage: '25 GB max quota' },
                  { plan: 'Enterprise tier package', users: 'Unlimited users', storage: '100 GB max quota' }
                ].map(p => (
                  <div key={p.plan} className="p-3 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[hsl(var(--text-primary))]">{p.plan}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{p.users} &bull; {p.storage}</p>
                    </div>
                    <button onClick={() => triggerNotification(`Configuration saved for ${p.plan}`)} className="px-3 py-1 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded font-bold">
                      Edit Limits
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Promo Code &amp; Coupons manager</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Set early discount schedules for school organizations groups.</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <input type="text" placeholder="Promo code (e.g. BACKTOSCHOOL)" className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-primary))]" />
                <button onClick={() => triggerNotification('New coupon code BACKTOSCHOOL created successfully!')} className="py-2.5 bg-[hsl(var(--accent))] text-white rounded-lg font-bold">
                  Generate Coupon
                </button>
              </div>
            </div>
          </div>

        </div>
      ) : null}

      {/* 3. PLATFORM OPERATIONS CONSOLE */}
      {consoleParam.startsWith('platform') ? (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Real-time server diagnostics dials */}
            <div className="lg:col-span-2 glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Real-Time Platform Infrastructure Load</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">System diagnostic outputs for virtual CPU threads, DB replications, and cache loads.</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))]">
                  <Cpu className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">V-CPU Load</p>
                  <p className="text-xl font-extrabold text-[hsl(var(--text-primary))]">24.1%</p>
                </div>
                <div className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))]">
                  <Database className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">DB Schema pool</p>
                  <p className="text-xl font-extrabold text-[hsl(var(--text-primary))]">12%</p>
                </div>
                <div className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))]">
                  <Server className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Memory Quota</p>
                  <p className="text-xl font-extrabold text-[hsl(var(--text-primary))]">41%</p>
                </div>
              </div>

              {/* Dynamic trigger backup script */}
              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div>
                  <p className="font-bold text-[hsl(var(--text-primary))]">Disaster Recovery &amp; S3 Snapshots</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Generate platform-wide schema snapshot files immediately.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleBackupTrigger} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:opacity-90">
                    Backup Snapshot now
                  </button>
                </div>
              </div>
            </div>

            {/* Compliance, SSO, and MFA configurations panel */}
            <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[hsl(var(--accent))]" /> Global Security Policy
              </h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Enforce access parameters globally for all multi-tenant users.</p>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">Enforce Multi-Factor (MFA)</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Requires mobile app verification code</p>
                  </div>
                  <button onClick={() => setMfaEnforced(!mfaEnforced)} className="text-[hsl(var(--accent))]">
                    {mfaEnforced ? <ToggleRight className="w-8 h-8 text-[hsl(var(--accent))]" /> : <ToggleLeft className="w-8 h-8 text-[hsl(var(--text-tertiary))]" />}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))]">Max Session Idle Timeout (Minutes)</label>
                  <select
                    value={sessionTimeout}
                    onChange={e => {
                      setSessionTimeout(e.target.value);
                      triggerNotification(`Global session timeout changed to ${e.target.value} minutes.`);
                    }}
                    className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-[hsl(var(--text-primary))]"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-rose-500/10 space-y-1 text-[11px] leading-relaxed">
                  <p className="font-bold text-rose-400 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Block suspicious access attempts</p>
                  <p className="text-[hsl(var(--text-secondary))]">14 failed logins detected from outside authorized campus IPs. Automatic brute force blocks deployed.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : null}

      {/* 4. CUSTOMER ADMINISTRATION CONSOLE */}
      {consoleParam.startsWith('customer') ? (
        <div className="space-y-8 animate-fade-in text-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Helpdesk ticket support records desk */}
            <div className="lg:col-span-2 glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Direct Customer Support Desk</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Answer system requests from school coordinators.</p>
              
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === 'critical' ? 'bg-rose-500/10 text-rose-400' :
                          ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                        <span className="font-bold text-[hsl(var(--text-primary))]">#{ticket.id} &bull; {ticket.school}</span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1">{ticket.title}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{ticket.time}</p>
                    </div>
                    {ticket.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          setActiveTicketId(ticket.id);
                          setTicketReplyText(`Investigating details for ticket #${ticket.id}. Action update dispatched shortly.`);
                        }}
                        className="px-3.5 py-1.5 bg-[hsl(var(--accent))] text-white font-bold rounded-lg"
                      >
                        Reply &amp; Close
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Global Feature Flags toggle desk */}
            <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Modular Feature Flags Control</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Enable or disable SaaS modules globally across all campuses.</p>
              
              <div className="space-y-3.5">
                {[
                  { key: 'library', label: 'Library & Resource Desk' },
                  { key: 'hostel', label: 'Hostel Boarding Manager' },
                  { key: 'transport', label: 'Bus Transit Route Logs' },
                  { key: 'aiAssistant', label: 'AI Study/Parent Assistants' }
                ].map(flag => {
                  const val = featureFlags[flag.key as keyof typeof featureFlags];
                  return (
                    <div key={flag.key} className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[hsl(var(--text-primary))]">{flag.label}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Toggle SaaS endpoint capability</p>
                      </div>
                      <button
                        onClick={() => {
                          setFeatureFlags(prev => ({ ...prev, [flag.key]: !val }));
                          triggerNotification(`Feature Flag "${flag.label}" toggled to ${!val ? 'ENABLED' : 'DISABLED'}.`);
                        }}
                      >
                        {val ? <ToggleRight className="w-8 h-8 text-[hsl(var(--accent))]" /> : <ToggleLeft className="w-8 h-8 text-[hsl(var(--text-tertiary))]" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Announcements Broadcasting tool */}
          <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-4 bg-[hsl(var(--bg-tertiary)/0.2)]">
            <div>
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Global Communications Broadcast System</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Send alerts, update schedules, or emergency notices to all registered schools, staff, or families.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))]">Select Target Scope</label>
                <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-secondary))]">
                  <option value="all">All Registered Tenants</option>
                  <option value="active">Active Schools Only</option>
                  <option value="trials">Trial Schools Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))]">Select Transmission Channel</label>
                <select value={broadcastChannel} onChange={e => setBroadcastChannel(e.target.value)} className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-secondary))]">
                  <option value="email">Email SMTP Broadcast</option>
                  <option value="sms">SMS Text Alert Gateway</option>
                  <option value="push">In-App Push Message</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))]">Announcement Content</label>
                <input
                  type="text"
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-primary))]"
                />
              </div>
            </div>

            <button
              onClick={() => {
                triggerNotification(`Broadcast dispatched successfully to ${broadcastTarget} scope via ${broadcastChannel.toUpperCase()}!`);
                setBroadcastMessage('');
              }}
              className="px-5 py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white font-bold hover:opacity-90 transition-all flex items-center gap-1.5 w-fit"
            >
              <Send className="w-4 h-4" /> Dispatch System Announcement
            </button>
          </div>

        </div>
      ) : null}

      {/* TICKET REPLY DIALOG MODAL SIMULATOR */}
      {activeTicketId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveTicketId(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
              <MessageSquare className="w-5 h-5 text-[hsl(var(--accent))]" /> Send HelpDesk Reply
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">Send ticket resolution status answer for ticket #{activeTicketId}.</p>
            <textarea
              value={ticketReplyText}
              onChange={e => setTicketReplyText(e.target.value)}
              className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 h-28 text-[hsl(var(--text-primary))]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveTicketId(null)} className="px-4 py-2 border border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))] font-semibold">Cancel</button>
              <button onClick={() => handleResolveTicket(activeTicketId)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:opacity-90">Send &amp; Resolve Ticket</button>
            </div>
          </div>
        </>
      )}

      {/* PROVISIONING NEW SCHOOL MODAL SIMULATOR */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)} />
          <form onSubmit={handleOnboardSchool} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
              <Database className="w-5 h-5 text-[hsl(var(--accent))]" /> Auto-Provision Tenant Database
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">Trigger SaaS onboarding process. Installs schemas, sets default roles, configurations, and brand setups.</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))] mb-1">School Legal Name</label>
                <input
                  type="text"
                  required
                  value={newSchoolName}
                  onChange={e => {
                    setNewSchoolName(e.target.value);
                    setNewSchoolSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                  }}
                  placeholder="e.g. St. Gregory College"
                  className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-[hsl(var(--text-primary))]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))] mb-1">Subdomain Slug</label>
                <div className="flex">
                  <input
                    type="text"
                    required
                    value={newSchoolSlug}
                    onChange={e => setNewSchoolSlug(e.target.value)}
                    className="flex-1 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-l-xl p-2.5 text-[hsl(var(--text-primary))] font-mono"
                  />
                  <span className="bg-[hsl(var(--bg-tertiary))] border-y border-r border-[hsl(var(--border))] p-2.5 rounded-r-xl text-[hsl(var(--text-tertiary))]">.schoolsaas.com</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))] mb-1">Subscription plan level</label>
                <select
                  value={newSchoolPlan}
                  onChange={e => setNewSchoolPlan(e.target.value)}
                  className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-[hsl(var(--text-primary))]"
                >
                  <option value="Starter">Starter tier</option>
                  <option value="Professional">Professional tier</option>
                  <option value="Enterprise">Enterprise tier</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))] font-semibold">Cancel</button>
              <button type="submit" disabled={working} className="px-5 py-2 bg-[hsl(var(--accent))] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50">
                {working ? 'Provisioning...' : 'Provision Schema & Onboard'}
              </button>
            </div>
          </form>
        </>
      )}

    </div>
  );
}

export default function SuperAdminControlCenter() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[hsl(var(--accent))] animate-spin mx-auto" />
          <p className="text-sm text-[hsl(var(--text-secondary))] animate-pulse">Loading SaaS Control Center...</p>
        </div>
      </div>
    }>
      <SuperAdminControlCenterContent />
    </Suspense>
  );
}
