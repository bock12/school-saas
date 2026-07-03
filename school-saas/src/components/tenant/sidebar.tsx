'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  CalendarCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
  Wallet,
  UserPlus,
  UserCheck,
  Heart,
  Bus,
  Home,
  Package,
  MessageSquare,
  Library,
  Trophy,
  ShieldCheck,
  Plug,
  FileText,
  ClipboardList,
  UsersRound,
  Brain,
  HelpCircle,
  ChevronDown,
  Stethoscope,
  Clock,
  BookMarked,
  FlaskConical,
  LayoutGrid,
  X,
  TrendingUp,
  DollarSign,
  UserCog,
  Scale,
  Megaphone,
  Briefcase,
  Shield,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useSidebar } from './sidebar-provider';

interface TenantSidebarProps {
  tenantSlug: string;
  tenantName: string;
  primaryColor?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
  subSections?: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    items: NavItem[];
  }[];
}

export function TenantSidebar({ tenantSlug, tenantName, primaryColor }: TenantSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    Students: true,
    'Staff Management': true,
    Academics: true,
  });

  const basePath = `/${tenantSlug}`;

  // Close mobile sidebar on navigation
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  function toggleSubMenu(key: string) {
    setOpenSubMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const navSections: NavSection[] = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', href: basePath, icon: LayoutDashboard, exact: true },
        { label: 'Parents', href: `${basePath}/parents`, icon: UserCheck },
      ],
    },
    {
      label: 'Staff Management',
      items: [],
      subSections: [
        {
          label: 'Staff Management',
          icon: UsersRound,
          items: [
            { label: 'Dashboard', href: `${basePath}/staff`, icon: LayoutDashboard, exact: true },
            { label: 'Recruitment', href: `${basePath}/staff/recruitment`, icon: Briefcase },
            { label: 'Applicants', href: `${basePath}/staff/applicants`, icon: UserPlus },
            { label: 'Employees', href: `${basePath}/staff/employees`, icon: Users },
            { label: 'Teachers', href: `${basePath}/staff/teachers`, icon: GraduationCap },
            { label: 'Non-Teaching Staff', href: `${basePath}/staff/non-teaching`, icon: Shield },
            { label: 'Departments', href: `${basePath}/staff/departments`, icon: Layers },
            { label: 'Positions', href: `${basePath}/staff/positions`, icon: BookOpen },
            { label: 'Attendance', href: `${basePath}/staff/attendance`, icon: CalendarCheck },
            { label: 'Leave', href: `${basePath}/staff/leave`, icon: Clock },
            { label: 'Performance', href: `${basePath}/staff/performance`, icon: BarChart3 },
            { label: 'Payroll', href: `${basePath}/staff/payroll`, icon: DollarSign },
            { label: 'Documents', href: `${basePath}/staff/documents`, icon: FileText },
            { label: 'Contracts', href: `${basePath}/staff/contracts`, icon: ClipboardList },
            { label: 'Training', href: `${basePath}/staff/training`, icon: Award },
            { label: 'Bulk Operations', href: `${basePath}/staff/bulk`, icon: LayoutGrid },
            { label: 'Reports', href: `${basePath}/staff/reports`, icon: BarChart3 },
          ],
        },
      ],
    },
    {
      label: 'Student Lifecycle',
      items: [],
      subSections: [
        {
          label: 'Students',
          icon: Users,
          items: [
            { label: 'Dashboard', href: `${basePath}/students`, icon: LayoutDashboard, exact: true },
            { label: 'Admissions', href: `${basePath}/students/admissions`, icon: UserPlus },
            { label: 'Applications', href: `${basePath}/students/applications`, icon: ClipboardList },
            { label: 'Enrolled Students', href: `${basePath}/students/enrolled`, icon: UserCheck },
            { label: 'Active Students', href: `${basePath}/students/active`, icon: Users },
            { label: 'Class Allocation', href: `${basePath}/students/allocation`, icon: Layers },
            { label: 'Promotions', href: `${basePath}/students/promotions`, icon: TrendingUp },
            { label: 'Transfers', href: `${basePath}/students/transfers`, icon: Bus },
            { label: 'Graduation', href: `${basePath}/students/graduation`, icon: GraduationCap },
            { label: 'Alumni', href: `${basePath}/students/alumni`, icon: UsersRound },
            { label: 'Medical', href: `${basePath}/students/medical`, icon: Stethoscope },
            { label: 'Discipline', href: `${basePath}/students/discipline`, icon: Scale },
            { label: 'Documents', href: `${basePath}/students/documents`, icon: FileText },
            { label: 'Bulk Operations', href: `${basePath}/students/bulk`, icon: LayoutGrid },
            { label: 'Reports', href: `${basePath}/students/reports`, icon: BarChart3 },
          ],
        },
      ],
    },
    {
      label: 'Academics',
      items: [],
      subSections: [
        {
          label: 'Academics',
          icon: BookOpen,
          items: [
            { label: 'Classes', href: `${basePath}/classes`, icon: Layers },
            { label: 'Subjects', href: `${basePath}/subjects`, icon: BookMarked },
            { label: 'Timetable', href: `${basePath}/academics/timetable`, icon: Clock },
            { label: 'Attendance', href: `${basePath}/attendance`, icon: CalendarCheck },
            { label: 'Examinations', href: `${basePath}/academics/examinations`, icon: FlaskConical },
            { label: 'LMS', href: `${basePath}/academics/lms`, icon: LayoutGrid },
          ],
        },
      ],
    },
    {
      label: 'Finance & HR',
      items: [
        { label: 'Finance', href: `${basePath}/finance`, icon: DollarSign },
        { label: 'Human Resources', href: `${basePath}/hr`, icon: UserCog },
      ],
    },
    {
      label: 'School Life',
      items: [
        { label: 'Communication', href: `${basePath}/communication`, icon: MessageSquare },
        { label: 'Library', href: `${basePath}/library`, icon: Library },
        { label: 'Transport', href: `${basePath}/transport`, icon: Bus },
        { label: 'Hostel', href: `${basePath}/hostel`, icon: Home },
        { label: 'Health Center', href: `${basePath}/health`, icon: Stethoscope },
        { label: 'Welfare & Discipline', href: `${basePath}/welfare`, icon: Scale },
        { label: 'Events', href: `${basePath}/events`, icon: Trophy },
      ],
    },
    {
      label: 'Resources',
      items: [
        { label: 'Inventory', href: `${basePath}/inventory`, icon: Package },
        { label: 'Reports & Analytics', href: `${basePath}/reports`, icon: TrendingUp },
        { label: 'Approvals', href: `${basePath}/approvals`, icon: ClipboardList, badge: '5' },
      ],
    },
    {
      label: 'Administration',
      items: [
        { label: 'Users & Roles', href: `${basePath}/users-roles`, icon: UsersRound },
        { label: 'Integrations', href: `${basePath}/integrations`, icon: Plug },
        { label: 'Audit Logs', href: `${basePath}/audit-logs`, icon: ShieldCheck },
        { label: 'AI Assistant', href: `${basePath}/ai-assistant`, icon: Brain },
        { label: 'Settings', href: `${basePath}/settings`, icon: Settings },
      ],
    },
    {
      label: 'Support',
      items: [
        { label: 'Help & Support', href: `${basePath}/help`, icon: HelpCircle },
      ],
    },
  ];

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const accentStyle = primaryColor
    ? ({ '--tenant-accent': primaryColor } as React.CSSProperties)
    : {};

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href, item.exact);
    return (
      <Link
        key={item.href}
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
          active
            ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]'
            : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
        )}
      >
        <item.icon
          className={cn(
            'w-[18px] h-[18px] flex-shrink-0 transition-colors',
            active
              ? 'text-[hsl(var(--accent))]'
              : 'text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]'
          )}
        />
        {!isCollapsed && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[hsl(var(--accent))] text-white">
                {item.badge}
              </span>
            )}
            {active && !item.badge && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" />
            )}
          </>
        )}
        {/* Tooltip when collapsed */}
        {isCollapsed && (
          <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-primary))] whitespace-nowrap shadow-lg z-50">
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full" style={accentStyle}>
      {/* School Logo / Name */}
      <div className="flex items-center h-16 px-4 border-b border-[hsl(var(--border))] flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden w-full">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: primaryColor ? `${primaryColor}20` : 'hsl(var(--accent) / 0.15)',
            }}
          >
            <School
              className="w-4 h-4"
              style={{ color: primaryColor || 'hsl(var(--accent))' }}
            />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">
                {tenantName}
              </h2>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium uppercase tracking-wider">
                School Portal
              </p>
            </div>
          )}
        </div>
        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="lg:hidden ml-auto p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 overflow-y-auto space-y-1 scrollbar-thin">
        {navSections.map((section) => {
          // Sections with subSections (collapsible groups)
          if (section.subSections && section.subSections.length > 0) {
            return (
              <div key={section.label} className="mb-1">
                {!isCollapsed && (
                  <p className="px-3 mb-1.5 mt-3 text-[10px] font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-widest">
                    {section.label}
                  </p>
                )}
                {section.subSections.map((sub) => {
                  const isOpen = openSubMenus[sub.label] ?? false;
                  const hasActive = sub.items.some((i) => isActive(i.href, i.exact));

                  return (
                    <div key={sub.label}>
                      <button
                        onClick={() => !isCollapsed && toggleSubMenu(sub.label)}
                        title={isCollapsed ? sub.label : undefined}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                          hasActive
                            ? 'text-[hsl(var(--accent))]'
                            : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                        )}
                      >
                        <sub.icon
                          className={cn(
                            'w-[18px] h-[18px] flex-shrink-0',
                            hasActive
                              ? 'text-[hsl(var(--accent))]'
                              : 'text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]'
                          )}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{sub.label}</span>
                            <ChevronDown
                              className={cn(
                                'w-3.5 h-3.5 transition-transform duration-200 text-[hsl(var(--text-tertiary))]',
                                isOpen && 'rotate-180'
                              )}
                            />
                          </>
                        )}
                        {isCollapsed && (
                          <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-primary))] whitespace-nowrap shadow-lg z-50">
                            {sub.label}
                          </span>
                        )}
                      </button>
                      {(isOpen || isCollapsed) && (
                        <div
                          className={cn(
                            'space-y-0.5',
                            !isCollapsed && 'pl-4 mt-0.5 border-l border-[hsl(var(--border)/0.6)] ml-4'
                          )}
                        >
                          {sub.items.map((item) => renderNavItem(item))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }

          // Regular sections
          return (
            <div key={section.label} className="mb-1">
              {!isCollapsed && section.items.length > 0 && (
                <p className="px-3 mb-1.5 mt-3 text-[10px] font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-widest">
                  {section.label}
                </p>
              )}
              {isCollapsed && section.items.length > 0 && (
                <div className="my-2 mx-3 border-t border-[hsl(var(--border)/0.4)]" />
              )}
              <div className="space-y-0.5">{section.items.map((item) => renderNavItem(item))}</div>
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle (desktop only) */}
      <div className="border-t border-[hsl(var(--border))] p-2.5 flex-shrink-0 hidden lg:block">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 text-xs"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay Backdrop */}
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
          isCollapsed ? 'w-[68px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[280px] border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] transition-transform duration-300 ease-in-out lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
