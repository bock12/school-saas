import { TenantStatus } from '../types/hierarchy';

export const STATUS_MAP: Record<TenantStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500' },
  trial: { label: 'Trial', color: 'bg-yellow-500/10 text-yellow-500' },
  provisioning: { label: 'Provisioning', color: 'bg-blue-500/10 text-blue-500' },
  pending: { label: 'Pending', color: 'bg-orange-500/10 text-orange-500' },
  suspended: { label: 'Suspended', color: 'bg-red-500/10 text-red-500' },
  archived: { label: 'Archived', color: 'bg-gray-500/10 text-gray-500' },
};

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
