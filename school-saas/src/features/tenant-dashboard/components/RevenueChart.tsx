import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useDashboardRevenue } from '../hooks/useDashboard';

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState('6m');
  const { data, isLoading, isError } = useDashboardRevenue(timeRange);

  return (
    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-3 h-[280px] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">
            Tenant Acquisition & MRR Growth
          </h3>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
            New schools onboarded and recurring revenue.
          </p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 text-xs text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="6m">Last 6 Months</option>
          <option value="1y">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
      
      <div className="flex-1 min-h-0 w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/20 rounded-xl animate-pulse">
            <div className="h-full w-full border-b border-l border-gray-200 dark:border-gray-800 p-4 flex items-end gap-4">
               {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className="flex-1 bg-indigo-500/10 rounded-t" style={{ height: `${20 + i * 10}%` }}></div>
               ))}
            </div>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm">
            Error loading chart data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--text-tertiary))', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--text-tertiary))', fontSize: 12 }}
                tickFormatter={(val) => `$${val / 1000}k`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--bg-elevated))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--text-primary))'
                }}
                itemStyle={{ color: 'hsl(var(--accent))' }}
                formatter={(value: any) => {
                  const numValue = typeof value === 'number' ? value : Number(value);
                  return [`$${numValue.toLocaleString()}`, 'MRR'];
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: 'hsl(var(--bg-secondary))', stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
