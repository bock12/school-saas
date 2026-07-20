'use client';

import { useState, useTransition, useRef } from 'react';
import {
  X, School, Building2, AlertCircle, CheckCircle2,
  Loader2, ChevronDown, Upload, Users, Briefcase, Phone, Hash, Camera, Edit2
} from 'lucide-react';
import { updateStaffProfile } from '@/app/actions/tenant';
import { cn } from '@/lib/utils';

interface School { id: string; name: string; slug: string; }

interface StaffRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  department: string | null;
  office?: string | null;
  job_title: string | null;
  staff_id: string | null;
  phone: string | null;
  schoolName: string;
  schoolSlug: string;
  isOrgLevel: boolean;
  avatar_url?: string | null;
  tenant_id?: string;
}

interface EditStaffModalProps {
  staff: StaffRow;
  orgId: string;
  schools: School[];
  onClose: () => void;
  onSuccess: () => void;
}

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

export function EditStaffModal({ staff, orgId, schools, onClose, onSuccess }: EditStaffModalProps) {
  const [name, setName] = useState(staff.full_name || '');
  const [role, setRole] = useState(staff.role || 'teacher');
  const [tenantScope, setTenantScope] = useState<'org' | 'school'>(staff.isOrgLevel ? 'org' : 'school');
  
  // Find current school id based on staff data or fallback to first school
  const currentSchoolId = staff.isOrgLevel ? (schools[0]?.id ?? '') : (staff.tenant_id ?? schools[0]?.id ?? '');
  const [selectedSchoolId, setSelectedSchoolId] = useState(currentSchoolId);
  
  const [department, setDepartment] = useState(staff.department || '');
  const [office, setOffice] = useState(staff.office || '');
  const [jobTitle, setJobTitle] = useState(staff.job_title || '');
  const [phone, setPhone] = useState(staff.phone || '');
  const [staffId, setStaffId] = useState(staff.staff_id || '');
  const [avatarUrl, setAvatarUrl] = useState(staff.avatar_url || '');
  const [avatarPreview, setAvatarPreview] = useState(staff.avatar_url || '');
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tenantId = tenantScope === 'org' ? orgId : selectedSchoolId;

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
  const labelCls = 'block text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5';

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
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (tenantScope === 'school' && !selectedSchoolId) { setError('Please select a school.'); return; }

    startTransition(async () => {
      const res = await updateStaffProfile(staff.id, {
        name: name.trim(),
        role,
        tenantId,
        department: department || undefined,
        office: office || undefined,
        jobTitle: jobTitle || undefined,
        staffId: staffId || undefined,
        phone: phone || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      if (!res.success) {
        setError(res.error ?? 'Failed to update staff member.');
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
              <Edit2 className="w-4 h-4 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Edit Staff Profile</h3>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Update details for {staff.email}</p>
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
            <p className="text-base font-semibold text-[hsl(var(--text-primary))]">Profile Updated!</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              Staff details have been successfully saved.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

            {/* Profile Picture */}
            <div>
              <label className={labelCls}><Camera className="w-3 h-3 inline mr-1" />Profile Picture</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] flex items-center justify-center flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[11px] font-bold text-[hsl(var(--accent))] flex items-center justify-center bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--info)/0.3)] w-full h-full">
                      {(staff.full_name || staff.email || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input ref={avatarFileRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.4)] transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" /> Change Photo
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
                <label className={labelCls}>Email Address</label>
                <input type="email" value={staff.email || ''} disabled className={cn(inputCls, 'opacity-50 cursor-not-allowed')} />
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
                </div>
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
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
