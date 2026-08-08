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
  UserCheck, BookMarked,
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
    emoji: '🏛️',
    color: 'text-violet-400',
    items: [
      { id: 'dashboard', label: 'Control Center', icon: LayoutDashboard },
      { id: 'communications', label: 'Communication Center', icon: MessageSquare },
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
      { id: 'malpractice', label: 'Malpractice & Incidents', icon: AlertTriangle },
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
  const basePath = `/exam-office`;

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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border))] transition-all duration-300 overflow-y-auto scrollbar-none flex flex-col',
          isCollapsed ? 'w-16' : 'w-60',
          isMobileOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--bg-secondary))] z-10 flex-shrink-0">
          <div className="flex items-center min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md"
              style={{ background: `linear-gradient(135deg, #7c3aed, #4f46e5)` }}
            >
              E
            </div>
            {!isCollapsed && (
              <div className="ml-2.5 min-w-0">
                <p className="font-bold text-xs text-[hsl(var(--text-primary))] truncate">{tenantName}</p>
                <p className="text-[10px] text-violet-400 font-semibold">Exam Office</p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle button in header */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform duration-200', isCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-3 space-y-0.5">
          {navGroups.map((group) => {
            const isGroupOpen = isCollapsed || openGroups.includes(group.label);
            const hasActive = group.items.some((i) => i.id === currentTab);

            return (
              <div key={group.label}>
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
                    {isGroupOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                )}

                {isGroupOpen && (
                  <div className={cn('space-y-0.5', !isCollapsed && 'px-2 pb-1')}>
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
                            'flex items-center rounded-xl text-xs font-semibold transition-all group',
                            isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2',
                            isActive
                              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                              : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
                          )}
                        >
                          <Icon
                            className={cn(
                              'flex-shrink-0 w-4 h-4',
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

        {/* Footer Collapse Toggle (desktop only) */}
        <div className="border-t border-[hsl(var(--border))] p-2.5 flex-shrink-0 hidden lg:block">
          <button
            onClick={toggleCollapsed}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors',
              isCollapsed && 'px-0'
            )}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform duration-200', isCollapsed && 'rotate-180')} />
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
