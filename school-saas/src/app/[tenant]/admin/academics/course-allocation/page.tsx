import { redirect } from 'next/navigation';

export default async function CourseAllocationRedirectPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/${resolvedParams.tenant}/admin/academics/offerings`);
}
