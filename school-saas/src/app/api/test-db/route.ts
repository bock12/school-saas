import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: 'Provide a search query of at least 3 characters using ?q=' },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();
  const pattern = `%${query}%`;
  const { data: applicants } = await adminSupabase
    .from('applicants')
    .select('id, tenant_id, student_id_number, student_username, stage')
    .ilike('student_id_number', pattern);

  const { data: students } = await adminSupabase
    .from('students')
    .select('id, tenant_id, admission_number, email')
    .ilike('admission_number', pattern);

  return NextResponse.json({ applicants, students });
}
