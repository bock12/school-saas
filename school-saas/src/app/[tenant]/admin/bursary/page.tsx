import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BursaryClient from './bursary-client';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function BursaryPage({ params }: PageProps) {
  const { tenant } = await params;
  const supabase = await createClient();

  // 1. Resolve tenant_id from slug
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name, bursary_settings')
    .eq('slug', tenant)
    .single();

  if (tenantError || !tenantData) {
    redirect('/login');
  }

  // 2. Fetch applicants with financial and payment fields
  const { data: applicants } = await supabase
    .from('applicants')
    .select('id, first_name, last_name, target_grade, stage, created_at, parent_name, phone, status, payment_cleared, receipt_number, payment_method, payment_receipt_url, payment_phone, transaction_id')
    .eq('tenant_id', tenantData.id)
    .order('created_at', { ascending: false });

  const mappedRecords = (applicants || []).map(a => ({
    id: a.id,
    referenceCode: `APP-${a.id.substring(0, 8).toUpperCase()}`,
    name: `${a.first_name} ${a.last_name}`,
    grade: a.target_grade,
    parentName: a.parent_name,
    parentPhone: a.phone || undefined,
    appliedDate: a.created_at,
    stage: a.stage,
    paymentCleared: a.payment_cleared || false,
    receiptNumber: a.receipt_number || undefined,
    paymentMethod: a.payment_method || undefined,
    paymentReceiptUrl: a.payment_receipt_url || undefined,
    paymentPhone: a.payment_phone || undefined,
    transactionId: a.transaction_id || undefined,
  }));

  return (
    <BursaryClient
      serverRecords={mappedRecords}
      tenantSlug={tenant}
      bursarySettings={tenantData.bursary_settings || null}
    />
  );
}
