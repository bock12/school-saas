'use client';

import { School, Plus, X, Globe, Building2, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addSchoolToOrg } from '@/app/actions/tenant';
import { SCHOOL_TYPES, SCHOOL_LEVELS, SCHOOL_SHIFTS } from '@/features/tenant-management/constants/provisioning';
import { cn } from '@/lib/utils';

interface AddSchoolButtonProps {
  tenantSlug: string;
  orgId: string;
}

export function AddSchoolButton({ orgId }: AddSchoolButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [schoolType, setSchoolType] = useState(SCHOOL_TYPES[0]);
  const [levels, setLevels] = useState<string[]>([]);
  const [shifts, setShifts] = useState<string[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [sendInvite, setSendInvite] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isValidSlug = (s: string) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(s);

  const toggleLevel = (val: string) => {
    setLevels(prev => prev.includes(val) ? prev.filter(l => l !== val) : [...prev, val]);
  };

  const toggleShift = (val: string) => {
    setShifts(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);
  };

  const handleCreate = () => {
    if (!name || !slug) {
      setError('Name and subdomain are required.');
      return;
    }
    if (!isValidSlug(slug)) {
      setError('Subdomain must be lowercase, numbers, and hyphens only.');
      return;
    }

    if (!sendInvite && adminEmail && adminPassword.length < 8) {
      setError('Temporary password must be at least 8 characters.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await addSchoolToOrg(orgId, {
        name,
        slug,
        schoolType,
        schoolLevels: levels,
        schoolShifts: shifts,
        adminEmail: adminEmail || undefined,
        adminName: adminName || undefined,
        adminPassword: (!sendInvite && adminEmail && adminPassword) ? adminPassword : undefined,
      });

      if (!res.success) {
        setError(res.error || 'Failed to create school');
      } else {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setName('');
          setSlug('');
          setAdminEmail('');
          setAdminName('');
          setAdminPassword('');
          setSendInvite(true);
          setLevels([]);
          setShifts([]);
          router.refresh();
        }, 2000);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
      >
        <Plus className="w-4 h-4" />
        Add School
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />
          
          <div className="relative w-full max-w-lg glass-card p-6 animate-fade-in-scale max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                <School className="w-5 h-5 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Provision New School</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Add a child school to this organization</p>
              </div>
            </div>

            {success ? (
              <div className="py-8 text-center animate-fade-in space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">School Created!</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                    The school has been added to your organization.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                      School Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!slug) {
                          setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                        }
                      }}
                      className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:border-[hsl(var(--accent))] focus:outline-none transition-colors"
                      placeholder="e.g. Lincoln High School"
                      disabled={isPending}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                      School Subdomain <span className="text-red-400">*</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-[hsl(var(--border))] focus-within:border-[hsl(var(--accent))] transition-colors">
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                        placeholder="lincoln"
                        disabled={isPending}
                        className="flex-1 bg-[hsl(var(--bg-tertiary))] px-4 py-2.5 text-sm font-mono text-[hsl(var(--text-primary))] focus:outline-none disabled:opacity-50"
                      />
                      <span className="flex-shrink-0 bg-[hsl(var(--bg-elevated))] px-4 py-2.5 text-sm text-[hsl(var(--text-tertiary))] font-mono border-l border-[hsl(var(--border))]">
                        .schoolsaas.com
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                      School Type
                    </label>
                    <select
                      value={schoolType}
                      onChange={(e) => setSchoolType(e.target.value)}
                      disabled={isPending}
                      className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:border-[hsl(var(--accent))] focus:outline-none transition-colors disabled:opacity-50"
                    >
                      {SCHOOL_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                      School Levels
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SCHOOL_LEVELS.map(t => (
                        <label
                          key={t.value}
                          className={cn(
                            'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                            levels.includes(t.value)
                              ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-400'
                              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] text-[hsl(var(--text-secondary))]'
                          )}
                        >
                          <input type="checkbox" className="sr-only" checked={levels.includes(t.value)} onChange={() => toggleLevel(t.value)} disabled={isPending} />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[hsl(var(--border))]" />

                  {/* Optional: Admin Invite */}
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">School Admin (Optional)</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={e => setAdminEmail(e.target.value)}
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:border-[hsl(var(--accent))] focus:outline-none transition-colors"
                          placeholder="admin@example.com"
                          disabled={isPending}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                          Admin Full Name
                        </label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={e => setAdminName(e.target.value)}
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:border-[hsl(var(--accent))] focus:outline-none transition-colors"
                          placeholder="e.g. John Doe"
                          disabled={isPending}
                        />
                      </div>
                      
                      {adminEmail && (
                        <>
                          <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                              type="checkbox"
                              checked={sendInvite}
                              onChange={(e) => setSendInvite(e.target.checked)}
                              disabled={isPending}
                              className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
                            />
                            <span className="text-xs text-[hsl(var(--text-secondary))]">Send invitation link via email</span>
                          </label>

                          {!sendInvite && (
                            <div className="animate-fade-in mt-3">
                              <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                                Temporary Password <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={adminPassword}
                                onChange={e => setAdminPassword(e.target.value)}
                                className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:border-[hsl(var(--accent))] focus:outline-none transition-colors"
                                placeholder="Enter a secure password"
                                disabled={isPending}
                              />
                            </div>
                          )}
                        </>
                      )}

                      {sendInvite ? (
                        <p className="text-[11px] text-[hsl(var(--text-tertiary))]">An invitation link will be sent to this email. They will be prompted to set a password before accessing the school dashboard.</p>
                      ) : (
                        <p className="text-[11px] text-[hsl(var(--text-tertiary))]">The admin can log in immediately using their email and this temporary password.</p>
                      )}
                    </div>
                  </div>

                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                    className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isPending}
                    className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--text-primary))] text-[hsl(var(--bg-primary))] text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create School'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
