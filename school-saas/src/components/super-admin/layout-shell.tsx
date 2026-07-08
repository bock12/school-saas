'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function SuperAdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      
      {/* Content wrapper */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0 ${
          isCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[280px]'
        }`}
      >
        <Topbar onMenuToggle={() => setIsMobileOpen(true)} />
        <main className="p-4 sm:p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
