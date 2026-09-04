import { NextResponse } from 'next/server';
import { getPgPool } from '@/lib/db/pg-fallback';

const RESERVED_SLUGS = new Set([
  'admin',
  'super-admin',
  'api',
  'auth',
  'login',
  'www',
  'app',
  'platform',
  'register',
  'onboarding',
  'portal',
  'dashboard',
  'system',
  'test',
  'demo',
  'status',
  'help',
  'support',
  'terms',
  'privacy',
]);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSlug = searchParams.get('slug') || '';
    const slug = rawSlug.trim().toLowerCase();

    if (!slug) {
      return NextResponse.json(
        { available: false, error: 'Subdomain slug is required.' },
        { status: 400 }
      );
    }

    // Format validation (letters, numbers, hyphens; min 2, max 48)
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug) || slug.length < 2 || slug.length > 48) {
      return NextResponse.json({
        available: false,
        slug,
        message: 'Subdomain must be 2-48 characters, lowercase letters, numbers, or hyphens only.',
      });
    }

    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json({
        available: false,
        slug,
        message: `"${slug}" is a reserved system domain. Please choose another.`,
      });
    }

    const dbPool = getPgPool();
    if (!dbPool) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { rows } = await dbPool.query(
      'SELECT id, name FROM tenants WHERE LOWER(slug) = $1 LIMIT 1',
      [slug]
    );

    if (rows.length > 0) {
      return NextResponse.json({
        available: false,
        slug,
        message: `"${slug}" is already registered by another institution.`,
      });
    }

    return NextResponse.json({
      available: true,
      slug,
      message: `"${slug}" is available!`,
    });
  } catch (err: any) {
    console.error('Check slug API error:', err);
    return NextResponse.json(
      { available: false, error: err.message || 'Error checking subdomain availability.' },
      { status: 500 }
    );
  }
}
