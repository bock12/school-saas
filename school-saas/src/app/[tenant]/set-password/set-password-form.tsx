'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface SetPasswordFormProps {
  tenantSlug: string;
  tenantName: string;
}

export function SetPasswordForm({ tenantSlug, tenantName }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Password strength checks
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
  ];
  const isStrong = checks.every(c => c.ok);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrong) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { requires_password_change: null }
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.replace('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center mx-auto mb-4 border border-[hsl(var(--accent)/0.2)]">
            <ShieldCheck className="w-8 h-8 text-[hsl(var(--accent))]" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Set Your Password</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Welcome to <span className="font-semibold text-[hsl(var(--text-primary))]">{tenantName}</span>!<br />
            Please create a secure password to access your dashboard.
          </p>
        </div>

        {success ? (
          <div className="glass-card p-8 text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Password Set!</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              Redirecting you to your dashboard…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                {error}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Create a strong password"
                  className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:border-[hsl(var(--accent))] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strength checks */}
            {password.length > 0 && (
              <div className="space-y-1.5">
                {checks.map(c => (
                  <div key={c.label} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.ok ? 'bg-emerald-500' : 'bg-[hsl(var(--text-tertiary))]'}`} />
                    <span className={`text-[11px] ${c.ok ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Repeat your password"
                  className={`w-full bg-[hsl(var(--bg-tertiary))] border rounded-xl pl-10 pr-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none transition-colors ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-[hsl(var(--border))] focus:border-[hsl(var(--accent))]'
                  }`}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isStrong || password !== confirmPassword}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set Password & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
