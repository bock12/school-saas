'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, School, Users, CreditCard, BarChart3, ArrowRight, Check, Zap, Lock, Globe, X, LogIn } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [slug, setSlug] = useState('');

  const handleGoToPortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;
    router.push(`/${slug.trim().toLowerCase()}/login`);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.8)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-lg font-bold text-[hsl(var(--text-primary))]">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPortalModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all font-semibold"
            >
              <LogIn className="w-4 h-4" /> School Portal Login
            </button>
            <Link href="/super-admin" className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">Admin Dashboard</Link>
            <Link href="/super-admin" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--accent)/0.05)] to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] text-xs font-medium text-[hsl(var(--accent))] mb-6">
            <Zap className="w-3 h-3" /> Multi-tenant School Management Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[hsl(var(--text-primary))] leading-tight max-w-3xl mx-auto">
            Manage <span className="gradient-text">Every School</span> From One Platform
          </h1>
          <p className="text-lg text-[hsl(var(--text-secondary))] mt-6 max-w-2xl mx-auto">
            A complete SaaS solution for managing multiple schools with isolated data, role-based access, and powerful administrative tools.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link href="/super-admin" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-semibold hover:opacity-90 transition-opacity">
              Launch Super-Admin Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setShowPortalModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-semibold hover:bg-[hsl(var(--bg-tertiary))] transition-all"
            >
              School Portal Login <LogIn className="w-4 h-4 text-[hsl(var(--accent))]" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] text-center mb-12">Built for Scale</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: School, title: 'Multi-Tenant Architecture', desc: 'Each school gets isolated data with Row-Level Security. Zero cross-contamination.' },
            { icon: Users, title: 'Role-Based Dashboards', desc: 'Admins, teachers, students, and parents each see exactly what they need.' },
            { icon: Lock, title: 'Enterprise Security', desc: 'PostgreSQL RLS, JWT auth, and encrypted data at rest and in transit.' },
            { icon: CreditCard, title: 'Subscription Billing', desc: 'Tiered pricing plans with built-in payment processing integration.' },
            { icon: BarChart3, title: 'Analytics & Reports', desc: 'Real-time dashboards with revenue tracking, usage metrics, and audit logs.' },
            { icon: Globe, title: 'Custom Domains', desc: 'Each school can have their own branded subdomain or custom domain.' },
          ].map((f, i) => (
            <div key={i} className="glass-card p-6 group hover:border-[hsl(var(--accent)/0.3)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--accent)/0.15)] transition-colors">
                <f.icon className="w-5 h-5 text-[hsl(var(--accent))]" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-2">{f.title}</h3>
              <p className="text-sm text-[hsl(var(--text-tertiary))] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-[hsl(var(--border))]">
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] text-center mb-12">Choose the plan that fits your school&apos;s size</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Starter', price: 29, students: '100', features: ['Basic Reports', 'Email Support', '1 Admin'] },
            { name: 'Professional', price: 79, students: '500', features: ['Advanced Reports', 'Priority Support', '5 Admins', 'SMS Notifications', 'Custom Branding'], popular: true },
            { name: 'Enterprise', price: 199, students: '5,000', features: ['All Features', 'Dedicated Support', 'Unlimited Admins', 'API Access', 'Custom Domain'] },
          ].map((plan, i) => (
            <div key={i} className={`glass-card p-6 relative ${plan.popular ? 'border-[hsl(var(--accent)/0.4)] ring-1 ring-[hsl(var(--accent)/0.2)]' : ''}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[hsl(var(--accent))] text-white text-[10px] font-bold uppercase tracking-wider">Most Popular</div>}
              <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">{plan.name}</h3>
              <div className="mt-3 mb-4"><span className="text-3xl font-bold text-[hsl(var(--text-primary))]">${plan.price}</span><span className="text-sm text-[hsl(var(--text-tertiary))]">/mo</span></div>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mb-4">Up to {plan.students} students</p>
              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))]"><Check className="w-3.5 h-3.5 text-emerald-400" />{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-[hsl(var(--text-tertiary))]">© 2026 {APP_NAME}. Multi-Tenant School Management SaaS Platform.</p>
        </div>
      </footer>

      {/* Multi-Tenant School Portal Navigation Modal */}
      {showPortalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Find Your School Portal</h3>
              </div>
              <button onClick={() => setShowPortalModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Enter your school's unique slug or subdomain identifier below to access your custom student lifecycle and academic desk.
            </p>

            <form onSubmit={handleGoToPortal} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">School Identifier Slug *</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. greenwood, springfield"
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                  <span className="absolute right-3 text-[10px] text-[hsl(var(--text-tertiary))] font-mono">.schoolsaas.com</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPortalModal(false)}
                  className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1"
                >
                  Go to Portal <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
