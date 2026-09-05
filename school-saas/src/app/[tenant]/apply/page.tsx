import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { ApplyClient } from './apply-client';

export default async function PublicApplyPage({ params }: { params: Promise<{ tenant: string }> }) {
  const supabase = await createClient();
  const { tenant: tenantSlug } = await params;
  
  const supabaseAdmin = createAdminClient();

  const { data: tenantData } = await supabaseAdmin
    .from('tenants')
    .select('name, logo_url, domain')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--bg-secondary))]">
      <header className="w-full bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border))] py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-3">
          {tenantData.logo_url ? (
            <img src={tenantData.logo_url} alt={tenantData.name} className="h-10 w-auto rounded-md" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] font-bold">
              {tenantData.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">{tenantData.name}</h1>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-8">
        <ApplyClient tenantSlug={tenantSlug} schoolName={tenantData.name} />
      </main>
    </div>
  );
}
