import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowRight, LogIn, GraduationCap, Building, ExternalLink, MapPin, School, Search } from 'lucide-react';

export default async function PublicTenantLanding({ params }: { params: Promise<{ tenant: string }> }) {
  // 1. Fetch user session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { tenant: tenantSlug } = await params;

  // 2. Fetch tenant details using Service Role (since anon users can't read tenants table by default)
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, name, logo_url, domain, type, contact_email')
    .eq('slug', tenantSlug)
    .single();

  if (!tenant) {
    return notFound();
  }

  const isOrg = tenant.type === 'organization';

  // 3. If it's an Organization, fetch all child schools belonging to it
  let childSchools: Array<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    contact_email: string | null;
  }> = [];

  if (isOrg) {
    const { data: schools } = await supabaseAdmin
      .from('tenants')
      .select('id, name, slug, logo_url, address, city, country, contact_email')
      .eq('parent_id', tenant.id);
    
    childSchools = schools || [];
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-secondary))] flex flex-col">
      {/* Header */}
      <header className="w-full bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border))] py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-auto rounded-md" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] font-bold">
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">{tenant.name}</h1>
              {isOrg && <span className="text-xs text-[hsl(var(--accent))] font-semibold">Educational Group / Organization</span>}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!isOrg && (
              <Link
                href="/apply/status"
                className="text-xs text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] font-medium underline"
              >
                Track Application Status
              </Link>
            )}
            {user ? (
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-sm font-semibold hover:bg-[hsl(var(--border))] transition-colors"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                href="/login"
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-sm font-semibold hover:bg-[hsl(var(--border))] transition-colors"
              >
                <LogIn className="w-4 h-4" /> Portal Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="w-full py-20 px-6 flex items-center justify-center bg-gradient-to-b from-[hsl(var(--bg-primary))] to-[hsl(var(--bg-secondary))] border-b border-[hsl(var(--border))]">
          <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
            <div className="mx-auto w-24 h-24 bg-[hsl(var(--bg-tertiary))] rounded-2xl shadow-xl flex items-center justify-center border border-[hsl(var(--border))]">
              {isOrg ? (
                <Building className="w-12 h-12 text-[hsl(var(--accent))]" />
              ) : (
                <GraduationCap className="w-12 h-12 text-[hsl(var(--accent))]" />
              )}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-[hsl(var(--text-primary))] tracking-tight">
              Welcome to {tenant.name}
            </h2>
            
            <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto leading-relaxed">
              {isOrg 
                ? "Empowering educational excellence across our network of member schools and institutions. Explore our institutions below."
                : "Dedicated to academic excellence and student success. Discover our programs or apply for admission today."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {!isOrg && (
                <>
                  <Link
                    href="/apply"
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(var(--accent)/0.2)]"
                  >
                    Apply for Admission
                  </Link>
                  <Link
                    href="/apply/status"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-medium hover:bg-[hsl(var(--border))] transition-colors"
                  >
                    <Search className="w-4 h-4" /> Track Status
                  </Link>
                </>
              )}
              {!user && (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border-2 border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold hover:border-[hsl(var(--text-secondary))] transition-colors"
                >
                  Login to Portal
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Organization Directory Grid (Only shown for Organization Tenants) */}
        {isOrg && (
          <section className="w-full py-16 px-6 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
              <div>
                <h3 className="text-2xl font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                  <School className="w-6 h-6 text-[hsl(var(--accent))]" /> Member Schools & Campuses
                </h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                  Select a school below to visit its official portal and apply for admissions.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-full text-[hsl(var(--text-secondary))] self-start sm:self-auto">
                {childSchools.length} {childSchools.length === 1 ? 'School' : 'Schools'} Managed
              </span>
            </div>

            {childSchools.length === 0 ? (
              <div className="text-center py-12 bg-[hsl(var(--bg-primary))] rounded-2xl border border-[hsl(var(--border))] space-y-3">
                <School className="w-12 h-12 text-[hsl(var(--text-tertiary))] mx-auto" />
                <p className="text-base font-semibold text-[hsl(var(--text-secondary))]">No member schools added yet.</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] max-w-md mx-auto">
                  Organization administrators can add child schools directly through their Super Admin or Organization portal.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {childSchools.map((school) => (
                  <div
                    key={school.id}
                    className="bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:shadow-lg hover:border-[hsl(var(--accent)/0.4)] transition-all group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {school.logo_url ? (
                          <img src={school.logo_url} alt={school.name} className="w-12 h-12 rounded-xl object-cover border border-[hsl(var(--border))]" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-lg">
                            {school.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-bold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] transition-colors">
                            {school.name}
                          </h4>
                          <span className="text-xs text-[hsl(var(--text-tertiary))] font-mono">
                            {school.slug}
                          </span>
                        </div>
                      </div>

                      {(school.city || school.address || school.country) && (
                        <div className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))]">
                          <MapPin className="w-4 h-4 text-[hsl(var(--text-tertiary))] shrink-0 mt-0.5" />
                          <span>
                            {[school.address, school.city, school.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <a
                      href={`http://${school.slug}.localhost:3000`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[hsl(var(--accent))] hover:text-white hover:border-[hsl(var(--accent))] transition-all"
                    >
                      Visit School Portal <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Future Expansion Sections */}
        <section className="w-full py-16 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center opacity-60">
              <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] mb-2">About Us</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))]">Coming soon. School administrators can add their mission statement and history here.</p>
            </div>
            <div className="glass-card p-8 text-center opacity-60">
              <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] mb-2">Latest News</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))]">Coming soon. Announcements and upcoming events will be displayed here.</p>
            </div>
            <div className="glass-card p-8 text-center opacity-60">
              <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] mb-2">Contact</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                {tenant.contact_email ? `Email: ${tenant.contact_email}` : 'Contact information coming soon.'}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-[hsl(var(--bg-primary))] border-t border-[hsl(var(--border))] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-[hsl(var(--text-tertiary))]">
            &copy; {new Date().getFullYear()} {tenant.name}. Powered by SchoolSaaS.
          </p>
        </div>
      </footer>
    </div>
  );
}
