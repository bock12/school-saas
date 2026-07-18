'use client';

import { useState } from 'react';
import {
  CreditCard, Check, TrendingUp, AlertTriangle, Calendar,
  Download, Zap, ArrowUp, ArrowDown, Clock, Building2, Users, School
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  price_monthly?: number;
  price_yearly?: number;
  max_schools?: number;
  max_staff?: number;
  max_students?: number;
  features?: string[];
}

interface Usage {
  schools: number;
  maxSchools: number;
  staff: number;
  maxStaff: number;
  students: number;
  maxStudents: number;
}

interface BillingClientProps {
  orgId: string;
  currentPlan: Plan | null;
  allPlans: Plan[];
  usage: Usage;
  orgStatus: string;
  joinedAt: string;
}

const MOCK_INVOICES = [
  { id: 'INV-001', date: '2026-07-01', amount: 79, status: 'paid',   desc: 'Professional Plan — Monthly' },
  { id: 'INV-002', date: '2026-06-01', amount: 79, status: 'paid',   desc: 'Professional Plan — Monthly' },
  { id: 'INV-003', date: '2026-05-01', amount: 29, status: 'paid',   desc: 'Starter Plan — Monthly' },
  { id: 'INV-004', date: '2026-04-01', amount: 0,  status: 'trial',  desc: 'Trial Period' },
];

const PLAN_FEATURES: Record<string, string[]> = {
  Starter:         ['1 School', 'Up to 100 students', '5 staff accounts', 'Basic reports', 'Email support'],
  Standard:        ['3 Schools', 'Up to 500 students', '20 staff accounts', 'Advanced reports', 'Priority email support'],
  Professional:    ['10 Schools', 'Up to 2,000 students', '100 staff accounts', 'Full analytics', 'Priority support + SMS'],
  Enterprise:      ['50 Schools', 'Up to 10,000 students', 'Unlimited staff', 'API access', 'Dedicated support'],
  'Enterprise Plus':['250 Schools', 'Unlimited students', 'Unlimited staff', 'API + SSO', 'White-label + SLA'],
};

