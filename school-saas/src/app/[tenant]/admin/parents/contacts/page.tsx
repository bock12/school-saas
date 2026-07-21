import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { ContactsClient } from './contacts-client';

export default async function ContactsListPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { school: org } = await requireOrgAdmin(tenant);

  const supabase = await createClient();

  // Fetch parents and their linked students
  const { data: parentsData } = await supabase
    .from('parents')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      address,
      profile_id,
      student_parents (
        relationship,
        is_primary,
        is_emergency_contact,
        students (
          first_name,
          last_name
        )
      )
    `)
    .eq('tenant_id', org.id);

  const formattedContacts = (parentsData || []).map((p: any) => {
    const studentLinks = p.student_parents || [];
    const children = studentLinks
      .map((sp: any) => sp.students ? `${sp.students.first_name} ${sp.students.last_name}` : '')
      .filter(Boolean);

    // Get the highest priority relationship to show as 'type'
    const relationships = studentLinks.map((sp: any) => sp.relationship);
    const type = relationships.includes('Sponsor') ? 'Sponsor' : (relationships[0] || 'Guardian');

    return {
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      type,
      email: p.email,
      phone: p.phone,
      address: p.address,
      children,
      portalAccess: !!p.profile_id,
      isEmergency: studentLinks.some((sp: any) => sp.is_emergency_contact),
      isFinancial: type === 'Sponsor' || studentLinks.some((sp: any) => sp.is_primary)
    };
  });

  return <ContactsClient contacts={formattedContacts} tenant={tenant} />;
}
