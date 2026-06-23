'use client';

import { StatCard } from '@/components/super-admin/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  School,
  CreditCard,
  DollarSign,
  Users,
  ArrowRight,
  Plus,
  Megaphone,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Demo data — will be replaced with Supabase queries
const revenueData = [
  { month: 'Jan', revenue: 4200, schools: 12 },
  { month: 'Feb', revenue: 5100, schools: 15 },
  { month: 'Mar', revenue: 6800, schools: 19 },
  { month: 'Apr', revenue: 7200, schools: 22 },
  { month: 'May', revenue: 8900, schools: 28 },
  { month: 'Jun', revenue: 9600, schools: 31 },
  { month: 'Jul', revenue: 11200, schools: 35 },
  { month: 'Aug', revenue: 12800, schools: 39 },
  { month: 'Sep', revenue: 13500, schools: 42 },
  { month: 'Oct', revenue: 15200, schools: 46 },
  { month: 'Nov', revenue: 16800, schools: 51 },
  { month: 'Dec', revenue: 18400, schools: 56 },
];

const recentSchools = [
  {
    id: '1',
    name: 'Greenwood Academy',
    slug: 'greenwood',
    plan: 'Professional',
    status: 'active' as const,
    students: 342,
    created_at: '2026-06-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'Sunrise International School',
    slug: 'sunrise',
    plan: 'Enterprise',
    status: 'active' as const,
    students: 1205,
    created_at: '2026-06-18T08:15:00Z',
  },
  {
    id: '3',
    name: 'Heritage Prep',
    slug: 'heritage-prep',
    plan: 'Starter',
    status: 'trial' as const,
    students: 67,
    created_at: '2026-06-15T14:45:00Z',
  },
  {
    id: '4',
    name: 'Oakwood Learning Center',
    slug: 'oakwood',
    plan: 'Professional',
    status: 'past_due' as const,
    students: 189,
    created_at: '2026-06-12T11:20:00Z',
  },
  {
    id: '5',
    name: 'Maple Ridge School',
    slug: 'maple-ridge',
    plan: 'Starter',
    status: 'active' as const,
    students: 98,
    created_at: '2026-06-10T09:00:00Z',
  },
];

const recentActivity = [
  {
    id: '1',
    action: 'New school registered',
    detail: 'Greenwood Academy joined on Professional plan',
    time: '2 hours ago',
    type: 'success',
  },
  {
    id: '2',
    action: 'Subscription upgraded',
    detail: 'Sunrise International upgraded to Enterprise',
    time: '5 hours ago',
    type: 'info',
  },
  {
    id: '3',
    action: 'Payment overdue',
    detail: 'Oakwood Learning Center — invoice #INV-0041',
    time: '1 day ago',
    type: 'warning',
  },
  {
    id: '4',
    action: 'School suspended',
    detail: 'Riverdale Academy suspended for non-payment',
    time: '2 days ago',
    type: 'danger',
  },
];

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-[hsl(var(--text-primary))]">{label}</p>
        <p className="text-xs text-[hsl(var(--accent))]">
          ${payload[0].value.toLocaleString()} MRR
        </p>
      </div>
    );
  }
  return null;
}

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Platform-wide metrics and recent activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/super-admin/tenants"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add School
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Schools"
          value="56"
          icon={School}
          trend={12}
          trendLabel="vs last month"
          accentColor="hsl(250, 90%, 65%)"
          delay={0}
        />
        <StatCard
          title="Active Subscriptions"
          value="48"
          icon={CreditCard}
          trend={8}
          trendLabel="3 trials expiring soon"
          accentColor="hsl(142, 71%, 45%)"
          delay={50}
        />
        <StatCard
          title="Monthly Revenue"
          value="$18,400"
          icon={DollarSign}
          trend={15}
          trendLabel="MRR growing steadily"
          accentColor="hsl(38, 92%, 50%)"
          delay={100}
        />
        <StatCard
          title="Total Students"
          value="12,847"
          icon={Users}
          trend={22}
          trendLabel="Across all schools"
          accentColor="hsl(217, 91%, 60%)"
          delay={150}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 glass-card p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
                Revenue Trend
              </h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                Monthly Recurring Revenue (MRR)
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              +15% this quarter
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(250, 90%, 65%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(250, 90%, 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 20%, 15%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(0, 0%, 42%)' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(0, 0%, 42%)' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(250, 90%, 65%)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
              Recent Activity
            </h2>
            <Link
              href="/super-admin/system"
              className="text-xs text-[hsl(var(--accent))] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors"
              >
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    item.type === 'success'
                      ? 'bg-emerald-400'
                      : item.type === 'info'
                        ? 'bg-blue-400'
                        : item.type === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight">
                    {item.action}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 truncate">
                    {item.detail}
                  </p>
                </div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] flex-shrink-0 mt-0.5">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Schools Table */}
      <div className="glass-card animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
              Recent Schools
            </h2>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
              Latest tenant registrations
            </p>
          </div>
          <Link
            href="/super-admin/tenants"
            className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">
                  School
                </th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">
                  Plan
                </th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">
                  Students
                </th>
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSchools.map((school) => (
                <tr
                  key={school.id}
                  className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                        {school.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                          {school.name}
                        </p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">
                          {school.slug}.schoolsaas.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-[hsl(var(--text-secondary))]">
                      {school.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={school.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-[hsl(var(--text-secondary))]">
                      {school.students.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                      <Clock className="w-3 h-3" />
                      {new Date(school.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/super-admin/tenants"
          className="glass-card p-5 flex items-center gap-4 group hover:border-[hsl(var(--accent)/0.3)] transition-all animate-fade-in"
          style={{ animationDelay: '350ms' }}
        >
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center group-hover:bg-[hsl(var(--accent)/0.2)] transition-colors">
            <Plus className="w-5 h-5 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              Onboard School
            </h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              Register a new tenant
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] ml-auto group-hover:text-[hsl(var(--accent))] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/super-admin/plans"
          className="glass-card p-5 flex items-center gap-4 group hover:border-[hsl(var(--accent)/0.3)] transition-all animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              Manage Plans
            </h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              Edit pricing & features
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] ml-auto group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/super-admin/system"
          className="glass-card p-5 flex items-center gap-4 group hover:border-amber-500/30 transition-all animate-fade-in"
          style={{ animationDelay: '450ms' }}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Megaphone className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              Send Broadcast
            </h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              Notify all tenants
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] ml-auto group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
