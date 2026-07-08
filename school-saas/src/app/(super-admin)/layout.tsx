import { SuperAdminLayoutShell } from '@/components/super-admin/layout-shell';
import { SidebarProvider } from '@/components/super-admin/sidebar-provider';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SuperAdminLayoutShell>{children}</SuperAdminLayoutShell>
    </SidebarProvider>
  );
}
