import { School } from 'lucide-react';

export default async function TenantLayout({ children, params }: { children: React.ReactNode; params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  // TODO: Fetch tenant branding from Supabase
  // const supabase = await createClient();
  // const { data: tenantData } = await supabase.from('tenants').select('*').eq('slug', tenant).single();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]" style={{ '--tenant-primary': '#6366f1' } as React.CSSProperties}>
      {/* Tenant Header Bar */}
      <header className="h-14 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent)/0.15)] flex items-center justify-center">
            <School className="w-4 h-4 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] capitalize">{tenant.replace(/-/g, ' ')}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{tenant}.schoolsaas.com</p>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
