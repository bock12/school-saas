import { TenantLoginForm } from './login-form';

export default async function TenantLoginPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const tenantName = tenant.replace(/-/g, ' ');

  return <TenantLoginForm tenantSlug={tenant} tenantName={tenantName} />;
}
