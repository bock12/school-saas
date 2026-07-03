import { UsersRound, UserPlus, Briefcase, Search, Phone, Mail, Shield, Truck, BookOpen, HeartPulse } from 'lucide-react';

const staffCategories = [
  { label: 'Admin Staff', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', count: 8 },
  { label: 'Finance Staff', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', count: 4 },
  { label: 'Librarians', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', count: 2 },
  { label: 'Nurses', icon: HeartPulse, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', count: 3 },
  { label: 'Security', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', count: 6 },
  { label: 'Drivers', icon: Truck, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', count: 5 },
];

const demoStaff = [
  { id: '1', name: 'Mrs. Patricia Osei', role: 'Head of Admin', department: 'Administration', email: 'p.osei@school.edu', phone: '+1 555-1001', employeeId: 'EMP-001', joinDate: 'Mar 2019', status: 'active', type: 'Admin Staff' },
  { id: '2', name: 'Mr. Benjamin Asante', role: 'Accountant', department: 'Finance', email: 'b.asante@school.edu', phone: '+1 555-1002', employeeId: 'EMP-002', joinDate: 'Jan 2021', status: 'active', type: 'Finance Staff' },
  { id: '3', name: 'Ms. Josephine Boateng', role: 'Head Librarian', department: 'Library', email: 'j.boateng@school.edu', phone: '+1 555-1003', employeeId: 'EMP-003', joinDate: 'Sep 2018', status: 'active', type: 'Librarians' },
  { id: '4', name: 'Nurse Mary Amponsah', role: 'School Nurse', department: 'Health Center', email: 'm.amponsah@school.edu', phone: '+1 555-1004', employeeId: 'EMP-004', joinDate: 'Sep 2020', status: 'active', type: 'Nurses' },
  { id: '5', name: 'Sgt. Paul Mensah', role: 'Head of Security', department: 'Security', email: 'p.mensah@school.edu', phone: '+1 555-1005', employeeId: 'EMP-005', joinDate: 'Jan 2017', status: 'active', type: 'Security' },
  { id: '6', name: 'Mr. Kwame Darko', role: 'Bus Driver', department: 'Transport', email: 'k.darko@school.edu', phone: '+1 555-1006', employeeId: 'EMP-006', joinDate: 'Sep 2022', status: 'on_leave', type: 'Drivers' },
  { id: '7', name: 'Ms. Abena Frimpong', role: 'Secretary', department: 'Administration', email: 'a.frimpong@school.edu', phone: '+1 555-1007', employeeId: 'EMP-007', joinDate: 'Jan 2023', status: 'active', type: 'Admin Staff' },
  { id: '8', name: 'Mr. Kofi Asumadu', role: 'IT Support', department: 'Administration', email: 'k.asumadu@school.edu', phone: '+1 555-1008', employeeId: 'EMP-008', joinDate: 'Sep 2021', status: 'active', type: 'Admin Staff' },
];

const typeColors: Record<string, string> = {
  'Admin Staff': 'bg-blue-500/15 text-blue-400',
  'Finance Staff': 'bg-emerald-500/15 text-emerald-400',
  'Librarians': 'bg-purple-500/15 text-purple-400',
  'Nurses': 'bg-pink-500/15 text-pink-400',
  'Security': 'bg-amber-500/15 text-amber-400',
  'Drivers': 'bg-teal-500/15 text-teal-400',
};

export default function StaffPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Staff Management</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Non-teaching staff — {demoStaff.length} total employees
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto">
          <UserPlus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {staffCategories.map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.label} className={`rounded-xl border p-4 text-center cursor-pointer hover:scale-105 transition-transform ${cat.bg}`}>
              <Icon className={`w-5 h-5 mx-auto mb-2 ${cat.color}`} />
              <p className={`text-xl font-bold ${cat.color}`}>{cat.count}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 leading-tight">{cat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input type="text" placeholder="Search staff..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
          </div>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors w-full sm:w-48">
            <option>All Departments</option>
            <option>Administration</option>
            <option>Finance</option>
            <option>Library</option>
            <option>Health Center</option>
            <option>Security</option>
            <option>Transport</option>
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoStaff.map((staff, i) => (
          <div key={staff.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] font-bold text-sm flex-shrink-0">
                  {staff.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[hsl(var(--text-primary))] truncate">{staff.name}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] truncate">{staff.role}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${staff.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {staff.status === 'active' ? 'Active' : 'On Leave'}
              </span>
            </div>
            <div className="space-y-1 mb-3">
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 flex-shrink-0" />{staff.email}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5 truncate"><Phone className="w-3 h-3 flex-shrink-0" />{staff.phone}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[staff.type] || 'bg-zinc-500/15 text-zinc-400'}`}>{staff.type}</span>
              <code className="text-[10px] font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{staff.employeeId}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
