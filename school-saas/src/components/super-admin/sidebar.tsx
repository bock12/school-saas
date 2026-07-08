'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  School,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Shield,
  Megaphone,
  Cpu,
  Users,
  Brain,
  Layers,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useSidebar } from './sidebar-provider';

const sidebarGroups = [
  {
    title: 'Executive Intelligence',
    items: [
      { label: 'Executive Dashboard', href: '/super-admin?console=executive', icon: LayoutDashboard },
      { label: 'AI Platform Insights', href: '/super-admin?console=ai', icon: Brain },
    ],
  },
  {
    title: 'Business Operations',
    items: [
      { label: 'Tenant Management', href: '/super-admin?console=business_tenants', icon: School },
      { label: 'Subscriptions & Billing', href: '/super-admin?console=business_billing', icon: CreditCard },
    ],
  },
  {
    title: 'Platform Operations',
    items: [
      { label: 'System Health & Monitor', href: '/super-admin?console=platform_health', icon: Cpu },
      { label: 'Security & SSO Config', href: '/super-admin?console=platform_security', icon: Shield },
    ],
  },
  {
    title: 'Customer Administration',
    items: [
      { label: 'Global Users & Roles', href: '/super-admin?console=customer_users', icon: Users },
      { label: 'Support & Announcements', href: '/super-admin?console=customer_support', icon: Megaphone },
      { label: 'Global Feature Flags', href: '/super-admin?console=customer_features', icon: Layers },
    ],
  },
];

export function Sidebar() {
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(var(--border))] flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0 flex-1">
              <h1 className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">
                {APP_NAME}
              </h1>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium uppercase tracking-wider">
                Super Control Center
              </p>
            </div>
          )}
        </div>

        {/* Close button for Mobile drawer view */}
        <button
          onClick={closeMobile}
          className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Group Items list */}
      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto scrollbar-none">
        {sidebarGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            {!isCollapsed && (
              <p className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-3">
                {group.title}
              </p>
            )}
            {isCollapsed && <div className="my-2 mx-3 border-t border-[hsl(var(--border)/0.4)]" />}
            {group.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobile}
                title={isCollapsed ? item.label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 group relative"
              >
                <item.icon className="w-4 h-4 flex-shrink-0 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]" />
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                
                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-primary))] whitespace-nowrap shadow-lg z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="hidden lg:block border-t border-[hsl(var(--border))] p-3 flex-shrink-0">
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
          isCollapsed ? 'w-[68px]' : 'w-[280px]'
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
