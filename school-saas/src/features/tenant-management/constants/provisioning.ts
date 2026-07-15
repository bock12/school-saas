import {
  Building2, Globe, GraduationCap, CreditCard, Blocks, User, CheckCircle2
} from 'lucide-react';
import { SubscriptionPlan } from '../types/hierarchy';

export const STEPS = [
  { id: 'type',         label: 'Type',         icon: Building2 },
  { id: 'identity',     label: 'Identity',     icon: Globe },
  { id: 'schools',      label: 'Schools',      icon: GraduationCap },
  { id: 'subscription', label: 'Plan',         icon: CreditCard },
  { id: 'modules',      label: 'Modules',      icon: Blocks },
  { id: 'admin',        label: 'Admin',        icon: User },
  { id: 'review',       label: 'Review',       icon: CheckCircle2 },
] as const;

export const PLAN_OPTIONS: { value: SubscriptionPlan; label: string; price: string; desc: string; color: string }[] = [
  { value: 'trial',      label: 'Trial',        price: 'Free / 30 days', desc: 'Explore before committing',    color: 'border-yellow-500/40 bg-yellow-500/8' },
  { value: 'starter',    label: 'Starter',      price: '$29/mo',         desc: 'Up to 100 students',           color: 'border-teal-500/40 bg-teal-500/8' },
  { value: 'pro',        label: 'Professional', price: '$79/mo',         desc: 'Up to 500 students, 5 admins', color: 'border-blue-500/40 bg-blue-500/8' },
  { value: 'enterprise', label: 'Enterprise',   price: '$199/mo',        desc: 'Unlimited, API access, SSO',   color: 'border-indigo-500/40 bg-indigo-500/8' },
];

export const MODULES = [
  { id: 'core',      name: 'Core SIS',              desc: 'Student info, attendance, grades', required: true },
  { id: 'finance',   name: 'Finance & Billing',      desc: 'Invoices, fee collection, payroll' },
  { id: 'lms',       name: 'Learning Management',    desc: 'Assignments, quizzes, courses' },
  { id: 'hr',        name: 'HR & Staffing',          desc: 'Leave, staff portal, payroll' },
  { id: 'transport', name: 'Transport & Fleet',      desc: 'Bus tracking, routes, fees' },
  { id: 'hostel',    name: 'Hostel & Dormitory',     desc: 'Room allocation, wardens, visitors' },
  { id: 'library',   name: 'Library Management',     desc: 'Books, loans, catalogues' },
  { id: 'parents',   name: 'Parent Portal',          desc: 'Progress reports, payments, alerts' },
];

export const REGIONS = [
  'Eastern Region',
  'Northern Region',
  'Southern Region',
  'Western Area Urban',
  'Western Area Rural',
];

export const SCHOOL_TYPES = ['Primary', 'Senior / High School', 'Kindergarten', 'College', 'Vocational'];

export const SCHOOL_LEVELS = [
  { value: 'kindergarten', label: 'Kindergarten / Pre-School' },
  { value: 'primary',      label: 'Primary / Elementary' },
  { value: 'junior',       label: 'Junior / Middle School' },
  { value: 'secondary',    label: 'Senior / High School' },
  { value: 'college',      label: 'College / University' },
  { value: 'vocational',   label: 'Vocational / Technical' },
];

export const SCHOOL_SHIFTS = [
  { value: 'morning',   label: 'Morning Shift' },
  { value: 'afternoon', label: 'Afternoon Shift' }
];
