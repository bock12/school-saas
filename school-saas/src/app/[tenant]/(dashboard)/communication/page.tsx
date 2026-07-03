import { MessageSquare, Mail, Bell, Send, Users, Megaphone, AlertTriangle, Plus, Phone, Search } from 'lucide-react';

const channels = [
  { label: 'SMS', icon: Phone, count: 8, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Email', icon: Mail, count: 24, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { label: 'Push Notifications', icon: Bell, count: 12, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { label: 'Internal Messages', icon: MessageSquare, count: 36, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

const recentMessages = [
  { id: '1', from: 'Mrs. Rachel Johnson', subject: 'Regarding Amara\'s absence last week', channel: 'email', date: 'Jul 2', read: false },
  { id: '2', from: 'System', subject: 'Attendance report for June 2026 is ready', channel: 'internal', date: 'Jul 2', read: true },
  { id: '3', from: 'Mr. Emeka Okafor', subject: 'Request for fee installment plan', channel: 'email', date: 'Jul 1', read: false },
  { id: '4', from: 'Dr. Raj Sharma', subject: 'Medical exemption for Priya — PE class', channel: 'email', date: 'Jun 30', read: true },
  { id: '5', from: 'Board of Directors', subject: 'Q2 Academic Report Review', channel: 'internal', date: 'Jun 29', read: true },
];

const announcements = [
  { id: '1', title: 'Sports Day — Jul 17, 2026', audience: 'All Students & Parents', sent: 'Jun 28, 2026', channel: 'SMS + Email', reach: 623 },
  { id: '2', title: 'Mid-Term Exam Schedule Published', audience: 'Grade 9–12 Students', sent: 'Jun 25, 2026', channel: 'Push + Email', reach: 412 },
  { id: '3', title: 'Fee Payment Reminder — Term 2', audience: 'All Parents', sent: 'Jun 20, 2026', channel: 'SMS + Email', reach: 312 },
];

export default function CommunicationPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Communication Center</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">SMS, email, push notifications and announcements</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Emergency Alert
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Megaphone className="w-4 h-4" />
            Broadcast
          </button>
        </div>
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {channels.map(ch => {
          const Icon = ch.icon;
          return (
            <div key={ch.label} className={`rounded-xl border p-4 flex items-center gap-3 ${ch.bg}`}>
              <Icon className={`w-6 h-6 flex-shrink-0 ${ch.color}`} />
              <div>
                <p className={`text-xl font-bold ${ch.color}`}>{ch.count}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{ch.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compose + Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Compose */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-4">Quick Message</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">To</label>
              <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                <option>All Students</option>
                <option>All Parents</option>
                <option>All Staff</option>
                <option>Grade 10 Students</option>
                <option>Custom Group</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Channel</label>
              <div className="flex gap-2">
                {['SMS', 'Email', 'Push'].map(c => (
                  <button key={c} className="flex-1 py-2 rounded-lg text-xs font-medium text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-all">{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Subject</label>
              <input type="text" placeholder="Message subject..." className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Message</label>
              <textarea rows={4} placeholder="Type your message here..." className="w-full px-3 py-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors resize-none" />
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </div>

        {/* Inbox */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Inbox</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              <input type="text" placeholder="Search..." className="h-8 pl-8 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors w-36" />
            </div>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {recentMessages.map(msg => (
              <div key={msg.id} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors cursor-pointer ${!msg.read ? 'bg-[hsl(var(--accent)/0.03)]' : ''}`}>
                {!msg.read && <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] mt-2 flex-shrink-0" />}
                {msg.read && <div className="w-2 h-2 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${!msg.read ? 'font-semibold text-[hsl(var(--text-primary))]' : 'font-medium text-[hsl(var(--text-secondary))]'} truncate`}>{msg.from}</p>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] flex-shrink-0">{msg.date}</span>
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${!msg.read ? 'text-[hsl(var(--text-secondary))]' : 'text-[hsl(var(--text-tertiary))]'}`}>{msg.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Recent Broadcasts</h2>
          <button className="flex items-center gap-1.5 text-xs text-[hsl(var(--accent))] hover:underline">
            <Plus className="w-3.5 h-3.5" />New Broadcast
          </button>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {announcements.map(ann => (
            <div key={ann.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-4 h-4 text-[hsl(var(--accent))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{ann.title}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{ann.audience} · {ann.channel}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{ann.reach}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Recipients</p>
                </div>
                <span className="text-xs text-[hsl(var(--text-tertiary))]">{ann.sent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
