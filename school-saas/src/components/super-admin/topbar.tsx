'use client';

import { Bell, Search, LogOut, User, ChevronDown, Loader2, Menu } from 'lucide-react';
import { useState, useTransition } from 'react';
import { APP_NAME } from '@/lib/constants';
import { signOut } from '@/app/[tenant]/login/actions';
import { useSidebar } from './sidebar-provider';

export function Topbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const { toggleMobile } = useSidebar();

  const handleSignOut = () => {
    startSignOut(async () => {
      await signOut();
    });
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.85)] backdrop-blur-xl">
      <div className="flex items-center h-full px-4 gap-3">
        
        {/* Left: Mobile menu toggle and search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] flex-shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                placeholder="Search schools, plans, logs..."
                className="w-[320px] h-9 pl-9 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] focus:ring-1 focus:ring-[hsl(var(--accent))] transition-all duration-200"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--danger))] ring-2 ring-[hsl(var(--bg-primary))]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-sm rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg animate-fade-in-scale overflow-hidden">
                <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
                  <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                    Notifications
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-xs text-[hsl(var(--text-tertiary))] text-center py-4">
                    No new notifications
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center text-white text-xs font-bold">
                SA
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight">
                  Super Admin
                </p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                  {APP_NAME}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-[hsl(var(--text-tertiary))] hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 w-56 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg animate-fade-in-scale overflow-hidden">
                <div className="p-1">
                  <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <div className="my-1 border-t border-[hsl(var(--border))]" />
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] transition-all duration-200 disabled:opacity-50"
                  >
                    {isSigningOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {isSigningOut ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
