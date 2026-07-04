'use client';

import { useState } from 'react';
import { AlertTriangle, Plus, Search } from 'lucide-react';

const mockEmergencies = [
  { id: '1', title: 'Inclement Weather School Closure', date: '2026-06-15', channels: 'SMS, Email, Push', confirmedCount: '98%' },
  { id: '2', title: 'Fire Evacuation Drill Completed', date: '2026-05-10', channels: 'In-app Notice', confirmedCount: '100%' }
];

export default function EmergencyAlertsPage() {
  const [alerts, setAlerts] = useState(mockEmergencies);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Emergency alerts Desk</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Dispatch high-priority evacuation alerts to multiple target channels with automatic escalations.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <AlertTriangle className="w-4 h-4" /> Trigger Emergency Alert
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Alert Title', 'Triggered Date', 'Channels Dispatched', 'Confirmed Read'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> {row.title}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.date}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.channels}</td>
                  <td className="px-5 py-3.5 text-xs text-emerald-400 font-bold">{row.confirmedCount} confirmed</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
