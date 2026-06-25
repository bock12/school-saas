import { TenantSidebar } from '@/components/tenant/sidebar';
import { TenantTopbar } from '@/components/tenant/topbar';

export default async function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  // TODO: Fetch tenant branding + user profile from Supabase
  // const supabase = await createClient();
  // const { data: tenantData } = await supabase.from('tenants').select('*').eq('slug', tenant).single();
  // const { data: { user } } = await supabase.auth.getUser();

  const tenantName = tenant
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      <TenantSidebar
        tenantSlug={tenant}
        tenantName={tenantName}
        primaryColor="#6366f1"
      />
      <div className="ml-[260px] transition-all duration-300">
        <TenantTopbar
          tenantName={tenantName}
          userName="John Admin"
          userRole="school_admin"
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
