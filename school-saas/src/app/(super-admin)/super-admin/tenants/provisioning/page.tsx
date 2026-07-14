'use client';

import { useState, useCallback } from 'react';
import {
  Building2, CreditCard, Blocks, User, CheckCircle2, Database,
  Shield, ArrowRight, ArrowLeft, School, GraduationCap, Plus,
  Trash2, Globe, Server, Zap, Check, Info, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionPlan } from '@/features/tenant-management/types/hierarchy';
import { hierarchyApi } from '@/features/tenant-management/api/hierarchy.api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type OrgMode = 'standalone' | 'multi';

interface SchoolEntry {
  id: string;
  name: string;
  slug: string;
  schoolType: string;
  schoolLevels: string[];
  schoolShifts: string[];
}

interface WizardData {
  // Step 1
  orgMode: OrgMode;
  // Step 2 – Identity
  orgName: string;
  orgSlug: string;    // only standalone uses this
  region: string;
  schoolLevels: string[]; // only standalone uses this
  schoolShifts: string[]; // only standalone uses this
  // Step 3 – Schools (multi-school mode)
  schools: SchoolEntry[];
  // Step 4 – Subscription
  plan: SubscriptionPlan;
  // Step 5 – Modules
  modules: string[];
  // Step 6 – Admin
  adminName: string;
  adminEmail: string;
}

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------
const STEPS = [
  { id: 'type',         label: 'Type',         icon: Building2 },
  { id: 'identity',     label: 'Identity',     icon: Globe },
  { id: 'schools',      label: 'Schools',      icon: GraduationCap },
  { id: 'subscription', label: 'Plan',         icon: CreditCard },
  { id: 'modules',      label: 'Modules',      icon: Blocks },
  { id: 'admin',        label: 'Admin',        icon: User },
  { id: 'review',       label: 'Review',       icon: CheckCircle2 },
];

const PLAN_OPTIONS: { value: SubscriptionPlan; label: string; price: string; desc: string; color: string }[] = [
  { value: 'trial',      label: 'Trial',        price: 'Free / 30 days', desc: 'Explore before committing',    color: 'border-yellow-500/40 bg-yellow-500/8' },
  { value: 'starter',    label: 'Starter',      price: '$29/mo',         desc: 'Up to 100 students',           color: 'border-teal-500/40 bg-teal-500/8' },
  { value: 'pro',        label: 'Professional', price: '$79/mo',         desc: 'Up to 500 students, 5 admins', color: 'border-blue-500/40 bg-blue-500/8' },
  { value: 'enterprise', label: 'Enterprise',   price: '$199/mo',        desc: 'Unlimited, API access, SSO',   color: 'border-indigo-500/40 bg-indigo-500/8' },
];

const MODULES = [
  { id: 'core',      name: 'Core SIS',              desc: 'Student info, attendance, grades', required: true },
  { id: 'finance',   name: 'Finance & Billing',      desc: 'Invoices, fee collection, payroll' },
  { id: 'lms',       name: 'Learning Management',    desc: 'Assignments, quizzes, courses' },
  { id: 'hr',        name: 'HR & Staffing',          desc: 'Leave, staff portal, payroll' },
  { id: 'transport', name: 'Transport & Fleet',      desc: 'Bus tracking, routes, fees' },
  { id: 'hostel',    name: 'Hostel & Dormitory',     desc: 'Room allocation, wardens, visitors' },
  { id: 'library',   name: 'Library Management',     desc: 'Books, loans, catalogues' },
  { id: 'parents',   name: 'Parent Portal',          desc: 'Progress reports, payments, alerts' },
];

const REGIONS = [
  'US East (N. Virginia)',
  'US West (Oregon)',
  'EU (Frankfurt)',
  'EU (Ireland)',
  'Asia Pacific (Singapore)',
  'Asia Pacific (Sydney)',
  'Africa (Cape Town)',
];

const SCHOOL_TYPES = ['Primary', 'Secondary / High School', 'Kindergarten', 'College', 'Vocational'];

const SCHOOL_LEVELS = [
  { value: 'kindergarten', label: 'Kindergarten / Pre-School' },
  { value: 'primary',      label: 'Primary / Elementary' },
  { value: 'junior',       label: 'Junior / Middle School' },
  { value: 'secondary',    label: 'Secondary / High School' },
  { value: 'college',      label: 'College / University' },
  { value: 'vocational',   label: 'Vocational / Technical' },
];

