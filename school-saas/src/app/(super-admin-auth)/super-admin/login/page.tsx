import { TenantLoginForm } from '@/app/[tenant]/login/login-form';
import { Suspense } from 'react';

export default async function SuperAdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenantLoginForm
        tenantSlug="admin"
        tenantName="System Administration"
        schoolId=""
      />
    </Suspense>
  );
}
