'use client';

import { useState } from 'react';
import { StatCard } from '@/components/super-admin/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  School, CreditCard, DollarSign, Users, ArrowRight, Plus, Megaphone,
  TrendingUp, Clock, ShieldAlert, Cpu, Database, HardDrive, LayoutGrid,
  Activity, Layers, Heart, MessageSquare, AlertTriangle, Key, Terminal,
  RefreshCw, CheckCircle, HelpCircle, FileText, CheckCircle2, Play, ToggleLeft, ToggleRight,
  UserCheck, Shield, BookOpen, UserX, BarChart3, Settings, ShieldCheck, Download, Trash2, Search, ArrowUpRight, Brain, Sparkles
} from 'lucide-react';
import Link from 'next/link';

type ConsoleType = 'executive' | 'business' | 'platform' | 'customer';

type PlatformRole =
  | 'owner'
  | 'super_admin'
  | 'operations'
  | 'customer_success'
  | 'finance'
  | 'support'
  | 'security'
  | 'infra'
  | 'compliance'
  | 'ai_ops';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: 'active' | 'trial' | 'suspended' | 'past_due';
  students: number;
  created_at: string;
  domain: string;
  mrr: number;
  features: string[];
}

const initialTenants: Tenant[] = [
  { id: 't1', name: 'Greenwood Academy', slug: 'greenwood', plan: 'Professional', status: 'active', students: 342, created_at: '2026-06-20', domain: 'greenwood.schoolsaas.com', mrr: 299, features: ['Library', 'Transport', 'Parent Portal', 'AI Assistant'] },
  { id: 't2', name: 'Sunrise International School', slug: 'sunrise', plan: 'Enterprise', status: 'active', students: 1205, created_at: '2026-06-18', domain: 'sunrise.schoolsaas.com', mrr: 899, features: ['Library', 'Hostel', 'Transport', 'Parent Portal', 'AI Assistant', 'Payroll', 'Finance'] },
  { id: 't3', name: 'Heritage Prep', slug: 'heritage-prep', plan: 'Basic', status: 'trial', students: 67, created_at: '2026-06-15', domain: 'heritage.schoolsaas.com', mrr: 0, features: ['Parent Portal'] },
  { id: 't4', name: 'Oakwood Learning Center', slug: 'oakwood', plan: 'Professional', status: 'past_due', students: 189, created_at: '2026-06-12', domain: 'oakwood.schoolsaas.com', mrr: 299, features: ['Library', 'Parent Portal'] },
  { id: 't5', name: 'Maple Ridge School', slug: 'maple-ridge', plan: 'Basic', status: 'active', students: 98, created_at: '2026-06-10', domain: 'mapleridge.schoolsaas.com', mrr: 99, features: ['Transport', 'Parent Portal'] }
];

