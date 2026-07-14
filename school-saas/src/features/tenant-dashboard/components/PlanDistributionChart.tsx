import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Layers, Loader2 } from 'lucide-react';

export function PlanDistributionChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'plan-distribution'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tenants')
        .select('id, plan_id, subscription_plans (name)')
        .eq('type', 'school');

      if (error) throw new Error(error.message);

      const counts: Record<string, number> = {
        'Starter': 0,
        'Professional': 0,
        'Enterprise': 0,
        'Trial / Free': 0,
      };

      let total = 0;
      data.forEach((row: any) => {
        const planName = row.subscription_plans?.name || 'Trial / Free';
        counts[planName] = (counts[planName] ?? 0) + 1;
        total++;
      });

      return {
        total,
        distribution: Object.entries(counts).map(([name, count]) => ({
          name,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        })),
      };
    },
  });

  const planColors: Record<string, string> = {
    'Starter': 'bg-teal-500',
    'Professional': 'bg-blue-500',
    'Enterprise': 'bg-indigo-500',
    'Trial / Free': 'bg-yellow-500',
  };

  return (
    <div className="glass-card p-5 border border-[hsl(var(--border))] rounded-2xl flex flex-col h-[280px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-[hsl(var(--accent)/0.1)]">
          <Layers className="w-4 h-4 text-[hsl(var(--accent))]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider">
            Plan Distribution
          </h3>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
            Active school tiers across the platform
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--accent))]" />
          </div>
        ) : (
          data?.distribution.map(plan => (
            <div key={plan.name} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[hsl(var(--text-secondary))]">{plan.name}</span>
                <span className="text-[hsl(var(--text-primary))]">
                  {plan.count} ({plan.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${planColors[plan.name] || 'bg-gray-400'}`}
                  style={{ width: `${plan.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
