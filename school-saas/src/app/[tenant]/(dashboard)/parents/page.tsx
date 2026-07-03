import { UserCheck, UserPlus, Phone, Mail, Users, Search, MapPin, Heart, MessageSquare, ArrowRight } from 'lucide-react';

const demoParents = [
  { id: '1', name: 'Mrs. Rachel Johnson', email: 'rachel.johnson@email.com', phone: '+1 555-0101', children: ['Amara Johnson', 'Tony Johnson'], type: 'Parent', address: '42 Elm Street, Springfield', joinedDate: 'Sep 2024' },
  { id: '2', name: 'Mr. Emeka Okafor', email: 'emeka.okafor@email.com', phone: '+1 555-0102', children: ['David Okafor'], type: 'Parent', address: '18 Oak Avenue, Riverside', joinedDate: 'Jan 2025' },
  { id: '3', name: 'Ms. Linda Williams', email: 'linda.williams@email.com', phone: '+1 555-0103', children: ['Sarah Williams'], type: 'Guardian', address: '99 Pine Road, Westtown', joinedDate: 'Sep 2023' },
  { id: '4', name: 'Mr. Wei Chen', email: 'wei.chen@email.com', phone: '+1 555-0104', children: ['Michael Chen', 'Lucy Chen'], type: 'Parent', address: '5 Cherry Lane, Greenville', joinedDate: 'Jan 2024' },
  { id: '5', name: 'Mr. Ahmed Hassan', email: 'a.hassan@email.com', phone: '+1 555-0105', children: ['Fatima Hassan'], type: 'Parent', address: '33 Maple Drive, Northgate', joinedDate: 'Sep 2024' },
  { id: '6', name: 'Mrs. Linh Nguyen', email: 'linh.nguyen@email.com', phone: '+1 555-0106', children: ['James Nguyen'], type: 'Parent', address: '77 Birch Blvd, Eastside', joinedDate: 'Sep 2021' },
  { id: '7', name: 'Dr. Raj Sharma', email: 'raj.sharma@email.com', phone: '+1 555-0107', children: ['Priya Sharma'], type: 'Parent', address: '12 Willow Ct, Midtown', joinedDate: 'Jan 2025' },
  { id: '8', name: 'Pastor Samuel Adeyemi', email: 's.adeyemi@email.com', phone: '+1 555-0108', children: ['Emmanuel Adeyemi'], type: 'Sponsor', address: '60 Church Road, Calvary', joinedDate: 'Sep 2025' },
];

export default function ParentsPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Parents & Guardians</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{demoParents.length} registered contacts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <UserPlus className="w-4 h-4" />
          Add Parent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Parents', value: demoParents.filter(p => p.type === 'Parent').length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Guardians', value: demoParents.filter(p => p.type === 'Guardian').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Sponsors', value: demoParents.filter(p => p.type === 'Sponsor').length, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input type="text" placeholder="Search parents..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
          </div>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>All Types</option>
            <option>Parent</option>
            <option>Guardian</option>
            <option>Sponsor</option>
          </select>
        </div>
      </div>

      {/* Parent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {demoParents.map((parent, i) => (
          <div key={parent.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] font-bold text-sm flex-shrink-0">
                {parent.name.split(' ').map(w => w[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[hsl(var(--text-primary))] truncate">{parent.name}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${parent.type === 'Parent' ? 'bg-blue-500/15 text-blue-400' : parent.type === 'Guardian' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-purple-500/15 text-purple-400'}`}>
                  {parent.type}
                </span>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Mail className="w-3 h-3" />{parent.email}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Phone className="w-3 h-3" />{parent.phone}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><MapPin className="w-3 h-3" />{parent.address}</p>
            </div>
            <div className="pt-3 border-t border-[hsl(var(--border))]">
              <p className="text-[10px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Children</p>
              <div className="flex flex-wrap gap-1">
                {parent.children.map(c => (
                  <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))]">{c}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-[hsl(var(--border))]">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] transition-all">
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] hover:bg-[hsl(var(--accent)/0.2)] transition-all">
                <UserCheck className="w-3.5 h-3.5" />
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
