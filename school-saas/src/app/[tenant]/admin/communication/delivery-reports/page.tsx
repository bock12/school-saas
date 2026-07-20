'use client';

import { useState } from 'react';
import { BarChart3, Search } from 'lucide-react';

const mockReports = [
  { date: '2026-07-04', totalSent: 1248, smsDelivered: '98.2%', emailOpened: '85.4%', failed: 18 },
  { date: '2026-07-03', totalSent: 940, smsDelivered: '97.5%', emailOpened: '82.1%', failed: 24 }
];

export default function DeliveryReportsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Delivery &amp; Open Rate Reports</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review click-through rates, SMS network response speeds, and email bounce metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <div>
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Delivery Success Trends</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Calculated daily across all channels</p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between px-4 pt-10 relative">
            {[
              { label: 'Jul 4 (Today)', val: '98.4%', h: 'h-60' },
              { label: 'Jul 3', val: '97.6%', h: 'h-52' },
              { label: 'Jul 2', val: '99.1%', h: 'h-56' },
              { label: 'Jul 1', val: '98.0%', h: 'h-48' }
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2 w-20 group cursor-pointer">
                <div className="text-[10px] font-bold text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</div>
                <div className={`w-full ${item.h} rounded-t bg-gradient-to-t from-[hsl(var(--accent)/0.6)] to-[hsl(var(--accent))]`} />
                <span className="text-[9px] text-[hsl(var(--text-tertiary))] text-center truncate w-full">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4 h-fit text-xs text-[hsl(var(--text-secondary))]">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Cumulative KPIs</h3>
          <div className="space-y-3">
            {mockReports.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-1">
                <p className="font-bold text-[hsl(var(--text-primary))]">{r.date}</p>
                <p>Total sent: {r.totalSent}</p>
                <p className="text-emerald-400">SMS success: {r.smsDelivered}</p>
                <p className="text-purple-400">Email open: {r.emailOpened}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
