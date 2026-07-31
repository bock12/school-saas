import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Public API — returns all active/publicly visible tenants for the landing page directory
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, slug, type, logo_url, city, country, contact_email, primary_color')
      .order('name', { ascending: true });

    if (error) {
      console.error('Public tenants fetch error:', error);
      return NextResponse.json({ tenants: [] }, { status: 200 });
    }

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
