import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { ParentDetailClient } from './parent-detail-client';
import { notFound } from 'next/navigation';

export default async function ParentDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant, id } = await params;
  const { school: org } = await requireOrgAdmin(tenant);

  const supabase = await createClient();

  const { data: parent } = await supabase
    .from('parents')
    .select(`
      *,
      student_parents (
        relationship,
        is_primary,
        is_emergency_contact,
        students (
          id,
          first_name,
          last_name,
          admission_number
        )
      )
    `)
    .eq('id', id)
    .eq('tenant_id', org.id)
    .single();

  if (!parent) {
    notFound();
  }

  // Format data for client component
  const formattedParent = {
    ...parent,
    name: `${parent.first_name} ${parent.last_name}`,
    portalStatus: parent.profile_id ? 'Active' : 'Unregistered',
    prefContact: 'Email',
    outstanding_balance: 0,
  };

  const linkedChildren = (parent.student_parents || []).map((sp: any) => ({
    id: sp.students?.id,
    name: `${sp.students?.first_name} ${sp.students?.last_name}`,
    grade: sp.students?.admission_number || 'N/A', // Using admission number as a proxy for grade in mock
    stream: sp.relationship, // Using relationship for stream in mock
    status: sp.is_primary ? 'Primary' : 'Secondary'
  }));

  return <ParentDetailClient tenant={tenant} parent={formattedParent} linkedChildren={linkedChildren} />;
}
