'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { UserPlus, X, Search, Mail, Lock, CheckCircle2, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { assignSchoolAdmin } from '@/app/actions/tenant';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface StaffProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

interface AssignAdminModalProps {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  orgStaff: StaffProfile[];
  onClose: () => void;
}

type CredentialMode = 'invite' | 'password';
type AssignMode = 'existing' | 'new';

export function AssignAdminModal({ schoolId, schoolName, schoolSlug, orgStaff, onClose }: AssignAdminModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [assignMode, setAssignMode] = useState<AssignMode>('existing');
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<StaffProfile | null>(null);

  // New user fields
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [credMode, setCredMode] = useState<CredentialMode>('invite');
  const [tempPassword, setTempPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredStaff = useMemo(() => {
    const q = search.toLowerCase();
    return orgStaff.filter(
      (s) =>
        (s.full_name ?? '').toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q)
    );
  }, [orgStaff, search]);

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';

  const handleSubmit = () => {
    setError(null);

    if (assignMode === 'existing' && !selectedProfile) {
      setError('Please select a staff member.');
      return;
    }
    if (assignMode === 'new') {
      if (!newEmail.trim()) { setError('Email is required.'); return; }
      if (credMode === 'password' && tempPassword.length < 8) {
        setError('Temporary password must be at least 8 characters.');
        return;
      }
    }

    startTransition(async () => {
      const res = await assignSchoolAdmin(schoolId, schoolSlug, {
        profileId: assignMode === 'existing' ? selectedProfile!.id : undefined,
        email: assignMode === 'new' ? newEmail.trim() : undefined,
        name: assignMode === 'new' ? newName.trim() : undefined,
        tempPassword: assignMode === 'new' && credMode === 'password' ? tempPassword : undefined,
      });

      if (!res.success) {
        setError(res.error ?? 'An error occurred.');
      } else {
        setSuccess(true);
        setTimeout(onClose, 1800);
      }
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg glass-card animate-fade-in-scale overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.12)] flex items-center justify-center">
              <UserPlus className="w-4.5 h-4.5 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Assign School Admin</h3>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">{schoolName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center animate-bounce-in">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-[hsl(var(--text-primary))]">Admin Assigned!</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              {assignMode === 'new' && credMode === 'invite'
                ? 'An invitation email has been sent.'
                : 'The admin account is ready.'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Mode toggle */}
            <div className="flex rounded-lg overflow-hidden border border-[hsl(var(--border))] p-0.5 bg-[hsl(var(--bg-tertiary))]">
              {(['existing', 'new'] as AssignMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setAssignMode(m); setError(null); }}
                  className={cn(
                    'flex-1 py-2 text-xs font-semibold rounded-md transition-all',
                    assignMode === m
                      ? 'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))] shadow-sm'
                      : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
                  )}
                >
                  {m === 'existing' ? '👤 Select Existing Staff' : '✉️ Add New Admin'}
                </button>
              ))}
            </div>

            {/* Existing staff picker */}
            {assignMode === 'existing' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className={cn(inputCls, 'pl-9')}
                  />
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {filteredStaff.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[hsl(var(--text-tertiary))]">
                      {orgStaff.length === 0 ? 'No org staff found. Use "Add New Admin" instead.' : 'No results match your search.'}
                    </div>
                  ) : (
                    filteredStaff.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedProfile(s)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                          selectedProfile?.id === s.id
                            ? 'bg-[hsl(var(--accent)/0.12)] border border-[hsl(var(--accent)/0.3)]'
                            : 'hover:bg-[hsl(var(--bg-tertiary))] border border-transparent'
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--info)/0.3)] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--accent))] flex-shrink-0">
                          {(s.full_name ?? 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[hsl(var(--text-primary))] truncate">{s.full_name ?? '—'}</p>
                          <p className="text-[11px] text-[hsl(var(--text-tertiary))] truncate">{s.email}</p>
                        </div>
                        {selectedProfile?.id === s.id && (
                          <UserCheck className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {selectedProfile && (
                  <div className="p-3 rounded-lg bg-[hsl(var(--accent)/0.06)] border border-[hsl(var(--accent)/0.2)] text-xs text-[hsl(var(--text-secondary))]">
                    <strong className="text-[hsl(var(--accent))]">{selectedProfile.full_name}</strong> will be assigned as School Admin for <strong>{schoolName}</strong>. They can log in immediately with their existing credentials.
                  </div>
                )}
              </div>
            )}

            {/* New user form */}
            {assignMode === 'new' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5 block">Email *</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@school.edu" className={inputCls} />
                  </div>
                </div>

                {/* Credential mode */}
                <div>
                  <label className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-2 block">Access Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'invite', icon: Mail, label: 'Send Invitation', sub: 'Magic link via email' },
                      { value: 'password', icon: Lock, label: 'Set Password', sub: 'Temporary credentials' },
                    ] as const).map(({ value, icon: Icon, label, sub }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCredMode(value)}
                        className={cn(
                          'flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all',
                          credMode === value
                            ? 'border-[hsl(var(--accent)/0.5)] bg-[hsl(var(--accent)/0.08)]'
                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)] hover:bg-[hsl(var(--bg-tertiary))]'
                        )}
                      >
                        <Icon className={cn('w-4 h-4', credMode === value ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-tertiary))]')} />
                        <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{label}</span>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {credMode === 'password' && (
                  <div>
                    <label className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5 block">Temporary Password *</label>
                    <input
                      type="text"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={inputCls}
                    />
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1.5">Admin must change this password on first login.</p>
                  </div>
                )}

                {credMode === 'invite' && (
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-3 py-2.5 rounded-lg">
                    An invitation link will be sent to the admin's email. They'll be redirected to set their own password before accessing the school dashboard.
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors font-medium">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Assigning…</> : 'Assign Admin'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
