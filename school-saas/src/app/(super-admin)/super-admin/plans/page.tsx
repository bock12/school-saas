'use client';

import { useState } from 'react';
import { Check, Plus, Edit2, Trash2, Tag, Percent, X } from 'lucide-react';

const plans = [
  { id: '1', name: 'Starter', price_monthly: 29, price_yearly: 290, max_students: 100, max_teachers: 10, storage: 2, features: ['Basic Reports', 'Email Support', '1 Admin'], active_schools: 12, color: 'hsl(var(--text-secondary))' },
  { id: '2', name: 'Professional', price_monthly: 79, price_yearly: 790, max_students: 500, max_teachers: 50, storage: 10, features: ['Advanced Reports', 'Priority Support', '5 Admins', 'SMS Notifications', 'Custom Branding'], active_schools: 28, color: 'hsl(var(--accent))' },
  { id: '3', name: 'Enterprise', price_monthly: 199, price_yearly: 1990, max_students: 5000, max_teachers: 500, storage: 100, features: ['All Features', 'Dedicated Support', 'Unlimited Admins', 'API Access', 'Custom Domain', 'SLA Guarantee'], active_schools: 16, color: 'hsl(38, 92%, 50%)' },
];

const coupons = [
  { id: '1', code: 'EARLYBIRD50', discount: '50%', uses: '12/50', valid_until: '2026-12-31', status: 'active' },
  { id: '2', code: 'LAUNCH25', discount: '25%', uses: '43/100', valid_until: '2026-09-30', status: 'active' },
  { id: '3', code: 'PARTNER100', discount: '$100 off', uses: '5/10', valid_until: '2026-07-31', status: 'active' },
];

export default function PlansPage() {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Plans & Billing</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Manage subscription tiers and promotions</p>
        </div>
        <button onClick={() => setShowPlanForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <div key={plan.id} className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="h-1" style={{ background: plan.color }} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">{plan.name}</h3>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--danger)/0.1)] transition-colors"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-[hsl(var(--text-primary))]">${plan.price_monthly}</span>
                <span className="text-sm text-[hsl(var(--text-tertiary))]">/month</span>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">${plan.price_yearly}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)</p>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--bg-tertiary))]">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{plan.max_students.toLocaleString()}</p><p className="text-[10px] text-[hsl(var(--text-tertiary))]">Students</p></div>
                  <div><p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{plan.max_teachers}</p><p className="text-[10px] text-[hsl(var(--text-tertiary))]">Teachers</p></div>
                  <div><p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{plan.storage}GB</p><p className="text-[10px] text-[hsl(var(--text-tertiary))]">Storage</p></div>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))]">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-[hsl(var(--border))]">
                <p className="text-xs text-[hsl(var(--text-tertiary))]"><span className="font-medium text-[hsl(var(--text-secondary))]">{plan.active_schools}</span> active schools</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupons Section */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[hsl(var(--accent))]" />
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Coupon Codes</h2>
          </div>
          <button onClick={() => setShowCouponForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.1)] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Coupon
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[hsl(var(--border))]">
              {['Code', 'Discount', 'Usage', 'Valid Until', 'Status', ''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover">
                  <td className="px-5 py-3"><code className="text-sm font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded">{c.code}</code></td>
                  <td className="px-5 py-3"><span className="flex items-center gap-1 text-sm text-[hsl(var(--text-secondary))]"><Percent className="w-3.5 h-3.5 text-emerald-400" />{c.discount}</span></td>
                  <td className="px-5 py-3 text-sm text-[hsl(var(--text-secondary))]">{c.uses}</td>
                  <td className="px-5 py-3 text-sm text-[hsl(var(--text-tertiary))]">{new Date(c.valid_until).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-current" />Active</span></td>
                  <td className="px-5 py-3"><button className="p-1.5 rounded-lg hover:bg-[hsl(var(--danger)/0.1)] transition-colors"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Form Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPlanForm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl animate-fade-in-scale p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Create Plan</h2>
              <button onClick={() => setShowPlanForm(false)} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))]"><X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Plan Name</label><input type="text" placeholder="e.g., Premium" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Monthly Price</label><input type="number" placeholder="99" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Yearly Price</label><input type="number" placeholder="990" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Max Students</label><input type="number" placeholder="1000" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Max Teachers</label><input type="number" placeholder="100" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Storage GB</label><input type="number" placeholder="20" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowPlanForm(false)} className="px-4 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90">Create Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCouponForm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl animate-fade-in-scale p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Create Coupon</h2>
              <button onClick={() => setShowCouponForm(false)} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))]"><X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Coupon Code</label><input type="text" placeholder="e.g., SUMMER30" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] font-mono uppercase focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Discount %</label><input type="number" placeholder="25" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Max Uses</label><input type="number" placeholder="100" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              </div>
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Valid Until</label><input type="date" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowCouponForm(false)} className="px-4 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90">Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
