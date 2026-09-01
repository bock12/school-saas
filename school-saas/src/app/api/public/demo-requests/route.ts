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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contactName = body.contactName ?? body.name;
    const email = body.email;
    const institutionName = body.institutionName;
    const institutionType = body.institutionType ?? body.type ?? 'school';
    const phone = body.phone;
    const region = body.region;
    const estimatedStudents = body.estimatedStudents;
    const requirements = body.requirements ?? body.message;

    // Validate required fields
    if (!contactName || !email || !institutionName) {
      return NextResponse.json(
        { error: 'Contact Name, Email Address, and Institution Name are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Attempt REST insertion via Supabase
    if (SUPA_URL && SUPA_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${SUPA_URL}/rest/v1/demo_requests`, {
          method: 'POST',
          headers: {
            apikey: SUPA_KEY,
            Authorization: `Bearer ${SUPA_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            contact_name: contactName.trim(),
            email: email.trim().toLowerCase(),
            institution_name: institutionName.trim(),
            institution_type: institutionType,
            phone: phone ? phone.trim() : null,
            region: region ? region.trim() : null,
            estimated_students: estimatedStudents ? parseInt(String(estimatedStudents), 10) : null,
            requirements: requirements ? requirements.trim() : null,
            status: 'pending',
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const inserted = await res.json();
          return NextResponse.json(
            {
              success: true,
              message: 'Your demonstration and onboarding request has been received.',
              request: inserted[0] || null,
            },
            { status: 201 }
          );
        }
      } catch (httpErr) {
        console.warn('[Demo Request API] REST insert failed, attempting PostgreSQL fallback:', httpErr);
      }
    }

    // 2. Direct PostgreSQL fallback
    const dbPool = getPgPool();
    if (dbPool) {
      const { rows } = await dbPool.query(
        `INSERT INTO demo_requests (
          contact_name, email, institution_name, institution_type, phone, region, estimated_students, requirements, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
        RETURNING *`,
        [
          contactName.trim(),
          email.trim().toLowerCase(),
          institutionName.trim(),
          institutionType,
          phone ? phone.trim() : null,
          region ? region.trim() : null,
          estimatedStudents ? parseInt(String(estimatedStudents), 10) : null,
          requirements ? requirements.trim() : null,
        ]
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Your demonstration and onboarding request has been received.',
          request: rows[0] || null,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to save demonstration request. Please try again or contact support.' },
      { status: 500 }
    );
  } catch (err) {
    console.error('Demo request API error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
