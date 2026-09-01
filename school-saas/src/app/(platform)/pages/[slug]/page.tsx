import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCmsPages, getLandingPageSections, getCmsPlugins, getCmsSettings } from '@/app/actions/landing-cms';
import { BlockRenderer } from '@/components/cms/BlockRenderer';
import { PublicPluginInjector } from '@/components/cms/PublicPluginInjector';
import { APP_NAME } from '@/lib/constants';
import { ArrowLeft, School, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const pagesRes = await getCmsPages();
  const page = pagesRes.data.find(p => p.slug === slug);

  if (!page) {
    return { title: `Page Not Found | ${APP_NAME}` };
  }

  return {
    title: page.seo_title || `${page.title} | ${APP_NAME}`,
    description: page.seo_description || page.description,
    keywords: page.seo_keywords,
    openGraph: {
      title: page.seo_title || page.title,
      description: page.seo_description || page.description,
      images: page.og_image_url ? [{ url: page.og_image_url }] : [],
    },
  };
}

export default async function DynamicCmsPage({ params }: PageProps) {
  const { slug } = await params;

  // Reserved core routes should not be captured
  if (['login', 'register', 'super-admin', 'api'].includes(slug)) {
    notFound();
  }

  const [pagesRes, sectionsRes, pluginsRes, settingsRes] = await Promise.all([
    getCmsPages(),
    getLandingPageSections(slug),
    getCmsPlugins(),
    getCmsSettings(),
  ]);

  const page = pagesRes.data.find(p => p.slug === slug);
  if (!page || !page.is_published) {
    notFound();
  }

  const sections = sectionsRes.data.filter(s => s.is_published);

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] selection:bg-[hsl(var(--accent)/0.3)] flex flex-col justify-between">
      
      {/* Active Public Plugins */}
      <PublicPluginInjector plugins={pluginsRes.data} settings={settingsRes.data} />

      {/* Global Header Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[hsl(var(--bg-primary)/0.8)] border-b border-[hsl(var(--border))] transition-colors">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent))] flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="text-base font-black text-[hsl(var(--text-primary))] tracking-tight">{APP_NAME}</span>
          </Link>

          {/* Dynamic Header Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {pagesRes.data.filter(p => p.show_in_header && p.is_published).map(p => (
              <Link
                key={p.slug}
                href={p.is_home ? '/' : `/pages/${p.slug}`}
                className={`text-xs font-bold transition-colors ${
                  p.slug === slug
                    ? 'text-[hsl(var(--accent))]'
                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                {p.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-secondary))] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 rounded-xl bg-[hsl(var(--accent))] text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
            >
              Register School
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dynamic Page Content */}
      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border))]">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] text-xs font-bold border border-[hsl(var(--accent)/0.25)]">
              {page.title}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[hsl(var(--text-primary))]">
              {page.seo_title || page.title}
            </h1>
            {page.seo_description && (
              <p className="text-sm sm:text-base text-[hsl(var(--text-secondary))] max-w-2xl mx-auto leading-relaxed">
                {page.seo_description}
              </p>
            )}
          </div>
        </section>

        {/* Dynamic Blocks */}
        {sections.length > 0 ? (
          <div className="space-y-0">
            {sections.map(section => (
              <BlockRenderer key={section.section_key} section={section} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-xs text-[hsl(var(--text-secondary))]">
            This page is currently being drafted. Check back soon.
          </div>
        )}
      </main>

      {/* Global Academic Platform Footer */}
      <footer className="bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] py-12 w-full mt-16">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[hsl(var(--text-secondary))]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-white font-black text-xs">
              N
            </div>
            <span className="font-bold text-[hsl(var(--text-primary))]">{APP_NAME}</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            {pagesRes.data.filter(p => p.show_in_footer && p.is_published).map(p => (
              <Link key={p.slug} href={p.is_home ? '/' : `/pages/${p.slug}`} className="hover:underline">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
