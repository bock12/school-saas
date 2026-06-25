'use client';

import { Shield, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TenantLoginForm({ tenantSlug, tenantName }: { tenantSlug: string; tenantName: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Sign in via Supabase Auth
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

    // 2. Fetch user profile and verify tenant match
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id, tenants(slug)')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      setError('User profile not found. Contact your administrator.');
      setLoading(false);
      return;
    }

    // 3. ENFORCE TENANT ISOLATION: Ensure user belongs to this school's subdomain
    const profileTenant = (profile as unknown as { tenants: { slug: string } | null }).tenants;
    if (!profileTenant || profileTenant.slug !== tenantSlug) {
      // Cross-tenant access attempt — force sign out immediately
      await supabase.auth.signOut();
      setError(`Access denied. Your account does not belong to this school portal.`);
      setLoading(false);
      return;
    }

    // 4. Success — redirect to the tenant dashboard
    router.push(`/${tenantSlug}`);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[hsl(var(--accent))]" />
          </div>
          <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] capitalize">{tenantName}</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Sign in to your school portal</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-center text-xs text-[hsl(var(--text-tertiary))]">
            <a href="#" className="text-[hsl(var(--accent))] hover:underline">Forgot password?</a>
          </p>
        </form>

        <p className="text-center text-[10px] text-[hsl(var(--text-tertiary))] mt-6">
          Secure login powered by SchoolSaaS
        </p>
      </div>
    </div>
  );
}
