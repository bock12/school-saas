'use client';

import { Bell, ChevronDown, LogOut, User, Search, Loader2, Menu, Settings } from 'lucide-react';
import { useState, useTransition } from 'react';
import { signOut } from '@/app/[tenant]/login/actions';
import { useSidebar } from './sidebar-provider';
import Link from 'next/link';

interface TenantTopbarProps {
  tenantSlug: string;
  tenantName: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

const roleLabels: Record<string, string> = {
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
  finance_officer: 'Finance Officer',
  librarian: 'Librarian',
  nurse: 'Nurse',
  department_head: 'Department Head',
  vice_principal: 'Vice Principal',
};

const demoNotifications = [
  { id: '1', title: '5 admissions pending review', time: '10 min ago', type: 'warning' },
  { id: '2', title: 'Mid-term exam results uploaded', time: '1 hr ago', type: 'info' },
  { id: '3', title: 'Fee payment from James Okafor', time: '2 hrs ago', type: 'success' },
  { id: '4', title: 'Leave request from Mr. Ahmed', time: '3 hrs ago', type: 'info' },
];

export function TenantTopbar({
  tenantSlug,
  tenantName,
  userName = 'School Admin',
  userRole = 'school_admin',
  userAvatar,
}: TenantTopbarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const { toggleMobile } = useSidebar();

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function handleSignOut() {
    startSignOut(async () => {
      await signOut(tenantSlug);
    });
  }

  const notifTypeStyles: Record<string, string> = {
    warning: 'bg-amber-500/20 text-amber-400',
    info: 'bg-blue-500/20 text-blue-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    danger: 'bg-red-500/20 text-red-400',
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.85)] backdrop-blur-xl">
      <div className="flex items-center h-full px-4 gap-3">
        {/* Hamburger — visible on mobile/tablet */}
        <button
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] transition-colors flex-shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder={`Search in ${tenantName}...`}
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Quick Settings */}
          <Link
            href={`/${tenantSlug}/settings`}
            className="hidden md:flex p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]"
            title="Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 text-[hsl(var(--text-tertiary))]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--accent))] ring-2 ring-[hsl(var(--bg-primary))]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg animate-fade-in-scale overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Notifications</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--accent))] text-white font-bold">
                    {demoNotifications.length}
                  </span>
                </div>
                <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {demoNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors cursor-pointer"
                    >
                      <div
                        className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          n.type === 'warning'
                            ? 'bg-amber-400'
                            : n.type === 'success'
                            ? 'bg-emerald-400'
                            : 'bg-blue-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[hsl(var(--text-primary))] leading-relaxed">{n.title}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-[hsl(var(--border))]">
                  <button className="text-xs text-[hsl(var(--accent))] hover:underline w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--info)/0.3)] flex items-center justify-center flex-shrink-0">
                {userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-[hsl(var(--accent))]">{initials}</span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight max-w-[120px] truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                  {roleLabels[userRole] || userRole}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] hidden md:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 w-52 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg animate-fade-in-scale overflow-hidden z-50 p-1">
                <div className="px-3 py-2.5 mb-1">
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{userName}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">
                    {roleLabels[userRole] || userRole}
                  </p>
                </div>
                <div className="border-t border-[hsl(var(--border))] mx-1" />
                <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all mt-0.5">
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <Link
                  href={`/${tenantSlug}/settings`}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <div className="my-0.5 mx-1 border-t border-[hsl(var(--border))]" />
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] transition-all disabled:opacity-50"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {isSigningOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
