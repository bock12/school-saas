'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, GraduationCap, Award, Clock, BookOpenCheck, BookOpen,
  Trophy, Heart, DollarSign, Brain, CheckSquare, Settings, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-provider';

export function StudentSidebar({ tenantSlug, tenantName, primaryColor }: { tenantSlug: string, tenantName: string, primaryColor?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const { isCollapsed } = useSidebar();
  const basePath = `/student`;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', href: `${basePath}?tab=dashboard`, icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Tracker', href: `${basePath}?tab=attendance`, icon: CalendarCheck },
    { id: 'profile', label: 'My Profile', href: `${basePath}?tab=profile`, icon: GraduationCap },
    { id: 'academics', label: 'Academic & Grades', href: `${basePath}?tab=academics`, icon: Award },
    { id: 'timetable', label: 'Timetable & Exams', href: `${basePath}?tab=timetable`, icon: Clock },
    { id: 'calendar', label: 'Academic Calendar', href: `${basePath}?tab=calendar`, icon: Calendar },
    { id: 'assignments', label: 'Assignments Desk', href: `${basePath}?tab=assignments`, icon: BookOpenCheck },
    { id: 'lms', label: 'LMS Courses', href: `${basePath}?tab=lms`, icon: BookOpen },
    { id: 'activities', label: 'School Life & Library', href: `${basePath}?tab=activities`, icon: Trophy },
    { id: 'welfare', label: 'Health & Conduct', href: `${basePath}?tab=welfare`, icon: Heart },
    { id: 'finance', label: 'Fees Ledger', href: `${basePath}?tab=finance`, icon: DollarSign },
    { id: 'ai-copilot', label: 'AI Study Copilot', href: `${basePath}?tab=ai-copilot`, icon: Brain },
    { id: 'productivity', label: 'Productivity Logs', href: `${basePath}?tab=productivity`, icon: CheckSquare },
    { id: 'settings', label: 'Settings', href: `${basePath}?tab=settings`, icon: Settings }
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border))] transition-all duration-300 overflow-y-auto scrollbar-none",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="h-16 flex items-center px-4 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--bg-secondary))] z-10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.25)] to-[hsl(var(--accent))] flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md">
          {tenantName ? tenantName.substring(0, 1).toUpperCase() : 'S'}
        </div>
        {!isCollapsed && (
          <div className="ml-3 truncate">
            <p className="font-bold text-xs text-[hsl(var(--text-primary))] truncate">{tenantName}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Student Portal</p>
          </div>
        )}
      </div>

      <div className="p-3 space-y-1 my-2">
        {navItems.map(item => {
          const isPathMode = pathname.startsWith(`/${tenantSlug}`);
          const targetHref = isPathMode ? `/${tenantSlug}${item.href}` : item.href;
          const isActive = pathname.includes('/student') && (currentTab === item.id || (!searchParams.get('tab') && item.id === 'dashboard'));
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={targetHref}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all group",
                isActive
                  ? "bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md shadow-[hsl(var(--accent)/0.2)]"
                  : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--accent))]")} />
              {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
