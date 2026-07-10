"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardHeader } from '../../../../../features/tenant-dashboard/components/DashboardHeader';
import { KpiGrid } from '../../../../../features/tenant-dashboard/components/KpiGrid';
import { RevenueChart } from '../../../../../features/tenant-dashboard/components/RevenueChart';
import { ProvisioningFeed } from '../../../../../features/tenant-dashboard/components/ProvisioningFeed';
import { AlertsPanel } from '../../../../../features/tenant-dashboard/components/AlertsPanel';
import { QuickActions } from '../../../../../features/tenant-dashboard/components/QuickActions';

// Create a query client instance. 
// Using a simple instance here for the prototype, wrapped outside the component to prevent recreation.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function TenantDashboardContent() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-24 animate-fade-in">
      <DashboardHeader />
      <KpiGrid />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RevenueChart />
          <AlertsPanel />
        </div>
        
        <div className="space-y-6">
          <QuickActions />
          <ProvisioningFeed />
        </div>
      </div>
    </div>
  );
}

export default function TenantDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantDashboardContent />
    </QueryClientProvider>
  );
}
