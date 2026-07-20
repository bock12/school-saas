'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

function AttendanceTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length && payload[0].value > 0) {
    return (
      <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-[hsl(var(--text-primary))]">{label}</p>
        <p className="text-xs text-emerald-400">{payload[0].value}% attendance</p>
      </div>
    );
  }
  return null;
}

function FeeTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-[hsl(var(--text-primary))] mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className={`text-xs ${p.name === 'collected' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {p.name === 'collected' ? 'Collected' : 'Pending'}: $${p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

interface DashboardChartsProps {
  attendanceData: Array<{ day: string; rate: number }>;
  feeData: Array<{ month: string; collected: number; pending: number }>;
  basePath: string;
}

export function DashboardCharts({ attendanceData, feeData, basePath }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Attendance Chart */}
      <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
              Weekly Attendance
            </h2>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
              This week&apos;s daily attendance rate
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            93% avg
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 15%)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(0, 0%, 42%)' }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(0, 0%, 42%)' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<AttendanceTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#attendanceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fee Collection Chart */}
      <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '250ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
              Fee Collection
            </h2>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
              Monthly collected vs pending
            </p>
          </div>
          <Link href={`${basePath}/fees`} className="text-xs text-[hsl(var(--accent))] hover:underline">
            View details
          </Link>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 15%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(0, 0%, 42%)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(0, 0%, 42%)' }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<FeeTooltip />} />
              <Bar dataKey="collected" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
