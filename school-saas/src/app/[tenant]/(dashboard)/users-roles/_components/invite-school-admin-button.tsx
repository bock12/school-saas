'use client';

import { useState, useTransition } from 'react';
import { UserPlus, X, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { inviteTenantAdmin } from '@/app/actions/tenant';

interface InviteSchoolAdminButtonProps {
  schoolId: string;
  schoolName: string;
}

export function InviteSchoolAdminButton({ schoolId, schoolName }: InviteSchoolAdminButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setOpen(false);
    setName(''); setEmail(''); setError(''); setSuccess('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) { setError('Email is required.'); return; }
    startTransition(async () => {
      try {
        await inviteTenantAdmin(email.trim(), name.trim(), schoolId, 'school_admin');
        setSuccess(`Invite sent to ${email}. They will receive a secure activation link shortly.`);
        setName(''); setEmail('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to send invite.');
      }
    });
  }

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
  const labelCls = 'block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
      >
        <UserPlus className="w-4 h-4" />
        Invite Admin
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative w-full max-w-md glass-card p-6 animate-fade-in-scale space-y-4">
            <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Invite School Admin</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">for {schoolName}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@school.com" required className={inputCls} />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl border border-[hsl(var(--info)/0.2)] bg-[hsl(var(--info)/0.05)]">
                <Info className="w-4 h-4 text-[hsl(var(--info))] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-[hsl(var(--info))] leading-relaxed">
                  A secure invite link will be emailed. The admin sets their own password on first login. No temporary passwords are shared.
                </p>
              </div>

              {error && <p className="text-xs text-[hsl(var(--danger))] bg-[hsl(var(--danger)/0.1)] px-3 py-2 rounded-lg">{error}</p>}
              {success && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-emerald-400 leading-relaxed">{success}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={handleClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2">
                  {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending…</> : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
