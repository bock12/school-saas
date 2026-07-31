'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, School, Users, CreditCard, BarChart3, ArrowRight, ChevronRight,
  Check, Zap, Lock, Globe, X, LogIn, Menu, Building2, Search, GraduationCap,
  MapPin, Star, Phone, Mail, Sparkles, BookOpen, Trophy, Heart
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo_url: string | null;
  city: string | null;
  country: string | null;
  contact_email: string | null;
  primary_color?: string | null;
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'school' | 'organization'>('all');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUrl, setAdminUrl] = useState('/super-admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const cleanHost = hostname.replace(/^(www\.|admin\.)/, '');
      const port = window.location.port ? `:${window.location.port}` : '';
      setAdminUrl(`${window.location.protocol}//admin.${cleanHost}${port}`);
    }
  }, []);

  // Fetch all publicly visible tenants via API
  useEffect(() => {
    async function fetchTenants() {
      try {
        const res = await fetch('/api/public/tenants');
        if (res.ok) {
          const data = await res.json();
          setTenants(data.tenants || []);
        }
      } catch {
        // fail silently — show empty directory
      } finally {
        setLoading(false);
      }
    }
    fetchTenants();
  }, []);

  // Filter tenants by search + type
  const filtered = tenants.filter(t => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      (filterType === 'school' && t.type !== 'organization') ||
      (filterType === 'organization' && t.type === 'organization');
    return matchesSearch && matchesType;
  });

  // Build per-tenant URL
  const getTenantUrl = (slug: string) => {
    if (typeof window === 'undefined') return `/${slug}`;
    const hostname = window.location.hostname;
    const cleanHost = hostname.replace(/^(www\.|admin\.)/, '');
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${slug}.${cleanHost}${port}`;
  };

  const stats = [
    { value: tenants.filter(t => t.type !== 'organization').length || '50+', label: 'Schools Onboarded' },
    { value: tenants.filter(t => t.type === 'organization').length || '10+', label: 'Organizations' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.85)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent)/0.25)]">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-[hsl(var(--text-primary))] tracking-tight">{APP_NAME}</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a href="#directory" className="px-4 py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] font-semibold transition-colors">Browse Schools</a>
            <a href="#features" className="px-4 py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] font-semibold transition-colors">Features</a>
            <a href="#pricing" className="px-4 py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] font-semibold transition-colors">Pricing</a>
            <Link href={adminUrl} className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-[hsl(var(--accent)/0.2)] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Admin Portal
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] px-4 py-3 space-y-2">
            <a href="#directory" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-[hsl(var(--text-secondary))] font-semibold">Browse Schools</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-[hsl(var(--text-secondary))] font-semibold">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-[hsl(var(--text-secondary))] font-semibold">Pricing</a>
            <Link href={adminUrl} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold">
              <Shield className="w-4 h-4" /> Admin Portal
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[hsl(var(--accent)/0.06)] rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="absolute top-40 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] text-xs font-bold text-[hsl(var(--accent))] mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" /> Multi-Tenant School Management Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-[hsl(var(--text-primary))] leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6">
            The School Portal
            <span className="block gradient-text">Your Students Deserve</span>
          </h1>

          <p className="text-base sm:text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete SaaS platform for schools and educational groups — manage students, staff, fees, timetables, results, and more from one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#directory"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold hover:opacity-90 transition-all shadow-xl shadow-[hsl(var(--accent)/0.25)] text-sm sm:text-base"
            >
              <School className="w-4 h-4" /> Find Your School <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href={adminUrl}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] font-bold hover:bg-[hsl(var(--bg-tertiary))] transition-all text-sm sm:text-base"
            >
              <Shield className="w-4 h-4 text-[hsl(var(--accent))]" /> Admin Login
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-4 sm:p-5 text-center rounded-2xl">
                <p className="text-2xl sm:text-3xl font-black text-[hsl(var(--accent))]">{s.value}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── School / Org Directory ───────────────── */}
      <section id="directory" className="bg-[hsl(var(--bg-secondary))] border-y border-[hsl(var(--border))] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Section header */}
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
              <School className="w-3.5 h-3.5" /> Live Institution Directory
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[hsl(var(--text-primary))] mb-3">
              Browse Schools & Organizations
            </h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] max-w-xl mx-auto">
              Select any school or educational group below to visit their portal, apply for admission, or login to your dashboard.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, city or identifier..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'school', 'organization'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    filterType === t
                      ? 'bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))] shadow-md'
                      : 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'school' ? '🏫 Schools' : '🏢 Orgs'}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--bg-tertiary))]" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-[hsl(var(--bg-tertiary))] rounded w-3/4" />
                      <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-[hsl(var(--bg-tertiary))] rounded-xl" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <School className="w-16 h-16 text-[hsl(var(--text-tertiary))] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[hsl(var(--text-secondary))] mb-2">
                {searchQuery ? 'No results found' : 'No institutions listed yet'}
              </h3>
              <p className="text-sm text-[hsl(var(--text-tertiary))] max-w-sm mx-auto">
                {searchQuery
                  ? 'Try a different search term or clear the filter.'
                  : 'Schools and organizations will appear here once they are registered on the platform.'}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mt-4 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-sm font-bold hover:opacity-90 transition-all">
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(t => {
                const isOrg = t.type === 'organization';
                const tenantUrl = getTenantUrl(t.slug);
                return (
                  <div
                    key={t.id}
                    className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[hsl(var(--accent)/0.4)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="space-y-3">
                      {/* Logo + Name */}
                      <div className="flex items-center gap-3">
                        {t.logo_url ? (
                          <img src={t.logo_url} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-[hsl(var(--border))] flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent)/0.05)] text-[hsl(var(--accent))] flex items-center justify-center font-black text-lg flex-shrink-0 border border-[hsl(var(--accent)/0.15)]">
                            {t.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] transition-colors leading-tight truncate">
                            {t.name}
                          </h3>
                          <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{t.slug}</span>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isOrg
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {isOrg ? <Building2 className="w-3 h-3" /> : <School className="w-3 h-3" />}
                        {isOrg ? 'Educational Organization' : 'School'}
                      </span>

                      {/* Location */}
                      {(t.city || t.country) && (
                        <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{[t.city, t.country].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <a
                      href={tenantUrl}
                      className="w-full py-2.5 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[hsl(var(--accent))] hover:text-white hover:border-[hsl(var(--accent))] transition-all duration-200"
                    >
                      Visit Portal <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <p className="text-center text-xs text-[hsl(var(--text-tertiary))] mt-6">
              Showing {filtered.length} of {tenants.length} registered institutions
            </p>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5" /> Platform Capabilities
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[hsl(var(--text-primary))] mb-3">Built for Modern Education</h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] max-w-xl mx-auto">
            Everything your school needs, from student enrollment to financial reporting, in one integrated platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: School, title: 'Multi-Tenant Architecture', desc: 'Each school gets isolated data with Row-Level Security. Zero cross-contamination guaranteed.', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { icon: Users, title: 'Role-Based Dashboards', desc: 'Admins, teachers, students, and parents each see exactly what they need — nothing more, nothing less.', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { icon: Lock, title: 'Enterprise Security', desc: 'PostgreSQL RLS, JWT authentication, and encrypted data at rest and in transit for maximum protection.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { icon: CreditCard, title: 'Integrated Fee Management', desc: 'Tiered pricing plans, installment tracking, receipts, and payment gateway integration built-in.', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { icon: BarChart3, title: 'Analytics & Smart Reports', desc: 'Real-time performance dashboards, GPA trends, attendance analytics, and automated report cards.', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
            { icon: Globe, title: 'Custom Branded Portals', desc: 'Each school gets its own branded subdomain, custom colors, logo, and public-facing landing page.', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
            { icon: BookOpen, title: 'LMS & Learning Tools', desc: 'Integrated Learning Management System with courses, assignments, AI Study Copilot, and digital library.', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
            { icon: Trophy, title: 'Student Career Portfolio', desc: 'Digital portfolio for students to collect projects, certificates, awards, and extracurricular achievements.', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
            { icon: Heart, title: 'Health & Wellbeing', desc: 'Student welfare tracking, health records, behaviour reports, merit/demerit system, and counselling log.', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
          ].map((f, i) => (
            <div key={i} className={`glass-card p-5 sm:p-6 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl border ${f.color.split(' ')[2]}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[hsl(var(--text-primary))] mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm text-[hsl(var(--text-tertiary))] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────── */}
      <section id="pricing" className="bg-[hsl(var(--bg-secondary))] border-y border-[hsl(var(--border))] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
              <Star className="w-3.5 h-3.5" /> Simple, Transparent Pricing
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[hsl(var(--text-primary))] mb-3">Choose Your Plan</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] max-w-lg mx-auto">
              Flexible pricing that grows with your school. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: 29, students: '100', features: ['Student & Staff Portals', 'Basic Report Cards', 'Timetable Manager', 'Email Support', '1 Admin Account'], color: 'border-[hsl(var(--border))]' },
              { name: 'Professional', price: 79, students: '500', features: ['Everything in Starter', 'Advanced Analytics', 'Fee Management', 'LMS & Assignments', 'AI Study Copilot', 'SMS Notifications', '5 Admin Accounts', 'Custom Branding'], popular: true, color: 'border-[hsl(var(--accent)/0.5)]' },
              { name: 'Enterprise', price: 199, students: '5,000+', features: ['Everything in Professional', 'Multi-School Organization', 'Dedicated Support Manager', 'Unlimited Admins', 'Full API Access', 'Custom Domain', 'SSO Integration', 'Data Export & Backup'], color: 'border-[hsl(var(--border))]' },
            ].map((plan, i) => (
              <div key={i} className={`glass-card p-6 rounded-2xl relative flex flex-col ${plan.popular ? 'ring-2 ring-[hsl(var(--accent)/0.4)] ' + plan.color : plan.color}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                    ⭐ Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl sm:text-4xl font-black text-[hsl(var(--text-primary))]">${plan.price}</span>
                    <span className="text-sm text-[hsl(var(--text-tertiary))]">/month</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">Up to {plan.students} students</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))]">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white hover:opacity-90 shadow-lg shadow-[hsl(var(--accent)/0.2)]'
                    : 'border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                }`}>
                  Get Started <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t border-[hsl(var(--border))] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-[hsl(var(--text-primary))]">{APP_NAME}</span>
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))] text-center">
              © {new Date().getFullYear()} {APP_NAME}. Multi-Tenant School Management SaaS Platform.
            </p>
            <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-tertiary))]">
              <span>Privacy</span>
              <span>Terms</span>
              <Link href={adminUrl} className="text-[hsl(var(--accent))] font-semibold hover:underline">Admin Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
