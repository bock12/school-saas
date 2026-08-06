import { NextResponse } from 'next/server';

// Public API — returns all active/publicly visible tenants for the landing page directory
export async function GET() {
  try {
    const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const res = await fetch(
      `${SUPA_URL}/rest/v1/tenants?select=id,name,slug,type,logo_url,city,country,contact_email,primary_color&order=name.asc`,
      {
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.error('Public tenants fetch error:', await res.text());
      return NextResponse.json({ tenants: [] }, { status: 200 });
    }

    const tenants = await res.json();

    return NextResponse.json({ tenants: tenants || [] }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });
  } catch (err) {
    console.error('Public tenants API error:', err);
    return NextResponse.json({ tenants: [] }, { status: 200 });
  }
}
