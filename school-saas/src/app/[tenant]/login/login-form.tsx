'use client';

import { Shield, Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TenantLoginForm({
  tenantSlug,
  tenantName,
  schoolId,
}: {
  tenantSlug: string;
  tenantName: string;
  schoolId: string;
}) {
  const [mode, setMode] = useState<'password' | 'magic_link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const isAdminSubdomain = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
    const nextPath = isAdminSubdomain ? '/' : `/${tenantSlug}`;

    if (mode === 'password') {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      // Fetch user profile to verify tenant access immediately (prevents flicker)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        setError('User profile not found. Contact your administrator.');
        setLoading(false);
        return;
      }

      if (isAdminSubdomain) {
        if (profile.role !== 'super_admin') {
          await supabase.auth.signOut();
          setError('Access denied. Only system administrators can access this portal.');
          setLoading(false);
          return;
        }
      } else {
        if (profile.role !== 'super_admin' && profile.tenant_id !== schoolId) {
          await supabase.auth.signOut();
          setError('Access denied. Your account does not belong to this school portal.');
          setLoading(false);
          return;
        }
      }

      // Success
      router.push(nextPath);
      router.refresh();
    } else {
      // Magic Link Login
      const redirectTo = `${window.location.origin}/api/auth/callback?next=${nextPath}`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccessMsg('Check your email for the magic link!');
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    
    const isAdminSubdomain = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
    const nextPath = isAdminSubdomain ? '/' : `/${tenantSlug}`;
    const redirectTo = `${window.location.origin}/api/auth/callback?next=${nextPath}`;
    
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[hsl(var(--accent))]" />
          </div>
          <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] capitalize">{tenantName}</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            {tenantSlug === 'admin' ? 'Sign in to the system control center' : 'Sign in to your school portal'}
          </p>
        </div>

        <div className="glass-card p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-400 font-medium">{successMsg}</p>
            </div>
          )}

          {/* Social Auth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-10 rounded-lg bg-white text-gray-700 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[hsl(var(--border))]"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-[hsl(var(--text-tertiary))]">
              OR CONTINUE WITH
            </span>
            <div className="flex-grow border-t border-[hsl(var(--border))]"></div>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-[hsl(var(--bg-tertiary))] rounded-lg">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'password'
                  ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode('magic_link')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'magic_link'
                  ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
              }`}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  className="w-full h-10 pl-10 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                />
              </div>
            </div>

            {mode === 'password' && (
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'magic_link' ? (
                <>Send Magic Link <Sparkles className="w-4 h-4" /></>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {mode === 'password' && (
              <p className="text-center text-xs text-[hsl(var(--text-tertiary))]">
                <a href="#" className="text-[hsl(var(--accent))] hover:underline">Forgot password?</a>
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-[10px] text-[hsl(var(--text-tertiary))] mt-6">
          Secure login powered by SchoolSaaS
        </p>
      </div>
    </div>
  );
}
