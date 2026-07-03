import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  // ── Use the admin (service-role) client ONLY to look up the tenant.
  // This bypasses RLS so unauthenticated visitors (e.g. the login page)
  // can still see the school's name and status without a session cookie.
  const adminSupabase = createAdminClient();

  const { data: school, error } = await adminSupabase
    .from('tenants')
    .select('id, name, slug, status, primary_color, logo_url')
    .eq('slug', tenant)
    .single();

  // If the school slug doesn't exist at all, redirect to the platform homepage
  if (error || !school) {
    redirect('/');
  }

  // ── Handle suspended schools ──────────────────────────────────
  if (school.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Account Suspended</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-3 max-w-xs mx-auto">
            This school portal has been temporarily suspended. Please contact your school administrator or our support team for assistance.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">School</p>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{school.name}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mt-6 text-sm text-[hsl(var(--accent))] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  // ── Active tenant — render the school portal ──────────────────
  return (
    <div
      className="min-h-screen bg-[hsl(var(--bg-primary))]"
      style={{ '--tenant-primary': school.primary_color || '#6366f1' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
