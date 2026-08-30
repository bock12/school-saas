'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  School, Building2, Shield, CheckCircle2, ArrowRight, ArrowLeft,
  Sparkles, Check, AlertCircle, RefreshCw, Eye, EyeOff, Lock,
  Mail, User, Globe, MapPin, Layers, ExternalLink, Zap, HelpCircle
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

type OrgMode = 'standalone' | 'multi';

interface SchoolBranch {
  name: string;
  slug: string;
  schoolType: string;
}

const REGIONS = [
  'Western Area (Freetown)',
  'Eastern Province (Kenema/Kono)',
  'Southern Province (Bo/Moyamba)',
  'Northern Province (Makeni)',
  'North West Province (Port Loko)',
  'International / Other',
];

const AVAILABLE_LEVELS = [
  { id: 'Nursery', label: 'Nursery & Early Childhood', desc: 'Ages 3-5 foundation' },
  { id: 'Primary', label: 'Primary School (Class 1-6)', desc: 'NPSE foundation stream' },
  { id: 'JSS', label: 'Junior Secondary (JSS 1-3)', desc: 'BECE national curriculum' },
  { id: 'SSS', label: 'Senior Secondary (SSS 1-3)', desc: 'WASSCE Arts, Science, Comm.' },
];

const AVAILABLE_SHIFTS = [
  { id: 'Morning Shift', label: 'Morning Shift (7:45 AM - 1:30 PM)' },
  { id: 'Afternoon Shift', label: 'Afternoon Shift (1:45 PM - 6:00 PM)' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Campus',
    badge: '30-Day Free Trial',
    price: 'Free Trial',
    period: 'No credit card required',
    desc: 'Perfect for standalone primary or secondary schools getting started with digitized record-keeping.',
    features: [
      'Single standalone campus',
      'Up to 1,500 enrolled students',
      '6-3-3-4 National Stream Support',
      '30% CASS & 70% Terminal Exams',
      'Basic Report Card Generator',
      'Staff Attendance Tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Professional Academy',
    badge: 'Most Popular',
    price: 'NLe 8,500',
    period: 'per term / billed annually',
    desc: 'Full-featured academic intelligence for established academies, high schools, and technical colleges.',
    features: [
      'Everything in Starter, plus:',
      'Gemini 2.0 AI Lesson Plan Engine',
      'WAEC Electronic CASS Master Export',
      'Orange & AfriMoney Fee Gateway',
      'Online Admissions & Applicant Stepper',
      'Digital Parent & Student Portals',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise & Diocesan',
    badge: 'Multi-Campus',
    price: 'Custom',
    period: 'Tailored group pricing',
    desc: 'Designed for mission boards, dioceses, and educational groups managing multiple sister campuses.',
    features: [
      'Everything in Pro, plus:',
      'Multi-school centralized oversight',
      'Custom apex domain mapping',
      'Dedicated cloud instance & daily PITR',
      'Custom timetable scheduling engine',
      'Priority 24/7 SLA & on-site training',
    ],
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [orgMode, setOrgMode] = useState<OrgMode>('standalone');
  
  // School Identity
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugMessage, setSlugMessage] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['JSS', 'SSS']);
  const [selectedShifts, setSelectedShifts] = useState<string[]>(['Morning Shift']);

  // Multi-school branches
  const [branches, setBranches] = useState<SchoolBranch[]>([
    { name: '', slug: '', schoolType: 'Primary' },
  ]);

  // Plan
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('starter');

  // Administrator Account
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Submission & Provisioning state
  const [submitting, setSubmitting] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [provisionStepText, setProvisionStepText] = useState('');
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [provisionSuccess, setProvisionSuccess] = useState<any>(null);

  // Auto-generate slug from school name
  const handleNameChange = (val: string) => {
    setOrgName(val);
    if (!orgSlug || orgSlug === orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
      const generated = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setOrgSlug(generated);
    }
  };

  // Subdomain live availability checker
  useEffect(() => {
    if (!orgSlug || orgSlug.length < 2) {
      setSlugStatus('idle');
      setSlugMessage('');
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus('checking');
      try {
        const res = await fetch(`/api/public/check-slug?slug=${encodeURIComponent(orgSlug)}`);
        const data = await res.json();
        if (data.available) {
          setSlugStatus('available');
          setSlugMessage(`http://${orgSlug}.localhost:3000 is available!`);
        } else {
          setSlugStatus('taken');
          setSlugMessage(data.message || 'This subdomain is not available.');
        }
      } catch {
        setSlugStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [orgSlug]);

  const toggleLevel = (lvl: string) => {
    setSelectedLevels(prev =>
      prev.includes(lvl) ? prev.filter(x => x !== lvl) : [...prev, lvl]
    );
  };

  const toggleShift = (shift: string) => {
    setSelectedShifts(prev =>
      prev.includes(shift) ? prev.filter(x => x !== shift) : [...prev, shift]
    );
  };

  // Validation per step
  const canProceed = useMemo(() => {
    if (step === 1) return true; // Institutional model selection
    if (step === 2) {
      return (
        orgName.trim().length > 0 &&
        orgSlug.trim().length >= 2 &&
        slugStatus !== 'taken' &&
        selectedLevels.length > 0
      );
    }
    if (step === 3) {
      if (orgMode === 'multi') {
        return branches.length > 0 && branches.every(b => b.name.trim() && b.slug.trim());
      }
      return true; // Plan selection for standalone
    }
    if (step === 4) {
      if (orgMode === 'multi') return true; // Plan selection for multi
      return (
        adminName.trim().length > 0 &&
        adminEmail.trim().includes('@') &&
        password.length >= 6 &&
        agreedTerms
      );
    }
    if (step === 5) {
      return (
        adminName.trim().length > 0 &&
        adminEmail.trim().includes('@') &&
        password.length >= 6 &&
        agreedTerms
      );
    }
    return true;
  }, [step, orgMode, orgName, orgSlug, slugStatus, selectedLevels, branches, adminName, adminEmail, password, agreedTerms]);

  const totalSteps = orgMode === 'multi' ? 6 : 5;

  const handleLaunch = async () => {
    setSubmitting(true);
    setProvisionError(null);
    setProvisionProgress(15);
    setProvisionStepText('Claiming subdomain & allocating database tenant...');

    const interval = setInterval(() => {
      setProvisionProgress(prev => {
        if (prev < 35) {
          setProvisionStepText('Establishing isolated PostgreSQL schema & RLS policies...');
          return prev + 10;
        } else if (prev < 65) {
          setProvisionStepText('Seeding WAEC 6-3-3-4 curriculum framework & grading matrix...');
          return prev + 12;
        } else if (prev < 85) {
          setProvisionStepText('Creating administrator security credentials...');
          return prev + 8;
        }
        return prev;
      });
    }, 400);

    try {
      const res = await fetch('/api/public/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName,
          orgSlug,
          orgMode,
          region,
          schoolLevels: selectedLevels,
          schoolShifts: selectedShifts,
          schools: orgMode === 'multi' ? branches : [],
          plan: selectedPlan,
          adminName,
          adminEmail,
          password,
        }),
      });

      clearInterval(interval);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to provision school portal.');
      }

      setProvisionProgress(100);
      setProvisionStepText('School Portal Ready!');
      setProvisionSuccess(data.tenant);
    } catch (err: any) {
      clearInterval(interval);
      setProvisionError(err.message || 'An error occurred during portal provisioning.');
      setSubmitting(false);
    }
  };

  const getPortalLoginUrl = (slug: string) => {
    if (typeof window === 'undefined') return `/${slug}/login`;
    const hostname = window.location.hostname;
    const cleanHost = hostname.replace(/^(www\.|admin\.)/, '');
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${slug}.${cleanHost}${port}/login`;
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans antialiased selection:bg-[hsl(var(--accent)/0.25)] selection:text-[hsl(var(--accent))] flex flex-col justify-between">
      
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary)/0.8)] backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[hsl(var(--accent)/0.3)]">
              N
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[hsl(var(--text-primary))] block leading-none">
                {APP_NAME}
              </span>
              <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block mt-0.5">
                Self-Service Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-[hsl(var(--text-secondary))] hidden sm:inline font-medium">Already have an institution portal?</span>
            <Link
              href="/#institutions"
              className="font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1"
            >
              <span>Browse Schools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Onboarding Wizard Form ────────────────────────────── */}
      <main className="max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">
        
        {/* Progress Header */}
        {!provisionSuccess && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[hsl(var(--text-secondary))]">
              <span>Step {step} of {totalSteps}</span>
              <span className="text-[hsl(var(--accent))]">
                {step === 1 && 'Institutional Model'}
                {step === 2 && 'Identity & Subdomain'}
                {step === 3 && (orgMode === 'multi' ? 'Campus Branches' : 'Choose Plan')}
                {step === 4 && (orgMode === 'multi' ? 'Choose Plan' : 'Admin Profile')}
                {step === 5 && (orgMode === 'multi' ? 'Admin Profile' : 'Launch Portal')}
                {step === 6 && 'Launch Portal'}
              </span>
            </div>

            {/* Visual Step Bar */}
            <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] transition-all duration-300 rounded-full"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Wizard Card Container */}
        <div className="glass-card rounded-3xl border border-[hsl(var(--border))] p-6 sm:p-10 shadow-2xl bg-[hsl(var(--bg-secondary))]">
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SUCCESS SCREEN */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {provisionSuccess ? (
            <div className="text-center py-8 space-y-6 animate-in fade-in">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Tenant Environment Provisioned
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">
                  Congratulations, {provisionSuccess.name}!
                </h2>
                <p className="text-sm text-[hsl(var(--text-secondary))] max-w-md mx-auto">
                  Your dedicated multi-tenant school portal is live and ready for staff enrollment and academic scheduling.
                </p>
              </div>

              {/* Subdomain & Credentials Summary */}
              <div className="p-5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] max-w-md mx-auto text-left space-y-3 text-xs">
                <div>
                  <span className="text-[hsl(var(--text-tertiary))] font-mono uppercase block text-[10px]">Your School Subdomain</span>
                  <a
                    href={getPortalLoginUrl(provisionSuccess.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1.5 mt-0.5"
                  >
                    <span>{provisionSuccess.slug}.localhost:3000</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="pt-2 border-t border-[hsl(var(--border))] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))] block text-[10px]">Admin Username</span>
                    <span className="font-bold text-[hsl(var(--text-primary))]">{provisionSuccess.adminEmail}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))] block text-[10px]">Assigned Role</span>
                    <span className="font-bold text-emerald-400 capitalize">{provisionSuccess.role.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Launch CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getPortalLoginUrl(provisionSuccess.slug)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-sm shadow-xl shadow-[hsl(var(--accent)/0.3)] hover:opacity-95 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <span>Launch School Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 1: Institutional Model */}
              {/* ═══════════════════════════════════════════════════════ */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Select Institutional Structure
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
                      Choose how your institution is structured. You can adjust this configuration at any time.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div
                      onClick={() => setOrgMode('standalone')}
                      className={`p-6 rounded-3xl border-2 cursor-pointer transition-all space-y-3 relative ${
                        orgMode === 'standalone'
                          ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)] shadow-lg shadow-[hsl(var(--accent)/0.1)]'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-primary))]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                        <School className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Single Standalone School</h3>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">Standard</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 leading-relaxed">
                          For primary schools, junior secondary, senior secondary academies, or combined single-campus colleges.
                        </p>
                      </div>
                      {orgMode === 'standalone' && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[hsl(var(--accent))] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => setOrgMode('multi')}
                      className={`p-6 rounded-3xl border-2 cursor-pointer transition-all space-y-3 relative ${
                        orgMode === 'multi'
                          ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)] shadow-lg shadow-[hsl(var(--accent)/0.1)]'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-primary))]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Educational Group / Diocesan Board</h3>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold">Multi-School</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 leading-relaxed">
                          For mission foundations, diocesan education boards, and school networks managing multiple sister campuses.
                        </p>
                      </div>
                      {orgMode === 'multi' && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[hsl(var(--accent))] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 2: Identity & Subdomain */}
              {/* ═══════════════════════════════════════════════════════ */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      School Identity &amp; Subdomain Claim
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
                      Reserve your institution’s official academic domain and configure your national education framework.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Institution Name */}
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                        Official Institution Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="e.g. Albert Academy"
                        className="w-full h-12 px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                      />
                    </div>

                    {/* Subdomain Claim Input */}
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                        Claim Subdomain *
                      </label>
                      <div className="flex items-center rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] overflow-hidden focus-within:border-[hsl(var(--accent))] transition-colors">
                        <input
                          type="text"
                          required
                          value={orgSlug}
                          onChange={e => setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                          placeholder="albert-academy"
                          className="flex-1 h-12 px-4 bg-transparent text-sm text-[hsl(var(--text-primary))] font-mono focus:outline-none"
                        />
                        <span className="px-4 text-xs font-mono text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary)/0.5)] h-12 flex items-center border-l border-[hsl(var(--border))]">
                          .localhost:3000
                        </span>
                      </div>

                      {/* Slug Feedback */}
                      {slugStatus === 'checking' && (
                        <p className="text-[11px] text-[hsl(var(--text-secondary))] flex items-center gap-1 mt-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin text-[hsl(var(--accent))]" /> Checking availability...
                        </p>
                      )}
                      {slugStatus === 'available' && (
                        <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {slugMessage}
                        </p>
                      )}
                      {slugStatus === 'taken' && (
                        <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> {slugMessage}
                        </p>
                      )}
                    </div>

                    {/* Regional Jurisdiction */}
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                        Regional Jurisdiction / Province
                      </label>
                      <select
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                      >
                        {REGIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* 6-3-3-4 Streams & Levels */}
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2">
                        Education Streams &amp; Levels Offered *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {AVAILABLE_LEVELS.map(lvl => {
                          const isSelected = selectedLevels.includes(lvl.id);
                          return (
                            <div
                              key={lvl.id}
                              onClick={() => toggleLevel(lvl.id)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                                isSelected
                                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)]'
                                  : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] opacity-75'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white' : 'border-[hsl(var(--border))]'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[hsl(var(--text-primary))]">{lvl.label}</h4>
                                <p className="text-[10px] text-[hsl(var(--text-secondary))]">{lvl.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shifts */}
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2">
                        Operational Shifts
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {AVAILABLE_SHIFTS.map(shift => {
                          const isSelected = selectedShifts.includes(shift.id);
                          return (
                            <div
                              key={shift.id}
                              onClick={() => toggleShift(shift.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                isSelected
                                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)]'
                                  : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] opacity-75'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white' : 'border-[hsl(var(--border))]'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{shift.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 3 (Multi-School only): Campus Branches */}
              {/* ═══════════════════════════════════════════════════════ */}
              {step === 3 && orgMode === 'multi' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Campus Branches &amp; Member Schools
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
                      Add the initial member campuses governed by this diocesan / foundation board.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {branches.map((branch, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">Campus Branch #{i + 1}</span>
                          {branches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setBranches(branches.filter((_, idx) => idx !== i))}
                              className="text-[10px] text-red-400 hover:underline"
                            >
                              Remove Branch
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Campus Name (e.g. St. Edward Secondary)"
                            value={branch.name}
                            onChange={e => {
                              const next = [...branches];
                              next[i].name = e.target.value;
                              if (!next[i].slug) {
                                next[i].slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                              }
                              setBranches(next);
                            }}
                            className="h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))]"
                          />
                          <input
                            type="text"
                            placeholder="Branch Subdomain (e.g. st-edward)"
                            value={branch.slug}
                            onChange={e => {
                              const next = [...branches];
                              next[i].slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                              setBranches(next);
                            }}
                            className="h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] font-mono"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setBranches([...branches, { name: '', slug: '', schoolType: 'Secondary' }])}
                      className="w-full py-3 rounded-2xl border border-dashed border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.05)] transition-colors"
                    >
                      + Add Another Campus Branch
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP: Plan Selection */}
              {/* ═══════════════════════════════════════════════════════ */}
              {((step === 3 && orgMode === 'standalone') || (step === 4 && orgMode === 'multi')) && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Select Your Subscription Tier
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
                      All accounts include a 30-day full access trial. You can upgrade or switch anytime.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {PLANS.map(p => {
                      const isSelected = selectedPlan === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPlan(p.id as any)}
                          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                            isSelected
                              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)] shadow-xl shadow-[hsl(var(--accent)/0.15)] scale-[1.02]'
                              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-primary))]'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]">
                                {p.badge}
                              </span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[hsl(var(--accent))] text-white flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            <div>
                              <h3 className="font-black text-base text-[hsl(var(--text-primary))]">{p.name}</h3>
                              <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5">{p.desc}</p>
                            </div>

                            <div>
                              <div className="text-xl font-black text-[hsl(var(--text-primary))]">{p.price}</div>
                              <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{p.period}</span>
                            </div>

                            <ul className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
                              {p.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px]">
                                  <Check className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className={`py-2 rounded-xl text-center text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[hsl(var(--accent))] text-white'
                              : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'
                          }`}>
                            {isSelected ? 'Selected Tier' : 'Select Plan'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP: Administrator Profile */}
              {/* ═══════════════════════════════════════════════════════ */}
              {((step === 4 && orgMode === 'standalone') || (step === 5 && orgMode === 'multi')) && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      School Owner &amp; Primary Administrator
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
                      Create your administrative credentials. You will use this email and password to log in and manage your institution.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                        Administrator / Principal Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={e => setAdminName(e.target.value)}
                          placeholder="Dr. Samuel Koroma"
                          className="w-full h-12 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                        Work Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={e => setAdminEmail(e.target.value)}
                          placeholder="principal@albertacademy.edu.sl"
                          className="w-full h-12 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                        Create Administrator Password * (min. 6 characters)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-12 pl-10 pr-11 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={e => setAgreedTerms(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
                        />
                        <span className="text-xs text-[hsl(var(--text-secondary))] leading-normal">
                          I certify that I am authorized to register this institution and agree to the {APP_NAME}{' '}
                          <a href="#" className="text-[hsl(var(--accent))] hover:underline font-bold">Terms of Service</a> and{' '}
                          <a href="#" className="text-[hsl(var(--accent))] hover:underline font-bold">Data Sovereignty Policy</a>.
                        </span>
                      </label>
                    </div>

                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP: Review & Instant Launch */}
              {/* ═══════════════════════════════════════════════════════ */}
              {((step === 5 && orgMode === 'standalone') || (step === 6 && orgMode === 'multi')) && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Review &amp; Launch Portal
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
                      Confirm your institution details below and click Launch to spin up your dedicated portal.
                    </p>
                  </div>

                  {provisionError && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{provisionError}</span>
                    </div>
                  )}

                  {/* Summary Breakdown Grid */}
                  <div className="p-5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-[hsl(var(--border))]">
                      <div>
                        <span className="text-[hsl(var(--text-tertiary))] text-[10px] block">Institution Name</span>
                        <strong className="text-sm font-black text-[hsl(var(--text-primary))]">{orgName}</strong>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--text-tertiary))] text-[10px] block">Subdomain URL</span>
                        <strong className="text-sm font-mono text-[hsl(var(--accent))]">{orgSlug}.localhost:3000</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-[hsl(var(--border))]">
                      <div>
                        <span className="text-[hsl(var(--text-tertiary))] text-[10px] block">Structure</span>
                        <span className="font-bold text-[hsl(var(--text-primary))] capitalize">{orgMode === 'standalone' ? 'Single Standalone Campus' : 'Multi-School Group'}</span>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--text-tertiary))] text-[10px] block">Selected Plan</span>
                        <span className="font-bold text-emerald-400 capitalize">{selectedPlan} Tier</span>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--text-tertiary))] text-[10px] block">Region</span>
                        <span className="font-bold text-[hsl(var(--text-primary))]">{region}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[hsl(var(--text-tertiary))] text-[10px] block">Administrator Name</span>
                        <span className="font-bold text-[hsl(var(--text-primary))]">{adminName}</span>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--text-tertiary))] text-[10px] block">Login Email</span>
                        <span className="font-bold text-[hsl(var(--text-primary))]">{adminEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Provisioning Animation Box (when submitting) */}
                  {submitting && (
                    <div className="p-6 rounded-2xl bg-[hsl(var(--accent)/0.05)] border border-[hsl(var(--accent)/0.25)] space-y-3 text-center animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-[hsl(var(--accent))]">
                        <span>{provisionStepText}</span>
                        <span>{provisionProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div
                          className="h-full bg-[hsl(var(--accent))] transition-all duration-300 rounded-full"
                          style={{ width: `${provisionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* WIZARD NAVIGATION FOOTER */}
              {/* ═══════════════════════════════════════════════════════ */}
              <div className="pt-6 border-t border-[hsl(var(--border))] flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setStep(step - 1)}
                    className="px-5 py-3 rounded-2xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="px-4 py-2 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                  >
                    Cancel
                  </Link>
                )}

                {step < totalSteps ? (
                  <button
                    type="button"
                    disabled={!canProceed}
                    onClick={() => setStep(step + 1)}
                    className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-xs shadow-lg shadow-[hsl(var(--accent)/0.25)] hover:opacity-95 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canProceed || submitting}
                    onClick={handleLaunch}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-xs shadow-xl shadow-[hsl(var(--accent)/0.35)] hover:opacity-95 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Portal...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" /> Launch School Portal
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

        </div>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[hsl(var(--border))] py-6 text-center text-xs text-[hsl(var(--text-tertiary))]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} {APP_NAME} Enterprise. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[hsl(var(--text-secondary))] transition-colors">Platform Home</Link>
            <Link href="/#contact" className="hover:text-[hsl(var(--text-secondary))] transition-colors">Contact Implementation Team</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
