import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { BrandingForm } from './_components/branding-form';
import { Palette } from 'lucide-react';

export default async function BrandingPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { profile, school: org } = await requireOrgAdmin(tenant);

  const supabase = await createClient();
  const orgId = profile.role === 'org_admin' ? (profile.tenant_id ?? org.id) : org.id;

  // Fetch full tenant row for branding fields
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id, name, logo_url, primary_color, secondary_color, favicon_url, custom_font, custom_domain, domain_verified, email_sender_name, email_reply_to, hide_platform_branding, login_bg_url')
    .eq('id', orgId)
    .single();

  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Domain & Branding</h1>
        </div>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          Customize how <span className="font-semibold text-[hsl(var(--text-primary))]">{org.name}</span> appears to admins and users.
        </p>
      </div>

      <BrandingForm tenantId={orgId} initialData={tenantData ?? {}} />
    </div>
  );
}
