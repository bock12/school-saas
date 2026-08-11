'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, Bell, Calendar,
  ClipboardList, Users, FileText,
  Clock, CheckSquare, Shield,
  BarChart3, TrendingUp, Award,
  BookOpen, AlertTriangle, Scale,
  Send, Archive, ScrollText, Stamp,
  MessageSquare, Settings, FlaskConical,
  ChevronDown, ChevronRight, ChevronLeft, Fingerprint,
  UserCheck, BookMarked, Sparkles, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-provider';
import { useState, useEffect } from 'react';

type NavGroup = {
  label: string;
  emoji: string;
  color: string;
  badge?: string;
  items: { id: string; label: string; icon: React.ElementType; badge?: string }[];
};

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    emoji: '🏛️',
    color: 'text-violet-400',
    items: [
      { id: 'dashboard', label: 'Control Center', icon: LayoutDashboard },
      { id: 'communications', label: 'Communication Center', icon: MessageSquare, badge: 'New' },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'calendar', label: 'Exam Calendar', icon: Calendar },
      { id: 'audit', label: 'Audit & Security Log', icon: Shield },
    ],
  },
  {
    label: 'Examinations',
    emoji: '📅',
    color: 'text-blue-400',
    items: [
      { id: 'sessions', label: 'Exam Sessions', icon: ClipboardList },
      { id: 'grading-systems', label: 'Grading Systems', icon: Award },
      { id: 'question-bank', label: 'Question Papers', icon: BookOpen },
    ],
  },
  {
    label: 'Candidates',
    emoji: '👥',
    color: 'text-emerald-400',
    items: [
      { id: 'eligibility', label: 'Eligibility & Clearance', icon: UserCheck },
      { id: 'admit-cards', label: 'Admit Cards & Roll Nos.', icon: Fingerprint },
    ],
  },
  {
    label: 'Timetable & Halls',
    emoji: '🕒',
    color: 'text-amber-400',
    items: [
      { id: 'timetables', label: 'Exam Timetable', icon: Clock },
      { id: 'rooms', label: 'Exam Halls & Rooms', icon: BookMarked },
      { id: 'seating', label: 'Seating Arrangements', icon: Users },
      { id: 'invigilation', label: 'Invigilation Roster', icon: FileText },
    ],
  },
  {
    label: 'Live Operations',
    emoji: '🛡️',
    color: 'text-teal-400',
    items: [
      { id: 'hall-attendance', label: 'Hall Attendance', icon: CheckSquare },
      { id: 'malpractice', label: 'Malpractice & Incidents', icon: AlertTriangle, badge: 'Live' },
    ],
  },
  {
    label: 'Marks & Scores',
    emoji: '🖊️',
    color: 'text-purple-400',
    items: [
      { id: 'score-entry', label: 'Score Entry Status', icon: FlaskConical },
      { id: 'missing-marks', label: 'Missing Marks Audit', icon: AlertTriangle },
    ],
  },
  {
    label: 'Moderation & Results',
    emoji: '⚖️',
    color: 'text-rose-400',
    items: [
      { id: 'moderation', label: 'Moderation Workflow', icon: Scale },
      { id: 'validation', label: 'Result Validation', icon: CheckSquare },
      { id: 'approval', label: 'Approval Center', icon: Stamp },
      { id: 'publication', label: 'Result Publication', icon: Send },
    ],
  },
  {
    label: 'Analytics & Reports',
    emoji: '📊',
    color: 'text-cyan-400',
    items: [
      { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp },
      { id: 'reports', label: 'Reports Center', icon: BarChart3 },
      { id: 'appeals', label: 'Appeals & Corrections', icon: MessageSquare },
    ],
  },
  {
    label: 'Documents',
    emoji: '📜',
    color: 'text-slate-400',
    items: [
      { id: 'broadsheets', label: 'Master Broadsheets', icon: ScrollText },
      { id: 'transcripts', label: 'Transcripts & Certs', icon: Archive },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function ExamOfficeSidebar({
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
  const basePath = `/exam-office`;

  useEffect(() => {
    closeMobile();
  }, [pathname, searchParams, closeMobile]);

  const activeGroupLabel =
    navGroups.find((g) => g.items.some((i) => i.id === currentTab))?.label ?? 'Overview';
  const [openGroups, setOpenGroups] = useState<string[]>([activeGroupLabel]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const accentColor = primaryColor || '#7c3aed';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[hsl(var(--bg-secondary))]">
      {/* Brand Header — Styled identically to OrgSidebar */}
      <div className="flex items-center h-16 px-4 border-b border-[hsl(var(--border))] flex-shrink-0 justify-between">
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-md relative group"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #4f46e5)`,
            }}
          >
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[hsl(var(--bg-secondary))]" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">
                {tenantName}
              </h2>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider text-violet-400"
              >
                Exam Office Portal
              </p>
            </div>
          )}
        </div>
        <button
          onClick={closeMobile}
          className="lg:hidden p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-3 px-2.5 overflow-y-auto space-y-1 scrollbar-thin">
        {navGroups.map((group) => {
          const isGroupOpen = isCollapsed || openGroups.includes(group.label);
          const hasActive = group.items.some((i) => i.id === currentTab);

          return (
            <div key={group.label} className="mb-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 mb-1 mt-2.5 text-[10px] font-semibold uppercase tracking-widest transition-colors rounded-md py-1 hover:bg-[hsl(var(--bg-tertiary)/0.4)]',
                    hasActive
                      ? 'text-violet-400 font-bold'
                      : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
                  )}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{group.emoji}</span>
                    <span>{group.label}</span>
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {hasActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                    )}
                    {isGroupOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </div>
                </button>
              )}

              {isCollapsed && (
                <div className="my-2 mx-3 border-t border-[hsl(var(--border)/0.4)]" />
              )}

              {isGroupOpen && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const targetHref = `${basePath}?tab=${item.id}`;
                    const isActive =
                      pathname.includes('/exam-office') &&
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
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                          isActive
                            ? 'bg-violet-600/15 text-violet-400 font-bold'
                            : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 group-hover:scale-110',
                            isActive
                              ? 'text-violet-400'
                              : 'text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]'
                          )}
                        />

                        {!isCollapsed && (
                          <>
                            <span className="truncate flex-1 text-xs font-semibold">{item.label}</span>
                            {item.badge && (
                              <span className={cn(
                                'ml-auto flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                                isActive
                                  ? 'bg-violet-500 text-white'
                                  : 'bg-violet-500/15 text-violet-400'
                              )}>
                                {item.badge}
                              </span>
                            )}
                            {isActive && !item.badge && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                            )}
                          </>
                        )}

                        {/* Hover Tooltip in Collapsed Rail Mode */}
                        {isCollapsed && (
                          <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-primary))] whitespace-nowrap shadow-lg z-50">
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

      {/* Collapse Toggle Footer — Styled identically to OrgSidebar */}
      <div className="border-t border-[hsl(var(--border))] p-2.5 flex-shrink-0 hidden lg:block">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 text-xs font-semibold"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={closeMobile}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[260px] border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] transition-transform duration-300 ease-in-out lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
