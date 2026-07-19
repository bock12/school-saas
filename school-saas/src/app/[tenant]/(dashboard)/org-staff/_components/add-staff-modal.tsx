'use client';

import { useState, useTransition, useRef } from 'react';
import {
  UserPlus, X, School, Building2, Mail, Lock, AlertCircle, CheckCircle2,
  Loader2, ChevronDown, Upload, FileText, Users, Briefcase, Phone, Hash, Camera
} from 'lucide-react';
import { addStaffMember } from '@/app/actions/tenant';
import { cn } from '@/lib/utils';

interface School { id: string; name: string; slug: string; }

interface AddStaffModalProps {
  orgId: string;
  orgSlug: string;
  schools: School[];
  onClose: () => void;
  onSuccess: () => void;
}

type CredMode = 'invite' | 'password';

const ROLES = [
  { value: 'org_admin',      label: 'Org Admin',         group: 'Organization' },
  { value: 'school_admin',   label: 'School Admin',      group: 'School' },
  { value: 'teacher',        label: 'Teacher',           group: 'School' },
  { value: 'coordinator',    label: 'Coordinator',       group: 'School' },
  { value: 'department_head',label: 'Department Head',   group: 'School' },
  { value: 'counselor',      label: 'Counselor',         group: 'School' },
  { value: 'librarian',      label: 'Librarian',         group: 'School' },
  { value: 'accountant',     label: 'Accountant',        group: 'School' },
  { value: 'nurse',          label: 'School Nurse',      group: 'School' },
  { value: 'security',       label: 'Security Officer',  group: 'School' },
];

const ROLE_TEMPLATES = [
  { label: 'Class Teacher',     role: 'teacher',         dept: 'Academics' },
  { label: 'Dept. Head',        role: 'department_head', dept: 'Administration' },
  { label: 'School Admin',      role: 'school_admin',    dept: 'Administration' },
  { label: 'Finance Officer',   role: 'accountant',      dept: 'Finance' },
];

