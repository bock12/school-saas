import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  ArrowRight, LogIn, GraduationCap, Building2, ExternalLink,
  MapPin, School, Search, Mail, Phone, Globe, BookOpen,
  Award, Users, ChevronRight, Shield, Sparkles, Star
} from 'lucide-react';

export default async function PublicTenantLanding({ params }: { params: Promise<{ tenant: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { tenant: tenantSlug } = await params;

  // Fetch tenant via service role (anon can't read tenants by default)
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, name, logo_url, domain, type, contact_email, address, city, country, primary_color, phone')
    .eq('slug', tenantSlug)
    .single();

  if (!tenant) return notFound();

  const isOrg = tenant.type === 'organization';
  const accentColor = tenant.primary_color || '#6366f1';

  // Fetch child schools if org
  let childSchools: Array<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    contact_email: string | null;
    primary_color: string | null;
  }> = [];

  if (isOrg) {
    const { data: schools } = await supabaseAdmin
      .from('tenants')
      .select('id, name, slug, logo_url, address, city, country, contact_email, primary_color')
      .eq('parent_id', tenant.id)
      .order('name', { ascending: true });
    childSchools = schools || [];
  }

  // Build school URL helper (server-side best guess)
  const getSchoolUrl = (slug: string) => `/${slug}`;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex flex-col">

      {/* ── Sticky Header ─────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[hsl(var(--bg-primary)/0.9)] backdrop-blur-xl border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-9 w-auto rounded-lg flex-shrink-0" />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
              >
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-base font-black text-[hsl(var(--text-primary))] leading-tight truncate">{tenant.name}</h1>
              {isOrg && (
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Educational Organization</span>
              )}
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isOrg && (
              <Link
                href="/apply/status"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] font-semibold transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Track Application
              </Link>
            )}
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-black shadow-lg transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, boxShadow: `0 4px 16px ${accentColor}33` }}
              >
                <LogIn className="w-3.5 h-3.5" /> Staff / Student Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${accentColor}12, transparent 70%)`
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">

              {/* Logo / Icon */}
              <div className="mx-auto relative inline-block">
                {tenant.logo_url ? (
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl mx-auto">
                    <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl mx-auto border border-white/10"
                    style={{ background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)` }}
                  >
                    {isOrg
                      ? <Building2 className="w-12 h-12" style={{ color: accentColor }} />
                      : <GraduationCap className="w-12 h-12" style={{ color: accentColor }} />
                    }
                  </div>
                )}
                <span
                  className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider shadow-lg"
                  style={{ background: accentColor }}
                >
                  {isOrg ? 'Org' : 'School'}
                </span>
              </div>

              {/* Headline */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold mb-3 border"
                  style={{ color: accentColor, background: `${accentColor}15`, borderColor: `${accentColor}30` }}
                >
                  <Sparkles className="w-3 h-3" />
                  {isOrg ? 'Educational Group & Multi-School Organization' : 'Official Student & Staff Portal'}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-[hsl(var(--text-primary))] tracking-tight leading-tight">
                  Welcome to<br />{tenant.name}
                </h2>
              </div>

              <p className="text-base sm:text-lg text-[hsl(var(--text-secondary))] leading-relaxed max-w-2xl mx-auto">
                {isOrg
                  ? `${tenant.name} oversees a network of member schools committed to educational excellence. Explore our institutions below or log into your administrative portal.`
                  : `${tenant.name} is dedicated to academic excellence and holistic student development. Access your student portal, apply for admission, or track your application.`}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {!user ? (
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-black text-sm shadow-xl hover:opacity-90 transition-all"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 8px 32px ${accentColor}40` }}
                  >
                    <LogIn className="w-4 h-4" /> Login to Portal
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-black text-sm shadow-xl hover:opacity-90 transition-all"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 8px 32px ${accentColor}40` }}
                  >
                    <ArrowRight className="w-4 h-4" /> Go to Dashboard
                  </Link>
                )}

                {!isOrg && (
                  <>
                    <Link
                      href="/apply"
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold text-sm hover:bg-[hsl(var(--border))] transition-all"
                    >
                      <GraduationCap className="w-4 h-4" /> Apply for Admission
                    </Link>
                    <Link
                      href="/apply/status"
                      className="hidden sm:flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] font-semibold text-sm hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                    >
                      <Search className="w-4 h-4" /> Track Status
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Role-Based Portal Login Cards (standalone schools only) ── */}
        {!isOrg && (
          <section className="bg-[hsl(var(--bg-secondary))] border-y border-[hsl(var(--border))] py-14 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10">
                <h3 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))] mb-2">Choose Your Portal</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  Authorized users login to their dedicated dashboard below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {[
                  { role: 'Student', icon: BookOpen, desc: 'Access grades, timetables, assignments, and your learning hub.', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400', href: '/login?role=student' },
                  { role: 'Teacher', icon: Users, desc: 'Manage classes, gradebooks, attendance, and lesson plans.', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400', href: '/login?role=teacher' },
                  { role: 'Parent', icon: Star, desc: 'Monitor your child\'s academic progress, fees, and wellbeing.', color: 'border-amber-500/30 bg-amber-500/5 text-amber-400', href: '/login?role=parent' },
                  { role: 'Administrator', icon: Shield, desc: 'Full administrative control over the school management system.', color: 'border-purple-500/30 bg-purple-500/5 text-purple-400', href: '/login?role=admin' },
                ].map(portal => (
                  <Link
                    key={portal.role}
                    href={portal.href}
                    className={`glass-card p-5 rounded-2xl border flex flex-col gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group ${portal.color.split(' ').slice(0, 2).join(' ')}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${portal.color}`}>
                      <portal.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-[hsl(var(--text-primary))] text-sm mb-1">{portal.role} Portal</h4>
                      <p className="text-[11px] text-[hsl(var(--text-tertiary))] leading-relaxed">{portal.desc}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-[11px] font-bold mt-auto ${portal.color.split(' ')[2]}`}>
                      Login as {portal.role} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Organization Member Schools Directory ─── */}
        {isOrg && (
          <section className="bg-[hsl(var(--bg-secondary))] border-y border-[hsl(var(--border))] py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold mb-3 border"
                    style={{ color: accentColor, background: `${accentColor}15`, borderColor: `${accentColor}30` }}
                  >
                    <School className="w-3 h-3" /> Member Schools & Campuses
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">Our Institutions</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Select a school to visit its portal, apply, or login.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] self-start sm:self-auto">
                  {childSchools.length} {childSchools.length === 1 ? 'Campus' : 'Campuses'}
                </span>
              </div>

              {childSchools.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-2xl border border-[hsl(var(--border))]">
                  <School className="w-16 h-16 text-[hsl(var(--text-tertiary))] mx-auto mb-4" />
                  <p className="text-base font-bold text-[hsl(var(--text-secondary))] mb-2">No member schools added yet.</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] max-w-md mx-auto">
                    Organization administrators can add member schools through the admin portal.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {childSchools.map(school => {
                    const schoolAccent = school.primary_color || accentColor;
                    return (
                      <div
                        key={school.id}
                        className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)]"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {school.logo_url ? (
                              <img src={school.logo_url} alt={school.name} className="w-12 h-12 rounded-xl object-cover border border-[hsl(var(--border))] flex-shrink-0" />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md"
                                style={{ background: `linear-gradient(135deg, ${schoolAccent}, ${schoolAccent}99)` }}
                              >
                                {school.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] transition-colors leading-tight">
                                {school.name}
                              </h4>
                              <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{school.slug}</span>
                            </div>
                          </div>

                          {(school.city || school.country) && (
                            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
                              <MapPin className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] shrink-0" />
                              <span>{[school.city, school.country].filter(Boolean).join(', ')}</span>
                            </div>
                          )}

                          {school.contact_email && (
                            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{school.contact_email}</span>
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/${school.slug}`}
                          className="w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 text-white"
                          style={{ background: `linear-gradient(135deg, ${schoolAccent}, ${schoolAccent}cc)` }}
                        >
                          Visit School Portal <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Info Panels ───────────────────────────── */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* About */}
              <div className="glass-card p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}20`, color: accentColor }}>
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">About Us</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                  {isOrg
                    ? `${tenant.name} is a premier educational group committed to delivering world-class learning experiences across our network of schools.`
                    : `${tenant.name} is committed to nurturing academic excellence, creativity, and character in every student. We welcome learners of all backgrounds.`}
                </p>
              </div>

              {/* Contact */}
              <div className="glass-card p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}20`, color: accentColor }}>
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Contact Us</h3>
                <div className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
                  {tenant.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                      <a href={`mailto:${tenant.contact_email}`} className="hover:underline">{tenant.contact_email}</a>
                    </div>
                  )}
                  {(tenant as any).phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                      <span>{(tenant as any).phone}</span>
                    </div>
                  )}
                  {(tenant.city || tenant.country) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] mt-0.5 shrink-0" />
                      <span>{[tenant.address, tenant.city, tenant.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {!tenant.contact_email && !(tenant as any).phone && !tenant.city && (
                    <p className="text-xs text-[hsl(var(--text-tertiary))] italic">Contact information will be displayed here once configured by the school administrator.</p>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass-card p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}20`, color: accentColor }}>
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Portal Login', href: '/login', icon: LogIn },
                    ...(!isOrg ? [
                      { label: 'Apply for Admission', href: '/apply', icon: GraduationCap },
                      { label: 'Track Application', href: '/apply/status', icon: Search },
                    ] : []),
                  ].map(link => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors font-medium group"
                    >
                      <link.icon className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                      {link.label}
                      <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-7 w-auto rounded" />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black"
                style={{ background: accentColor }}>
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-black text-[hsl(var(--text-primary))]">{tenant.name}</span>
          </div>
          <p className="text-xs text-[hsl(var(--text-tertiary))] text-center">
            © {new Date().getFullYear()} {tenant.name}. Powered by SchoolSaaS.
          </p>
          <Link href="/login" className="text-xs font-bold flex items-center gap-1.5 hover:underline" style={{ color: accentColor }}>
            <LogIn className="w-3.5 h-3.5" /> Portal Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
