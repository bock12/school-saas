import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import {
  Building2, Landmark, MapPin, Users, Phone,
  Plus, ShieldCheck, ArrowUpRight, CheckCircle2, Globe
} from 'lucide-react';
import Link from 'next/link';
import CampusesAndDivisionsSettings from '@/components/admin/settings/CampusesAndDivisionsSettings';

export default async function OrgCampusesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { profile, school: org } = await requireOrgAdmin(tenant);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Organization Control Plane
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <Landmark className="w-8 h-8 text-[hsl(var(--accent))]" />
            Campuses, Branches & Autonomous Schools
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] font-medium">
            Manage satellite premises, physical campuses, and sovereign school administrations under <strong className="text-[hsl(var(--text-primary))]">{org.name}</strong>.
          </p>
        </div>
      </div>

      {/* Main Interactive Campuses & Autonomous Entities Hub */}
      <CampusesAndDivisionsSettings />
    </div>
  );
}
