import React from 'react';

// Reuse the TenantStatus from hierarchy, or redefine if they drift
export type TenantStatus = 
  | 'active'
  | 'trial'
  | 'provisioning'
  | 'pending'
  | 'suspended'
  | 'archived';

export interface KpiMetric {
  id: string;
  title: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
}

export interface RevenueDataPoint {
  name: string;
  revenue: number;
  tenants: number;
}

export interface ProvisioningActivity {
  id: string;
  schoolName: string;
  plan: string;
  geography: string;
  status: TenantStatus;
  timestamp: string;
  createdBy: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  color?: string; // Tailwind class
}
