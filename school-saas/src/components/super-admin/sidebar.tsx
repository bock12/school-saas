'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, School, CreditCard, ChevronLeft, ChevronRight, Shield,
  Megaphone, Cpu, Users, Brain, Layers, X, ChevronDown, Building2,
  FolderTree, MapPin, GraduationCap, Tent, UserPlus, Globe, HardDrive,
  Blocks, Copy, Palette, Settings, HelpCircle, FileText, BarChart3, Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useSidebar } from './sidebar-provider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  subSections?: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    items: NavItem[];
  }[];
}

const sidebarGroups: NavSection[] = [
  {
    title: 'Executive Intelligence',
    items: [
      { label: 'Executive Dashboard', href: '/super-admin?console=executive', icon: LayoutDashboard },
      { label: 'AI Platform Insights', href: '/super-admin?console=ai', icon: Brain },
    ],
  },
  {
    title: 'Tenant Lifecycle',
    items: [],
    subSections: [
      {
        label: 'Tenant Management',
        icon: Database,
        items: [
          { label: 'Dashboard', href: '/super-admin/tenants/dashboard', icon: LayoutDashboard },
          { label: 'Tenant Directory', href: '/super-admin/tenants/directory', icon: School },
          { label: 'Organizations', href: '/super-admin/tenants/hierarchy?view=organizations', icon: Building2 },
          { label: 'Groups', href: '/super-admin/tenants/hierarchy?view=groups', icon: FolderTree },
          { label: 'Districts', href: '/super-admin/tenants/hierarchy?view=districts', icon: MapPin },
          { label: 'Schools', href: '/super-admin/tenants/hierarchy?view=schools', icon: GraduationCap },
          { label: 'Campuses', href: '/super-admin/tenants/hierarchy?view=campuses', icon: Tent },
          { label: 'Provisioning', href: '/super-admin/tenants/provisioning', icon: UserPlus },
          { label: 'Subscriptions', href: '/super-admin/tenants/subscriptions', icon: CreditCard },
          { label: 'Domains', href: '/super-admin/tenants/domains', icon: Globe },
          { label: 'Storage', href: '/super-admin/tenants/storage', icon: HardDrive },
          { label: 'Feature Modules', href: '/super-admin/tenants/modules', icon: Blocks },
          { label: 'Templates', href: '/super-admin/tenants/templates', icon: Copy },
          { label: 'Branding', href: '/super-admin/tenants/branding', icon: Palette },
          { label: 'Tenant Settings', href: '/super-admin/tenants/settings', icon: Settings },
          { label: 'Support Tools', href: '/super-admin/tenants/support', icon: HelpCircle },
          { label: 'Audit History', href: '/super-admin/tenants/audit-logs', icon: FileText },
          { label: 'Reports', href: '/super-admin/tenants/reports', icon: BarChart3 },
        ],
      }
    ]
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
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    'Tenant Management': true,
  });

  const isActive = (href: string, exact = false) => {
    // Check if it's a query param route
    if (href.includes('?')) {
      return false; // we can't easily match query params dynamically here without searchParams
    }
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
  };

  const toggleSubMenu = (key: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href, item.exact);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={closeMobile}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group relative',
          active
            ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]'
            : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
        )}
      >
        <item.icon className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors',
          active ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]'
        )} />
        {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}

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
      <nav className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto scrollbar-thin">
        {sidebarGroups.map((section, idx) => (
          <div key={idx} className="mb-1">
            {!isCollapsed && (
              <p className="px-3 mb-1.5 mt-3 text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-widest">
                {section.title}
              </p>
            )}
            {isCollapsed && <div className="my-2 mx-3 border-t border-[hsl(var(--border)/0.4)]" />}

            {/* Render Subsections */}
            {section.subSections?.map((sub) => {
              const isOpen = openSubMenus[sub.label] ?? false;
              const hasActive = sub.items.some((i) => isActive(i.href, i.exact));

              return (
                <div key={sub.label}>
                  <button
                    onClick={() => !isCollapsed && toggleSubMenu(sub.label)}
                    title={isCollapsed ? sub.label : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group relative',
                      hasActive
                        ? 'text-[hsl(var(--accent))]'
                        : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                    )}
                  >
                    <sub.icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      hasActive ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]'
                    )} />
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
                    <div className={cn(
                      'space-y-0.5',
                      !isCollapsed && 'pl-4 mt-0.5 border-l border-[hsl(var(--border)/0.6)] ml-4'
                    )}>
                      {sub.items.map((item) => renderNavItem(item))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render direct items */}
            <div className="space-y-0.5">
              {section.items.map((item) => renderNavItem(item))}
            </div>
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
