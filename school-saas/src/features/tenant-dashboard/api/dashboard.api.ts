import { KpiMetric, RevenueDataPoint, ProvisioningActivity, Alert } from '../types/dashboard';
import { School, Users, DollarSign, AlertTriangle } from 'lucide-react';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data Generators
const generateKpis = (): KpiMetric[] => [
  { id: 'kpi-1', title: 'Total Registered Schools', value: 542, trend: '+12 this month', trendDirection: 'up', icon: School },
  { id: 'kpi-2', title: 'Platform MRR', value: '$248.5k', trend: '+4.2% MRR', trendDirection: 'up', icon: DollarSign },
  { id: 'kpi-3', title: 'Total End Users', value: '1.24M', trend: 'Active across platform', trendDirection: 'up', icon: Users },
  { id: 'kpi-4', title: 'Risk / Suspended', value: 18, trend: 'Needs review', trendDirection: 'down', icon: AlertTriangle }
];

const generateRevenueData = (): RevenueDataPoint[] => [
  { name: 'Jan', revenue: 150000, tenants: 450 },
  { name: 'Feb', revenue: 165000, tenants: 470 },
  { name: 'Mar', revenue: 180000, tenants: 495 },
  { name: 'Apr', revenue: 210000, tenants: 512 },
  { name: 'May', revenue: 235000, tenants: 530 },
  { name: 'Jun', revenue: 248500, tenants: 542 },
];

const generateProvisioningFeed = (): ProvisioningActivity[] => [
  { id: 'p-1', schoolName: 'Global Tech Academy', plan: 'Enterprise', geography: 'North America', status: 'active', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), createdBy: 'System' },
  { id: 'p-2', schoolName: 'Summit International', plan: 'Pro', geography: 'Europe', status: 'trial', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), createdBy: 'John Smith' },
  { id: 'p-3', schoolName: 'Westside High', plan: 'Starter', geography: 'North America', status: 'trial', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), createdBy: 'Alice Johnson' },
  { id: 'p-4', schoolName: 'Northstar School', plan: 'Enterprise', geography: 'Asia', status: 'pending', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), createdBy: 'System' },
];

const generateAlerts = (): Alert[] => [
  { id: 'a-1', title: 'Provisioning Job Failed', description: 'Tenant DB creation timeout for ID: 8829', severity: 'critical', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'a-2', title: 'High Storage Usage', description: 'District 4 is at 95% of quota.', severity: 'warning', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 'a-3', title: 'Billing Sync Delayed', description: 'Stripe webhook sync is delayed by 2 minutes.', severity: 'info', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
];

export const dashboardApi = {
  getKpis: async (): Promise<KpiMetric[]> => {
    await delay(500);
    return generateKpis();
  },
  
  getRevenueData: async (_timeRange: string = '6m'): Promise<RevenueDataPoint[]> => {
    await delay(700);
    return generateRevenueData();
  },
  
  getProvisioningFeed: async (): Promise<ProvisioningActivity[]> => {
    await delay(600);
    return generateProvisioningFeed();
  },
  
  getAlerts: async (): Promise<Alert[]> => {
    await delay(400);
    return generateAlerts();
  }
};
