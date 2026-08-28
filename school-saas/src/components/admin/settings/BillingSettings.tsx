'use client';

import { useState } from 'react';
import {
  CreditCard, Check, Sparkles, Zap, Shield,
  Download, ArrowUpRight, CheckCircle2, Clock, FileText, AlertCircle
} from 'lucide-react';

interface PlanTier {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxStudents: string;
  maxStaff: string;
  features: string[];
  popular?: boolean;
}

const TIERS: PlanTier[] = [
  {
    id: 'basic',
    name: 'Foundation Tier',
    priceMonthly: 49,
    priceYearly: 490,
    maxStudents: 'Up to 250 Students',
    maxStaff: '25 Faculty Accounts',
    features: [
      'Daily Attendance & Roll Call',
      'Timetable Scheduler & Grid',
      'Basic Assignments Vault',
      'Class & Student Directory',
      'Email Support (48h)',
    ],
  },
  {
    id: 'premium',
    name: 'Professional Tier',
    priceMonthly: 129,
    priceYearly: 1290,
    maxStudents: 'Up to 1,000 Students',
    maxStaff: '100 Faculty Accounts',
    popular: true,
    features: [
      'Everything in Foundation',
      'Advanced GPA & Weighted Gradebook',
      'Online Exams & Instant Marksheets',
      'SMS Text Messaging Gateway (Twilio)',
      'Parent-Teacher Comms Portal',
      'Discipline & Conduct Records',
      'Custom School Domain Alignment',
      'Priority 24/7 Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Institutional Enterprise',
    priceMonthly: 299,
    priceYearly: 2990,
    maxStudents: 'Unlimited Students',
    maxStaff: 'Unlimited Faculty',
    features: [
      'Everything in Professional',
      'Gemini AI Lesson & Exam Generator',
      'Multi-Campus Central Management',
      'Biometric Face Attendance Integration',
      'Custom SIS Webhook Callbacks',
      'Dedicated Account Manager',
      '99.9% Uptime SLA Guarantee',
    ],
  },
];

const INVOICES = [
  { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '$129.00', status: 'Paid', plan: 'Professional Tier (Monthly)' },
  { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '$129.00', status: 'Paid', plan: 'Professional Tier (Monthly)' },
  { id: 'INV-2026-06', date: 'Jun 01, 2026', amount: '$129.00', status: 'Paid', plan: 'Professional Tier (Monthly)' },
];

export default function BillingSettings() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string>('premium');
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Current Active Plan Overview Card */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[hsl(var(--border))]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Active Subscription
              </span>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">Renews on Sept 1, 2026</span>
            </div>
            <h3 className="text-2xl font-black text-[hsl(var(--text-primary))]">Professional Plan</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Comprehensive institutional management package with premium LMS, SMS alerts, and custom domain alignment.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <div className="text-3xl font-black text-[hsl(var(--text-primary))]">$129<span className="text-xs text-[hsl(var(--text-tertiary))] font-normal"> / month</span></div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Renew Enabled
            </span>
          </div>
        </div>

        {/* Quota usages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[hsl(var(--text-tertiary))] font-bold uppercase text-[10px]">Student Seats</span>
              <span className="font-bold text-[hsl(var(--text-primary))]">840 / 1,000</span>
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[hsl(var(--text-tertiary))] font-bold uppercase text-[10px]">Faculty Accounts</span>
              <span className="font-bold text-[hsl(var(--text-primary))]">54 / 100</span>
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '54%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[hsl(var(--text-tertiary))] font-bold uppercase text-[10px]">Cloud Storage</span>
              <span className="font-bold text-[hsl(var(--text-primary))]">18.4 GB / 50 GB</span>
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '37%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Available Tiers */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
          <div>
            <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Select Subscription Package</h4>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Upgrade or modify your plan to unlock higher capacity and AI features.</p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-[hsl(var(--accent))] text-white shadow-sm' : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'yearly' ? 'bg-[hsl(var(--accent))] text-white shadow-sm' : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map(tier => {
            const isCurrent = tier.id === currentPlan;
            const price = billingCycle === 'monthly' ? tier.priceMonthly : Math.round(tier.priceYearly / 12);

            return (
              <div
                key={tier.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative ${
                  tier.popular
                    ? 'bg-gradient-to-b from-blue-500/5 to-purple-500/5 border-blue-500/30 shadow-lg'
                    : 'bg-[hsl(var(--bg-tertiary)/0.3)] border-[hsl(var(--border))]'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h5 className="text-base font-black text-[hsl(var(--text-primary))]">{tier.name}</h5>
                    <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">{tier.maxStudents} · {tier.maxStaff}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[hsl(var(--text-primary))]">${price}</span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">/ month</span>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-[hsl(var(--border)/0.5)]">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPlan(tier.id);
                        alert(`Switched subscription plan to ${tier.name}`);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
                    >
                      Switch to {tier.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card on file */}
        <div className="glass-card p-6 md:p-8 space-y-4">
          <h4 className="font-black text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            Payment Method
          </h4>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-md space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Institutional Card</span>
              <span className="text-xs font-bold text-blue-400">VISA</span>
            </div>
            <div className="text-sm font-mono tracking-widest">•••• •••• •••• 4242</div>
            <div className="flex justify-between text-[10px] text-slate-400 uppercase">
              <span>Expires 08/29</span>
              <span>EduScale AutoPay</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert("Payment method gateway opened.")}
            className="w-full py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            Update Payment Method
          </button>
        </div>

        {/* Invoice Receipts */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border))]">
            <h4 className="font-black text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              Invoice & Billing History
            </h4>
            <span className="text-xs text-[hsl(var(--text-tertiary))] font-semibold">3 Invoices</span>
          </div>

          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {INVOICES.map(inv => (
              <div key={inv.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[hsl(var(--text-primary))] block">{inv.id}</span>
                  <span className="text-[11px] text-[hsl(var(--text-tertiary))]">{inv.date} · {inv.plan}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[hsl(var(--text-primary))]">{inv.amount}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {inv.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Downloading ${inv.id} PDF receipt.`)}
                    className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
                    title="Download Receipt"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
