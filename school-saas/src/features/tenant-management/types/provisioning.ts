import { SubscriptionPlan } from './hierarchy';

export type OrgMode = 'standalone' | 'multi';

export interface SchoolEntry {
  id: string;
  name: string;
  slug: string;
  schoolType: string;
  schoolLevels: string[];
  schoolShifts: string[];
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
  adminPassword?: string;
}

export interface WizardState {
  step: number;
  data: WizardData;
  isProvisioning: boolean;
  provisionProgress: number;
  provisionDone: boolean;
  provisionError: string | null;
}
