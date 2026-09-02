import { redirect } from 'next/navigation';

export default async function SubjectsRedirectPage({ params }: { params: Promise<{ tenant: string }> }) {
  const resolvedParams = await params;
  redirect(`/${resolvedParams.tenant}/admin/academics/subjects`);
}
