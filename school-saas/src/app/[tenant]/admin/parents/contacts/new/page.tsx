import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { NewContactClient } from './new-contact-client';

export default async function NewContactPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { school: org } = await requireOrgAdmin(tenant);

  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name, admission_number')
    .eq('tenant_id', org.id);

  return <NewContactClient tenant={tenant} students={students || []} />;
}
