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
  ChevronDown, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-provider';
import { useState } from 'react';

type NavGroup = {
  label: string;
  emoji: string;
  color: string;
  items: { id: string; label: string; icon: React.ElementType }[];
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
      { id: 'attendance', label: 'Take Attendance', icon: CheckSquare },
      { id: 'attendance-history', label: 'Attendance History', icon: RotateCcw },
    ],
  },
  {
    label: 'Assessment',
    emoji: '📊',
    color: 'text-purple-400',
    items: [
      { id: 'gradebook', label: 'Gradebook', icon: Award },
      { id: 'scores', label: 'Enter Scores', icon: ClipboardList },
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
      { id: 'ai-assistant', label: 'AI Teaching Assistant', icon: Brain },
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
  const { isCollapsed } = useSidebar();
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
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border))] transition-all duration-300 overflow-y-auto scrollbar-none flex flex-col',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand header */}
      <div className="h-16 flex items-center px-3 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--bg-secondary))] z-10 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md"
          style={{ background: `linear-gradient(135deg, ${primaryColor || '#6366f1'}, ${primaryColor || '#6366f1'}99)` }}
        >
          {tenantName ? tenantName.substring(0, 1).toUpperCase() : 'T'}
        </div>
        {!isCollapsed && (
          <div className="ml-2.5 min-w-0">
            <p className="font-bold text-xs text-[hsl(var(--text-primary))] truncate">{tenantName}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Teacher Portal</p>
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-3 space-y-0.5">
        {navGroups.map((group) => {
          const isGroupOpen = isCollapsed || openGroups.includes(group.label);
          const hasActive = group.items.some((i) => i.id === currentTab);

          return (
            <div key={group.label}>
              {/* Group header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors',
                    hasActive
                      ? group.color
                      : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{group.emoji}</span>
                    <span>{group.label}</span>
                  </span>
                  {isGroupOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              )}

              {/* Group items */}
              {isGroupOpen && (
                <div className={cn('space-y-0.5', !isCollapsed && 'px-2 pb-1')}>
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
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          'flex items-center rounded-xl text-xs font-semibold transition-all group',
                          isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2',
                          isActive
                            ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md shadow-[hsl(var(--accent)/0.2)]'
                            : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
                        )}
                      >
                        <Icon
                          className={cn(
                            'flex-shrink-0',
                            isCollapsed ? 'w-4 h-4' : 'w-4 h-4',
                            isActive ? 'text-white' : 'text-[hsl(var(--text-tertiary))]'
                          )}
                        />
                        {!isCollapsed && <span className="ml-2.5 truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
