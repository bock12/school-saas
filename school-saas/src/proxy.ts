import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const TENANT_MODE = process.env.NEXT_PUBLIC_TENANT_MODE || 'path';
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';

export async function middleware(request: NextRequest) {
  // 1. Refresh the Supabase session
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 2. Super Admin routing
  if (pathname.startsWith('/super-admin')) {
    // Super Admin routes are handled directly by the (super-admin) route group
    return response;
  }

  // 3. Subdomain-based tenant routing (production mode)
  if (TENANT_MODE === 'subdomain') {
    const currentHost = hostname.replace(`:${request.nextUrl.port}`, '');
    const rootDomain = APP_DOMAIN.replace(`:${request.nextUrl.port}`, '');

    // Check if this is the admin subdomain
    if (currentHost === `admin.${rootDomain}`) {
      const url = request.nextUrl.clone();
      url.pathname = `/super-admin${pathname}`;
      return NextResponse.rewrite(url);
    }

    // Extract subdomain
    const subdomain = currentHost.replace(`.${rootDomain}`, '');

    // If we have a subdomain (and it's not www or the root domain itself)
    if (subdomain && subdomain !== 'www' && subdomain !== rootDomain && subdomain !== currentHost) {
      // Set tenant context header for downstream components
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${pathname}`;
      
      const rewriteResponse = NextResponse.rewrite(url);
      rewriteResponse.headers.set('x-tenant-slug', subdomain);
      
      // Copy cookies from session refresh
      response.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie.name, cookie.value);
      });
      
      return rewriteResponse;
    }
  }

  // 4. Path-based tenant routing (development mode: /t/[slug]/...)
  if (TENANT_MODE === 'path' && pathname.startsWith('/t/')) {
    const segments = pathname.split('/');
    const tenantSlug = segments[2]; // /t/[slug]/...
    
    if (tenantSlug) {
      const remainingPath = '/' + segments.slice(3).join('/');
      const url = request.nextUrl.clone();
      url.pathname = `/${tenantSlug}${remainingPath}`;
      
      const rewriteResponse = NextResponse.rewrite(url);
      rewriteResponse.headers.set('x-tenant-slug', tenantSlug);
      
      response.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie.name, cookie.value);
      });
      
      return rewriteResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
