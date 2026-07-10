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
  | 'archived';

export interface TenantNode {
  id: string;
  name: string;
  type: HierarchyType;
  parentId?: string; // null if top-level organization
  childrenCount: number;
  usersCount: number;
  studentsCount: number;
  storageUsed: number; // in bytes or GB
  subscriptionId?: string;
  status: TenantStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HierarchyFilterParams {
  search?: string;
  status?: TenantStatus;
  type?: HierarchyType;
  page?: number;
  limit?: number;
  sortBy?: keyof TenantNode;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