export default function SuperAdminDashboard() {
  const [activeConsole, setActiveConsole] = useState<ConsoleType>('executive');
  const [activeRole, setActiveRole] = useState<PlatformRole>('owner');
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);

  // Form states for provisioning
  const [newSchoolName, setNewSchoolName] = useState('St. Jude Collegiate');
  const [newSchoolSlug, setNewSchoolSlug] = useState('st-jude');
  const [newSchoolPlan, setNewSchoolPlan] = useState('Professional');
  const [provisionProgress, setProvisionProgress] = useState<string[]>([]);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Broadcast settings
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastSubject, setBroadcastSubject] = useState('Platform Scheduled Maintenance (v2.4.0)');
  const [broadcastBody, setBroadcastBody] = useState('Dear administrators, SchoolSaas will undergo a 15-minute maintenance window on Sunday at 02:00 AM UTC.');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // AI predictions state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Security policy states
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Action feedback alert
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  const displayNotif = (msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => setNotifMessage(null), 4000);
  };

  // Roles verification matrix
  const isConsoleLocked = (console: ConsoleType): boolean => {
    if (activeRole === 'owner' || activeRole === 'super_admin') return false;
    
    if (activeRole === 'operations') {
      return ['executive', 'business'].includes(console);
    }
    if (activeRole === 'customer_success') {
      return ['platform', 'business'].includes(console);
    }
    if (activeRole === 'finance') {
      return ['platform', 'customer'].includes(console);
    }
    if (activeRole === 'support') {
      return ['platform', 'business'].includes(console);
    }
    if (activeRole === 'security') {
      return ['executive', 'business', 'customer'].includes(console);
    }
    if (activeRole === 'infra') {
      return ['executive', 'business', 'customer'].includes(console);
    }
    if (activeRole === 'compliance') {
      return ['executive', 'business', 'customer'].includes(console);
    }
    if (activeRole === 'ai_ops') {
      return !['executive'].includes(console);
    }
    return false;
  };

  // Run school provisioning simulation
  const handleProvisionSchool = () => {
    setIsProvisioning(true);
    setProvisionProgress([]);
    const steps = [
      'Authenticating merchant payment confirmation...',
      'Provisioning schema database node db_shard_stjude...',
      'Setting default security groups and administrative roles...',
      'Applying custom brand templates (st-jude.schoolsaas.com)...',
      'Initialization successful! Tenant online.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setProvisionProgress(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsProvisioning(false);
          const newTenant: Tenant = {
            id: `t_${Date.now()}`,
            name: newSchoolName,
            slug: newSchoolSlug,
            plan: newSchoolPlan,
            status: 'active',
            students: 120,
            created_at: new Date().toISOString().split('T')[0],
            domain: `${newSchoolSlug}.schoolsaas.com`,
            mrr: newSchoolPlan === 'Enterprise' ? 899 : newSchoolPlan === 'Professional' ? 299 : 99,
            features: ['Parent Portal', 'Library']
          };
          setTenants(prev => [newTenant, ...prev]);
          displayNotif(`Successfully onboarded ${newSchoolName}!`);
        }
      }, (idx + 1) * 900);
    });
  };

  // Global feature flags toggle simulator
  const toggleFeatureForTenant = (tenantId: string, feature: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const hasFeature = t.features.includes(feature);
        const updatedFeatures = hasFeature
          ? t.features.filter(f => f !== feature)
          : [...t.features, feature];
        return { ...t, features: updatedFeatures };
      }
      return t;
    }));
    displayNotif(`Toggled feature "${feature}" for tenant.`);
  };

  // Run AI Predictive Analysis
  const handlePredictiveRun = () => {
    setIsAnalyzing(true);
    setAiReport(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiReport(
        "🧠 AI System Forecast Report:\n\n" +
        "1. Churn Risk Warning: Oakwood Learning Center has shown past-due invoices for 18 days. High churn probability predicted (84%).\n" +
        "2. Infrastructure Scaling Advice: CPU utilization spikes logged consistently on Sunrise sharding server. Recommend auto-scale up to 16 vCPU.\n" +
        "3. Pricing Optimization: Standard tier conversion holds a +14% lift margin. Recommend offering a limited coupon code to trial targets."
      );
    }, 1200);
  };

  const handleBroadcastSubmit = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      displayNotif(`Broadcast successfully dispatched to target group "${broadcastTarget}"!`);
      setBroadcastSubject('');
      setBroadcastBody('');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[hsl(var(--accent))]" />
            SaaS Platform Control Center
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Global management portal for multi-tenant database partitioning, billing streams, and resource monitoring.
          </p>
        </div>

        {/* Global Action Notifications */}
        {notifMessage && (
          <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4" /> {notifMessage}
          </div>
        )}
      </div>

      {/* Role Simulation Control Toolbar */}
      <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] space-y-3">
        <div>
          <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Configure Active Platform Administrator Role</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5">Test restricted views matching granular platform administration roles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'owner', label: 'Platform Owner' },
            { id: 'super_admin', label: 'Super Admin' },
            { id: 'operations', label: 'Operations Manager' },
            { id: 'customer_success', label: 'Customer Success' },
            { id: 'finance', label: 'Finance Admin' },
            { id: 'support', label: 'Support Admin' },
            { id: 'security', label: 'Security Admin' },
            { id: 'infra', label: 'Infrastructure Admin' },
            { id: 'compliance', label: 'Compliance Officer' },
            { id: 'ai_ops', label: 'AI Operations Manager' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRole(r.id as PlatformRole);
                displayNotif(`Switched platform role to ${r.label}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeRole === r.id
                  ? 'bg-[hsl(var(--accent)/0.12)] border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                  : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              {activeRole === r.id ? '✓ ' : ''} {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* The 4 Major SaaS Consoles Selector */}
      <div className="flex flex-wrap gap-3 pb-2 border-b border-[hsl(var(--border))]">
        {[
          { id: 'executive', label: 'Executive Intelligence', icon: BarChart3, desc: 'Uptime, KPIs, revenue and AI forecasting insights.' },
          { id: 'business', label: 'Business Operations', icon: DollarSign, desc: 'Tenants subscription pricing levels, invoicing logs.' },
          { id: 'platform', label: 'Platform Operations', icon: Activity, desc: 'Realtime CPU monitoring, SSO keys & MFA policy limits.' },
          { id: 'customer', label: 'Customer Administration', icon: Layers, desc: 'Database provisioning automation, custom feature flags.' }
        ].map(item => {
          const locked = isConsoleLocked(item.id as ConsoleType);
          return (
            <button
              key={item.id}
              onClick={() => setActiveConsole(item.id as ConsoleType)}
              className={`flex-1 min-w-[200px] text-left p-4 rounded-xl border transition-all ${
                activeConsole === item.id
                  ? 'bg-[hsl(var(--accent)/0.12)] border-[hsl(var(--accent))] text-[hsl(var(--text-primary))] shadow-glow'
                  : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <item.icon className="w-5 h-5 text-[hsl(var(--accent))]" />
                {locked && <Lock className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <p className="text-xs font-bold">{item.label}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 line-clamp-1">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main console content window */}
      <div className="pb-16">
        
        {/* Lock Screen if Role is Unauthorized */}
        {isConsoleLocked(activeConsole) ? (
          <div className="glass-card p-12 border border-rose-500/20 bg-rose-500/5 rounded-2xl text-center space-y-4 max-w-md mx-auto animate-fade-in">
            <Lock className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Console Access Restriced</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Your active platform role (<strong className="text-rose-400 font-bold uppercase">{activeRole.replace('_', ' ')}</strong>) 
              is restricted from accessing the {activeConsole.toUpperCase()} console records.
            </p>
          </div>
        ) : (
          <>
            
            {/* CONSOLE 1: EXECUTIVE INTELLIGENCE */}
            {activeConsole === 'executive' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Platform & Financial KPI grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-4 border border-[hsl(var(--border))] rounded-xl">
                    <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Platform Tenants</span>
                    <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{tenants.length} Schools</p>
                    <p className="text-[9px] text-[hsl(var(--text-secondary))] mt-1">4 Active &bull; 1 Trial &bull; 0 Suspended</p>
                  </div>

                  <div className="glass-card p-4 border border-[hsl(var(--border))] rounded-xl">
                    <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Monthly Recurring Revenue</span>
                    <p className="text-2xl font-black text-[hsl(var(--text-primary))]">
                      ₦{(tenants.reduce((acc, t) => acc + t.mrr, 0) * 1000).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-[hsl(var(--text-secondary))] mt-1">ARR: ₦{(tenants.reduce((acc, t) => acc + t.mrr, 0) * 12 * 1000).toLocaleString()}</p>
                  </div>

                  <div className="glass-card p-4 border border-[hsl(var(--border))] rounded-xl">
                    <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Total Users Managed</span>
                    <p className="text-2xl font-black text-[hsl(var(--text-primary))]">12,847</p>
                    <p className="text-[9px] text-[hsl(var(--text-secondary))] mt-1">3,412 Active Sessions Today</p>
                  </div>

                  <div className="glass-card p-4 border border-[hsl(var(--border))] rounded-xl">
                    <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Platform Open Tickets</span>
                    <p className="text-2xl font-black text-[hsl(var(--text-primary))]">8 Support</p>
                    <p className="text-[9px] text-[hsl(var(--text-secondary))] mt-1">Avg response time: 24 mins</p>
                  </div>
                </div>

                {/* Infrastructure Performance Indicators & Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Visual Infrastructure usages */}
                  <div className="lg:col-span-2 glass-card p-5 border border-[hsl(var(--border))] space-y-6 rounded-xl">
                    <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Infrastructure Usage Indicators</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'API Requests Count', val: '8.4M', fill: '84%', desc: 'Capacity load 42%' },
                        { label: 'Database Load/Storage', val: '128 GB', fill: '64%', desc: '6.4M queries / min' },
                        { label: 'Cache Performance Hits', val: '97.2%', fill: '97%', desc: 'Redis in-memory store' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--bg-secondary))] space-y-2">
                          <span className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase block">{item.label}</span>
                          <p className="text-xl font-bold text-[hsl(var(--text-primary))]">{item.val}</p>
                          <div className="h-1.5 w-full bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                            <div className="h-full bg-[hsl(var(--accent))] rounded-full" style={{ width: item.fill }} />
                          </div>
                          <p className="text-[8px] text-[hsl(var(--text-tertiary))]">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* SVG Resource Load Line Chart */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Daily Active Session Trends (Monthly)</p>
                      <div className="h-40 relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="saasSessionGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0 120 Q 125 100 250 70 T 500 30 L 500 150 L 0 150 Z" fill="url(#saasSessionGrad)" />
                          <path d="M 0 120 Q 125 100 250 70 T 500 30" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" />
                        </svg>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-[hsl(var(--text-tertiary))] pt-1">
                          <span>Week 1</span>
                          <span>Week 2</span>
                          <span>Week 3</span>
                          <span>Active Week 4</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Predictions Advisor */}
                  <div className="glass-card p-5 border border-indigo-500/20 bg-indigo-500/5 space-y-4 rounded-xl">
                    <p className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <Brain className="w-4 h-4" /> AI Operations Copilot
                    </p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] leading-relaxed">
                      Analyze metrics across all tenant sharding databases to forecast school churn risk and suggest auto-scaling limits.
                    </p>
                    <button
                      onClick={handlePredictiveRun}
                      disabled={isAnalyzing}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compiling Platform Metrics...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Run Churn &amp; Scaling Predictor
                        </>
                      )}
                    </button>
                    {aiReport && (
                      <div className="p-3 border border-indigo-500/15 bg-indigo-950/40 text-[9px] leading-relaxed text-indigo-300 font-mono rounded-lg whitespace-pre-line animate-fade-in">
                        {aiReport}
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic metrics aggregator */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl">
                  <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[hsl(var(--accent))]" /> Global Academic Aggregations
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Total Students Managed</p>
                      <p className="font-semibold text-[hsl(var(--text-primary))]">12,847 kids</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Teaching Staff Members</p>
                      <p className="font-semibold text-[hsl(var(--text-primary))]">648 educators</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Attendance Completion Rate</p>
                      <p className="font-semibold text-[hsl(var(--text-primary))]">96.8% Average</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Terminal Exam Success Margin</p>
                      <p className="font-semibold text-[hsl(var(--text-primary))]">84.2% Passed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONSOLE 2: BUSINESS OPERATIONS */}
            {activeConsole === 'business' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Billing ledger */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl">
                  <div>
                    <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">SaaS Tenants Subscriptions Ledger</h3>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Review outstanding invoices and manage refund logs.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))]">
                          <th className="py-2.5 px-3">School Name</th>
                          <th className="py-2.5 px-3">Domain Reference</th>
                          <th className="py-2.5 px-3">Plan Class</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Monthly Charge</th>
                          <th className="py-2.5 px-3 text-right">Invoice / Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenants.map(t => (
                          <tr key={t.id} className="border-b border-[hsl(var(--border)/0.5)]">
                            <td className="py-3 px-3 font-semibold text-[hsl(var(--text-primary))]">{t.name}</td>
                            <td className="py-3 px-3 font-mono text-[hsl(var(--text-secondary))]">{t.domain}</td>
                            <td className="py-3 px-3">{t.plan}</td>
                            <td className="py-3 px-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold">₦{(t.mrr * 1000).toLocaleString()}</td>
                            <td className="py-3 px-3 text-right space-x-2">
                              <button onClick={() => displayNotif(`Refund request submitted for ${t.name}.`)} className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all text-rose-400 font-bold rounded">
                                Refund
                              </button>
                              <button onClick={() => displayNotif(`Downloading invoice log for ${t.name}`)} className="px-2 py-1 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded">
                                Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Simulated Coupons and Pricing discount creator */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.2)]">
                  <p className="font-bold text-[hsl(var(--text-primary))]">Discount Coupons Generator</p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <input type="text" placeholder="Coupon Code (e.g. SUMMER15)" className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-primary))]" />
                    <select className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-secondary))]">
                      <option>15% Discount</option>
                      <option>25% Discount</option>
                      <option>Free Trial Extension</option>
                    </select>
                    <input type="text" placeholder="Applicable Tenant Slug" className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-primary))]" />
                    <button onClick={() => displayNotif('Promotion coupon registered globally.')} className="px-4 py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white font-bold hover:opacity-90 transition-all">Create Coupon</button>
                  </div>
                </div>
              </div>
            )}

            {/* CONSOLE 3: PLATFORM OPERATIONS */}
            {activeConsole === 'platform' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Real-time Infrastructure Monitoring */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="lg:col-span-2 glass-card p-5 border border-[hsl(var(--border))] space-y-6 rounded-xl">
                    <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Real-Time Infrastructure Monitor</h3>
                    
                    <div className="space-y-4 text-xs">
                      {[
                        { label: 'Platform CPU Usage Core', status: 'Healthy', val: '42% load', color: 'bg-emerald-400' },
                        { label: 'DB Sharding Queue Processors', status: 'Idle', val: '0 pending tasks', color: 'bg-emerald-400' },
                        { label: 'Automatic Nightly Backup Logs', status: 'Succeeded', val: 'Completed 6 hours ago', color: 'bg-emerald-400' }
                      ].map((log, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                          <div>
                            <p className="font-bold text-[hsl(var(--text-primary))]">{log.label}</p>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{log.val}</p>
                          </div>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => displayNotif('Triggered snapshot database backup.')} className="px-4 py-2 bg-[hsl(var(--accent))] hover:opacity-90 text-white font-bold rounded-lg text-xs transition-all">
                        Run Manual Database Snapshot Backup
                      </button>
                      <button onClick={() => displayNotif('Cleared cache logs successfully.')} className="px-4 py-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--border))] rounded-lg text-xs font-bold transition-all">
                        Flush Cache Stores
                      </button>
                    </div>
                  </div>

                  {/* Security Center policy controls */}
                  <div className="glass-card p-5 border border-rose-500/20 bg-rose-500/5 space-y-4 rounded-xl text-xs">
                    <p className="font-bold text-rose-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Global MFA &amp; Security Policy
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[hsl(var(--text-primary))]">Enforce Multi-Factor (MFA)</p>
                          <p className="text-[9px] text-[hsl(var(--text-tertiary))]">Require MFA for all platform admins.</p>
                        </div>
                        <button onClick={() => setMfaEnforced(prev => !prev)} className="text-[hsl(var(--accent))]">
                          {mfaEnforced ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-[hsl(var(--text-tertiary))]" />}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Max Idle Session Timeout (Minutes)</label>
                        <select
                          value={sessionTimeout}
                          onChange={e => {
                            setSessionTimeout(e.target.value);
                            displayNotif(`Configured timeout policy: ${e.target.value} minutes.`);
                          }}
                          className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2 text-[hsl(var(--text-primary))]"
                        >
                          <option value="15">15 Minutes</option>
                          <option value="30">30 Minutes (Recommended)</option>
                          <option value="60">60 Minutes</option>
                        </select>
                      </div>

                      <div className="pt-2 border-t border-[hsl(var(--border))] space-y-1">
                        <p className="text-[10px] text-rose-400 font-bold uppercase">Blocked IPs Range</p>
                        <p className="font-mono text-[9px] text-[hsl(var(--text-tertiary))]">41.82.119.5 (Brute Force Blocked)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Logs Trail */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl text-xs">
                  <p className="font-bold text-[hsl(var(--text-primary))]">Platform Audit Logs (Immutable Log Trail)</p>
                  <div className="space-y-2.5 font-mono text-[10px]">
                    <div className="p-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded flex justify-between">
                      <span className="text-[hsl(var(--accent))]">SEC_MFA_UPDATE</span>
                      <span className="text-[hsl(var(--text-secondary))]">Admin configured MFA constraint globally</span>
                      <span className="text-[hsl(var(--text-tertiary))]">12 mins ago</span>
                    </div>
                    <div className="p-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded flex justify-between">
                      <span className="text-rose-400 font-bold">SYS_REFUND</span>
                      <span className="text-[hsl(var(--text-secondary))]">Issued partial credit balance to Sunrise Prep</span>
                      <span className="text-[hsl(var(--text-tertiary))]">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONSOLE 4: CUSTOMER ADMINISTRATION */}
            {activeConsole === 'customer' && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Onboarding provisioning automator */}
                  <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl text-xs">
                    <div>
                      <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Automated Tenant Provisioning</h3>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Spin up new isolated databases sharding models and configure branding.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">School Legal Name</label>
                        <input
                          type="text"
                          value={newSchoolName}
                          onChange={e => setNewSchoolName(e.target.value)}
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-primary))]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Subdomain Slug</label>
                          <input
                            type="text"
                            value={newSchoolSlug}
                            onChange={e => setNewSchoolSlug(e.target.value)}
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-primary))] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Select Tier Plan</label>
                          <select
                            value={newSchoolPlan}
                            onChange={e => setNewSchoolPlan(e.target.value)}
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-secondary))]"
                          >
                            <option>Basic</option>
                            <option>Professional</option>
                            <option>Enterprise</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleProvisionSchool}
                        disabled={isProvisioning}
                        className="w-full py-2.5 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5"
                      >
                        {isProvisioning ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Node Databases...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" /> Provision &amp; Onboard School Tenant
                          </>
                        )}
                      </button>

                      {provisionProgress.length > 0 && (
                        <div className="p-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg space-y-1.5">
                          <p className="text-[10px] font-bold uppercase text-[hsl(var(--text-tertiary))]">Provision Status Console Logs</p>
                          {provisionProgress.map((step, idx) => (
                            <p key={idx} className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                              ✓ {step}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feature flags manager */}
                  <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl text-xs">
                    <div>
                      <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Global Modules Feature Flags</h3>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Enable or disable SaaS modules dynamically per tenant base.</p>
                    </div>

                    <div className="space-y-4">
                      {tenants.slice(0, 3).map(tenant => (
                        <div key={tenant.id} className="p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-2">
                          <p className="font-bold text-[hsl(var(--text-primary))]">{tenant.name} ({tenant.plan})</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {['Library', 'Hostel', 'Transport', 'AI Assistant', 'Payroll', 'Finance'].map(feat => {
                              const active = tenant.features.includes(feat);
                              return (
                                <button
                                  key={feat}
                                  onClick={() => toggleFeatureForTenant(tenant.id, feat)}
                                  className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${
                                    active
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                      : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
                                  }`}
                                >
                                  {feat} {active ? 'On' : 'Off'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Broadcaster announcement board */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">SaaS Broadcast Emergency Announcer</h3>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Dispatch email notifications or push alerts directly to customer databases.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Target Group</label>
                      <select
                        value={broadcastTarget}
                        onChange={e => setBroadcastTarget(e.target.value)}
                        className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-secondary))]"
                      >
                        <option value="all">All School Admins</option>
                        <option value="teachers">All Teaching Staff</option>
                        <option value="parents">All Parents</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Subject Header</label>
                      <input
                        type="text"
                        value={broadcastSubject}
                        onChange={e => setBroadcastSubject(e.target.value)}
                        className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-primary))]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Announcements Body</label>
                    <textarea
                      value={broadcastBody}
                      onChange={e => setBroadcastBody(e.target.value)}
                      className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[hsl(var(--text-primary))] h-20"
                    />
                  </div>

                  <button
                    onClick={handleBroadcastSubmit}
                    disabled={isBroadcasting}
                    className="px-5 py-2.5 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    {isBroadcasting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Dispatching Broadcast...
                      </>
                    ) : (
                      <>
                        <Megaphone className="w-3.5 h-3.5" /> Dispatch Global Announcement
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
          </>
        )}

      </div>
    </div>
  );
}

// Simulated inline lock component
function Lock({ className }: { className?: string }) {
  return <ShieldAlert className={className} />;
}
