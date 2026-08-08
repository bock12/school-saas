'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Bell, CheckCircle, Clock, AlertTriangle, Info, Award, Calendar } from 'lucide-react';

type NotifType = 'info' | 'alert' | 'success' | 'reminder' | 'achievement';

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  info:        { icon: Info,        color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  alert:       { icon: AlertTriangle, color: 'text-red-400',   bg: 'bg-red-500/15' },
  success:     { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  reminder:    { icon: Clock,       color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  achievement: { icon: Award,       color: 'text-purple-400',  bg: 'bg-purple-500/15' },
};

const notifications = [
  { id: '1', type: 'alert' as NotifType, title: 'Attendance Pending', message: 'You have not taken attendance for SS3A Period 3 today.', time: '35 min ago', read: false },
  { id: '2', type: 'reminder' as NotifType, title: 'Assignment Due Tomorrow', message: 'Mid-Term Quiz for SS2B is due tomorrow at 8:00 AM.', time: '1 hr ago', read: false },
  { id: '3', type: 'info' as NotifType, title: 'Staff Meeting Rescheduled', message: 'The Thursday staff meeting has been moved to Friday 2pm.', time: '3 hrs ago', read: false },
  { id: '4', type: 'success' as NotifType, title: 'Leave Request Approved', message: 'Your annual leave application for Aug 20–24 has been approved by the Principal.', time: '1 day ago', read: true },
  { id: '5', type: 'achievement' as NotifType, title: 'Class Performance Milestone', message: 'SS2A achieved 91% attendance this month — the highest across all classes!', time: '2 days ago', read: true },
  { id: '6', type: 'info' as NotifType, title: 'New Parent Message', message: 'Dr. Nwosu Charles sent you a message regarding Chukwuemeka.', time: '2 days ago', read: true },
  { id: '7', type: 'reminder' as NotifType, title: 'Term-End Reports Due', message: 'Term 2 end-of-term reports must be submitted by August 30.', time: '3 days ago', read: true },
  { id: '8', type: 'info' as NotifType, title: 'New Lesson Plan Policy', message: 'The HOD has shared the updated lesson plan template for this term.', time: '4 days ago', read: true },
];

export function NotificationsTab({ teacher }: { teacher: TeacherData }) {
  const [filter, setFilter] = useState<'all' | 'unread' | NotifType>('all');
  const [items, setItems] = useState(notifications);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  function markRead(id: string) {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  const filtered = items.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Notifications</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            {unreadCount > 0 ? <span className="text-[hsl(var(--accent))] font-bold">{unreadCount} unread</span> : 'All caught up'}
            {' '}· {items.length} total
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors font-semibold">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'unread', ...Object.keys(typeConfig)] as const).map((f) => {
          const cfg = f !== 'all' && f !== 'unread' ? typeConfig[f as NotifType] : null;
          const Icon = cfg?.icon || Bell;
          return (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === f
                  ? f === 'all' || f === 'unread' ? 'bg-[hsl(var(--accent))] text-white' : `${cfg?.bg} ${cfg?.color}`
                  : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'
              }`}
            >
              <Icon className="w-3 h-3" />
              {f === 'unread' ? `Unread (${unreadCount})` : f}
            </button>
          );
        })}
      </div>

      {/* Notification Feed */}
      <div className="space-y-2">
        {filtered.map((notif) => {
          const cfg = typeConfig[notif.type];
          const Icon = cfg.icon;
          return (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`glass-card rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${!notif.read ? 'ring-1 ring-[hsl(var(--accent)/0.2)]' : 'opacity-75'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-black ${notif.read ? 'text-[hsl(var(--text-secondary))]' : 'text-[hsl(var(--text-primary))]'}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] whitespace-nowrap">{notif.time}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'hsl(var(--accent))' }} />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto mb-2" />
            <p className="text-sm text-[hsl(var(--text-tertiary))]">No notifications to show</p>
          </div>
        )}
      </div>
    </div>
  );
}
