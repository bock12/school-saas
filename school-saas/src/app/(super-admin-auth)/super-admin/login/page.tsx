import { TenantLoginForm } from '@/app/[tenant]/login/login-form';

export default async function SuperAdminLoginPage() {
  return (
    <TenantLoginForm
      tenantSlug="admin"
      tenantName="System Administration"
      schoolId=""
    />
  );
}
