// ===========================================
// App-Wide Constants
// ===========================================

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'SchoolSaaS';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
export const TENANT_MODE = (process.env.NEXT_PUBLIC_TENANT_MODE || 'path') as 'subdomain' | 'path';

export const SUPER_ADMIN_PATHS = ['/super-admin'];
export const AUTH_PATHS = ['/login', '/signup', '/forgot-password'];
export const PUBLIC_PATHS = ['/', '/pricing', '/about', '/contact'];

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  trial: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  suspended: 'bg-red-500/15 text-red-400 border-red-500/20',
  past_due: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  deleted: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
};

export const BROADCAST_TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  critical: 'bg-red-500/15 text-red-400 border-red-500/20',
  maintenance: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Australia/Sydney',
];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'India', 'Nigeria', 'Kenya',
  'South Africa', 'Ghana', 'Japan', 'Brazil', 'Mexico',
];
