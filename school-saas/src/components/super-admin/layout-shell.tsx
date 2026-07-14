'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useSidebar } from './sidebar-provider';
import { cn } from '@/lib/utils';

export function SuperAdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen } = useSidebar();

  return (
    // overflow-hidden prevents body from scrolling while the mobile drawer is open
    <div className={cn('min-h-screen bg-[hsl(var(--bg-primary))] flex', isMobileOpen && 'overflow-hidden')}>
      <Sidebar />

      {/* Main content area — shifts right on desktop to clear the sidebar */}
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out',
          // Mobile/tablet: no margin (sidebar is a drawer overlay)
          'ml-0',
          // Desktop (lg+): match sidebar width
          isCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[280px]'
        )}
      >
        <Topbar />
        {/* 
          overflow-auto: lets pages that need full viewport height (hierarchy two-panel, etc.)
          work without the outer shell clipping them. Padding is owned by each page.
        */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
