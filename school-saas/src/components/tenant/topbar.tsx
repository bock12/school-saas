'use client';

import { Bell, ChevronDown, LogOut, User, Search } from 'lucide-react';
import { useState } from 'react';

interface TenantTopbarProps {
  tenantName: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export function TenantTopbar({ tenantName, userName = 'School Admin', userRole = 'school_admin', userAvatar }: TenantTopbarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleLabels: Record<string, string> = {
    school_admin: 'School Admin',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.8)] backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="relative w-80 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder={`Search in ${tenantName}...`}
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              <Bell className="w-4.5 h-4.5 text-[hsl(var(--text-tertiary))]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-11 w-72 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg animate-fade-in-scale overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Notifications</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--info)/0.3)] flex items-center justify-center">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-[hsl(var(--accent))]">
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight">{userName}</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{roleLabels[userRole] || userRole}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] hidden md:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 w-52 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg animate-fade-in-scale overflow-hidden z-50 p-1">
                <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <div className="my-1 border-t border-[hsl(var(--border))]" />
                <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] transition-all">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
