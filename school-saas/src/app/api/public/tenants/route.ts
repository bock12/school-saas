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
    const dbPool = getPgPool();
    if (dbPool) {
      const { rows } = await dbPool.query(
        `SELECT 
          t.id, 
          t.name, 
          t.slug, 
          t.type, 
          t.parent_id,
          t.is_standalone_school,
          t.logo_url, 
          t.city, 
          t.country, 
          t.contact_email, 
          t.contact_phone, 
          t.address, 
          t.region, 
          t.school_type, 
          t.primary_color,
          p.name AS parent_name,
          p.is_standalone_school AS parent_is_standalone,
          (
            SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'slug', s.slug, 'school_type', s.school_type))
            FROM tenants s
            WHERE s.parent_id = t.id AND s.slug IS NOT NULL
          ) AS member_schools
        FROM tenants t
        LEFT JOIN tenants p ON t.parent_id = p.id
        WHERE t.slug IS NOT NULL AND (t.status IS NULL OR t.status != 'suspended')
        ORDER BY t.name ASC`
      );

      return NextResponse.json(
        { tenants: rows || [] },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    // Fallback: Supabase REST fetch
    const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const res = await fetch(
      `${SUPA_URL}/rest/v1/tenants?select=id,name,slug,type,parent_id,is_standalone_school,logo_url,city,country,contact_email,contact_phone,address,region,school_type,primary_color&slug=not.is.null&order=name.asc`,
      {
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (res.ok) {
      const tenants = await res.json();
      return NextResponse.json({ tenants: tenants || [] }, { status: 200 });
    }

    return NextResponse.json({ tenants: [] }, { status: 200 });
  } catch (err) {
    console.error('Public tenants API error:', err);
    return NextResponse.json({ tenants: [] }, { status: 200 });
  }
}
