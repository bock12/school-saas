import { requireSuperAdmin } from '@/lib/auth/guards';
import { SuperAdminLayoutShell } from '@/components/super-admin/layout-shell';
import { SidebarProvider } from '@/components/super-admin/sidebar-provider';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <SidebarProvider>
      <SuperAdminLayoutShell>{children}</SuperAdminLayoutShell>
    </SidebarProvider>
  );
}

