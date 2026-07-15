import { SubscriptionPlan } from './hierarchy';
import { AdminRole } from '@/app/actions/tenant';

export type OrgMode = 'standalone' | 'multi';

export interface SchoolEntry {
  id: string;
  name: string;
  slug: string;
  schoolType: string;
  schoolLevels: string[];
  schoolShifts: string[];
  // Optional per-school admin assigned during provisioning
  adminName?: string;
  adminEmail?: string;
}

export interface WizardData {
  orgMode: OrgMode;
  orgName: string;
  orgSlug: string;
  region: string;
  schoolLevels: string[];
  schoolShifts: string[];
  schools: SchoolEntry[];
  plan: SubscriptionPlan;
  modules: string[];
  adminName: string;
  adminEmail: string;
  adminRole: AdminRole;
  // adminPassword intentionally removed — use invite flow instead
}

export interface WizardState {
  step: number;
  data: WizardData;
  isProvisioning: boolean;
  provisionProgress: number;
  provisionDone: boolean;
  provisionError: string | null;
  // Tracks all invites sent on completion for the success screen
  invitesSent: Array<{ email: string; name: string; role: AdminRole; tenantName: string }>;
}
