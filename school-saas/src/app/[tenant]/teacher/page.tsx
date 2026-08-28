import { requireTeacher } from '@/lib/auth/guards';
import { TeacherDashboardContent } from '@/components/teacher/TeacherDashboardContent';

export default async function TeacherDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tenant } = await params;
  const { tab = 'dashboard' } = await searchParams;
  const { user, profile, school } = await requireTeacher(tenant);

  const displayName =
    profile?.full_name || user?.email?.split('@')[0] || 'Teacher';

  return (
    <TeacherDashboardContent
      tab={tab}
      teacher={{
        id: user.id,
        name: displayName,
        email: user.email || '',
        role: profile?.role || 'teacher',
        department: (profile as Record<string, unknown>)?.department as string | undefined,
        tenantSlug: tenant,
        tenantName: school?.name || tenant,
        primaryColor: school?.primary_color || '#6366f1',
        schoolLevel: school?.type || 'school',
      }}
    />
  );
}
