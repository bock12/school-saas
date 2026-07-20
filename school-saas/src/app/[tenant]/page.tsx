import { redirect } from 'next/navigation';
import { requireTenantUser } from '@/lib/auth/guards';

export default async function TenantRootRedirect({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { profile } = await requireTenantUser(tenant);

  // Redirect based on role
  if (['super_admin', 'org_admin', 'school_admin'].includes(profile.role)) {
    redirect(`/admin`);
  } else if (profile.role === 'teacher') {
    redirect(`/teacher`);
  } else if (profile.role === 'student') {
    redirect(`/student`);
  } else if (profile.role === 'parent') {
    redirect(`/parent`);
  } else {
    // Fallback if role is unknown or missing
    redirect(`/login`);
  }
}
