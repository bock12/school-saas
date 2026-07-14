export type HierarchyType = 
  | 'organization'
  | 'group'
  | 'district'
  | 'school'
  | 'campus';

export type TenantStatus = 
  | 'active'
  | 'trial'
  | 'provisioning'
  | 'pending'
  | 'suspended'
  | 'archived'
  | 'past_due'
  | 'deleted';

export type SubscriptionPlan = 'enterprise' | 'pro' | 'starter' | 'trial';

export interface TenantNode {
  id: string;
  name: string;
  type: HierarchyType;
  parentId?: string;
  childrenCount: number;
  usersCount: number;
  studentsCount: number;
  storageUsed: number;
  subscriptionId?: string;
  plan?: SubscriptionPlan;
  status: TenantStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // Standalone: org and school are the same entity
  isStandaloneSchool?: boolean;
  // Domain / identity
  slug?: string;
  region?: string;
  schoolType?: string;
  schoolLevels?: string[];
  schoolShifts?: string[];
  address?: string;
  // Tree building (populated client-side)
  children?: TenantNode[];
}

export interface HierarchyFilterParams {
  search?: string;
  status?: TenantStatus;
  type?: HierarchyType;
  page?: number;
  limit?: number;
  sortBy?: keyof TenantNode;
  sortOrder?: 'asc' | 'desc';
  parentId?: string; // fetch direct children of a node
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
