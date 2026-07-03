import { Trophy, Plus, Calendar, Users, DollarSign, MapPin, Clock, CheckCircle2, Tag } from 'lucide-react';

const events = [
  { id: '1', title: 'Annual Sports Day', type: 'Sports', date: 'Jul 17, 2026', time: '8:00 AM', venue: 'School Sports Field', organizer: 'Coach Asare', budget: 2500, registered: 480, capacity: 600, status: 'upcoming' },
  { id: '2', title: 'Parent-Teacher Meeting', type: 'Meeting', date: 'Jul 10, 2026', time: '10:00 AM', venue: 'School Hall', organizer: 'Mrs. Patricia Osei', budget: 800, registered: 145, capacity: 200, status: 'upcoming' },
  { id: '3', title: 'Inter-School Science Quiz', type: 'Competition', date: 'Jul 24, 2026', time: '9:00 AM', venue: 'ICT Lab', organizer: 'Mr. Agyei', budget: 1200, registered: 12, capacity: 30, status: 'upcoming' },
  { id: '4', title: 'End of Term 2 Graduation', type: 'Graduation', date: 'Aug 5, 2026', time: '10:00 AM', venue: 'Main Auditorium', organizer: 'School Administration', budget: 8000, registered: 280, capacity: 400, status: 'planning' },
  { id: '5', title: 'Mid-Year PTA Meeting', type: 'Meeting', date: 'Jun 15, 2026', time: '2:00 PM', venue: 'Conference Room', organizer: 'Mrs. Patricia Osei', budget: 600, registered: 98, capacity: 120, status: 'completed' },
];

const typeColors: Record<string, string> = {
  Sports: 'bg-emerald-500/15 text-emerald-400',
  Meeting: 'bg-blue-500/15 text-blue-400',
  Competition: 'bg-purple-500/15 text-purple-400',
  Graduation: 'bg-amber-500/15 text-amber-400',
  Conference: 'bg-teal-500/15 text-teal-400',
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  upcoming: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Upcoming' },
  planning: { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', label: 'Planning' },
  ongoing: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Ongoing' },
  completed: { color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20', label: 'Completed' },
};

export default function EventsPage() {
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const totalBudget = events.reduce((a, e) => a + e.budget, 0);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Events Management</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">School events, sports, meetings and competitions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />Create Event
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: events.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Upcoming', value: upcomingCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Total Registrations', value: events.reduce((a, e) => a + e.registered, 0), color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {events.map((event, i) => {
          const sts = statusConfig[event.status];
          const typeColor = typeColors[event.type] || 'bg-zinc-500/15 text-zinc-400';
          const fillRate = Math.round((event.registered / event.capacity) * 100);
          return (
            <div key={event.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColor}`}>{event.type}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sts.bg} ${sts.color}`}>{sts.label}</span>
              </div>
              <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-3">{event.title}</h3>
              <div className="space-y-1.5 mb-4">
                <p className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{event.date} at {event.time}
                </p>
                <p className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{event.venue}
                </p>
                <p className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />Budget: ${event.budget.toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-[hsl(var(--text-tertiary))]">
                    <Users className="w-3 h-3 inline mr-1" />{event.registered}/{event.capacity} registered
                  </span>
                  <span className="text-xs font-medium text-[hsl(var(--text-primary))]">{fillRate}%</span>
                </div>
                <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${fillRate}%` }} />
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-[hsl(var(--border))]">
                <button className="flex-1 py-2 rounded-lg text-xs font-medium text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">View Details</button>
                {event.status !== 'completed' && (
                  <button className="flex-1 py-2 rounded-lg text-xs font-medium text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] hover:bg-[hsl(var(--accent)/0.2)] transition-all">Manage</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
