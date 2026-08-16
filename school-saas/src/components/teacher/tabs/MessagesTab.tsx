'use client';

import { useState, useEffect } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import MessagingClient from '@/app/[tenant]/admin/communication/internal/_components/messaging-client';
import { loadMessagingData, loadPresence } from '@/app/[tenant]/admin/communication/internal/_components/actions';
import type { ChatChannel, ChatUser } from '@/app/[tenant]/admin/communication/internal/_components/actions';
import { MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';

export function MessagesTab({ teacher }: { teacher: TeacherData }) {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [tenantId, setTenantId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('Available 👋');
  const [lastSeen, setLastSeen] = useState<'everyone' | 'contacts' | 'nobody'>('everyone');
  const [online, setOnline] = useState<'everyone' | 'same_as_last_seen' | 'nobody'>('everyone');

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setLoading(true);
        const [data, presenceMap] = await Promise.all([
          loadMessagingData(teacher.tenantSlug),
          loadPresence([teacher.id]),
        ]);

        if (isMounted) {
          setChannels(data.channels || []);
          setUsers(data.users || []);
          setTenantId(data.tenantId || '');
          const myPres = presenceMap[teacher.id] || {};
          if (myPres.status_message) setStatusMessage(myPres.status_message);
          if (myPres.last_seen_visibility) setLastSeen(myPres.last_seen_visibility);
          if (myPres.online_visibility) setOnline(myPres.online_visibility);
        }
      } catch (err) {
        console.warn('[Teacher MessagesTab init failed]', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [teacher.tenantSlug, teacher.id]);

  const currentUser: ChatUser = {
    id: teacher.id,
    full_name: teacher.name,
    role: teacher.role,
    avatar_url: null,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] glass-card rounded-2xl p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold text-[hsl(var(--text-primary))]">Connecting to Staff Messaging Network...</p>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Loading channels, class chats &amp; peer contacts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[hsl(var(--border))] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/15 text-violet-400 flex items-center justify-center font-black">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
              Staff &amp; Class Messages Desk
            </h1>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
              Real-time direct messaging, class groups, department channels, and colleague calling
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted School Network</span>
        </div>
      </div>

      {/* Embedded Full-Featured Messaging Client */}
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-[hsl(var(--border))]">
        <MessagingClient
          tenantSlug={teacher.tenantSlug}
          tenantId={tenantId}
          currentUserId={teacher.id}
          currentUser={currentUser}
          currentUserRole={teacher.role}
          initialChannels={channels}
          initialUsers={users}
          initialStatusMessage={statusMessage}
          initialLastSeen={lastSeen}
          initialOnline={online}
        />
      </div>
    </div>
  );
}
