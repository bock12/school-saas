import React from 'react';
import { useDashboardKpis } from '../hooks/useDashboard';
import { KpiCard } from './KpiCard';
import { KpiMetric } from '../types/dashboard';

export function KpiGrid() {
  const { data: kpis, isLoading, isError } = useDashboardKpis();

  if (isError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
        Failed to load KPI metrics. Please try again later.
      </div>
    );
  }

  // Loading skeleton state
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <KpiCard key={i} metric={{} as unknown as KpiMetric} isLoading={true} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(kpi => (
        <KpiCard key={kpi.id} metric={kpi} />
      ))}
    </div>
  );
}
