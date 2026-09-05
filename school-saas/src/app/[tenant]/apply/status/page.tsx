import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StatusClient } from './status-client';

export default async function PublicApplicationStatusPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;

  // Fetch tenant details using Service Role
  const supabaseAdmin = createAdminClient();

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('name, logo_url')
    .eq('slug', tenantSlug)
    .single();

  if (!tenant) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-secondary))] flex flex-col">
      {/* Header */}
      <header className="w-full bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border))] py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-auto rounded-md" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] font-bold">
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-[hsl(var(--text-primary))]">{tenant.name}</h1>
              <span className="text-xs text-[hsl(var(--text-secondary))] font-medium">Application Status Lookup</span>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Home Page
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-8">
        <StatusClient tenantSlug={tenantSlug} schoolName={tenant.name} />
      </main>
    </div>
  );
}
