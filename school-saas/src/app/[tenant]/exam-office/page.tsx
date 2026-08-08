import { requireExamOfficer } from '@/lib/auth/guards';
import { ExamOfficeDashboardContent } from '@/components/exam-office/ExamOfficeDashboardContent';

export default async function ExamOfficePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tenant } = await params;
  const { tab = 'dashboard' } = await searchParams;
  const { user, profile, school } = await requireExamOfficer(tenant);

  const displayName =
    profile.full_name || user.email?.split('@')[0] || 'Exam Officer';

  return (
    <ExamOfficeDashboardContent
      tab={tab}
      officer={{
        id: user.id,
        name: displayName,
        email: user.email || '',
        role: profile.role || 'exam_officer',
        tenantSlug: tenant,
        tenantName: school.name || tenant,
        primaryColor: school.primary_color || '#7c3aed',
        schoolLevel: school.type || 'school',
      }}
    />
  );
}
