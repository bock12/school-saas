'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Calendar, FileText, Bell, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-provider';

export function StudentSidebar({ tenantSlug, tenantName, primaryColor }: { tenantSlug: string, tenantName: string, primaryColor?: string }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const basePath = `/student`;

  const navItems = [
    { label: 'Dashboard', href: basePath, icon: LayoutDashboard, exact: true },
    { label: 'My Courses', href: `${basePath}/courses`, icon: BookOpen },
    { label: 'Schedule', href: `${basePath}/schedule`, icon: Calendar },
    { label: 'Grades', href: `${basePath}/grades`, icon: FileText },
    { label: 'Messages', href: `${basePath}/messages`, icon: MessageSquare },
    { label: 'Notices', href: `${basePath}/notices`, icon: Bell },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border))] transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="h-16 flex items-center px-4 border-b border-[hsl(var(--border))]">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center font-bold text-[hsl(var(--accent))] flex-shrink-0">
          S
        </div>
        {!isCollapsed && <span className="ml-3 font-semibold text-sm truncate">{tenantName}</span>}
      </div>
      <div className="p-3 space-y-1 mt-4">
        {navItems.map(item => {
          const isActive = item.exact ? pathname.endsWith(item.href) : pathname.includes(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.label} href={`/${tenantSlug}${item.href}`} className={cn(
              "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
              isActive ? "bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]" : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]"
            )}>
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]")} />
              {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
