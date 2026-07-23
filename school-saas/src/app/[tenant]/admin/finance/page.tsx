import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function FinancePage({ params }: PageProps) {
  const { tenant } = await params;
  redirect(`/${tenant}/admin/bursary`);
}
