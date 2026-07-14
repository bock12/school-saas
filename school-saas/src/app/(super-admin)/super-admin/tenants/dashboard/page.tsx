"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardHeader } from '../../../../../features/tenant-dashboard/components/DashboardHeader';
import { KpiGrid } from '../../../../../features/tenant-dashboard/components/KpiGrid';
import { RevenueChart } from '../../../../../features/tenant-dashboard/components/RevenueChart';
import { PlanDistributionChart } from '../../../../../features/tenant-dashboard/components/PlanDistributionChart';
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
    <div className="space-y-5 sm:space-y-6 pb-20 animate-fade-in">
      <DashboardHeader />
      <KpiGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <RevenueChart />
            <PlanDistributionChart />
          </div>
          <AlertsPanel />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
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
