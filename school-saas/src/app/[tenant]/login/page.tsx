import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export default async function TenantLoginPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-[hsl(var(--accent))]" />
          </div>
          <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] capitalize">{tenant.replace(/-/g, ' ')}</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Sign in to your school portal</p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <input type="email" placeholder="you@school.edu" className="w-full h-10 pl-10 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <input type="password" placeholder="••••••••" className="w-full h-10 pl-10 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs text-[hsl(var(--text-tertiary))]">
            <a href="#" className="text-[hsl(var(--accent))] hover:underline">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
}
