import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Define your primary root domain (update for production)
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN
  || (process.env.NODE_ENV === 'production' ? 'yoursaas.com' : 'localhost:3000');

export default async function proxy(request: NextRequest) {
  // 1. Refresh the Supabase auth session (cookie-based)
  const { supabaseResponse: response, user } = await updateSession(request);

  const url = request.nextUrl.clone();
  const { pathname } = url;
  const hostname = request.headers.get('host') || '';

  // ── 2. Extract subdomain from the hostname ──────────────────────
  let subdomain = '';
  if (hostname.includes(ROOT_DOMAIN)) {
    // e.g., "greenwood.yoursaas.com" → "greenwood"
    // e.g., "admin.yoursaas.com"     → "admin"
    // e.g., "yoursaas.com"           → ""
    subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '').replace(ROOT_DOMAIN, '');
  }

  // ── 3. Root domain / www — let Next.js handle the (platform) routes ──
  if (!subdomain || subdomain === 'www') {
    return response;
  }

  // ── 4. Super Admin panel (admin.yoursaas.com) ──────────────────
  if (subdomain === 'admin') {
    if (!user && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (user && user.user_metadata?.requires_password_change && pathname !== '/set-password') {
      return NextResponse.redirect(new URL('/set-password', request.url));
    }

    if (!pathname.startsWith('/super-admin')) {
      url.pathname = `/super-admin${pathname}`;
    }
    const rewriteResponse = NextResponse.rewrite(url);
    // Forward session cookies from Supabase middleware
    response.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });
    return rewriteResponse;
  }

  // ── 5. Tenant school subdomains (greenwood.yoursaas.com) ───────
  // Enforce edge protection: Only allow /login if unauthenticated
  // (Update this condition if you add public pages like /enrollment)
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (user && user.user_metadata?.requires_password_change && pathname !== '/set-password') {
    return NextResponse.redirect(new URL('/set-password', request.url));
  }

  // Rewrite internally to the dynamic [tenant] route folder
  url.pathname = `/${subdomain}${pathname}`;
  const rewriteResponse = NextResponse.rewrite(url);
  rewriteResponse.headers.set('x-tenant-slug', subdomain);

  // Forward session cookies from Supabase middleware
  response.cookies.getAll().forEach((cookie) => {
    rewriteResponse.cookies.set(cookie.name, cookie.value);
  });

  return rewriteResponse;
}

// Stop the proxy from running on static files, images, or API routes
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes (handled by backend API handlers)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. favicon.ico, sitemap.xml, robots.txt (metadata files)
     * 5. Public assets (svg, png, jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
