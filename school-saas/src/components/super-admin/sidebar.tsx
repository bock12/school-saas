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

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

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

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 z-50 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] transition-all duration-300 ease-in-out',
          // Desktop behavior
          isCollapsed ? 'lg:w-[68px]' : 'lg:w-[280px]',
          'lg:left-0 lg:translate-x-0',
          // Mobile behavior
          'w-[280px] max-lg:fixed max-lg:top-0 max-lg:bottom-0 max-lg:z-50',
          isMobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'
        )}
      >
        {/* Header Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="animate-fade-in">
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
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Group Items list */}
        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto scrollbar-none">
          {sidebarGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              {(!isCollapsed || isMobileOpen) && (
                <p className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-3">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 group"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]" />
                  {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="hidden lg:block border-t border-[hsl(var(--border))] p-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
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
      </aside>
    </>
  );
}
