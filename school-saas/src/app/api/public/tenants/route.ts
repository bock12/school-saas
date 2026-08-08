import { NextResponse } from 'next/server';
import { Pool } from 'pg';

let pgPool: Pool | null = null;
function getPgPool() {
  if (!pgPool && process.env.DATABASE_URL) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pgPool;
}

// Public API — returns all active/publicly visible tenants for the landing page directory
export async function GET() {
  try {
    const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 1. Try REST fetch with 3-second timeout guard
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(
        `${SUPA_URL}/rest/v1/tenants?select=id,name,slug,type,logo_url,city,country,contact_email,primary_color&order=name.asc`,
        {
          headers: {
            apikey: SUPA_KEY,
            Authorization: `Bearer ${SUPA_KEY}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const tenants = await res.json();
        return NextResponse.json({ tenants: tenants || [] }, {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          }
        });
      }
    } catch (httpErr) {
      console.warn('[Public Tenants API] HTTP fetch failed, attempting PostgreSQL direct pool fallback:', (httpErr as any)?.message || httpErr);
    }

    // 2. Direct PostgreSQL query fallback
    const dbPool = getPgPool();
    if (dbPool) {
      const { rows } = await dbPool.query(
        `SELECT id, name, slug, type, logo_url, city, country, contact_email, primary_color
         FROM tenants
         ORDER BY name ASC`
      );
      return NextResponse.json({ tenants: rows || [] }, { status: 200 });
    }

    return NextResponse.json({ tenants: [] }, { status: 200 });
  } catch (err) {
    console.error('Public tenants API error:', err);
    return NextResponse.json({ tenants: [] }, { status: 200 });
  }
}
