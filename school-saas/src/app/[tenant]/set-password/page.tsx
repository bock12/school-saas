import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { SetPasswordForm } from './set-password-form';
import { createClient } from '@/lib/supabase/server';

export default async function SetPasswordPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  // Get current session — the invite link has already been exchanged for a session
  // by the /api/auth/callback route.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If there's no active session, the invite link may have expired. Redirect to login.
  if (!user) {
    redirect(`/${tenant}/login?error=InviteExpired`);
  }

  // Fetch the tenant info for display
  const adminSupabase = createAdminClient();
  const { data: school } = await adminSupabase
    .from('tenants')
    .select('name')
    .eq('slug', tenant)
    .single();

  return (
    <SetPasswordForm
      tenantSlug={tenant}
      tenantName={school?.name ?? tenant}
    />
  );
}
