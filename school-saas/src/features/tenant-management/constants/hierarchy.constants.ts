import { TenantStatus } from '../types/hierarchy';

export const STATUS_MAP: Record<TenantStatus, {
  label: string;
  color: string;
  dot: string;
  textColor: string;
}> = {
  active:       { label: 'Active',       color: 'bg-green-500/10 text-green-500',   dot: 'bg-green-500',  textColor: 'text-green-500' },
  trial:        { label: 'Trial',        color: 'bg-yellow-500/10 text-yellow-500', dot: 'bg-yellow-500', textColor: 'text-yellow-500' },
  provisioning: { label: 'Provisioning', color: 'bg-blue-500/10 text-blue-500',     dot: 'bg-blue-500',   textColor: 'text-blue-500' },
  pending:      { label: 'Pending',      color: 'bg-orange-500/10 text-orange-500', dot: 'bg-orange-500', textColor: 'text-orange-500' },
  suspended:    { label: 'Suspended',    color: 'bg-red-500/10 text-red-500',       dot: 'bg-red-500',    textColor: 'text-red-500' },
  archived:     { label: 'Archived',     color: 'bg-gray-500/10 text-gray-500',     dot: 'bg-gray-400',   textColor: 'text-gray-500' },
  past_due:     { label: 'Past Due',     color: 'bg-rose-500/10 text-rose-500',     dot: 'bg-rose-500',   textColor: 'text-rose-500' },
  deleted:      { label: 'Deleted',      color: 'bg-red-500/10 text-red-500',       dot: 'bg-red-500',    textColor: 'text-red-500' },
};

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
