'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, GraduationCap, Bell,
  Clock, Calendar, CalendarCheck,
  Users, UserCheck, BookOpen,
  FileText, ClipboardList, Folder,
  CheckSquare, RotateCcw,
  Award, AlertTriangle,
  TrendingUp, BarChart3,
  MessageSquare, Megaphone,
  Brain, CalendarX, BookMarked, Settings,
  ChevronDown, ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-provider';
import { useState } from 'react';

type NavGroup = {
  label: string;
  emoji: string;
  color: string;
  items: { id: string; label: string; icon: React.ElementType; badge?: string }[];
};

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    emoji: '🏠',
    color: 'text-indigo-400',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'My Profile', icon: GraduationCap },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Teaching',
    emoji: '📅',
    color: 'text-blue-400',
    items: [
      { id: 'schedule', label: "Today's Schedule", icon: Clock },
      { id: 'timetable', label: 'Weekly Timetable', icon: Calendar },
      { id: 'calendar', label: 'Academic Calendar', icon: CalendarCheck },
    ],
  },
  {
    label: 'Classes & Students',
    emoji: '👥',
    color: 'text-emerald-400',
    items: [
      { id: 'classes', label: 'My Classes', icon: Users },
      { id: 'students', label: 'Student List', icon: UserCheck },
      { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    ],
  },
  {
    label: 'Lessons & Tasks',
    emoji: '📝',
    color: 'text-amber-400',
    items: [
      { id: 'lesson-plans', label: 'Lesson Plans', icon: FileText },
      { id: 'assignments', label: 'Assignments', icon: ClipboardList },
      { id: 'materials', label: 'Teaching Materials', icon: Folder },
    ],
  },
  {
    label: 'Attendance',
    emoji: '✅',
    color: 'text-teal-400',
    items: [
      { id: 'attendance', label: 'Take Attendance', icon: CheckSquare, badge: 'Daily' },
      { id: 'attendance-history', label: 'Attendance History', icon: RotateCcw },
    ],
  },
  {
    label: 'Assessment',
    emoji: '📊',
    color: 'text-purple-400',
    items: [
      { id: 'gradebook', label: 'Gradebook', icon: Award },
      { id: 'scores', label: 'Enter Scores', icon: ClipboardList, badge: 'Exam' },
      { id: 'behaviour', label: 'Behaviour', icon: AlertTriangle },
    ],
  },
  {
    label: 'Analytics & Reports',
    emoji: '📈',
    color: 'text-rose-400',
    items: [
      { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp },
      { id: 'reports', label: 'Generate Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Communication',
    emoji: '💬',
    color: 'text-cyan-400',
    items: [
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    label: 'My Workspace',
    emoji: '⚙️',
    color: 'text-slate-400',
    items: [
      { id: 'ai-assistant', label: 'AI Teaching Assistant', icon: Brain, badge: 'AI' },
      { id: 'leave', label: 'Leave Requests', icon: CalendarX },
      { id: 'resources', label: 'Resources & Library', icon: BookMarked },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function TeacherSidebar({
  tenantSlug,
  tenantName,
  primaryColor,
}: {
  tenantSlug: string;
  tenantName: string;
  primaryColor?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebar();
  const basePath = `/teacher`;

  const activeGroupLabel =
    navGroups.find((g) => g.items.some((i) => i.id === currentTab))?.label ?? 'Overview';
  const [openGroups, setOpenGroups] = useState<string[]>([activeGroupLabel]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border)/0.8)] transition-all duration-300 overflow-y-auto scrollbar-none flex flex-col shadow-xl',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-[hsl(var(--border)/0.8)] sticky top-0 bg-[hsl(var(--bg-secondary))] z-10 flex-shrink-0 backdrop-blur-md">
          <div className="flex items-center min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-lg relative group"
              style={{ background: `linear-gradient(135deg, ${primaryColor || '#6366f1'}, #4f46e5)` }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[hsl(var(--bg-secondary))]" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 min-w-0">
                <p className="font-bold text-xs text-[hsl(var(--text-primary))] truncate leading-tight">{tenantName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.2 rounded-md">Teacher Portal</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle button in header */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform duration-300', isCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-3 space-y-1">
          {navGroups.map((group) => {
            const isGroupOpen = isCollapsed || openGroups.includes(group.label);
            const hasActive = group.items.some((i) => i.id === currentTab);

            return (
              <div key={group.label} className="px-2">
                {/* Group header */}
                {!isCollapsed && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors rounded-lg hover:bg-[hsl(var(--bg-tertiary)/0.4)]',
                      hasActive
                        ? group.color
                        : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{group.emoji}</span>
                      <span>{group.label}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {hasActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                      )}
                      {isGroupOpen ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </div>
                  </button>
                )}

                {/* Group items */}
                {isGroupOpen && (
                  <div className={cn('space-y-0.5 mt-0.5', !isCollapsed && 'pb-1')}>
                    {group.items.map((item) => {
                      const isPathMode = pathname.startsWith(`/${tenantSlug}`);
                      const targetHref = isPathMode
                        ? `/${tenantSlug}${basePath}?tab=${item.id}`
                        : `${basePath}?tab=${item.id}`;
                      const isActive =
                        pathname.includes('/teacher') &&
                        (currentTab === item.id ||
                          (!searchParams.get('tab') && item.id === 'dashboard'));
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.id}
                          href={targetHref}
                          onClick={closeMobile}
                          title={isCollapsed ? item.label : undefined}
                          className={cn(
                            'flex items-center rounded-xl text-xs font-semibold transition-all group relative',
                            isCollapsed ? 'justify-center w-10 h-10 mx-auto my-0.5' : 'px-3 py-2.5',
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25 font-bold'
                              : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
                          )}
                        >
                          <Icon
                            className={cn(
                              'flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                              isCollapsed ? 'w-4 h-4' : 'w-4 h-4',
                              isActive ? 'text-white' : 'text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-primary))]'
                            )}
                          />
                          {!isCollapsed && (
                            <span className="ml-2.5 truncate flex-1">{item.label}</span>
                          )}
                          {!isCollapsed && item.badge && (
                            <span className={cn(
                              'ml-auto text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter',
                              isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/15 text-indigo-400'
                            )}>
                              {item.badge}
                            </span>
                          )}

                          {/* Hover Tooltip in Collapsed Rail Mode */}
                          {isCollapsed && (
                            <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] whitespace-nowrap shadow-2xl z-50">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Collapse Toggle (desktop only) */}
        <div className="border-t border-[hsl(var(--border)/0.8)] p-2 flex-shrink-0 hidden lg:block bg-[hsl(var(--bg-secondary))]">
          <button
            onClick={toggleCollapsed}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all',
              isCollapsed && 'px-0'
            )}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform duration-300', isCollapsed && 'rotate-180')} />
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
