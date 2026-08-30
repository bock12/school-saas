import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { getPgPool } from '@/lib/db/pg-fallback';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  let school: {
    id: string;
    name: string;
    slug: string;
    status: string;
    primary_color: string | null;
    logo_url: string | null;
  } | null = null;

  // 1. Direct PG Pool lookup (fastest & robust against Supabase key format issues)
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT id, name, slug, status, primary_color, logo_url
         FROM tenants
         WHERE slug = $1
         LIMIT 1`,
        [tenant]
      );
      if (res.rows.length > 0) {
        school = res.rows[0];
      }
    } catch (pgErr) {
      console.warn('[TenantLayout] Direct PG lookup failed, falling back to Supabase client:', pgErr);
    }
  }

  // 2. Supabase client fallback
  if (!school) {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('tenants')
      .select('id, name, slug, status, primary_color, logo_url')
      .eq('slug', tenant)
      .maybeSingle();

    if (data && !error) {
      school = data;
    }
  }

  // If the school slug doesn't exist at all, redirect to the main platform homepage
  if (!school) {
    const rootUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    redirect(rootUrl);
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
