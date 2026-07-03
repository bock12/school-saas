import { UsersRound, Plus, Shield, Key, Search, Settings, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

const roles = [
  { name: 'School Admin', users: 2, permissions: 48, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', description: 'Full control over school operations' },
  { name: 'Vice Principal', users: 1, permissions: 35, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', description: 'Academic and discipline oversight' },
  { name: 'Department Head', users: 6, permissions: 22, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', description: 'Department-level management' },
  { name: 'Teacher', users: 42, permissions: 14, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', description: 'Class and student management' },
  { name: 'Finance Officer', users: 3, permissions: 18, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', description: 'Fee collection and financial reports' },
  { name: 'Librarian', users: 2, permissions: 8, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', description: 'Library catalog and borrowing' },
  { name: 'Nurse', users: 3, permissions: 10, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', description: 'Health center records' },
  { name: 'Parent', users: 312, permissions: 4, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20', description: 'View child progress and communication' },
];

const recentUsers = [
  { name: 'Mrs. Patricia Osei', email: 'p.osei@school.edu', role: 'School Admin', status: 'active', lastLogin: '2 hrs ago' },
  { name: 'Mr. Benjamin Asante', email: 'b.asante@school.edu', role: 'Finance Officer', status: 'active', lastLogin: '1 day ago' },
  { name: 'Ms. Grace Owusu', email: 'g.owusu@school.edu', role: 'Teacher', status: 'active', lastLogin: '3 hrs ago' },
  { name: 'Dr. Raj Sharma', email: 'raj.sharma@email.com', role: 'Parent', status: 'active', lastLogin: '2 days ago' },
  { name: 'Mr. Kofi Asumadu', email: 'k.asumadu@school.edu', role: 'Teacher', status: 'inactive', lastLogin: '1 week ago' },
];

export default function UsersRolesPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Users & Roles</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Manage user accounts, roles, and access permissions</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">
            <Shield className="w-4 h-4" />Manage Roles
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />Add User
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div>
        <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest mb-3">Roles & Permissions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {roles.map((role, i) => (
            <div key={role.name} className={`rounded-xl border p-4 animate-fade-in hover:scale-105 transition-transform cursor-pointer ${role.bg}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <Shield className={`w-5 h-5 ${role.color}`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.bg} ${role.color}`}>{role.permissions} perms</span>
              </div>
              <p className={`text-base font-bold ${role.color}`}>{role.users}</p>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{role.name}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">User Accounts</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              <input type="text" placeholder="Search users..." className="h-9 pl-8 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors w-40" />
            </div>
            <select className="h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
              <option>All Roles</option>
              {roles.map(r => <option key={r.name}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['User', 'Email', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user, i) => (
                <tr key={i} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold flex-shrink-0">
                        {user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-[hsl(var(--text-primary))] whitespace-nowrap">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-tertiary))]">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))]">{user.role}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">{user.lastLogin}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"><Key className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--danger))]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
