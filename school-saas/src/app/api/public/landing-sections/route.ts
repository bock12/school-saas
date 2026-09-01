import { NextResponse } from 'next/server';
import { getLandingPageSections, getCmsPlugins, getCmsSettings, getCmsPages } from '@/app/actions/landing-cms';

export async function GET() {
  try {
    const [secRes, plugRes, setRes, pageRes] = await Promise.all([
      getLandingPageSections('home'),
      getCmsPlugins(),
      getCmsSettings(),
      getCmsPages(),
    ]);

    return NextResponse.json({
      sections: secRes.data || [],
      plugins: plugRes.data || [],
      settings: setRes.data,
      pages: pageRes.data || [],
    });
  } catch (err: any) {
    console.error('[API landing-sections] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
