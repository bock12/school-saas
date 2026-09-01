'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  School, Building2, Shield, CheckCircle2, ArrowRight, ArrowLeft,
  Sparkles, Check, AlertCircle, RefreshCw, Eye, EyeOff, Lock,
  Mail, User, Globe, MapPin, Layers, ExternalLink, Zap, HelpCircle,
  Clock, Landmark, Plus, Trash2, ChevronRight
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

type InstitutionalStructure = 'standalone' | 'compound' | 'diocesan';

interface SchoolBranch {
  name: string;
  slug: string;
  schoolType: string;
  facilityName?: string;
  shiftType?: string;
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
  { id: 'Nursery', label: 'Nursery & Early Childhood', desc: 'Ages 3-5 foundation stream' },
  { id: 'Primary', label: 'Primary School (Class 1-6)', desc: 'NPSE national foundation' },
  { id: 'JSS', label: 'Junior Secondary (JSS 1-3)', desc: 'BECE basic education stream' },
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
    desc: 'Perfect for standalone primary or secondary schools getting started with digitized academic records.',
    recommendedFor: 'standalone',
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
    name: 'Compound Academy Hub',
    badge: 'Most Popular',
    price: 'NLe 8,500',
    period: 'per term / billed annually',
    desc: 'Full-featured multi-shift & multi-administration academic intelligence for shared campus compounds.',
    recommendedFor: 'compound',
    features: [
      'Multi-Shift Compound Oversight',
      'Autonomous Portals for Primary & Secondary',
      'Gemini 2.0 AI Lesson Plan Engine',
      'WAEC Electronic CASS Master Export',
      'Orange & AfriMoney Fee Gateway',
      'Online Admissions & Applicant Stepper',
    ],
  },
  {
    id: 'enterprise',
    name: 'Diocesan & Mission Board',
    badge: 'Multi-Campus',
    price: 'Custom',
    period: 'Tailored group contract',
    desc: 'Designed for mission boards, dioceses, and educational foundations managing multiple sister campuses.',
    recommendedFor: 'diocesan',
    features: [
      'Central Governing Board Radar',
      'Unlimited geographic campuses & branches',
      'Cross-school academic benchmarking',
      'Custom apex domain mapping',
      'Dedicated cloud instance & daily PITR',
      'Priority 24/7 SLA & on-site training',
    ],
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [structure, setStructure] = useState<InstitutionalStructure>('standalone');
  
  // School / Compound Identity
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugMessage, setSlugMessage] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [address, setAddress] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['JSS', 'SSS']);
  const [selectedShifts, setSelectedShifts] = useState<string[]>(['Morning Shift']);

  // Multi-school / Shift branches
  const [branches, setBranches] = useState<SchoolBranch[]>([
    { name: 'Primary School (Morning Shift)', slug: 'prim-am', schoolType: 'Primary', facilityName: 'Building A (Primary)', shiftType: 'Morning Shift' },
    { name: 'Primary School (Afternoon Shift)', slug: 'prim-pm', schoolType: 'Primary', facilityName: 'Building A (Primary)', shiftType: 'Afternoon Shift' },
    { name: 'Junior Secondary School (JSS)', slug: 'jss', schoolType: 'JSS', facilityName: 'Building B (Secondary)', shiftType: 'Morning Shift' },
    { name: 'Senior Secondary School (SSS)', slug: 'sss', schoolType: 'SSS', facilityName: 'Building B (Secondary)', shiftType: 'Afternoon Shift' },
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

  const orgMode = structure === 'standalone' ? 'standalone' : 'multi';
  const totalSteps = structure === 'standalone' ? 5 : 6;

  // Step definitions for visual stepper
  const stepLabels = useMemo(() => {
    if (structure === 'standalone') {
      return [
        { num: 1, title: 'Structure', desc: 'Single School' },
        { num: 2, title: 'Identity', desc: 'School Domain' },
        { num: 3, title: 'Plan', desc: 'Select Tier' },
        { num: 4, title: 'Admin', desc: 'Principal Profile' },
        { num: 5, title: 'Launch', desc: 'Instant Deploy' },
      ];
    }
    if (structure === 'compound') {
      return [
        { num: 1, title: 'Structure', desc: 'Compound' },
        { num: 2, title: 'Compound', desc: 'Campus Location' },
        { num: 3, title: 'Shifts', desc: 'Shift Portals' },
        { num: 4, title: 'Plan', desc: 'Select Tier' },
        { num: 5, title: 'Admin', desc: 'Master Profile' },
        { num: 6, title: 'Launch', desc: 'Instant Deploy' },
      ];
    }
    return [
      { num: 1, title: 'Structure', desc: 'Diocesan Board' },
      { num: 2, title: 'Secretariat', desc: 'Board Domain' },
      { num: 3, title: 'Campuses', desc: 'Sister Schools' },
      { num: 4, title: 'Plan', desc: 'Select Tier' },
      { num: 5, title: 'Admin', desc: 'Director Profile' },
      { num: 6, title: 'Launch', desc: 'Instant Deploy' },
    ];
  }, [structure]);

  // Auto-generate slug from school/compound name
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
    if (step === 1) return true;
    if (step === 2) {
      if (structure === 'standalone') {
        return (
          orgName.trim().length > 0 &&
          orgSlug.trim().length >= 2 &&
          slugStatus !== 'taken' &&
          selectedLevels.length > 0
        );
      }
      return (
        orgName.trim().length > 0 &&
        orgSlug.trim().length >= 2 &&
        slugStatus !== 'taken'
      );
    }
    if (step === 3) {
      if (structure !== 'standalone') {
        return branches.length > 0 && branches.every(b => b.name.trim() && b.slug.trim());
      }
      return true; // Plan selection for standalone
    }
    if (step === 4) {
      if (structure !== 'standalone') return true; // Plan selection for multi
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
  }, [step, structure, orgName, orgSlug, slugStatus, selectedLevels, branches, adminName, adminEmail, password, agreedTerms]);

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
          schoolLevels: structure === 'standalone' ? selectedLevels : [],
          schoolShifts: structure === 'standalone' ? selectedShifts : [],
          schools: structure !== 'standalone' ? branches : [],
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
      
      {/* ── Top Responsive Header ───────────────────────────────────── */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary)/0.85)] backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md shadow-[hsl(var(--accent)/0.3)] transition-transform group-hover:scale-105">
              N
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight text-[hsl(var(--text-primary))] block leading-none">
                {APP_NAME}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block mt-0.5">
                Self-Service Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="text-[hsl(var(--text-secondary))] hidden md:inline font-medium">Already registered?</span>
            <Link
              href="/#institutions"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] text-[11px] sm:text-xs font-bold text-[hsl(var(--text-primary))] hover:text-[hsl(var(--accent))] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>Institutions Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Onboarding Container ───────────────────────────────── */}
      <main className="max-w-5xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        
        {/* Responsive Progress Stepper */}
        {!provisionSuccess && (
          <div className="mb-6 sm:mb-8 space-y-4">
            
            {/* Desktop / Tablet Multi-Step Bar */}
            <div className="hidden sm:grid grid-flow-col auto-cols-fr gap-2 pb-2">
              {stepLabels.map((s, idx) => {
                const isCurrent = step === s.num;
                const isPassed = step > s.num;

                return (
                  <div
                    key={s.num}
                    onClick={() => {
                      if (isPassed) setStep(s.num);
                    }}
                    className={`relative p-2.5 rounded-2xl border transition-all flex items-center gap-2.5 select-none ${
                      isCurrent
                        ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] shadow-sm'
                        : isPassed
                        ? 'border-emerald-500/30 bg-emerald-500/5 cursor-pointer hover:border-emerald-500/50'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary)/0.5)] opacity-60'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-[hsl(var(--accent))] text-white shadow-xs'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]'
                    }`}>
                      {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                    </div>

                    <div className="min-w-0 flex-1 truncate">
                      <span className={`text-[11px] font-bold block truncate leading-tight ${
                        isCurrent ? 'text-[hsl(var(--text-primary))]' : isPassed ? 'text-emerald-400' : 'text-[hsl(var(--text-secondary))]'
                      }`}>
                        {s.title}
                      </span>
                      <span className="text-[9px] text-[hsl(var(--text-tertiary))] block truncate">
                        {s.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Compact Stepper */}
            <div className="sm:hidden p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider text-[10px]">
                  Step {step} of {totalSteps}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-[11px] font-black">
                  {stepLabels[step - 1]?.title || 'Configuration'}
                </span>
              </div>
              
              <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] transition-all duration-300 rounded-full"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

          </div>
        )}

        {/* Wizard Card Container */}
        <div className="glass-card rounded-3xl border border-[hsl(var(--border))] p-4.5 sm:p-8 lg:p-10 shadow-2xl bg-[hsl(var(--bg-secondary))] transition-all">
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SUCCESS SCREEN */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {provisionSuccess ? (
            <div className="text-center py-6 sm:py-8 space-y-5 sm:space-y-6 animate-in fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Tenant Environment Provisioned
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">
                  Congratulations, {provisionSuccess.name}!
                </h2>
                <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] max-w-md mx-auto leading-relaxed">
                  Your dedicated multi-tenant school environment is live and ready for staff enrollment and academic scheduling.
                </p>
              </div>

              {/* Subdomain & Credentials Summary */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] max-w-md mx-auto text-left space-y-3 text-xs">
                <div>
                  <span className="text-[hsl(var(--text-tertiary))] font-mono uppercase block text-[10px]">Primary Portal URL</span>
                  <a
                    href={getPortalLoginUrl(provisionSuccess.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-sm font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1.5 mt-0.5 break-all"
                  >
                    <span>{provisionSuccess.slug}.localhost:3000</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>

                <div className="pt-2.5 border-t border-[hsl(var(--border))] grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))] block text-[10px]">Admin Username</span>
                    <span className="font-bold text-[hsl(var(--text-primary))] truncate block">{provisionSuccess.adminEmail}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))] block text-[10px]">Assigned Role</span>
                    <span className="font-bold text-emerald-400 capitalize">{provisionSuccess.role.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Launch CTA */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getPortalLoginUrl(provisionSuccess.slug)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-xs sm:text-sm shadow-xl shadow-[hsl(var(--accent)/0.3)] hover:opacity-95 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <span>Launch School Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 1: Institutional Model Selection */}
              {/* ═══════════════════════════════════════════════════════ */}
              {step === 1 && (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Select Institutional Structure
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Choose how your institution is structured. This ensures the correct dashboards, shift configurations, and portals are provisioned.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4.5 pt-1 sm:pt-2">
                    
                    {/* Option 1: Single Standalone School */}
                    <div
                      onClick={() => setStructure('standalone')}
                      className={`p-4.5 sm:p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 relative flex flex-col justify-between ${
                        structure === 'standalone'
                          ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-primary))]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                            <School className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase">
                            1 School Portal
                          </span>
                        </div>

                        <div>
                          <h3 className="font-black text-sm sm:text-base text-[hsl(var(--text-primary))]">
                            Single Autonomous School
                          </h3>
                          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 leading-relaxed">
                            For a single independent school run by one Principal or Head Teacher (e.g. standalone academy).
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-[11px]">
                        <span className="text-[hsl(var(--text-tertiary))]">Single Campus</span>
                        {structure === 'standalone' && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Option 2: Shared Compound / Multi-Shift Campus (HIGHLIGHTED) */}
                    <div
                      onClick={() => {
                        setStructure('compound');
                        setSelectedPlan('pro');
                        const baseSlug = orgSlug || 'compound';
                        setBranches([
                          { name: 'Primary School (Morning Shift)', slug: `${baseSlug}-prim-am`, schoolType: 'Primary', facilityName: 'Building A (Primary)', shiftType: 'Morning Shift (Class 1-3)' },
                          { name: 'Primary School (Afternoon Shift)', slug: `${baseSlug}-prim-pm`, schoolType: 'Primary', facilityName: 'Building A (Primary)', shiftType: 'Afternoon Shift (Class 4-6)' },
                          { name: 'Junior Secondary School (JSS)', slug: `${baseSlug}-jss`, schoolType: 'JSS', facilityName: 'Building B (Secondary)', shiftType: 'Morning Shift (JSS 1-3)' },
                          { name: 'Senior Secondary School (SSS)', slug: `${baseSlug}-sss`, schoolType: 'SSS', facilityName: 'Building B (Secondary)', shiftType: 'Afternoon Shift (SSS 1-3)' },
                        ]);
                      }}
                      className={`p-4.5 sm:p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 relative flex flex-col justify-between ${
                        structure === 'compound'
                          ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-primary))]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                            <Layers className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-black uppercase">
                            Recommended
                          </span>
                        </div>

                        <div>
                          <h3 className="font-black text-sm sm:text-base text-[hsl(var(--text-primary))]">
                            Multi-Shift Compound
                          </h3>
                          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 leading-relaxed">
                            For schools sharing the same location with separate administrations (Primary AM/PM, JSS Morning, SSS Afternoon).
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-[11px]">
                        <span className="text-amber-400 font-bold">4 Autonomous Shift Portals</span>
                        {structure === 'compound' && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Option 3: Diocesan Board / Geographic Multi-Campus Network */}
                    <div
                      onClick={() => {
                        setStructure('diocesan');
                        setSelectedPlan('enterprise');
                        const baseSlug = orgSlug || 'board';
                        setBranches([
                          { name: 'Central Freetown Campus', slug: `${baseSlug}-freetown`, schoolType: 'Secondary', facilityName: 'Freetown Branch' },
                          { name: 'Bo District Provincial Branch', slug: `${baseSlug}-bo`, schoolType: 'Secondary', facilityName: 'Bo Campus' },
                          { name: 'Kenema Eastern Branch', slug: `${baseSlug}-kenema`, schoolType: 'Secondary', facilityName: 'Kenema Campus' },
                        ]);
                      }}
                      className={`p-4.5 sm:p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 relative flex flex-col justify-between ${
                        structure === 'diocesan'
                          ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-primary))]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase">
                            Multi-Campus
                          </span>
                        </div>

                        <div>
                          <h3 className="font-black text-sm sm:text-base text-[hsl(var(--text-primary))]">
                            Diocesan / Mission Board
                          </h3>
                          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 leading-relaxed">
                            For educational foundations, mission secretariats, and school groups across multiple cities/towns.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-[11px]">
                        <span className="text-purple-400 font-bold">Central Radar + Campuses</span>
                        {structure === 'diocesan' && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 2: Identity & Subdomain (Tailored per Structure) */}
              {/* ═══════════════════════════════════════════════════════ */}
              {step === 2 && (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1 bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)]">
                      {structure === 'standalone' && <School className="w-3.5 h-3.5" />}
                      {structure === 'compound' && <Layers className="w-3.5 h-3.5" />}
                      {structure === 'diocesan' && <Building2 className="w-3.5 h-3.5" />}
                      <span>
                        {structure === 'standalone' && 'Single School Setup'}
                        {structure === 'compound' && 'Shared Compound Setup'}
                        {structure === 'diocesan' && 'Diocesan Secretariat Setup'}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      {structure === 'standalone' && 'School Identity & Subdomain Claim'}
                      {structure === 'compound' && 'Compound Identity & Shared Campus Location'}
                      {structure === 'diocesan' && 'Diocesan Secretariat & Oversight Domain'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      {structure === 'standalone' && 'Reserve your school’s official academic domain and configure your national education framework.'}
                      {structure === 'compound' && 'Define the central name, address, and primary portal address for this shared educational compound.'}
                      {structure === 'diocesan' && 'Define the governing board name and central executive radar domain for your educational network.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Institution / Compound Name */}
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                        {structure === 'standalone' && 'Official School Name *'}
                        {structure === 'compound' && 'Compound / Educational Complex Name *'}
                        {structure === 'diocesan' && 'Diocesan Secretariat / Board Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder={
                          structure === 'standalone'
                            ? 'e.g. Regent International Academy'
                            : structure === 'compound'
                            ? 'e.g. St. Edward\'s Educational Complex'
                            : 'e.g. Catholic Education Secretariat Sierra Leone'
                        }
                        className="w-full h-11 sm:h-12 px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs sm:text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                      />
                    </div>

                    {/* Subdomain Claim Input (Responsive suffix) */}
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                        {structure === 'standalone' && 'Claim School Subdomain *'}
                        {structure === 'compound' && 'Claim Compound Central Subdomain *'}
                        {structure === 'diocesan' && 'Claim Secretariat Master Subdomain *'}
                      </label>
                      
                      <div className="flex items-center rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] overflow-hidden focus-within:border-[hsl(var(--accent))] transition-colors">
                        <input
                          type="text"
                          required
                          value={orgSlug}
                          onChange={e => setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                          placeholder={structure === 'standalone' ? 'regent-academy' : structure === 'compound' ? 'sted-complex' : 'catholic-education'}
                          className="flex-1 h-11 sm:h-12 px-3.5 sm:px-4 bg-transparent text-xs sm:text-sm text-[hsl(var(--text-primary))] font-mono focus:outline-none min-w-0"
                        />
                        <span className="px-2.5 sm:px-4 text-[11px] sm:text-xs font-mono text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary)/0.5)] h-11 sm:h-12 flex items-center border-l border-[hsl(var(--border))] shrink-0">
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
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{slugMessage}</span>
                        </p>
                      )}
                      {slugStatus === 'taken' && (
                        <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{slugMessage}</span>
                        </p>
                      )}
                    </div>

                    {/* Regional Jurisdiction & Address Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                          {structure === 'standalone' ? 'Campus Region / Province *' : 'Headquarters / Compound Jurisdiction *'}
                        </label>
                        <select
                          value={region}
                          onChange={e => setRegion(e.target.value)}
                          className="w-full h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs sm:text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                        >
                          {REGIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      {structure !== 'standalone' && (
                        <div>
                          <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                            {structure === 'compound' ? 'Physical Campus Address' : 'Headquarters Secretariat Address'}
                          </label>
                          <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder={structure === 'compound' ? 'e.g. Kingtom Compound, Freetown' : 'e.g. Cathedral Secretariat, Freetown'}
                            className="w-full h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs sm:text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                          />
                        </div>
                      )}
                    </div>

                    {/* 6-3-3-4 Streams & Levels (FOR STANDALONE SCHOOLS ONLY) */}
                    {structure === 'standalone' && (
                      <div className="space-y-4 pt-1">
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
                                  className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 sm:gap-3 ${
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
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{lvl.label}</h4>
                                    <p className="text-[10px] text-[hsl(var(--text-secondary))] truncate">{lvl.desc}</p>
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
                                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 sm:gap-3 ${
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
                                  <span className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{shift.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 3 (Compound Mode): Shift & Facility Configurator */}
              {/* ═══════════════════════════════════════════════════════ */}
              {step === 3 && structure === 'compound' && (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold">
                      <Layers className="w-3.5 h-3.5" /> Compound Shift Configurator
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Configure Shift Administrations &amp; Facilities
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Set up the autonomous school sections operating across morning and afternoon shifts in your compound buildings.
                    </p>
                  </div>

                  {/* Compound Quick Templates (Responsive Chips) */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                      ⚡ Quick Compound Templates (1-Click Setup):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const baseName = orgName || 'Compound';
                          const baseSlug = orgSlug || 'compound';
                          setBranches([
                            { name: `${baseName} Primary (Morning Shift)`, slug: `${baseSlug}-prim-am`, schoolType: 'Primary', facilityName: 'Building A (Primary)', shiftType: 'Morning Shift (Class 1-3)' },
                            { name: `${baseName} Primary (Afternoon Shift)`, slug: `${baseSlug}-prim-pm`, schoolType: 'Primary', facilityName: 'Building A (Primary)', shiftType: 'Afternoon Shift (Class 4-6)' },
                            { name: `${baseName} Junior Secondary (JSS)`, slug: `${baseSlug}-jss`, schoolType: 'JSS', facilityName: 'Building B (Secondary)', shiftType: 'Morning Shift (JSS 1-3)' },
                            { name: `${baseName} Senior Secondary (SSS)`, slug: `${baseSlug}-sss`, schoolType: 'SSS', facilityName: 'Building B (Secondary)', shiftType: 'Afternoon Shift (SSS 1-3)' },
                          ]);
                        }}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] hover:border-amber-400 text-[11px] sm:text-xs font-bold text-[hsl(var(--text-primary))] transition-all shadow-xs"
                      >
                        🏛️ Standard 4-Shift Compound
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const baseName = orgName || 'Secondary';
                          const baseSlug = orgSlug || 'sec';
                          setBranches([
                            { name: `${baseName} Junior Secondary (Morning Shift)`, slug: `${baseSlug}-jss`, schoolType: 'JSS', facilityName: 'Secondary Block', shiftType: 'Morning Shift (JSS 1-3)' },
                            { name: `${baseName} Senior Secondary (Afternoon Shift)`, slug: `${baseSlug}-sss`, schoolType: 'SSS', facilityName: 'Secondary Block', shiftType: 'Afternoon Shift (SSS 1-3)' },
                          ]);
                        }}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] hover:border-amber-400 text-[11px] sm:text-xs font-bold text-[hsl(var(--text-primary))] transition-all shadow-xs"
                      >
                        🏫 Secondary Only (JSS AM + SSS PM)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const baseName = orgName || 'Primary';
                          const baseSlug = orgSlug || 'prim';
                          setBranches([
                            { name: `${baseName} Primary (Morning Class 1-3)`, slug: `${baseSlug}-am`, schoolType: 'Primary', facilityName: 'Primary Block', shiftType: 'Morning Shift' },
                            { name: `${baseName} Primary (Afternoon Class 4-6)`, slug: `${baseSlug}-pm`, schoolType: 'Primary', facilityName: 'Primary Block', shiftType: 'Afternoon Shift' },
                          ]);
                        }}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] hover:border-amber-400 text-[11px] sm:text-xs font-bold text-[hsl(var(--text-primary))] transition-all shadow-xs"
                      >
                        🎒 Primary Only (Class 1-3 AM + 4-6 PM)
                      </button>
                    </div>
                  </div>

                  {/* List of Shift Entities (Fully Responsive Card Layout) */}
                  <div className="space-y-3">
                    {branches.map((branch, i) => (
                      <div key={i} className="p-3.5 sm:p-4.5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] sm:text-[11px] font-black flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">
                              {branch.facilityName || `Section #${i + 1}`}
                            </span>
                            {branch.shiftType && (
                              <span className="hidden sm:inline text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-secondary))] font-mono truncate">
                                {branch.shiftType}
                              </span>
                            )}
                          </div>

                          {branches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setBranches(branches.filter((_, idx) => idx !== i))}
                              className="text-[10px] text-red-400 hover:underline flex items-center gap-1 shrink-0 p-1"
                            >
                              <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Remove Section</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-bold text-[hsl(var(--text-tertiary))] mb-1">
                              Autonomous Section Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. St. Edward's JSS (Morning Shift)"
                              value={branch.name}
                              onChange={e => {
                                const next = [...branches];
                                next[i].name = e.target.value;
                                if (!next[i].slug) {
                                  next[i].slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                }
                                setBranches(next);
                              }}
                              className="w-full h-10 sm:h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] font-medium focus:border-[hsl(var(--accent))]"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold text-[hsl(var(--text-tertiary))] mb-1">
                              Dedicated Subdomain *
                            </label>
                            <div className="flex items-center rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] overflow-hidden">
                              <input
                                type="text"
                                required
                                placeholder="sted-jss"
                                value={branch.slug}
                                onChange={e => {
                                  const next = [...branches];
                                  next[i].slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                  setBranches(next);
                                }}
                                className="w-full h-10 sm:h-11 px-3 bg-transparent text-xs text-[hsl(var(--text-primary))] font-mono focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-[hsl(var(--text-tertiary))] mb-1">
                              Academic Stream
                            </label>
                            <select
                              value={branch.schoolType}
                              onChange={e => {
                                const next = [...branches];
                                next[i].schoolType = e.target.value;
                                setBranches(next);
                              }}
                              className="w-full h-10 sm:h-11 px-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] font-bold focus:border-[hsl(var(--accent))]"
                            >
                              <option value="Primary">Primary (Class 1-6)</option>
                              <option value="JSS">Junior Sec (JSS 1-3)</option>
                              <option value="SSS">Senior Sec (SSS 1-3)</option>
                              <option value="Secondary">Secondary (JSS+SSS)</option>
                              <option value="Nursery">Nursery / Early</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setBranches([...branches, { name: '', slug: '', schoolType: 'Secondary', facilityName: 'Additional Building', shiftType: 'Morning Shift' }])}
                      className="w-full py-3 sm:py-3.5 rounded-2xl border border-dashed border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.05)] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> <span>Add Another Shift Administration / Facility</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 3 (Diocesan Mode): Geographic Sister Schools */}
              {/* ═══════════════════════════════════════════════════════ */}
              {step === 3 && structure === 'diocesan' && (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-bold">
                      <Building2 className="w-3.5 h-3.5" /> Diocesan &amp; Mission Network
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Add Regional Sister Schools &amp; Campuses
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Add the satellite schools and institutions governed across different towns, districts, and provinces.
                    </p>
                  </div>

                  {/* List of Geographic Campuses */}
                  <div className="space-y-3">
                    {branches.map((branch, i) => (
                      <div key={i} className="p-3.5 sm:p-4.5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] sm:text-[11px] font-black flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">
                              Regional Campus #{i + 1}
                            </span>
                          </div>

                          {branches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setBranches(branches.filter((_, idx) => idx !== i))}
                              className="text-[10px] text-red-400 hover:underline flex items-center gap-1 shrink-0 p-1"
                            >
                              <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Remove Campus</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-bold text-[hsl(var(--text-tertiary))] mb-1">
                              School / Campus Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Christ the King College (CKC)"
                              value={branch.name}
                              onChange={e => {
                                const next = [...branches];
                                next[i].name = e.target.value;
                                if (!next[i].slug) {
                                  next[i].slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                }
                                setBranches(next);
                              }}
                              className="w-full h-10 sm:h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] font-medium focus:border-[hsl(var(--accent))]"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold text-[hsl(var(--text-tertiary))] mb-1">
                              Campus Subdomain *
                            </label>
                            <div className="flex items-center rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] overflow-hidden">
                              <input
                                type="text"
                                required
                                placeholder="ckc-bo"
                                value={branch.slug}
                                onChange={e => {
                                  const next = [...branches];
                                  next[i].slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                  setBranches(next);
                                }}
                                className="w-full h-10 sm:h-11 px-3 bg-transparent text-xs text-[hsl(var(--text-primary))] font-mono focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-[hsl(var(--text-tertiary))] mb-1">
                              Campus Type
                            </label>
                            <select
                              value={branch.schoolType}
                              onChange={e => {
                                const next = [...branches];
                                next[i].schoolType = e.target.value;
                                setBranches(next);
                              }}
                              className="w-full h-10 sm:h-11 px-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] font-bold focus:border-[hsl(var(--accent))]"
                            >
                              <option value="Secondary">Secondary School</option>
                              <option value="Primary">Primary School</option>
                              <option value="TVET">Technical / Vocational</option>
                              <option value="Tertiary">College / Tertiary</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setBranches([...branches, { name: '', slug: '', schoolType: 'Secondary' }])}
                      className="w-full py-3 sm:py-3.5 rounded-2xl border border-dashed border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.05)] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> <span>Add Another Satellite Campus</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP: Plan Selection (Responsive Cards) */}
              {/* ═══════════════════════════════════════════════════════ */}
              {((step === 3 && structure === 'standalone') || (step === 4 && structure !== 'standalone')) && (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Select Your Subscription Tier
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      All accounts include a 30-day full access trial. You can upgrade or switch anytime.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4.5 pt-1 sm:pt-2">
                    {PLANS.map(p => {
                      const isSelected = selectedPlan === p.id;
                      const isRecommended = p.recommendedFor === structure;

                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPlan(p.id as any)}
                          className={`p-4.5 sm:p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                            isSelected
                              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)] shadow-xl shadow-[hsl(var(--accent)/0.15)] sm:scale-[1.02]'
                              : isRecommended
                              ? 'border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--bg-primary))]'
                              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-primary))]'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isRecommended
                                  ? 'bg-[hsl(var(--accent))] text-white'
                                  : 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]'
                              }`}>
                                {isRecommended ? 'Recommended' : p.badge}
                              </span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[hsl(var(--accent))] text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            <div>
                              <h3 className="font-black text-sm sm:text-base text-[hsl(var(--text-primary))]">{p.name}</h3>
                              <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5 leading-tight">{p.desc}</p>
                            </div>

                            <div>
                              <div className="text-lg sm:text-xl font-black text-[hsl(var(--text-primary))]">{p.price}</div>
                              <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{p.period}</span>
                            </div>

                            <ul className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
                              {p.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px]">
                                  <Check className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0 mt-0.5" />
                                  <span className="leading-tight">{f}</span>
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
              {((step === 4 && structure === 'standalone') || (step === 5 && structure !== 'standalone')) && (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      {structure === 'standalone' && 'School Principal / Primary Administrator'}
                      {structure === 'compound' && 'Compound Proprietor / Master Administrator'}
                      {structure === 'diocesan' && 'Education Secretary / Diocesan Director'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      {structure === 'standalone' && 'Create your administrative credentials to manage this school’s academic schedule and students.'}
                      {structure === 'compound' && 'This master account accesses the central Compound Radar to oversee all shift portals and assign Principals.'}
                      {structure === 'diocesan' && 'This executive account accesses the Diocesan Control Plane to monitor all provincial campuses.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                          {structure === 'standalone' ? 'Principal / Head Teacher Name *' : 'Master Admin / Proprietor Name *'}
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                          <input
                            type="text"
                            required
                            value={adminName}
                            onChange={e => setAdminName(e.target.value)}
                            placeholder="Dr. Samuel Koroma"
                            className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs sm:text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                          Official Work Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                          <input
                            type="email"
                            required
                            value={adminEmail}
                            onChange={e => setAdminEmail(e.target.value)}
                            placeholder={structure === 'standalone' ? 'principal@school.edu.sl' : 'director@compound.edu.sl'}
                            className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs sm:text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                          />
                        </div>
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
                          className="w-full h-11 sm:h-12 pl-10 pr-11 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs sm:text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
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
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={e => setAgreedTerms(e.target.checked)}
                          className="mt-0.5 rounded text-[hsl(var(--accent))] focus:ring-0"
                        />
                        <span className="text-[11px] sm:text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                          I acknowledge that I am an authorized representative of this institution and agree to the{' '}
                          <a href="#terms" className="text-[hsl(var(--accent))] underline">Terms of Service</a> &amp;{' '}
                          <a href="#privacy" className="text-[hsl(var(--accent))] underline">Privacy Policy</a>.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP: Review & Instant Launch */}
              {/* ═══════════════════════════════════════════════════════ */}
              {((step === 5 && structure === 'standalone') || (step === 6 && structure !== 'standalone')) && (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                      Review &amp; Instant Launch
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Review your setup configuration. Click below to provision your dedicated database and launch your portals.
                    </p>
                  </div>

                  {provisionError && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{provisionError}</span>
                    </div>
                  )}

                  {/* Configuration Summary Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                      <div>
                        <span className="text-[9px] sm:text-[10px] text-[hsl(var(--text-tertiary))] font-mono uppercase">
                          {structure === 'standalone' ? 'School' : structure === 'compound' ? 'Compound' : 'Secretariat'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[hsl(var(--text-primary))] truncate max-w-[220px] sm:max-w-md">
                          {orgName}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] font-bold text-[9px] sm:text-[10px] uppercase">
                        {structure === 'standalone' ? 'Standalone' : structure === 'compound' ? 'Compound' : 'Diocesan'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase block">Primary Subdomain</span>
                        <span className="font-mono font-bold text-[hsl(var(--accent))] text-xs truncate block">
                          {orgSlug}.localhost:3000
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase block">Selected Plan</span>
                        <span className="font-bold text-[hsl(var(--text-primary))] capitalize">
                          {selectedPlan} Tier (30-Day Free Trial)
                        </span>
                      </div>
                    </div>

                    {/* Member Schools Summary */}
                    {structure !== 'standalone' && branches.length > 0 && (
                      <div className="pt-2 border-t border-[hsl(var(--border))] space-y-2">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block">
                          Autonomous Shift Portals to be Created ({branches.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {branches.map((b, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex items-center justify-between text-[11px] gap-2">
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-[hsl(var(--text-primary))] block truncate">{b.name}</span>
                                <span className="text-[10px] text-[hsl(var(--text-secondary))] font-mono truncate block">{b.slug}.localhost:3000</span>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] font-bold text-[hsl(var(--accent))] shrink-0">
                                {b.schoolType}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[hsl(var(--border))] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase block">Primary Administrator</span>
                        <span className="font-bold text-[hsl(var(--text-primary))] truncate block">{adminName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase block">Admin Email</span>
                        <span className="font-bold text-[hsl(var(--text-primary))] truncate block">{adminEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Provisioning Progress Bar */}
                  {submitting && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[hsl(var(--accent)/0.05)] border border-[hsl(var(--accent)/0.2)] space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-bold gap-2">
                        <span className="text-[hsl(var(--text-primary))] flex items-center gap-2 truncate">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[hsl(var(--accent))] shrink-0" />
                          <span className="truncate">{provisionStepText}</span>
                        </span>
                        <span className="text-[hsl(var(--accent))] shrink-0">{provisionProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-primary))] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] transition-all duration-300 rounded-full"
                          style={{ width: `${provisionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Final Launch Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleLaunch}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-xs sm:text-sm shadow-xl shadow-[hsl(var(--accent)/0.3)] hover:opacity-95 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Provisioning Environment...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Launch School Environment Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* WIZARD NAVIGATION CONTROLS (Responsive Buttons) */}
              {/* ═══════════════════════════════════════════════════════ */}
              {!submitting && (
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[hsl(var(--border))] flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(prev => Math.max(1, prev - 1))}
                      className="px-4 sm:px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < totalSteps && (
                    <button
                      type="button"
                      disabled={!canProceed}
                      onClick={() => setStep(prev => Math.min(totalSteps, prev + 1))}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold shadow-lg shadow-[hsl(var(--accent)/0.25)] hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}

        </div>

      </main>

      {/* ── Responsive Footer ───────────────────────────────────────── */}
      <footer className="py-4 sm:py-6 border-t border-[hsl(var(--border))] text-center text-[10px] sm:text-xs text-[hsl(var(--text-tertiary))] px-4">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Ministry of Basic and Senior Secondary Education (MBSSE) &amp; WAEC Aligned.</p>
      </footer>

    </div>
  );
}
