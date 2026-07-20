'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  School,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  UserCog,
  ShieldCheck,
  Plug,
  HelpCircle,
  X,
  Building2,
  UserPlus,
  CreditCard,
  Globe,
  Bell,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useSidebar } from './sidebar-provider';

interface OrgSidebarProps {
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
}

export function OrgSidebar({ tenantSlug, tenantName, primaryColor }: OrgSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const basePath = '/admin';

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const navSections: NavSection[] = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', href: basePath || '/', icon: LayoutDashboard, exact: true },
        { label: 'Analytics', href: `${basePath}/analytics`, icon: BarChart3 },
      ],
    },
    {
      label: 'Organization',
      items: [
        { label: 'Schools Directory', href: `${basePath}/schools`, icon: School },
        { label: 'Org Staff', href: `${basePath}/org-staff`, icon: Users },
        { label: 'Reports', href: `${basePath}/reports`, icon: TrendingUp },
        { label: 'Announcements', href: `${basePath}/communication`, icon: Bell },
        { label: 'Approvals', href: `${basePath}/approvals`, icon: ClipboardList, badge: '3' },
      ],
    },
    {
      label: 'Administration',
      items: [
        { label: 'Users & Roles', href: `${basePath}/users-roles`, icon: UserCog },
        { label: 'Audit Logs', href: `${basePath}/audit-logs`, icon: ShieldCheck },
        { label: 'Integrations', href: `${basePath}/integrations`, icon: Plug },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Billing & Plans', href: `${basePath}/billing`, icon: CreditCard },
        { label: 'Domain & Branding', href: `${basePath}/branding`, icon: Globe },
        { label: 'Settings', href: `${basePath}/settings`, icon: Settings },
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
      {/* Org Logo / Name */}
      <div className="flex items-center h-16 px-4 border-b border-[hsl(var(--border))] flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden w-full">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: primaryColor ? `${primaryColor}25` : 'hsl(var(--accent) / 0.15)',
            }}
          >
            <Building2
              className="w-4 h-4"
              style={{ color: primaryColor || 'hsl(var(--accent))' }}
            />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">
                {tenantName}
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: primaryColor || 'hsl(var(--accent))' }}>
                Organization Portal
              </p>
            </div>
          )}
        </div>
        <button
          onClick={closeMobile}
          className="lg:hidden ml-auto p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 overflow-y-auto space-y-1 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            {!isCollapsed && section.items.length > 0 && (
              <p className="px-3 mb-1.5 mt-3 text-[10px] font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-widest">
                {section.label}
              </p>
            )}
            {isCollapsed && section.items.length > 0 && (
              <div className="my-2 mx-3 border-t border-[hsl(var(--border)/0.4)]" />
            )}
            <div className="space-y-0.5">{section.items.map(renderNavItem)}</div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
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
