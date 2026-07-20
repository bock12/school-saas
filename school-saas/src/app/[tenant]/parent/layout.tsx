import { requireParent } from '@/lib/auth/guards';
import { ParentSidebar } from '@/components/tenant/parent-sidebar';
import { TenantTopbar } from '@/components/tenant/topbar';
import { SidebarProvider } from '@/components/tenant/sidebar-provider';
import { SidebarLayoutShell } from '@/components/tenant/sidebar-layout-shell';

export default async function ParentDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { user, profile, school } = await requireParent(tenant);

  const displayName =
    profile.full_name || user.email?.split('@')[0] || 'Parent';

  const tenantName =
    school.name ||
    tenant.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
        <ParentSidebar
          tenantSlug={tenant}
          tenantName={tenantName}
          primaryColor={school.primary_color || '#6366f1'}
        />
        <SidebarLayoutShell>
          <TenantTopbar
            tenantSlug={tenant}
            tenantName={tenantName}
            userName={displayName}
            userRole={profile.role}
            tenantType={school.type}
          />
          <main className="p-4 sm:p-6 min-h-[calc(100vh-4rem)]">{children}</main>
        </SidebarLayoutShell>
      </div>
    </SidebarProvider>
  );
}
