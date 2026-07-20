'use client';

import { useState } from 'react';
import { X, Mail, Key, AlertCircle, Loader2 } from 'lucide-react';
import { sendPasswordReset, resetUserPasswordManually } from '@/app/actions/users';

interface PasswordResetModalProps {
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  tenantSlug: string;
  onClose: () => void;
}

export function PasswordResetModal({ user, tenantSlug, onClose }: PasswordResetModalProps) {
  const [mode, setMode] = useState<'email' | 'manual'>('email');
  const [manualPassword, setManualPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendEmail = async () => {
    if (!user.email) {
      setError('User has no email address configured.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await sendPasswordReset(user.email, tenantSlug);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess('Password reset email sent successfully.');
    } else {
      setError(res.error || 'Failed to send reset email.');
    }
  };

  const handleManualReset = async () => {
    if (manualPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await resetUserPasswordManually(user.id, manualPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess('Password manually updated. The user can now log in.');
      setManualPassword('');
    } else {
      setError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl p-6 space-y-5 animate-fade-in-scale">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Reset Password</h3>
          <button onClick={onClose} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Reset password for <span className="font-bold text-[hsl(var(--text-primary))]">{user.full_name}</span>.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2 text-emerald-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        <div className="flex bg-[hsl(var(--bg-tertiary))] p-1 rounded-lg">
          <button
            onClick={() => { setMode('email'); setError(null); setSuccess(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${mode === 'email' ? 'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
          >
            <Mail className="w-3.5 h-3.5" /> Send Link
          </button>
          <button
            onClick={() => { setMode('manual'); setError(null); setSuccess(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${mode === 'manual' ? 'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
          >
            <Key className="w-3.5 h-3.5" /> Set Manually
          </button>
        </div>

        {mode === 'email' && (
          <div className="space-y-4">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              This will send a secure link to <strong className="text-[hsl(var(--text-secondary))]">{user.email || 'no email provided'}</strong> allowing the user to choose a new password.
            </p>
            <button
              onClick={handleSendEmail}
              disabled={isSubmitting || !user.email}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Reset Email
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-4">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              Manually set a temporary password for this user. They can use this to log in immediately.
            </p>
            <div>
              <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">New Password</label>
              <input
                type="text"
                value={manualPassword}
                onChange={e => setManualPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
            <button
              onClick={handleManualReset}
              disabled={isSubmitting || manualPassword.length < 6}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Password
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