function UsageBar({ label, used, max, icon: Icon }: { label: string; used: number; max: number; icon: React.ComponentType<{className?: string}> }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-orange-500' : pct >= 80 ? 'bg-amber-500' : 'bg-[hsl(var(--accent))]';
  const textColor = pct >= 100 ? 'text-red-400' : pct >= 90 ? 'text-orange-400' : pct >= 80 ? 'text-amber-400' : 'text-[hsl(var(--text-secondary))]';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{label}</span>
        </div>
        <span className={cn('text-xs font-bold', textColor)}>
          {used} / {max > 9999 ? '∞' : max}
          {pct >= 80 && pct < 100 && <span className="ml-1.5 text-[10px] opacity-80">({pct}%)</span>}
          {pct >= 100 && <span className="ml-1.5 text-[10px]">LIMIT REACHED</span>}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-tertiary))]">
        <div className={cn('h-2 rounded-full transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function BillingClient({ orgId, currentPlan, allPlans, usage, orgStatus, joinedAt }: BillingClientProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<Plan | null>(null);
  const [tab, setTab] = useState<'overview' | 'plans' | 'history' | 'payment'>('overview');

  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);
  nextBilling.setDate(1);

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'plans'    as const, label: 'All Plans' },
    { id: 'history'  as const, label: 'Billing History' },
    { id: 'payment'  as const, label: 'Payment Method' },
  ];

  return (
    <div className="space-y-6">
      {/* Current plan hero */}
      <div className="glass-card p-6 bg-gradient-to-br from-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-tertiary)/0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[hsl(var(--accent))]" />
              <p className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">Current Plan</p>
            </div>
            <h2 className="text-2xl font-black text-[hsl(var(--text-primary))]">{currentPlan?.name ?? 'Trial'}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-black text-[hsl(var(--text-primary))]">
                ${(billingCycle === 'yearly' ? (currentPlan?.price_yearly ?? 0) : (currentPlan?.price_monthly ?? 0))}
              </span>
              <span className="text-sm text-[hsl(var(--text-tertiary))]">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Next billing: {nextBilling.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Member since {new Date(joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
              orgStatus === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}>
              {orgStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 p-1 rounded-lg bg-[hsl(var(--bg-tertiary))] w-fit">
          {(['monthly', 'yearly'] as const).map(c => (
            <button key={c} onClick={() => setBillingCycle(c)}
              className={cn('px-4 py-1.5 rounded-md text-xs font-semibold transition-all',
                billingCycle === c ? 'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))]')}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
              {c === 'yearly' && <span className="ml-1.5 text-emerald-400">–20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
              tab === t.id
                ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                : 'border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">
              <TrendingUp className="w-4 h-4 inline mr-2 text-[hsl(var(--accent))]" />
              Usage Overview
            </h3>
            <UsageBar label="Schools" used={usage.schools} max={usage.maxSchools} icon={Building2} />
            <UsageBar label="Staff Accounts" used={usage.staff} max={usage.maxStaff > 0 ? usage.maxStaff : 9999} icon={Users} />
            <UsageBar label="Student Accounts" used={usage.students} max={usage.maxStudents > 0 ? usage.maxStudents : 9999} icon={School} />
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Plan Features</h3>
            {(PLAN_FEATURES[currentPlan?.name ?? ''] ?? ['Basic access']).map(f => (
              <div key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-[hsl(var(--text-secondary))]">{f}</span>
              </div>
            ))}
            <button onClick={() => setTab('plans')}
              className="mt-4 w-full py-2.5 rounded-xl border border-[hsl(var(--accent)/0.3)] text-sm font-semibold text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.06)] transition-all">
              View All Plans
            </button>
          </div>
        </div>
      )}

      {/* All Plans */}
      {tab === 'plans' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(allPlans.length > 0 ? allPlans : [
            { id: 'mock-1', name: 'Starter',      price_monthly: 29,  price_yearly: 280,  max_schools: 1,  max_staff: 5,   max_students: 100 },
            { id: 'mock-2', name: 'Standard',     price_monthly: 59,  price_yearly: 565,  max_schools: 3,  max_staff: 20,  max_students: 500 },
            { id: 'mock-3', name: 'Professional', price_monthly: 99,  price_yearly: 950,  max_schools: 10, max_staff: 100, max_students: 2000 },
            { id: 'mock-4', name: 'Enterprise',   price_monthly: 199, price_yearly: 1900, max_schools: 50, max_staff: 0,   max_students: 0 },
          ] as Plan[]).map(plan => {
            const isCurrent = plan.id === currentPlan?.id || plan.name === currentPlan?.name;
            const price = billingCycle === 'yearly' ? (plan.price_yearly ?? 0) : (plan.price_monthly ?? 0);
            const features = PLAN_FEATURES[plan.name] ?? [];

            return (
              <div key={plan.id} className={cn('glass-card p-5 space-y-4 relative flex flex-col',
                isCurrent ? 'border-[hsl(var(--accent)/0.4)] ring-1 ring-[hsl(var(--accent)/0.2)]' : '')}>
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[hsl(var(--accent))] text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    Current Plan
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-[hsl(var(--text-primary))]">${price}</span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {features.slice(0, 4).map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button
                    onClick={() => setShowUpgradeDialog(plan)}
                    className="w-full py-2 rounded-lg text-xs font-bold transition-all border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.06)]"
                  >
                    {(plan.price_monthly ?? 0) > (currentPlan?.price_monthly ?? 0) ? (
                      <><ArrowUp className="w-3 h-3 inline mr-1" />Upgrade</>
                    ) : (
                      <><ArrowDown className="w-3 h-3 inline mr-1" />Downgrade</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Billing History */}
      {tab === 'history' && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Invoice History</h3>
            <button className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">
              <Download className="w-3.5 h-3.5" /> Export All
            </button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {MOCK_INVOICES.map(inv => (
              <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-[hsl(var(--accent))]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{inv.desc}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{new Date(inv.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {inv.id}</p>
                </div>
                <span className="text-sm font-bold text-[hsl(var(--text-primary))]">${inv.amount}</span>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                  inv.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}>
                  {inv.status}
                </span>
                <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method */}
      {tab === 'payment' && (
        <div className="glass-card p-6 space-y-5 max-w-md">
          <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Payment Method</h3>
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-700 border border-zinc-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-4">Visa ending in</p>
            <p className="text-2xl font-mono font-bold text-white tracking-widest">•••• •••• •••• 4242</p>
            <p className="text-xs text-zinc-400 mt-3">Expires 12/2028</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">Update Card</button>
            <button className="flex-1 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">+ Add Card</button>
          </div>
          <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Payment processing is handled securely via Stripe. Your card details are never stored on our servers.</p>
        </div>
      )}

      {/* Upgrade Dialog */}
      {showUpgradeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpgradeDialog(null)} />
          <div className="relative w-full max-w-sm glass-card p-6 animate-fade-in-scale space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">
              {(showUpgradeDialog.price_monthly ?? 0) > (currentPlan?.price_monthly ?? 0) ? '🚀 Upgrade to ' : '⬇️ Downgrade to '}
              {showUpgradeDialog.name}?
            </h3>
            <div className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
              <p>You will {(showUpgradeDialog.price_monthly ?? 0) > (currentPlan?.price_monthly ?? 0) ? 'gain' : 'lose'} access to:</p>
              {(PLAN_FEATURES[showUpgradeDialog.name] ?? []).map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />{f}
                </div>
              ))}
              <p className="pt-2 text-[hsl(var(--text-tertiary))] text-xs">Pro-rated billing will apply for the rest of this billing period.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowUpgradeDialog(null)} className="flex-1 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">Cancel</button>
              <button
                onClick={() => { alert('Payment integration coming soon!'); setShowUpgradeDialog(null); }}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-all">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
