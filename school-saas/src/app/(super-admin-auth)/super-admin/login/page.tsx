import { TenantLoginForm } from '@/app/[tenant]/login/login-form';
import { Suspense } from 'react';

export default async function SuperAdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-400">Loading Platform Administration Console...</div>}>
      <TenantLoginForm
        tenantSlug="super-admin"
        tenantName="Platform Super Administration"
        schoolId="platform-master"
      />
    </Suspense>
  );
}
