import { requireTenantUser } from '@/lib/auth/guards';
import { TenantSidebar } from '@/components/tenant/sidebar';
import { TenantTopbar } from '@/components/tenant/topbar';
import { SidebarProvider } from '@/components/tenant/sidebar-provider';
import { SidebarLayoutShell } from '@/components/tenant/sidebar-layout-shell';

export default async function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { user, profile, school } = await requireTenantUser(tenant);

  // ── 4. Build display name ──────────────────────────────────────
  const displayName =
    profile.full_name || user.email?.split('@')[0] || 'School User';

  const tenantName =
    school.name ||
    tenant.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
        <TenantSidebar
          tenantSlug={tenant}
          tenantName={tenantName}
          primaryColor={school.primary_color || '#6366f1'}
        />
        {/* SidebarLayoutShell handles the dynamic left margin based on sidebar state */}
        <SidebarLayoutShell>
          <TenantTopbar
            tenantSlug={tenant}
            tenantName={tenantName}
            userName={displayName}
            userRole={profile.role}
          />
          <main className="p-4 sm:p-6 min-h-[calc(100vh-4rem)]">{children}</main>
        </SidebarLayoutShell>
      </div>
    </SidebarProvider>
  );
}
