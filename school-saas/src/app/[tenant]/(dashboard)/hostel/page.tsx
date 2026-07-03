import { Home, Users, Bed, Plus, Search, Shield } from 'lucide-react';

const dormitories = [
  { id: '1', name: 'Block A — Boys', warden: 'Mr. Joseph Ampong', capacity: 80, occupied: 72, rooms: 20, gender: 'Male' },
  { id: '2', name: 'Block B — Boys', warden: 'Mr. Peter Asante', capacity: 80, occupied: 68, rooms: 20, gender: 'Male' },
  { id: '3', name: 'Block C — Girls', warden: 'Mrs. Abena Mensah', capacity: 60, occupied: 55, rooms: 15, gender: 'Female' },
  { id: '4', name: 'Block D — Girls', warden: 'Ms. Grace Owusu', capacity: 60, occupied: 48, rooms: 15, gender: 'Female' },
];

const boarders = [
  { id: '1', name: 'Kwame Asante', grade: 'Grade 11', block: 'Block A', room: 'A-102', bed: 'B1', status: 'present' },
  { id: '2', name: 'Emmanuel Adeyemi', grade: 'Grade 10', block: 'Block B', room: 'B-205', bed: 'B2', status: 'present' },
  { id: '3', name: 'Aisha Mohammed', grade: 'Grade 12', block: 'Block C', room: 'C-301', bed: 'B1', status: 'weekend_pass' },
  { id: '4', name: 'Fatimah Al-Hassan', grade: 'Grade 9', block: 'Block D', room: 'D-108', bed: 'B3', status: 'present' },
];

export default function HostelPage() {
  const totalCapacity = dormitories.reduce((a, d) => a + d.capacity, 0);
  const totalOccupied = dormitories.reduce((a, d) => a + d.occupied, 0);
  const occupancyRate = Math.round((totalOccupied / totalCapacity) * 100);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Hostel & Boarding</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Dormitory and room allocation management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />Allocate Room
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Capacity', value: totalCapacity, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Occupied Beds', value: totalOccupied, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Available Beds', value: totalCapacity - totalOccupied, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Occupancy Rate', value: `${occupancyRate}%`, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dormitories.map((dorm, i) => {
          const occupancy = Math.round((dorm.occupied / dorm.capacity) * 100);
          const isMale = dorm.gender === 'Male';
          return (
            <div key={dorm.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isMale ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)' }}>
                  <Home className="w-5 h-5" style={{ color: isMale ? '#60a5fa' : '#f472b6' }} />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isMale ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}`}>
                  {dorm.gender}
                </span>
              </div>
              <h3 className="font-semibold text-[hsl(var(--text-primary))] text-sm mb-1">{dorm.name}</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mb-4 flex items-center gap-1">
                <Shield className="w-3 h-3" />{dorm.warden}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Rooms', value: dorm.rooms },
                  { label: 'Occupied', value: dorm.occupied },
                ].map(s => (
                  <div key={s.label} className="bg-[hsl(var(--bg-tertiary)/0.6)] rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{s.value}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Occupancy</span>
                  <span className="text-[10px] font-semibold text-[hsl(var(--text-primary))]">{occupancy}%</span>
                </div>
                <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${occupancy >= 90 ? 'bg-red-500' : occupancy >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${occupancy}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Current Boarders</h2>
          <button className="text-xs text-[hsl(var(--accent))] hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student', 'Grade', 'Block', 'Room', 'Bed', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boarders.map(b => (
                <tr key={b.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-[10px] font-bold">
                        {b.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{b.grade}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{b.block}</td>
                  <td className="px-5 py-3.5"><code className="text-xs font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{b.room}</code></td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{b.bed}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${b.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {b.status === 'present' ? 'Present' : 'Weekend Pass'}
                    </span>
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