const SCHOOL_SHIFTS = [
  { value: 'morning',   label: 'Morning Shift' },
  { value: 'afternoon', label: 'Afternoon Shift' },
  { value: 'evening',   label: 'Evening / Night Shift' },
];

function slugify(v: string) {
  return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function isValidSlug(s: string) {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s) || /^[a-z0-9]{2,}$/.test(s);
}

// ---------------------------------------------------------------------------
export default function ProvisioningWizardPage() {
  const [step, setStep] = useState(0);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [provisionDone, setProvisionDone] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  const [data, setData] = useState<WizardData>({
    orgMode: 'standalone',
    orgName: '',
    orgSlug: '',
    region: REGIONS[0],
    schoolLevels: [],
    schoolShifts: [],
    schools: [{ id: '1', name: '', slug: '', schoolType: 'Primary', schoolLevels: [], schoolShifts: [] }],
    plan: 'starter',
    modules: ['core'],
    adminName: '',
    adminEmail: '',
  });

  // Computed: which step indices to show (skip 'schools' for standalone)
  const visibleSteps = STEPS.filter(s =>
    data.orgMode === 'standalone' ? s.id !== 'schools' : true
  );
  const currentStepDef = visibleSteps[step];
  const totalSteps = visibleSteps.length;

  const set = useCallback(<K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const next = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const addSchool = () => {
    set('schools', [...data.schools, { id: String(Date.now()), name: '', slug: '', schoolType: 'Primary', schoolLevels: [], schoolShifts: [] }]);
  };

  const updateSchool = (id: string, field: keyof SchoolEntry, value: any) => {
    set('schools', data.schools.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      // Auto-slug from name if not manually set
      if (field === 'name' && !s.slug) updated.slug = slugify(value);
      return updated;
    }));
  };

  const toggleSchoolArrayItem = (id: string, field: 'schoolLevels' | 'schoolShifts', item: string) => {
    set('schools', data.schools.map(s => {
      if (s.id !== id) return s;
      const arr = s[field] as string[];
      const newArr = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
      return { ...s, [field]: newArr };
    }));
  };

  const toggleArrayItem = (field: 'schoolLevels' | 'schoolShifts', item: string) => {
    const arr = data[field] as string[];
    const newArr = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
    set(field, newArr);
  };

  const removeSchool = (id: string) => {
    if (data.schools.length <= 1) return;
    set('schools', data.schools.filter(s => s.id !== id));
  };

  const handleProvision = async () => {
    setIsProvisioning(true);
    setProvisionError(null);
    setProvisionProgress(10);

    try {
      // Animate progress while waiting for the API
      const ticker = setInterval(() => {
        setProvisionProgress(p => Math.min(p + 8, 88));
      }, 400);

      await hierarchyApi.provisionOrganization({
        orgName: data.orgName,
        orgMode: data.orgMode,
        orgSlug: data.orgSlug,
        region: data.region,
        plan: data.plan,
        isStandaloneSchool: data.orgMode === 'standalone',
        schools: data.schools,
        schoolLevels: data.orgMode === 'standalone' ? data.schoolLevels : [],
        schoolShifts: data.orgMode === 'standalone' ? data.schoolShifts : [],
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        modules: data.modules,
      });

      clearInterval(ticker);
      setProvisionProgress(100);
      setTimeout(() => {
        setIsProvisioning(false);
        setProvisionDone(true);
      }, 600);
    } catch (err) {
      setIsProvisioning(false);
      setProvisionProgress(0);
      setProvisionError(err instanceof Error ? err.message : 'Provisioning failed. Please try again.');
    }
  };

  const toggleModule = (id: string) => {
    const mod = MODULES.find(m => m.id === id);
    if (mod?.required) return;
    set('modules', data.modules.includes(id)
      ? data.modules.filter(m => m !== id)
      : [...data.modules, id]
    );
  };

  const progressPercent = totalSteps > 1 ? (step / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">

        {/* Header */}
        <div className="text-center space-y-1.5 px-4 sm:px-0">
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
            Provision New Tenant
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Step-by-step setup for a new organization and its schools.
          </p>
        </div>

        {/* Step progress bar */}
        <div className="relative px-2 sm:px-0">
          {/* Track */}
          <div className="absolute top-4 sm:top-5 left-2 sm:left-0 right-2 sm:right-0 h-0.5 bg-[hsl(var(--border))] z-0" />
          {/* Fill */}
          <div
            className="absolute top-4 sm:top-5 left-2 sm:left-0 h-0.5 bg-[hsl(var(--accent))] z-0 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="flex justify-between relative z-10">
            {visibleSteps.map((s, idx) => {
              const isActive = idx === step;
              const isDone = idx < step;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1.5 z-10 relative">
                  <div className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative bg-[hsl(var(--bg-primary))]',
                    isActive
                      ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))] shadow-lg shadow-[hsl(var(--accent)/0.2)]'
                      : isDone
                        ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white'
                        : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
                  )}>
                    {isDone ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <s.icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>
                  <span className={cn(
                    'text-[9px] font-bold uppercase tracking-wider hidden sm:block absolute top-12 whitespace-nowrap',
                    isActive || isDone ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-tertiary))]'
                  )}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form card */}
        <div className="glass-card p-4 sm:p-8 rounded-2xl border border-[hsl(var(--border))] min-h-[360px] mx-4 sm:mx-0">

          {/* ── STEP: Organization Type ─────────────────────────────────── */}
          {currentStepDef?.id === 'type' && (
            <div className="space-y-5 animate-fade-in">
              <StepTitle icon={Building2} title="What are you provisioning?" />
              <p className="text-xs text-[hsl(var(--text-tertiary))]">
                This determines the hierarchy structure and domain routing for the new tenant.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Standalone */}
                <label className={cn(
                  'flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all',
                  data.orgMode === 'standalone'
                    ? 'border-teal-500/60 bg-teal-500/8'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'
                )}>
                  <input type="radio" className="sr-only" checked={data.orgMode === 'standalone'} onChange={() => set('orgMode', 'standalone')} />
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    <School className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[hsl(var(--text-primary))]">Standalone School</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 leading-relaxed">
                      A single school that is its own organization. Gets one subdomain. Ideal for independent schools.
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-teal-500 font-mono bg-teal-500/10 rounded-lg px-2 py-1 w-fit">
                    school.schoolsaas.com
                  </div>
                </label>

                {/* Multi-school */}
                <label className={cn(
                  'flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all',
                  data.orgMode === 'multi'
                    ? 'border-[hsl(var(--accent)/0.6)] bg-[hsl(var(--accent)/0.06)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'
                )}>
                  <input type="radio" className="sr-only" checked={data.orgMode === 'multi'} onChange={() => set('orgMode', 'multi')} />
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[hsl(var(--accent))]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[hsl(var(--text-primary))]">Multi-School Organization</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 leading-relaxed">
                      A governing body (trust, authority, network) that manages multiple schools. Each school gets its own subdomain.
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-[hsl(var(--accent))] font-mono bg-[hsl(var(--accent)/0.08)] rounded-lg px-2 py-1 w-fit">
                    school1.schoolsaas.com, school2.schoolsaas.com…
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ── STEP: Identity ──────────────────────────────────────────── */}
          {currentStepDef?.id === 'identity' && (
            <div className="space-y-5 animate-fade-in">
              <StepTitle icon={Globe} title="Organization Identity" />

              <div>
                <FieldLabel required>
                  {data.orgMode === 'standalone' ? 'School Name' : 'Organization / Trust Name'}
                </FieldLabel>
                <input
                  type="text"
                  value={data.orgName}
                  onChange={e => set('orgName', e.target.value)}
                  placeholder={data.orgMode === 'standalone' ? 'e.g. Lincoln Academy' : 'e.g. Greenwood Education Trust'}
                  className={inputCls}
                />
              </div>

              {data.orgMode === 'standalone' && (
                <div>
                  <FieldLabel required>School Subdomain</FieldLabel>
                  <div className="flex rounded-xl overflow-hidden border border-[hsl(var(--border))] focus-within:border-[hsl(var(--accent))] transition-colors">
                    <input
                      type="text"
                      value={data.orgSlug}
                      onChange={e => set('orgSlug', slugify(e.target.value))}
                      placeholder="lincoln"
                      className="flex-1 bg-[hsl(var(--bg-tertiary))] px-4 py-2.5 text-sm font-mono text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                    <span className="flex-shrink-0 bg-[hsl(var(--bg-elevated))] px-4 py-2.5 text-sm text-[hsl(var(--text-tertiary))] font-mono border-l border-[hsl(var(--border))]">
                      .schoolsaas.com
                    </span>
                  </div>
                  {data.orgSlug && isValidSlug(data.orgSlug) && (
                    <p className="mt-1.5 text-[11px] text-emerald-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Portal: <span className="font-mono">{data.orgSlug}.schoolsaas.com</span>
                    </p>
                  )}
                </div>
              )}

              {data.orgMode === 'multi' && (
                <div className="flex items-start gap-2 p-3 rounded-xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--bg-tertiary)/0.3)]">
                  <Info className="w-4 h-4 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
                    The organization itself has no public URL. Each school you add in the next step will receive its own subdomain.
                  </p>
                </div>
              )}

              <div>
                <FieldLabel required>Data Region</FieldLabel>
                <select
                  value={data.region}
                  onChange={e => set('region', e.target.value)}
                  className={inputCls}
                >
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              {data.orgMode === 'standalone' && (
                <>
                  <div>
                    <FieldLabel>School Levels</FieldLabel>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {SCHOOL_LEVELS.map(t => (
                        <label key={t.value} className={cn(
                          'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                          data.schoolLevels.includes(t.value)
                            ? 'border-teal-500/40 bg-teal-500/8 text-teal-400'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                        )}>
                          <input
                            type="checkbox"
                            checked={data.schoolLevels.includes(t.value)}
                            onChange={() => toggleArrayItem('schoolLevels', t.value)}
                            className="sr-only"
                          />
                          {data.schoolLevels.includes(t.value) && <Check className="w-3 h-3 flex-shrink-0 text-teal-400" />}
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>School Shifts</FieldLabel>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {SCHOOL_SHIFTS.map(t => (
                        <label key={t.value} className={cn(
                          'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                          data.schoolShifts.includes(t.value)
                            ? 'border-indigo-500/40 bg-indigo-500/8 text-indigo-400'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                        )}>
                          <input
                            type="checkbox"
                            checked={data.schoolShifts.includes(t.value)}
                            onChange={() => toggleArrayItem('schoolShifts', t.value)}
                            className="sr-only"
                          />
                          {data.schoolShifts.includes(t.value) && <Check className="w-3 h-3 flex-shrink-0 text-indigo-400" />}
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP: Schools (multi-school only) ──────────────────────── */}
          {currentStepDef?.id === 'schools' && (
            <div className="space-y-5 animate-fade-in">
              <StepTitle icon={GraduationCap} title="Add Schools" />
              <p className="text-xs text-[hsl(var(--text-tertiary))]">
                Add all schools under <strong className="text-[hsl(var(--text-primary))]">{data.orgName || 'your organization'}</strong>.
                Each school gets its own subdomain and tenant data isolation. You can add more later.
              </p>

              <div className="space-y-3">
                {data.schools.map((school, idx) => (
                  <div key={school.id} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[hsl(var(--text-secondary))] flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                        School {idx + 1}
                      </span>
                      {data.schools.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSchool(school.id)}
                          className="p-1 rounded text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <FieldLabel required>School Name</FieldLabel>
                        <input
                          type="text"
                          value={school.name}
                          onChange={e => updateSchool(school.id, 'name', e.target.value)}
                          placeholder="e.g. Lincoln High School"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <FieldLabel required>Subdomain Slug</FieldLabel>
                        <div className="flex rounded-xl overflow-hidden border border-[hsl(var(--border))] focus-within:border-[hsl(var(--accent))] transition-colors">
                          <input
                            type="text"
                            value={school.slug}
                            onChange={e => updateSchool(school.id, 'slug', slugify(e.target.value))}
                            placeholder="lincoln"
                            className="flex-1 min-w-0 bg-[hsl(var(--bg-tertiary))] px-3 py-2 text-xs font-mono text-[hsl(var(--text-primary))] focus:outline-none"
                          />
                          <span className="flex-shrink-0 bg-[hsl(var(--bg-elevated))] px-2 py-2 text-[10px] text-[hsl(var(--text-tertiary))] font-mono border-l border-[hsl(var(--border))]">
                            .schoolsaas.com
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <FieldLabel>School Levels</FieldLabel>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {SCHOOL_LEVELS.map(t => (
                            <label key={t.value} className={cn(
                              'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                              school.schoolLevels.includes(t.value)
                                ? 'border-teal-500/40 bg-teal-500/8 text-teal-400'
                                : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                            )}>
                              <input
                                type="checkbox"
                                checked={school.schoolLevels.includes(t.value)}
                                onChange={() => toggleSchoolArrayItem(school.id, 'schoolLevels', t.value)}
                                className="sr-only"
                              />
                              {school.schoolLevels.includes(t.value) && <Check className="w-3 h-3 flex-shrink-0 text-teal-400" />}
                              {t.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>School Shifts</FieldLabel>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {SCHOOL_SHIFTS.map(t => (
                            <label key={t.value} className={cn(
                              'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                              school.schoolShifts.includes(t.value)
                                ? 'border-indigo-500/40 bg-indigo-500/8 text-indigo-400'
                                : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                            )}>
                              <input
                                type="checkbox"
                                checked={school.schoolShifts.includes(t.value)}
                                onChange={() => toggleSchoolArrayItem(school.id, 'schoolShifts', t.value)}
                                className="sr-only"
                              />
                              {school.schoolShifts.includes(t.value) && <Check className="w-3 h-3 flex-shrink-0 text-indigo-400" />}
                              {t.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSchool}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.05)] w-full justify-center transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another School
              </button>
            </div>
          )}

          {/* ── STEP: Subscription ─────────────────────────────────────── */}
          {currentStepDef?.id === 'subscription' && (
            <div className="space-y-5 animate-fade-in">
              <StepTitle icon={CreditCard} title="Subscription Plan" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLAN_OPTIONS.map(p => (
                  <label key={p.value} className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    data.plan === p.value ? p.color + ' border-opacity-60' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'
                  )}>
                    <input type="radio" className="sr-only" checked={data.plan === p.value} onChange={() => set('plan', p.value)} />
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors',
                      data.plan === p.value ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]' : 'border-[hsl(var(--border))]'
                    )}>
                      {data.plan === p.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[hsl(var(--text-primary))]">{p.label}</p>
                      <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">{p.desc}</p>
                      <p className="text-sm font-bold text-[hsl(var(--accent))] mt-2">{p.price}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: Modules ───────────────────────────────────────────── */}
          {currentStepDef?.id === 'modules' && (
            <div className="space-y-5 animate-fade-in">
              <StepTitle icon={Blocks} title="Feature Modules" />
              <p className="text-xs text-[hsl(var(--text-tertiary))]">
                Select the modules to enable for this tenant. Modules can be changed later from the tenant settings.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MODULES.map(mod => {
                  const isOn = data.modules.includes(mod.id);
                  return (
                    <label key={mod.id} className={cn(
                      'flex items-start gap-3 p-3.5 rounded-xl border transition-all',
                      mod.required
                        ? 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] opacity-70 cursor-not-allowed'
                        : isOn
                          ? 'border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.06)] cursor-pointer'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] cursor-pointer'
                    )}>
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors',
                          isOn ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]' : 'border-[hsl(var(--border))]'
                        )}
                        onClick={() => !mod.required && toggleModule(mod.id)}
                      >
                        {isOn && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{mod.name}</p>
                          {mod.required && <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">REQUIRED</span>}
                        </div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{mod.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP: Admin Setup ───────────────────────────────────────── */}
          {currentStepDef?.id === 'admin' && (
            <div className="space-y-5 animate-fade-in">
              <StepTitle icon={User} title="Initial Admin Account" />
              <p className="text-xs text-[hsl(var(--text-tertiary))]">
                This person will be the super-user for {data.orgMode === 'standalone' ? 'the school' : 'the organization'}. They will receive an invitation email.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Full Name</FieldLabel>
                  <input
                    type="text"
                    value={data.adminName}
                    onChange={e => set('adminName', e.target.value)}
                    placeholder="John Doe"
                    className={inputCls}
                  />
                </div>
                <div>
                  <FieldLabel required>Email Address</FieldLabel>
                  <input
                    type="email"
                    value={data.adminEmail}
                    onChange={e => set('adminEmail', e.target.value)}
                    placeholder="admin@organization.com"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-amber-500/80 leading-relaxed">
                  A temporary password will be auto-generated and included in the invitation email. The admin must change it on first login.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP: Review & Deploy ───────────────────────────────────── */}
          {currentStepDef?.id === 'review' && !provisionDone && (
            <div className="space-y-5 animate-fade-in relative">
              {isProvisioning ? (
                <div className="absolute inset-0 bg-[hsl(var(--bg-secondary))] flex flex-col items-center justify-center gap-6 z-10 animate-fade-in rounded-2xl">
                  {/* Circular progress */}
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full text-[hsl(var(--border))]" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" />
                    </svg>
                    <svg
                      className="absolute inset-0 w-full h-full text-[hsl(var(--accent))] -rotate-90 transition-all duration-200"
                      viewBox="0 0 100 100"
                      strokeDasharray="276"
                      strokeDashoffset={276 - (276 * provisionProgress) / 100}
                    >
                      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Database className="w-6 h-6 text-[hsl(var(--accent))] animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Provisioning Infrastructure</h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))] font-mono">
                      {provisionProgress < 25 ? 'Creating database schema…' :
                       provisionProgress < 50 ? 'Provisioning storage buckets…' :
                       provisionProgress < 75 ? 'Configuring DNS subdomains…' :
                       'Setting up admin accounts…'}
                    </p>
                    <p className="text-lg font-black text-[hsl(var(--accent))]">{provisionProgress}%</p>
                  </div>
                </div>
              ) : (
                <>
                  <StepTitle icon={CheckCircle2} title="Review & Deploy" />
                  <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[11px] font-medium flex gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>This will provision a new tenant database schema, S3 storage, and DNS subdomains. Review before continuing.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ReviewItem label="Organization Type" value={data.orgMode === 'standalone' ? 'Standalone School' : 'Multi-School Organization'} />
                    <ReviewItem label="Name" value={data.orgName || '—'} />
                    {data.orgMode === 'standalone' && (
                      <ReviewItem label="Portal URL" value={`${data.orgSlug}.schoolsaas.com`} mono />
                    )}
                    {data.orgMode === 'multi' && (
                      <ReviewItem label="Schools" value={`${data.schools.length} school${data.schools.length !== 1 ? 's' : ''}`} />
                    )}
                    <ReviewItem label="Plan" value={PLAN_OPTIONS.find(p => p.value === data.plan)?.label ?? '—'} />
                    <ReviewItem label="Region" value={data.region} />
                    <ReviewItem label="Modules" value={`${data.modules.length} enabled`} />
                    <ReviewItem label="Admin" value={data.adminEmail || '—'} mono />
                  </div>

                  {data.orgMode === 'multi' && data.schools.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">Schools to Provision</p>
                      <div className="space-y-1.5">
                        {data.schools.map(s => (
                          <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))]">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{s.name || 'Unnamed school'}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{s.slug}.schoolsaas.com</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Done state ──────────────────────────────────────────────── */}
          {provisionDone && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Tenant Provisioned!</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))] max-w-sm">
                <strong>{data.orgName}</strong> has been successfully provisioned. The admin invitation email has been sent to <span className="font-mono">{data.adminEmail}</span>.
              </p>
              <div className="flex gap-3 mt-2">
                <a href="/super-admin/tenants/hierarchy" className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-opacity">
                  View in Hierarchy
                </a>
                <button onClick={() => { setStep(0); setProvisionDone(false); setProvisionProgress(0); setData(d => ({ ...d, orgName: '', orgSlug: '', schools: [{ id: '1', name: '', slug: '', schoolType: 'Primary' }] })); }}
                  className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                  Provision Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Provision error */}
        {provisionError && !provisionDone && (
          <div className="flex items-center gap-2 p-3 mx-4 sm:mx-0 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {provisionError}
          </div>
        )}

        {/* Navigation footer */}
        {!provisionDone && (
          <div className="flex items-center justify-between px-4 sm:px-0">
            <button
              onClick={prev}
              disabled={step === 0 || isProvisioning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
              {step + 1} / {totalSteps}
            </span>

            {step < totalSteps - 1 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm transition-all shadow-sm"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleProvision}
                disabled={isProvisioning}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <Server className="w-4 h-4" />
                {isProvisioning ? 'Deploying…' : 'Deploy Tenant'}
              </button>
            )}
          </div>
        )}
      </div>
  );
}

// ---------------------------------------------------------------------------
// Small shared sub-components
// ---------------------------------------------------------------------------
function StepTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h2 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
      <Icon className="w-5 h-5 text-[hsl(var(--accent))]" /> {title}
    </h2>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
      {children} {required && <span className="text-[hsl(var(--accent))]">*</span>}
    </label>
  );
}

function ReviewItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-1">
      <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{label}</p>
      <p className={cn('text-sm font-bold text-[hsl(var(--text-primary))]', mono && 'font-mono text-xs')}>{value}</p>
    </div>
  );
}

const inputCls = 'w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors placeholder:text-[hsl(var(--text-tertiary))]';
