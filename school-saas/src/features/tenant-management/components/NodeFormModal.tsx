'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { TenantNode, HierarchyType, SubscriptionPlan } from '../types/hierarchy';
import { HIERARCHY_CONFIG } from '../config/hierarchy.config';
import {
  X, Building2, Network, MapPin, GraduationCap, Building,
  Globe, Check, School, AlertCircle, ChevronRight, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface NodeFormData {
  name: string;
  type: HierarchyType;
  parentId?: string;
  slug?: string;
  plan?: SubscriptionPlan;
  region?: string;
  isStandaloneSchool?: boolean;
  schoolType?: string;
  schoolLevels?: string[];
  schoolShifts?: string[];
  address?: string;
}

interface NodeFormModalProps {
  isOpen: boolean;
  parentNode?: TenantNode | null;
  onClose: () => void;
  onSubmit: (data: NodeFormData) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

// ---------------------------------------------------------------------------
// Which child types are valid for a given parent?
// ---------------------------------------------------------------------------
function getValidChildTypes(parentType?: HierarchyType): HierarchyType[] {
  switch (parentType) {
    case undefined:        return ['organization'];
    case 'organization':   return ['group', 'school']; // group is optional
    case 'group':          return ['district', 'school']; // district is optional
    case 'district':       return ['school'];
    case 'school':         return ['campus'];
    case 'campus':         return [];
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PLAN_OPTIONS: { value: SubscriptionPlan; label: string; price: string; desc: string }[] = [
  { value: 'starter',    label: 'Starter',      price: '$29/mo',  desc: 'Up to 100 students' },
  { value: 'pro',        label: 'Professional', price: '$79/mo',  desc: 'Up to 500 students' },
  { value: 'enterprise', label: 'Enterprise',   price: '$199/mo', desc: 'Unlimited students' },
  { value: 'trial',      label: 'Trial',        price: 'Free',    desc: '30-day trial' },
];

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

const REGIONS = [
  'US East (N. Virginia)',
  'US West (Oregon)',
  'EU (Frankfurt)',
  'EU (Ireland)',
  'Asia Pacific (Singapore)',
  'Asia Pacific (Sydney)',
  'Africa (Cape Town)',
];

function slugify(val: string) {
  return val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function isValidSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]{1,}[a-z0-9]$/.test(slug) || /^[a-z0-9]{2,}$/.test(slug);
}

const TYPE_ICON_MAP: Record<HierarchyType, React.ElementType> = {
  organization: Building2,
  group: Network,
  district: MapPin,
  school: GraduationCap,
  campus: Building,
};

const TYPE_COLOR_MAP: Record<HierarchyType, string> = {
  organization: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  group:        'text-purple-400 bg-purple-500/10 border-purple-500/30',
  district:     'text-blue-400 bg-blue-500/10 border-blue-500/30',
  school:       'text-teal-400 bg-teal-500/10 border-teal-500/30',
  campus:       'text-green-400 bg-green-500/10 border-green-500/30',
};

// ---------------------------------------------------------------------------
// Main Modal
// ---------------------------------------------------------------------------
export function NodeFormModal({ isOpen, parentNode, onClose, onSubmit, isSubmitting = false, submitError }: NodeFormModalProps) {
  const validTypes = getValidChildTypes(parentNode?.type);
  const [selectedType, setSelectedType] = useState<HierarchyType>(validTypes[0]);
  const [isStandalone, setIsStandalone] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan>('starter');
  const [region, setRegion] = useState(REGIONS[0]);
  const [schoolType, setSchoolType] = useState('primary');
  const [schoolLevels, setSchoolLevels] = useState<string[]>([]);
  const [schoolShifts, setSchoolShifts] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      const types = getValidChildTypes(parentNode?.type);
      setSelectedType(types[0]);
      setIsStandalone(false);
      setName('');
      setSlug('');
      setSlugTouched(false);
      setPlan('starter');
      setRegion(REGIONS[0]);
      setSchoolType('primary');
      setSchoolLevels([]);
      setSchoolShifts([]);
      setAddress('');
      setErrors({});
    }
  }, [isOpen, parentNode]);

  const toggleItem = (arr: string[], setArr: (val: string[]) => void, item: string) => {
    if (arr.includes(item)) setArr(arr.filter(i => i !== item));
    else setArr([...arr, item]);
  };

  // Auto-generate slug from name (if not manually touched)
  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  const needsSlug = selectedType === 'school' || (selectedType === 'organization' && isStandalone);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (needsSlug && !isValidSlug(slug)) {
      errs.slug = 'Slug must be 2+ lowercase letters/numbers, hyphens allowed in the middle.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [name, slug, needsSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const isSchoolOrStandalone = selectedType === 'school' || (selectedType === 'organization' && isStandalone);
    
    onSubmit({
      name: name.trim(),
      type: selectedType,
      parentId: parentNode?.id,
      slug: needsSlug ? slug : undefined,
      plan: selectedType === 'organization' ? plan : undefined,
      region: selectedType === 'organization' ? region : undefined,
      isStandaloneSchool: selectedType === 'organization' ? isStandalone : undefined,
      schoolType: selectedType === 'school' ? schoolType : undefined,
      schoolLevels: isSchoolOrStandalone ? schoolLevels : undefined,
      schoolShifts: isSchoolOrStandalone ? schoolShifts : undefined,
      address: selectedType === 'campus' ? address : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  const config = HIERARCHY_CONFIG[selectedType];
  const Icon = TYPE_ICON_MAP[selectedType];

  // Title
  const title = parentNode
    ? `Add ${config.label} to ${parentNode.name}`
    : 'Create New Organization';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-scale">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[hsl(var(--border))] flex-shrink-0">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', TYPE_COLOR_MAP[selectedType])}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black text-[hsl(var(--text-primary))] truncate">{title}</h2>
            {parentNode && (
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 flex items-center gap-1">
                <span className="capitalize">{parentNode.type}</span>
                <ChevronRight className="w-2.5 h-2.5" />
                <span className="capitalize">{selectedType}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin">

            {/* Type selector — only when there are multiple valid child types */}
            {validTypes.length > 1 && (
              <div>
                <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-2">
                  Node Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {validTypes.map(t => {
                    const TIcon = TYPE_ICON_MAP[t];
                    const tConfig = HIERARCHY_CONFIG[t];
                    const isSelected = t === selectedType;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedType(t)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all',
                          isSelected
                            ? `${TYPE_COLOR_MAP[t]} border-current`
                            : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--text-secondary))]'
                        )}
                      >
                        <TIcon className="w-3.5 h-3.5" />
                        {tConfig.label}
                      </button>
                    );
                  })}
                </div>
                {/* Context hint for optional levels */}
                {(selectedType === 'school' && parentNode?.type === 'organization') && (
                  <p className="mt-2 text-[10px] text-[hsl(var(--text-tertiary))] flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    School added directly to the organization — Groups and Districts are optional.
                  </p>
                )}
                {(selectedType === 'school' && parentNode?.type === 'group') && (
                  <p className="mt-2 text-[10px] text-[hsl(var(--text-tertiary))] flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    School added directly to the group — Districts are optional.
                  </p>
                )}
              </div>
            )}

            {/* ── ORGANIZATION fields ──────────────────────────────────────── */}
            {selectedType === 'organization' && (
              <>
                {/* Standalone toggle */}
                <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                  <label className="flex items-center justify-between cursor-pointer gap-3">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-teal-400" />
                      <div>
                        <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Standalone School</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                          The organization IS the school — no groups or districts needed.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsStandalone(!isStandalone)}
                      className={cn(
                        'relative w-10 h-5 rounded-full transition-colors flex-shrink-0',
                        isStandalone ? 'bg-teal-500' : 'bg-[hsl(var(--bg-elevated))]'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                        isStandalone ? 'translate-x-5' : 'translate-x-0.5'
                      )} />
                    </button>
                  </label>
                </div>

                <FormField label="Legal Organization Name" error={errors.name} required>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Greenwood Education Trust"
                    className={inputClass(!!errors.name)}
                  />
                </FormField>

                {isStandalone && (
                  <SlugField
                    slug={slug}
                    setSlug={setSlug}
                    setSlugTouched={setSlugTouched}
                    error={errors.slug}
                    label="School Subdomain"
                    placeholder="greenwood"
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
                      Subscription Plan *
                    </label>
                    <div className="space-y-1.5">
                      {PLAN_OPTIONS.map(p => (
                        <label key={p.value} className={cn(
                          'flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all',
                          plan === p.value
                            ? 'border-[hsl(var(--accent)/0.5)] bg-[hsl(var(--accent)/0.08)]'
                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'
                        )}>
                          <input
                            type="radio"
                            name="plan"
                            value={p.value}
                            checked={plan === p.value}
                            onChange={() => setPlan(p.value)}
                            className="accent-[hsl(var(--accent))]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{p.label}</p>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{p.desc}</p>
                          </div>
                          <span className="text-xs font-bold text-[hsl(var(--accent))]">{p.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
                      Data Region *
                    </label>
                    <select
                      value={region}
                      onChange={e => setRegion(e.target.value)}
                      className={inputClass(false)}
                    >
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ── GROUP / DISTRICT fields ──────────────────────────────────── */}
            {(selectedType === 'group' || selectedType === 'district') && (
              <FormField label={`${HIERARCHY_CONFIG[selectedType].label} Name`} error={errors.name} required>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={selectedType === 'group' ? 'e.g. Northern Region' : 'e.g. Greenwood North District'}
                  className={inputClass(!!errors.name)}
                />
              </FormField>
            )}

            {/* ── SCHOOL fields ────────────────────────────────────────────── */}
            {selectedType === 'school' && (
              <>
                <FormField label="School Name" error={errors.name} required>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Lincoln High School"
                    className={inputClass(!!errors.name)}
                  />
                </FormField>

                <SlugField
                  slug={slug}
                  setSlug={setSlug}
                  setSlugTouched={setSlugTouched}
                  error={errors.slug}
                  label="School Subdomain"
                  placeholder="lincoln"
                />

                <div>
                  <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
                    School Levels
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {SCHOOL_LEVELS.map(st => (
                      <label key={st.value} className={cn(
                        'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                        schoolLevels.includes(st.value)
                          ? 'border-teal-500/40 bg-teal-500/8 text-teal-400'
                          : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                      )}>
                        <input
                          type="checkbox"
                          name="schoolLevels"
                          value={st.value}
                          checked={schoolLevels.includes(st.value)}
                          onChange={() => toggleItem(schoolLevels, setSchoolLevels, st.value)}
                          className="sr-only"
                        />
                        {schoolLevels.includes(st.value) && <Check className="w-3 h-3 flex-shrink-0 text-teal-400" />}
                        {st.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5 mt-4">
                    School Shifts
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {SCHOOL_SHIFTS.map(st => (
                      <label key={st.value} className={cn(
                        'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                        schoolShifts.includes(st.value)
                          ? 'border-indigo-500/40 bg-indigo-500/8 text-indigo-400'
                          : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                      )}>
                        <input
                          type="checkbox"
                          name="schoolShifts"
                          value={st.value}
                          checked={schoolShifts.includes(st.value)}
                          onChange={() => toggleItem(schoolShifts, setSchoolShifts, st.value)}
                          className="sr-only"
                        />
                        {schoolShifts.includes(st.value) && <Check className="w-3 h-3 flex-shrink-0 text-indigo-400" />}
                        {st.label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── CAMPUS fields ────────────────────────────────────────────── */}
            {selectedType === 'campus' && (
              <>
                <FormField label="Campus Name" error={errors.name} required>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Main Campus, Sports Complex, Annex"
                    className={inputClass(!!errors.name)}
                  />
                </FormField>

                <FormField label="Physical Address" error="">
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. 123 School Road, City, Country"
                    className={inputClass(false)}
                  />
                </FormField>
              </>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <p className="px-6 py-2 text-[11px] text-red-400 bg-red-500/5 border-t border-red-500/20 flex items-center gap-1.5 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {submitError}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[hsl(var(--border))] flex-shrink-0 bg-[hsl(var(--bg-secondary))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black text-white transition-all',
                'bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] shadow-sm',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating…
                </>
              ) : (
                <><Check className="w-3.5 h-3.5" /> Create {HIERARCHY_CONFIG[selectedType].label}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function FormField({ label, error, required, children }: {
  label: string; error: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-[hsl(var(--accent))]">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-[10px] text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function SlugField({ slug, setSlug, setSlugTouched, error, label, placeholder }: {
  slug: string; setSlug: (s: string) => void; setSlugTouched: (b: boolean) => void;
  error: string; label: string; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
        {label} <span className="text-[hsl(var(--accent))]">*</span>
      </label>
      <div className="flex rounded-xl overflow-hidden border border-[hsl(var(--border))] focus-within:border-[hsl(var(--accent))] transition-colors">
        <input
          type="text"
          value={slug}
          onChange={e => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder={placeholder}
          className="flex-1 bg-[hsl(var(--bg-tertiary))] px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] font-mono focus:outline-none"
        />
        <span className="flex-shrink-0 bg-[hsl(var(--bg-elevated))] px-3 py-2.5 text-xs text-[hsl(var(--text-tertiary))] font-mono border-l border-[hsl(var(--border))]">
          .schoolsaas.com
        </span>
      </div>
      {slug && !error && (
        <p className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1">
          <Globe className="w-3 h-3" />
          Portal: <span className="font-mono">{slug}.schoolsaas.com</span>
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-[10px] text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full bg-[hsl(var(--bg-tertiary))] border rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))]',
    'focus:outline-none transition-colors placeholder:text-[hsl(var(--text-tertiary))]',
    hasError
      ? 'border-red-500/50 focus:border-red-500'
      : 'border-[hsl(var(--border))] focus:border-[hsl(var(--accent))]'
  );
}
