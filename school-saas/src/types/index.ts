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

// ===========================================
// School Module Types (Phase 2)
// ===========================================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type GenderType = 'male' | 'female' | 'other';
export type FeeStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'mobile_money' | 'cheque' | 'other';

export interface AcademicYear {
  id: string;
  tenant_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface Term {
  id: string;
  tenant_id: string;
  academic_year_id: string;
  academic_year?: AcademicYear;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  tenant_id: string;
  name: string;
  head_teacher_id: string | null;
  head_teacher?: Teacher;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  tenant_id: string;
  name: string;
  short_name: string | null;
  sort_order: number;
  capacity: number;
  sections?: Section[];
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  tenant_id: string;
  class_id: string;
  class?: Class;
  name: string;
  capacity: number;
  class_teacher_id: string | null;
  class_teacher?: Teacher;
  student_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  tenant_id: string;
  department_id: string | null;
  department?: Department;
  name: string;
  code: string | null;
  description: string | null;
  is_elective: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  admission_number: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: GenderType | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  guardian_relationship: string | null;
  blood_group: string | null;
  medical_notes: string | null;
  avatar_url: string | null;
  is_active: boolean;
  admitted_at: string | null;
  current_section?: Section;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  gender: GenderType | null;
  department_id: string | null;
  department?: Department;
  qualification: string | null;
  specialization: string | null;
  date_of_joining: string | null;
  avatar_url: string | null;
  is_active: boolean;
  assigned_subjects?: Subject[];
  created_at: string;
  updated_at: string;
}

export interface ClassEnrollment {
  id: string;
  tenant_id: string;
  student_id: string;
  student?: Student;
  section_id: string;
  section?: Section;
  academic_year_id: string;
  academic_year?: AcademicYear;
  roll_number: number | null;
  enrolled_at: string | null;
  created_at: string;
}

export interface TeacherAssignment {
  id: string;
  tenant_id: string;
  teacher_id: string;
  teacher?: Teacher;
  section_id: string;
  section?: Section;
  subject_id: string;
  subject?: Subject;
  academic_year_id: string;
  academic_year?: AcademicYear;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  student_id: string;
  student?: Student;
  section_id: string;
  section?: Section;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  tenant_id: string;
  student_id: string;
  student?: Student;
  subject_id: string;
  subject?: Subject;
  term_id: string;
  term?: Term;
  section_id: string;
  section?: Section;
  score: number | null;
  max_score: number;
  grade_letter: string | null;
  remarks: string | null;
  graded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeeType {
  id: string;
  tenant_id: string;
  name: string;
  amount: number;
  description: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeeInvoice {
  id: string;
  tenant_id: string;
  student_id: string;
  student?: Student;
  term_id: string;
  term?: Term;
  invoice_number: string | null;
  total_amount: number;
  paid_amount: number;
  status: FeeStatus;
  due_date: string | null;
  items: Array<{ fee_type_id: string; name: string; amount: number }>;
  created_at: string;
  updated_at: string;
}

export interface FeePayment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  invoice?: FeeInvoice;
  amount: number;
  payment_method: PaymentMethod;
  reference: string | null;
  paid_at: string | null;
  received_by: string | null;
  created_at: string;
}

// School Dashboard Stats
export interface SchoolDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  attendanceToday: number;
  feeCollected: number;
  studentGrowth: number;
  teacherGrowth: number;
  attendanceTrend: number;
  collectionRate: number;
}
