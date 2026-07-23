import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: applicants } = await supabase.from('applicants').select('id, student_id_number, student_username, stage').ilike('student_id_number', '%46A377%');
  const { data: students } = await supabase.from('students').select('id, admission_number, email').ilike('admission_number', '%46A377%');
  return NextResponse.json({ applicants, students });
}
