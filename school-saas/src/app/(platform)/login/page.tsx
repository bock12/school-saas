'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2,
  Sparkles, Shield, Building2, School, ChevronDown, X, Search
} from 'lucide-react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

type Tenant = { id: string; name: string; slug: string; type: string; logo_url: string | null };

export default function PlatformLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantSearch, setTenantSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'magic_link'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load tenant list
  useEffect(() => {
    fetch('/api/public/tenants')
      .then(r => r.json())
      .then(d => setTenants(d.tenants || []));
  }, []);

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    t.slug.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) { setError('Please select your school or organization first.'); return; }
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === 'magic_link') {
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: identifier,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
      });
      if (otpErr) setError(otpErr.message);
      else setSuccess('Magic link sent! Check your email to complete login.');
      setLoading(false);
      return;
    }

    // Password login — delegate to tenant login action
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (signInErr) {
      setError(signInErr.message === 'Invalid login credentials'
        ? 'Incorrect email or password. Please try again.'
        : signInErr.message);
      setLoading(false);
      return;
    }

    // After successful auth, redirect to the tenant's dashboard
    const tenantBase = typeof window !== 'undefined'
      ? `${window.location.protocol}//${selectedTenant.slug}.${window.location.hostname.replace(/^(www\.|admin\.)/, '')}${window.location.port ? `:${window.location.port}` : ''}`
      : `/${selectedTenant.slug}`;

    window.location.href = `${tenantBase}/dashboard`;
  };

  const handleGoogleLogin = async () => {
    if (!selectedTenant) { setError('Please select your school or organization first.'); return; }
    const tenantBase = typeof window !== 'undefined'
      ? `${window.location.protocol}//${selectedTenant.slug}.${window.location.hostname.replace(/^(www\.|admin\.)/, '')}${window.location.port ? `:${window.location.port}` : ''}`
      : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${tenantBase}/dashboard` }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex flex-col">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[hsl(var(--accent)/0.05)] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 h-16 flex items-center justify-between px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.8)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center shadow-md">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-[hsl(var(--text-primary))]">{APP_NAME}</span>
        </Link>
        <Link href="/super-admin/login" className="text-xs text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] flex items-center gap-1 transition-colors">
          <Shield className="w-3.5 h-3.5" /> Super Admin
        </Link>
      </header>

      {/* Main login card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-5">

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Welcome Back</h1>
            <p className="text-sm text-[hsl(var(--text-secondary))]">Select your school and sign in to your portal.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-5 shadow-xl">

            {/* Error / Success */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> {success}
              </div>
            )}

            {/* Step 1: Select School/Org */}
            <div>
              <label className="block text-[11px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-2">
                Select Your School or Organization *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-sm border transition-all ${
                    selectedTenant
                      ? 'bg-[hsl(var(--accent)/0.08)] border-[hsl(var(--accent)/0.3)] text-[hsl(var(--text-primary))]'
                      : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
                  }`}
                >
                  {selectedTenant ? (
                    <span className="flex items-center gap-2 font-semibold">
                      {selectedTenant.type === 'organization'
                        ? <Building2 className="w-4 h-4 text-purple-400" />
                        : <School className="w-4 h-4 text-blue-400" />}
                      {selectedTenant.name}
                    </span>
                  ) : (
                    <span>— Select institution —</span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTenantDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTenantDropdown && (
                  <div className="absolute top-12 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search within dropdown */}
                    <div className="p-2 border-b border-[hsl(var(--border))]">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                        <input
                          autoFocus
                          type="text"
                          value={tenantSearch}
                          onChange={e => setTenantSearch(e.target.value)}
                          placeholder="Search school..."
                          className="w-full h-8 pl-8 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      {filteredTenants.length === 0 ? (
                        <p className="text-xs text-center py-4 text-[hsl(var(--text-tertiary))]">No institutions found</p>
                      ) : (
                        filteredTenants.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { setSelectedTenant(t); setShowTenantDropdown(false); setTenantSearch(''); setError(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[hsl(var(--bg-tertiary))] transition-colors text-left"
                          >
                            {t.logo_url ? (
                              <img src={t.logo_url} alt={t.name} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-[hsl(var(--accent)/0.15)] flex items-center justify-center text-[hsl(var(--accent))] font-black text-[10px] flex-shrink-0">
                                {t.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{t.name}</p>
                              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">{t.slug} · {t.type}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-xl bg-white text-gray-700 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[hsl(var(--border))]" />
              <span className="mx-4 text-[10px] font-semibold text-[hsl(var(--text-tertiary))]">OR</span>
              <div className="flex-grow border-t border-[hsl(var(--border))]" />
            </div>

            {/* Mode toggle */}
            <div className="flex p-1 bg-[hsl(var(--bg-tertiary))] rounded-xl">
              {(['password', 'magic_link'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === m
                      ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm'
                      : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
                  }`}
                >
                  {m === 'password' ? 'Password' : '✨ Magic Link'}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[hsl(var(--text-secondary))] mb-1.5">
                  Email, Phone or Student ID *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="admin@school.edu or STU-2026-1760"
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                  />
                </div>
              </div>

              {mode === 'password' && (
                <div>
                  <label className="block text-[11px] font-bold text-[hsl(var(--text-secondary))] mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-10 pr-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                    />
                  </div>
                  <p className="text-right mt-1.5">
                    <a href="#" className="text-[11px] text-[hsl(var(--accent))] hover:underline">Forgot password?</a>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[hsl(var(--accent)/0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'magic_link' ? (
                  <><Sparkles className="w-4 h-4" /> Send Magic Link</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-[hsl(var(--text-tertiary))]">
            Secure authentication powered by {APP_NAME}
          </p>
        </div>
      </main>
    </div>
  );
}
