import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

// For this prototype, we'll set a standard refetch interval
const REFRESH_INTERVAL = 1000 * 30; // 30 seconds

export const useDashboardKpis = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => dashboardApi.getKpis(),
    refetchInterval: REFRESH_INTERVAL,
  });
};

export const useDashboardRevenue = (timeRange: string) => {
  return useQuery({
    queryKey: ['dashboard', 'revenue', timeRange],
    queryFn: () => dashboardApi.getRevenueData(timeRange),
    // Revenue doesn't need to refresh as often
    refetchInterval: 1000 * 60 * 5, 
  });
};

export const useProvisioningFeed = () => {
  return useQuery({
    queryKey: ['dashboard', 'provisioning'],
    queryFn: () => dashboardApi.getProvisioningFeed(),
    refetchInterval: 1000 * 15, // Faster refresh for live feed
  });
};

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardApi.getAlerts(),
    refetchInterval: 1000 * 15,
  });
};
