import { Bus, MapPin, Users, Plus, Navigation, Wrench, Fuel, Phone, Clock } from 'lucide-react';

const routes = [
  { id: '1', name: 'Route A — Eastside', driver: 'Mr. Kwame Darko', vehicle: 'KIA Bus — KI-2341-24', students: 24, stops: 8, departureTime: '6:45 AM', returnTime: '4:00 PM', status: 'active' },
  { id: '2', name: 'Route B — Northgate', driver: 'Mr. Kofi Mensah', vehicle: 'Toyota HiAce — TO-1122-23', students: 18, stops: 6, departureTime: '7:00 AM', returnTime: '4:15 PM', status: 'active' },
  { id: '3', name: 'Route C — Westtown', driver: 'Mr. Samuel Adu', vehicle: 'Minibus — MB-5566-22', students: 15, stops: 5, departureTime: '6:30 AM', returnTime: '4:30 PM', status: 'maintenance' },
  { id: '4', name: 'Route D — Southpark', driver: 'Mrs. Grace Owusu', vehicle: 'KIA Bus — KI-9988-25', students: 21, stops: 7, departureTime: '7:15 AM', returnTime: '4:00 PM', status: 'active' },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Active' },
  maintenance: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'In Maintenance' },
  inactive: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Inactive' },
};

export default function TransportPage() {
  const totalStudents = routes.reduce((a, r) => a + r.students, 0);
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Transport</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Routes, vehicles and driver management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />Add Route
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Routes', value: routes.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Students Using Bus', value: totalStudents, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Active Vehicles', value: routes.filter(r => r.status === 'active').length, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'In Maintenance', value: routes.filter(r => r.status === 'maintenance').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route, i) => {
          const cfg = statusConfig[route.status];
          return (
            <div key={route.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                    <Bus className="w-5 h-5 text-[hsl(var(--accent))]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--text-primary))] text-sm">{route.name}</h3>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{route.vehicle}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center bg-[hsl(var(--bg-tertiary)/0.6)] rounded-lg p-2">
                  <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{route.students}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Students</p>
                </div>
                <div className="text-center bg-[hsl(var(--bg-tertiary)/0.6)] rounded-lg p-2">
                  <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{route.stops}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Stops</p>
                </div>
                <div className="text-center bg-[hsl(var(--bg-tertiary)/0.6)] rounded-lg p-2">
                  <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{route.departureTime}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Departure</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--bg-tertiary))] flex items-center justify-center text-[8px] font-bold text-[hsl(var(--text-secondary))]">
                    {route.driver.split(' ').map(w => w[0]).join('').slice(0,2)}
                  </div>
                  <span className="text-xs text-[hsl(var(--text-secondary))]">{route.driver}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors" title="Track">
                    <Navigation className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors" title="Maintenance">
                    <Wrench className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
