'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus, CheckCircle2, ArrowRight, ArrowLeft, Camera, BookOpen,
  Users, Phone, Mail, Hash, Calendar, MapPin, Loader2, GraduationCap,
  ClipboardList, Shield, X,
} from 'lucide-react';
import { addStudent } from '../actions';

const inputCls = 'w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
const selectCls = 'w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
const labelCls = 'block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5';

interface RecentStudent {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  gender: string | null;
  className: string;
  sectionName: string;
  guardian_name: string | null;
  admitted_at: string;
  avatar_url: string | null;
}

interface ClassOption {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

const STEPS = [
  { id: 1, label: 'Student Info', icon: UserPlus },
  { id: 2, label: 'Academic Placement', icon: GraduationCap },
  { id: 3, label: 'Parent / Guardian', icon: Users },
  { id: 4, label: 'Confirm & Admit', icon: CheckCircle2 },
];

export function DirectAdmissionsClient({
  tenant,
  classOptions,
  recentStudents,
}: {
  tenant: string;
  classOptions: ClassOption[];
  recentStudents: RecentStudent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [successStudent, setSuccessStudent] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [students, setStudents] = useState<RecentStudent[]>(recentStudents);

  const [form, setForm] = useState({
    first_name: '', last_name: '', dob: '', gender: 'Male', blood_group: '',
    nin: '', email: '', phone: '', address: '', city: '',
    guardian_name: '', guardian_phone: '', guardian_email: '', guardian_relation: 'Father',
    section_id: '',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const availableSections = classOptions.find(c => c.id === selectedClassId)?.sections || [];
  const selectedClass = classOptions.find(c => c.id === selectedClassId);
  const selectedSection = availableSections.find(s => s.id === form.section_id);

  const canProceedStep1 = form.first_name && form.last_name && form.dob && form.gender;
  const canProceedStep2 = true; // class is optional
  const canProceedStep3 = form.guardian_name && form.guardian_phone;

  const handleSubmit = async () => {
    setFormError(null);
    const fd = new FormData();
    fd.append('tenant', tenant);
    fd.append('first_name', form.first_name);
    fd.append('last_name', form.last_name);
    fd.append('dob', form.dob);
    fd.append('gender', form.gender);
    if (form.blood_group) fd.append('blood_group', form.blood_group);
    if (form.nin) fd.append('nin', form.nin);
    if (form.email) fd.append('email', form.email);
    if (form.phone) fd.append('phone', form.phone);
    if (form.address) fd.append('address', form.address);
    if (form.city) fd.append('city', form.city);
    if (form.guardian_name) fd.append('guardian_name', form.guardian_name);
    if (form.guardian_phone) fd.append('guardian_phone', form.guardian_phone);
    if (form.section_id) fd.append('section_id', form.section_id);
    if (avatarUrl) fd.append('avatar_url', avatarUrl);

    startTransition(async () => {
      const res = await addStudent(fd);
      if (res.success) {
        setSuccessStudent(`${form.first_name} ${form.last_name}`);
        setStep(1);
        setForm({
          first_name: '', last_name: '', dob: '', gender: 'Male', blood_group: '',
          nin: '', email: '', phone: '', address: '', city: '',
          guardian_name: '', guardian_phone: '', guardian_email: '', guardian_relation: 'Father',
          section_id: '',
        });
        setSelectedClassId('');
        setAvatarUrl(null);
        router.refresh();
      } else {
        setFormError(res.error || 'Failed to admit student. Please try again.');
      }
    });
  };

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Direct Student Admission</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Instantly admit a student into the school registry — no screening pipeline required.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Shield className="w-4 h-4" />
          Admin / Registrar Access
        </div>
      </div>

      {/* Success Banner */}
      {successStudent && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Student Admitted Successfully!</p>
              <p className="text-xs opacity-80">{successStudent} has been added to the active student registry.</p>
            </div>
          </div>
          <button onClick={() => setSuccessStudent(null)} className="text-emerald-400/60 hover:text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-step form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step Progress */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-0">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-1 min-w-[56px]">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-xs font-bold border-2 ${
                        isDone ? 'bg-emerald-500 border-emerald-500 text-white' :
                        isActive ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--accent)/0.3)]' :
                        'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className={`text-[9px] font-bold text-center leading-tight ${isActive ? 'text-[hsl(var(--accent))]' : isDone ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${isDone ? 'bg-emerald-500' : 'bg-[hsl(var(--border))]'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1 — Student Personal Info */}
          {step === 1 && (
            <div className="glass-card p-6 space-y-5 animate-fade-in">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[hsl(var(--accent))]" />
                Step 1 — Student Personal Information
              </h3>

              {/* Photo */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))]">
                <div className="relative w-20 h-20 rounded-full bg-[hsl(var(--bg-tertiary))] border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center overflow-hidden group flex-shrink-0">
                  {avatarUrl ? <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" /> : (
                    <><Camera className="w-6 h-6 text-[hsl(var(--text-tertiary))]" /><span className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Photo</span></>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Upload Student Photo</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">PNG, JPG or JPEG. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name *</label>
                  <input className={inputCls} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="e.g. Sarah" />
                </div>
                <div>
                  <label className={labelCls}>Last Name *</label>
                  <input className={inputCls} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="e.g. Johnson" />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth *</label>
                  <input type="date" className={inputCls} value={form.dob} onChange={e => set('dob', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Gender *</label>
                  <select className={selectCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Blood Group</label>
                  <input className={inputCls} value={form.blood_group} onChange={e => set('blood_group', e.target.value)} placeholder="e.g. O+" />
                </div>
                <div>
                  <label className={labelCls}>NIN / National ID</label>
                  <input className={inputCls} value={form.nin} onChange={e => set('nin', e.target.value)} placeholder="e.g. 120492019" />
                </div>
                <div>
                  <label className={labelCls}>Student Email (optional)</label>
                  <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. sarah@mail.com" />
                </div>
                <div>
                  <label className={labelCls}>Student Phone (optional)</label>
                  <input type="tel" className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. +232 76 000 000" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Home Address</label>
                  <input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 12 Broad Street" />
                </div>
                <div>
                  <label className={labelCls}>City / State</label>
                  <input className={inputCls} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Freetown" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all">
                  Next: Academic Placement <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Academic Placement */}
          {step === 2 && (
            <div className="glass-card p-6 space-y-5 animate-fade-in">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[hsl(var(--accent))]" />
                Step 2 — Academic Placement
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Class / Grade</label>
                  <select className={selectCls} value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); set('section_id', ''); }}>
                    <option value="">— Select Class —</option>
                    {classOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Section / Stream</label>
                  <select className={selectCls} value={form.section_id} onChange={e => set('section_id', e.target.value)} disabled={!selectedClassId}>
                    <option value="">— Select Section —</option>
                    {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              {!classOptions.length && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  No classes configured yet. You can skip this step and assign a class later from the student profile.
                </div>
              )}
              <div className="p-3 rounded-xl bg-[hsl(var(--accent)/0.08)] border border-[hsl(var(--accent)/0.15)] text-xs text-[hsl(var(--text-secondary))]">
                <p className="font-semibold text-[hsl(var(--accent))] mb-1">ℹ️ Class assignment is optional</p>
                <p>You can admit the student without assigning a class and place them later. They will appear in the Active Students registry immediately.</p>
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-sm font-bold hover:opacity-90">
                  Next: Parent / Guardian <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Parent / Guardian */}
          {step === 3 && (
            <div className="glass-card p-6 space-y-5 animate-fade-in">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <Users className="w-4 h-4 text-[hsl(var(--accent))]" />
                Step 3 — Parent / Guardian Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Guardian Full Name *</label>
                  <input className={inputCls} value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} placeholder="e.g. Patricia Johnson" />
                </div>
                <div>
                  <label className={labelCls}>Guardian Phone *</label>
                  <input type="tel" className={inputCls} value={form.guardian_phone} onChange={e => set('guardian_phone', e.target.value)} placeholder="e.g. +232 76 000 001" />
                </div>
                <div>
                  <label className={labelCls}>Guardian Email (optional)</label>
                  <input type="email" className={inputCls} value={form.guardian_email} onChange={e => set('guardian_email', e.target.value)} placeholder="e.g. guardian@mail.com" />
                </div>
                <div>
                  <label className={labelCls}>Relationship</label>
                  <select className={selectCls} value={form.guardian_relation} onChange={e => set('guardian_relation', e.target.value)}>
                    <option>Father</option><option>Mother</option><option>Legal Guardian</option><option>Sponsor</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(4)} disabled={!canProceedStep3} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40">
                  Review & Confirm <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Confirm & Admit */}
          {step === 4 && (
            <div className="glass-card p-6 space-y-5 animate-fade-in">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Step 4 — Confirm & Admit
              </h3>

              {/* Summary Card */}
              <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                <div className="bg-[hsl(var(--bg-secondary))] px-4 py-3 flex items-center gap-3 border-b border-[hsl(var(--border))]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Student" className="w-12 h-12 rounded-full object-cover border-2 border-[hsl(var(--accent)/0.3)]" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent)/0.15)] flex items-center justify-center text-[hsl(var(--accent))] font-bold text-lg">
                      {form.first_name?.[0]}{form.last_name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{form.first_name} {form.last_name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">
                      {form.gender} · DOB: {form.dob || 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-px bg-[hsl(var(--border))]">
                  {[
                    ['Class', selectedClass?.name || 'Not assigned'],
                    ['Section', selectedSection?.name || 'Not assigned'],
                    ['Guardian', form.guardian_name || '—'],
                    ['Guardian Phone', form.guardian_phone || '—'],
                    ['Address', form.address || '—'],
                    ['City', form.city || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[hsl(var(--bg-tertiary))] px-4 py-2.5">
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold">{label}</p>
                      <p className="text-xs font-semibold text-[hsl(var(--text-primary))] mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Instant Enrollment
                </p>
                <p className="opacity-85">Clicking "Admit Student" will immediately create an active student record. The student will appear in the Students dashboard right away.</p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={isPending}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Admitting...</> : <><CheckCircle2 className="w-4 h-4" /> Admit Student</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — Recently Admitted */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-4">
              <ClipboardList className="w-4 h-4 text-[hsl(var(--accent))]" />
              Recently Admitted
            </h3>
            {students.length === 0 ? (
              <div className="text-center py-8 text-xs text-[hsl(var(--text-tertiary))]">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No students admitted yet
              </div>
            ) : (
              <div className="space-y-3">
                {students.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.first_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent)/0.12)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold flex-shrink-0">
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[hsl(var(--text-primary))] truncate">{s.first_name} {s.last_name}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">
                        {s.className}{s.sectionName ? ` — ${s.sectionName}` : ''}
                      </p>
                    </div>
                    <code className="text-[9px] font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded flex-shrink-0">
                      {s.admission_number}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="glass-card p-4 space-y-3">
            <h4 className="text-xs font-bold text-[hsl(var(--text-primary))]">📌 Admin Admission vs Online Application</h4>
            <div className="space-y-2 text-[11px] text-[hsl(var(--text-secondary))]">
              <p>• <strong className="text-[hsl(var(--text-primary))]">Admin Admission</strong> (this page) — instant student creation, no screening stages.</p>
              <p>• <strong className="text-[hsl(var(--text-primary))]">Online Applications</strong> — parents apply via the public portal. Process them through the 7-stage pipeline in the Applications module.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
