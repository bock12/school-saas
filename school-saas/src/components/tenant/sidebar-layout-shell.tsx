'use client';

import { useSidebar } from './sidebar-provider';
import { cn } from '@/lib/utils';

/**
 * Client component that wraps the main content area.
 * It reads the sidebar collapsed state and applies the correct left-margin offset
 * so the content doesn't overlap with the sidebar.
 */
export function SidebarLayoutShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        // Mobile: no margin (sidebar is a drawer overlay)
        'ml-0',
        // Desktop: match sidebar width
        isCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'
      )}
    >
      {children}
    </div>
  );
}
