'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useSidebar } from './sidebar-provider';
import { cn } from '@/lib/utils';

export function SuperAdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          // Mobile: no margin (sidebar is a drawer overlay)
          'ml-0',
          // Desktop: match sidebar width
          isCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[280px]'
        )}
      >
        <Topbar />
        <main className="p-4 sm:p-6 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
