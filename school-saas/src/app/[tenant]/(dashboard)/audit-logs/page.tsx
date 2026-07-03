import { Clock, User, Shield, AlertTriangle, Search, Filter, CheckCircle2, Edit2, Trash2, Eye, LogIn, LogOut, Settings, UserPlus, DollarSign, Bell } from 'lucide-react';

const auditLogs = [
  { id: '1', action: 'Student Admitted', actor: 'Mrs. Patricia Osei', actorRole: 'Admin', target: 'Amara Johnson (Grade 9)', module: 'Admissions', ip: '192.168.1.10', timestamp: 'Jul 2, 2026 at 3:42 PM', type: 'create', status: 'success' },
  { id: '2', action: 'Fee Payment Recorded', actor: 'Mr. Benjamin Asante', actorRole: 'Finance', target: 'David Okafor — $2,400', module: 'Finance', ip: '192.168.1.15', timestamp: 'Jul 2, 2026 at 2:18 PM', type: 'create', status: 'success' },
  { id: '3', action: 'User Login', actor: 'Dr. Raj Sharma', actorRole: 'Parent', target: 'Portal Login', module: 'Auth', ip: '203.0.113.45', timestamp: 'Jul 2, 2026 at 11:32 AM', type: 'auth', status: 'success' },
  { id: '4', action: 'Grade Modified', actor: 'Mr. Asante', actorRole: 'Teacher', target: 'Michael Chen — Math Q2: 68→74', module: 'Academics', ip: '192.168.1.22', timestamp: 'Jul 1, 2026 at 5:10 PM', type: 'update', status: 'success' },
  { id: '5', action: 'Failed Login Attempt', actor: 'Unknown', actorRole: '—', target: 'admin@school.edu', module: 'Auth', ip: '45.33.32.156', timestamp: 'Jul 1, 2026 at 2:00 PM', type: 'auth', status: 'failed' },
  { id: '6', action: 'Announcement Sent', actor: 'Mrs. Patricia Osei', actorRole: 'Admin', target: 'All Parents (312 recipients)', module: 'Communication', ip: '192.168.1.10', timestamp: 'Jun 28, 2026 at 10:15 AM', type: 'create', status: 'success' },
  { id: '7', action: 'School Settings Updated', actor: 'Mrs. Patricia Osei', actorRole: 'Admin', target: 'Term Dates Configuration', module: 'Settings', ip: '192.168.1.10', timestamp: 'Jun 25, 2026 at 4:30 PM', type: 'update', status: 'success' },
  { id: '8', action: 'Staff Record Deleted', actor: 'Mrs. Patricia Osei', actorRole: 'Admin', target: 'Mr. Old Staff (EMP-099)', module: 'Staff', ip: '192.168.1.10', timestamp: 'Jun 20, 2026 at 9:00 AM', type: 'delete', status: 'success' },
];

const typeConfig: Record<string, { icon: typeof User; color: string; bg: string }> = {
  create: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  update: { icon: Edit2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  delete: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' },
  auth: { icon: LogIn, color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

export default function AuditLogsPage() {
  const failedCount = auditLogs.filter(l => l.status === 'failed').length;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Audit Logs</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Complete activity trail for all user actions and system events</p>
        </div>
        {failedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">{failedCount} suspicious event{failedCount > 1 ? 's' : ''} detected</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: auditLogs.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Successful', value: auditLogs.filter(l => l.status === 'success').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Failed / Suspicious', value: failedCount, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Unique Users', value: new Set(auditLogs.map(l => l.actor)).size, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input type="text" placeholder="Search logs by action, actor or target..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
          </div>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>All Modules</option>
            <option>Auth</option>
            <option>Admissions</option>
            <option>Finance</option>
            <option>Academics</option>
            <option>Communication</option>
            <option>Settings</option>
          </select>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>All Actions</option>
            <option>Create</option>
            <option>Update</option>
            <option>Delete</option>
            <option>Auth</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Action', 'Actor', 'Target', 'Module', 'IP Address', 'Timestamp', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => {
                const typeCfg = typeConfig[log.type] || typeConfig.create;
                const Icon = typeCfg.icon;
                return (
                  <tr key={log.id} className={`border-b border-[hsl(var(--border)/0.5)] transition-colors ${log.status === 'failed' ? 'bg-red-500/5 hover:bg-red-500/10' : 'table-row-hover'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${typeCfg.bg}`}>
                          <Icon className={`w-3 h-3 ${typeCfg.color}`} />
                        </div>
                        <span className="text-sm font-medium text-[hsl(var(--text-primary))] whitespace-nowrap">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-[hsl(var(--text-primary))] whitespace-nowrap">{log.actor}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{log.actorRole}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-[hsl(var(--text-secondary))] max-w-[180px] truncate">{log.target}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">{log.module}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-mono text-[hsl(var(--text-tertiary))]">{log.ip}</code>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {log.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
