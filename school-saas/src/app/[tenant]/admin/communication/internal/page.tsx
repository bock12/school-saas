import { requireTenantUser } from '@/lib/auth/guards';
import { loadMessagingData, loadPresence } from './_components/actions';
import MessagingClient from './_components/messaging-client';
import type { ChatUser } from './_components/actions';

export const metadata = {
  title: 'Internal Messaging',
  description: 'WhatsApp-style secure direct messaging and group chats for all school users.',
};

export default async function InternalMessagingPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { user, profile } = await requireTenantUser(tenant);

  // Load initial channels + available users from Supabase
  const { channels, users, tenantId } = await loadMessagingData(tenant);

  // Load current user's presence/privacy settings
  const presenceMap = await loadPresence([user.id]);
  const myPresence = presenceMap[user.id] || {};

  const currentUser: ChatUser = {
    id: user.id,
    full_name: profile.full_name || user.email?.split('@')[0] || 'Me',
    role: profile.role,
    avatar_url: (profile as any).avatar_url || null,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 p-0">
      {/* Page title — shown above chat on desktop */}
      <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] shrink-0">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              💬 Internal Messaging
            </h1>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
              Secure direct messages and group chats — available to all school users
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            End-to-end encrypted
          </div>
        </div>
      </div>

      {/* Chat interface */}
      <div className="flex-1 min-h-0 px-4 sm:px-6 py-4">
        <MessagingClient
          tenantSlug={tenant}
          tenantId={tenantId || ''}
          currentUserId={user.id}
          currentUser={currentUser}
          currentUserRole={profile.role}
          initialChannels={channels}
          initialUsers={users}
          initialStatusMessage={myPresence.status_message || 'Available 👋'}
          initialLastSeen={myPresence.last_seen_visibility || 'everyone'}
          initialOnline={myPresence.online_visibility || 'everyone'}
        />
      </div>
    </div>
  );
}
