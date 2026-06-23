'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  School,
  CreditCard,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useState } from 'react';

const navItems = [
  {
    label: 'Overview',
    href: '/super-admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Schools',
    href: '/super-admin/tenants',
    icon: School,
  },
  {
    label: 'Plans & Billing',
    href: '/super-admin/plans',
    icon: CreditCard,
  },
  {
    label: 'System Health',
    href: '/super-admin/system',
    icon: Activity,
  },
  {
    label: 'Settings',
    href: '/super-admin/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">
                {APP_NAME}
              </h1>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium uppercase tracking-wider">
                Super Admin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/super-admin'
              ? pathname === '/super-admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-[hsl(var(--accent))]'
                    : 'text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]'
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Broadcast Quick Action */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <Link
            href="/super-admin/system"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent)/0.1)] to-transparent border border-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] text-xs font-medium hover:from-[hsl(var(--accent)/0.15)] transition-all duration-200"
          >
            <Megaphone className="w-4 h-4" />
            <span>Send Broadcast</span>
          </Link>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="border-t border-[hsl(var(--border))] p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 text-xs"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
