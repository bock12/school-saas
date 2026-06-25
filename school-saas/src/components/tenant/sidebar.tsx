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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TenantSidebarProps {
  tenantSlug: string;
  tenantName: string;
  primaryColor?: string;
}

export function TenantSidebar({ tenantSlug, tenantName, primaryColor }: TenantSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Build the base path for this tenant
  const basePath = `/${tenantSlug}`;

  const navSections = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', href: basePath, icon: LayoutDashboard, exact: true },
        { label: 'Students', href: `${basePath}/students`, icon: Users },
        { label: 'Teachers', href: `${basePath}/teachers`, icon: GraduationCap },
      ],
    },
    {
      label: 'Academics',
      items: [
        { label: 'Classes', href: `${basePath}/classes`, icon: Layers },
        { label: 'Subjects', href: `${basePath}/subjects`, icon: BookOpen },
        { label: 'Attendance', href: `${basePath}/attendance`, icon: CalendarCheck },
        { label: 'Grades', href: `${basePath}/grades`, icon: BarChart3 },
      ],
    },
    {
      label: 'Finance',
      items: [
        { label: 'Fees', href: `${basePath}/fees`, icon: Wallet },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'Settings', href: `${basePath}/settings`, icon: Settings },
      ],
    },
  ];

  const accentStyle = primaryColor ? { '--tenant-accent': primaryColor } as React.CSSProperties : {};

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
      style={accentStyle}
    >
      {/* School Logo / Name */}
      <div className="flex items-center h-16 px-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: primaryColor ? `${primaryColor}20` : 'hsl(var(--accent) / 0.15)' }}
          >
            <School className="w-4 h-4" style={{ color: primaryColor || 'hsl(var(--accent))' }} />
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <h1 className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">
                {tenantName}
              </h1>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium uppercase tracking-wider truncate">
                School Portal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-widest">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
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
            </div>
          </div>
        ))}
      </nav>

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
