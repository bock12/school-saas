import { SuperAdminLayoutShell } from '@/components/super-admin/layout-shell';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayoutShell>{children}</SuperAdminLayoutShell>;
}
