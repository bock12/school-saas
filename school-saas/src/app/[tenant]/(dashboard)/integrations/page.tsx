import { Link as LinkIcon, CheckCircle2, AlertTriangle, Clock, Settings, RefreshCw, Plus, Zap, Mail, MessageSquare, CreditCard, Brain, BarChart3, FileText } from 'lucide-react';

const integrations = [
  {
    name: 'Supabase',
    category: 'Database & Auth',
    description: 'Primary database, real-time subscriptions and authentication provider',
    icon: '🛢️',
    status: 'connected',
    lastSync: '2 mins ago',
    color: 'border-emerald-500/20 bg-emerald-500/5',
    statusColor: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    name: 'Google Workspace',
    category: 'Productivity',
    description: 'Gmail, Google Calendar and Google Meet for staff and student communication',
    icon: '🔵',
    status: 'connected',
    lastSync: '1 hr ago',
    color: 'border-blue-500/20 bg-blue-500/5',
    statusColor: 'text-blue-400 bg-blue-500/10',
  },
  {
    name: 'Paystack',
    category: 'Payments',
    description: 'Online fee collection, payment receipts and financial reporting',
    icon: '💳',
    status: 'connected',
    lastSync: '30 mins ago',
    color: 'border-purple-500/20 bg-purple-500/5',
    statusColor: 'text-purple-400 bg-purple-500/10',
  },
  {
    name: 'Twilio SMS',
    category: 'Communication',
    description: 'Bulk SMS notifications for parents and emergency alerts',
    icon: '📱',
    status: 'connected',
    lastSync: '15 mins ago',
    color: 'border-red-500/20 bg-red-500/5',
    statusColor: 'text-red-400 bg-red-500/10',
  },
  {
    name: 'SendGrid',
    category: 'Email',
    description: 'Transactional emails, newsletters and automated parent communications',
    icon: '✉️',
    status: 'error',
    lastSync: 'Failed 2 hrs ago',
    color: 'border-amber-500/20 bg-amber-500/5',
    statusColor: 'text-amber-400 bg-amber-500/10',
  },
  {
    name: 'Google AI (Gemini)',
    category: 'AI Assistant',
    description: 'Intelligent admin assistant, report generation and data insights',
    icon: '🤖',
    status: 'pending',
    lastSync: 'Not configured',
    color: 'border-indigo-500/20 bg-indigo-500/5',
    statusColor: 'text-indigo-400 bg-indigo-500/10',
  },
  {
    name: 'Zoom',
    category: 'Video Conferencing',
    description: 'Virtual parent meetings, staff training and online classes',
    icon: '📹',
    status: 'disconnected',
    lastSync: 'Not connected',
    color: 'border-zinc-500/20 bg-zinc-500/5',
    statusColor: 'text-zinc-400 bg-zinc-500/10',
  },
  {
    name: 'Power BI',
    category: 'Analytics',
    description: 'Advanced analytics dashboards and executive reporting',
    icon: '📊',
    status: 'disconnected',
    lastSync: 'Not connected',
    color: 'border-zinc-500/20 bg-zinc-500/5',
    statusColor: 'text-zinc-400 bg-zinc-500/10',
  },
];

const statusIcon: Record<string, typeof CheckCircle2> = {
  connected: CheckCircle2,
  error: AlertTriangle,
  pending: Clock,
  disconnected: LinkIcon,
};

const statusLabels: Record<string, string> = {
  connected: 'Connected',
  error: 'Error',
  pending: 'Setup Required',
  disconnected: 'Not Connected',
};

export default function IntegrationsPage() {
  const connected = integrations.filter(i => i.status === 'connected').length;
  const errored = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Integrations</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Connected services and third-party platform management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Connected', value: connected, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Issues Found', value: errored, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Not Connected', value: integrations.filter(i => i.status === 'disconnected').length, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map((integration, i) => {
          const Icon = statusIcon[integration.status] || LinkIcon;
          const label = statusLabels[integration.status];
          return (
            <div key={integration.name} className={`rounded-xl border p-5 animate-fade-in ${integration.color}`} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--bg-secondary))] flex items-center justify-center text-xl">
                    {integration.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(var(--text-primary))] text-sm">{integration.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{integration.category}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${integration.statusColor}`}>
                  <Icon className="w-2.5 h-2.5" />{label}
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mb-4 leading-relaxed">{integration.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                  <RefreshCw className="w-2.5 h-2.5 inline mr-1" />{integration.lastSync}
                </p>
                <button className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline">
                  <Settings className="w-3 h-3" />
                  {integration.status === 'disconnected' || integration.status === 'pending' ? 'Configure' : 'Manage'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
