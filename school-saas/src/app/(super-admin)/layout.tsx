import { Sidebar } from '@/components/super-admin/sidebar';
import { Topbar } from '@/components/super-admin/topbar';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      <Sidebar />
      <div className="ml-[280px] transition-all duration-300">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
