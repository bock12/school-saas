import { Stethoscope, Plus, AlertTriangle, Heart, Pill, Syringe, User, Calendar, FileText } from 'lucide-react';

const clinicVisits = [
  { id: '1', student: 'David Okafor', grade: 'Grade 11', complaint: 'Headache and fever', nurse: 'Nurse Mary Amponsah', date: 'Jul 2, 2026', time: '10:30 AM', action: 'Paracetamol prescribed, rest recommended', status: 'treated' },
  { id: '2', student: 'Sarah Williams', grade: 'Grade 7', complaint: 'Stomach ache', nurse: 'Nurse Mary Amponsah', date: 'Jul 2, 2026', time: '2:15 PM', action: 'Under observation', status: 'observation' },
  { id: '3', student: 'Michael Chen', grade: 'Grade 10', complaint: 'Sprained ankle during PE', nurse: 'Nurse Mary Amponsah', date: 'Jul 1, 2026', time: '11:00 AM', action: 'First aid applied, parent notified', status: 'treated' },
  { id: '4', student: 'James Nguyen', grade: 'Grade 12', complaint: 'Asthma attack', nurse: 'Nurse Mary Amponsah', date: 'Jun 30, 2026', time: '9:45 AM', action: 'Inhaler administered, referred to hospital', status: 'referred' },
];

const medicalRecords = [
  { student: 'Fatima Hassan', condition: 'Asthma', medication: 'Salbutamol Inhaler', allergy: 'Penicillin', bloodGroup: 'O+' },
  { student: 'Emmanuel Adeyemi', condition: 'Epilepsy', medication: 'Carbamazepine', allergy: 'None', bloodGroup: 'A+' },
  { student: 'Priya Sharma', condition: 'Diabetes Type 1', medication: 'Insulin', allergy: 'Sulfa drugs', bloodGroup: 'B+' },
];

const statusConfig: Record<string, { color: string; bg: string }> = {
  treated: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  observation: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  referred: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function HealthPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Health Center</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Clinic visits, medical records and student health management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />Record Visit
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Visits Today', value: clinicVisits.filter(v => v.date === 'Jul 2, 2026').length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Stethoscope },
          { label: 'Under Observation', value: clinicVisits.filter(v => v.status === 'observation').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Heart },
          { label: 'Medical Conditions', value: medicalRecords.length, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Pill },
          { label: 'Referred Out', value: clinicVisits.filter(v => v.status === 'referred').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: AlertTriangle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-xl border p-4 flex items-center gap-3 ${s.bg}`}>
              <Icon className={`w-6 h-6 flex-shrink-0 ${s.color}`} />
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Recent Clinic Visits</h2>
            <button className="text-xs text-[hsl(var(--accent))] hover:underline">View all</button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {clinicVisits.map(visit => {
              const cfg = statusConfig[visit.status];
              return (
                <div key={visit.id} className="p-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{visit.student} <span className="font-normal text-[hsl(var(--text-tertiary))]">· {visit.grade}</span></p>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{visit.complaint}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.bg} ${cfg.color}`}>{visit.status}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{visit.action}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" />{visit.date} at {visit.time}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Chronic Conditions</h2>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {medicalRecords.map((rec, i) => (
              <div key={i} className="p-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-[10px] font-bold">
                    {rec.student.split(' ').map(w => w[0]).join('').slice(0,2)}
                  </div>
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{rec.student}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Condition:</span>
                    <span className="text-[10px] font-medium text-red-400">{rec.condition}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Allergy:</span>
                    <span className="text-[10px] font-medium text-amber-400">{rec.allergy}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Blood Group:</span>
                    <span className="text-[10px] font-medium text-blue-400">{rec.bloodGroup}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
