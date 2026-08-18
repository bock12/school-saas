'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Layers, BookOpen, CalendarCheck, Clock,
  BarChart3, DollarSign, FileText, ClipboardList, Award, LayoutGrid, Briefcase
} from 'lucide-react';
import { useRef, useEffect } from 'react';

interface HCMHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  actionButton?: React.ReactNode;
}

const HCM_TABS = [
  { label: 'Overview', href: '/admin/staff', icon: LayoutDashboard, exact: true },
  { label: 'Staff Directory', href: '/admin/staff/employees', icon: Users },
  { label: 'Attendance', href: '/admin/staff/attendance', icon: CalendarCheck },
  { label: 'Leave', href: '/admin/staff/leave', icon: Clock },
  { label: 'Recruitment', href: '/admin/staff/recruitment', icon: Briefcase },
  { label: 'Departments', href: '/admin/staff/departments', icon: Layers },
  { label: 'Positions', href: '/admin/staff/positions', icon: BookOpen },
  { label: 'Contracts', href: '/admin/staff/contracts', icon: ClipboardList },
  { label: 'Payroll', href: '/admin/staff/payroll', icon: DollarSign },
  { label: 'Performance', href: '/admin/staff/performance', icon: BarChart3 },
  { label: 'Training', href: '/admin/staff/training', icon: Award },
  { label: 'Documents', href: '/admin/staff/documents', icon: FileText },
  { label: 'Bulk Ops', href: '/admin/staff/bulk', icon: LayoutGrid },
  { label: 'Reports', href: '/admin/staff/reports', icon: BarChart3 },
];

export function HCMHeader({
  title = 'Human Capital Management (HCM)',
  subtitle = 'Unified workforce directory, attendance logs, department structures, and contract compliance.',
  badge = '84 Active Staff',
  actionButton
}: HCMHeaderProps) {
  const pathname = usePathname();
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeEl = tabsContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [pathname]);

  return (
    <div className="space-y-4 pb-2">
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
              {title}
            </h1>
            {badge && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        {actionButton && (
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {actionButton}
          </div>
        )}
      </div>

      {/* Horizontal Scrollable Tabs Bar */}
      <div className="relative border-b border-[hsl(var(--border))] group">
        <div
          ref={tabsContainerRef}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-1 -mb-px px-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {HCM_TABS.map((tab) => {
            const isActive = tab.exact
              ? pathname.endsWith('/admin/staff')
              : pathname.includes(tab.href);

            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                data-active={isActive}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 select-none ${
                  isActive
                    ? 'bg-[hsl(var(--accent))] text-white shadow-md shadow-[hsl(var(--accent)/0.25)]'
                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[hsl(var(--text-tertiary))]'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