export function AddStaffModal({ orgId, orgSlug, schools, onClose, onSuccess }: AddStaffModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('teacher');
  const [tenantScope, setTenantScope] = useState<'org' | 'school'>('school');
  const [selectedSchoolId, setSelectedSchoolId] = useState(schools[0]?.id ?? '');
  const [department, setDepartment] = useState('');
  const [office, setOffice] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [staffId, setStaffId] = useState(() => `STF-${Math.floor(10000 + Math.random() * 90000)}`);
  const [credMode, setCredMode] = useState<CredMode>('invite');
  const [tempPassword, setTempPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  const tenantId = tenantScope === 'org' ? orgId : selectedSchoolId;
  const tenantSlug = tenantScope === 'org' ? orgSlug : (selectedSchool?.slug ?? orgSlug);

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
  const labelCls = 'block text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5';

  const applyTemplate = (t: typeof ROLE_TEMPLATES[0]) => {
    setRole(t.role);
    setDepartment(t.dept);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      setAvatarUrl(dataUrl); // In production, upload to Supabase Storage and get the URL
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setError(null);
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (tenantScope === 'school' && !selectedSchoolId) { setError('Please select a school.'); return; }
    if (credMode === 'password' && tempPassword.length < 8) {
      setError('Temporary password must be at least 8 characters.'); return;
    }

    startTransition(async () => {
      const res = await addStaffMember(orgId, {
        email: email.trim(),
        name: name.trim(),
        role,
        tenantId,
        tenantSlug,
        department: department || undefined,
        office: office || undefined,
        jobTitle: jobTitle || undefined,
        staffId: staffId || `STF-${Math.floor(10000 + Math.random() * 90000)}`,
        phone: phone || undefined,
        tempPassword: credMode === 'password' ? tempPassword : undefined,
        avatarUrl: avatarUrl || undefined,
      });

      if (!res.success) {
        setError(res.error ?? 'Failed to add staff member.');
      } else {
        setSuccess(true);
        setTimeout(() => { onSuccess(); onClose(); }, 1600);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl glass-card animate-fade-in-scale overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.12)] flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Add Staff Member</h3>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Create and credential a new staff account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-[hsl(var(--text-primary))]">Staff Member Added!</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              {credMode === 'invite' ? 'An invitation email has been sent.' : 'Account created with temporary password.'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

            {/* Role Templates */}
            <div>
              <label className={labelCls}>Quick Role Templates</label>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_TEMPLATES.map(t => (
                  <button key={t.label} onClick={() => applyTemplate(t)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--accent))] transition-all">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <label className={labelCls}><Camera className="w-3 h-3 inline mr-1" />Profile Picture</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] flex items-center justify-center flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-[hsl(var(--text-tertiary))]" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input ref={avatarFileRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.4)] transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </button>
                  {!avatarPreview && (
                    <input type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                      placeholder="Or paste image URL…" className={cn(inputCls, 'text-xs')} />
                  )}
                </div>
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Smith" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@school.edu" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Role *</label>
                <div className="relative">
                  <select value={role} onChange={e => setRole(e.target.value)} className={cn(inputCls, 'pr-8 appearance-none cursor-pointer')}>
                    {['Organization', 'School'].map(group => (
                      <optgroup key={group} label={group}>
                        {ROLES.filter(r => r.group === group).map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Assign To</label>
                <div className="flex rounded-lg overflow-hidden border border-[hsl(var(--border))] h-9">
                  {(['org', 'school'] as const).map(s => (
                    <button key={s} onClick={() => setTenantScope(s)}
                      className={cn('flex-1 text-xs font-semibold transition-all',
                        tenantScope === s ? 'bg-[hsl(var(--accent))] text-white' : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]')}>
                      {s === 'org' ? <><Building2 className="w-3 h-3 inline mr-1" />Org</> : <><School className="w-3 h-3 inline mr-1" />School</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {tenantScope === 'school' && (
              <div>
                <label className={labelCls}>School *</label>
                <div className="relative">
                  <select value={selectedSchoolId} onChange={e => setSelectedSchoolId(e.target.value)} className={cn(inputCls, 'pr-8 appearance-none cursor-pointer')}>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] pointer-events-none" />
                </div>
              </div>
            )}

            {/* Extra details */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}><Briefcase className="w-3 h-3 inline mr-1" />Job Title</label>
                <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Head of Maths" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}><Users className="w-3 h-3 inline mr-1" />Department</label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Sciences" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}><Hash className="w-3 h-3 inline mr-1" />Staff ID</label>
                <div className="flex gap-1">
                  <input type="text" value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="Auto-generated" className={cn(inputCls, 'flex-1')} />
                  <button
                    type="button"
                    onClick={() => setStaffId(`STF-${Math.floor(10000 + Math.random() * 90000)}`)}
                    className="px-2 rounded-lg border border-[hsl(var(--border))] text-[10px] text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                    title="Generate new ID"
                  >↻</button>
                </div>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Auto-generated. Click ↻ to regenerate.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}><Phone className="w-3 h-3 inline mr-1" />Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 80 0000 0000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Office / Location</label>
                <input type="text" value={office} onChange={e => setOffice(e.target.value)} placeholder="e.g. Block A, Room 3" className={inputCls} />
              </div>
            </div>

            {/* Credentials */}
            <div>
              <label className={labelCls}>Access Method</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: 'invite' as CredMode, icon: Mail, label: 'Send Invitation', sub: 'Magic link via email' },
                  { v: 'password' as CredMode, icon: Lock, label: 'Set Password', sub: 'Temporary credentials' },
                ]).map(({ v, icon: Icon, label, sub }) => (
                  <button key={v} onClick={() => setCredMode(v)}
                    className={cn('flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all',
                      credMode === v
                        ? 'border-[hsl(var(--accent)/0.5)] bg-[hsl(var(--accent)/0.08)]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)] hover:bg-[hsl(var(--bg-tertiary))]')}>
                    <Icon className={cn('w-4 h-4', credMode === v ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-tertiary))]')} />
                    <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{label}</span>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {credMode === 'password' && (
              <div>
                <label className={labelCls}>Temporary Password *</label>
                <input type="text" value={tempPassword} onChange={e => setTempPassword(e.target.value)}
                  placeholder="Min. 8 characters" className={inputCls} />
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Staff must change this on first login.</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors font-medium">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isPending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Adding…</> : 'Add Staff Member'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
