// ===========================================
// Core TypeScript Interfaces for SchoolSaaS
// ===========================================

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
export type TenantStatus = 'active' | 'suspended' | 'past_due' | 'trial' | 'deleted';
export type PlanInterval = 'monthly' | 'yearly';
export type BroadcastType = 'info' | 'warning' | 'critical' | 'maintenance';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  max_students: number;
  max_teachers: number;
  max_storage_gb: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string;
  plan_id: string | null;
  plan?: SubscriptionPlan | null;
  status: TenantStatus;
  subscription_start: string | null;
  subscription_end: string | null;
  trial_ends_at: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  timezone: string;
  max_students: number;
  max_teachers: number;
  student_count: number;
  teacher_count: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  tenant_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  actor?: Profile;
  tenant?: Tenant;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: BroadcastType;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  max_uses: number;
  times_used: number;
  valid_from: string;
  valid_until: string | null;
  plan_id: string | null;
  is_active: boolean;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalSchools: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalStudents: number;
  schoolGrowth: number;
  revenueGrowth: number;
  studentGrowth: number;
}

// Onboarding Form Data
export interface TenantOnboardingData {
  name: string;
  slug: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  plan_id: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}
