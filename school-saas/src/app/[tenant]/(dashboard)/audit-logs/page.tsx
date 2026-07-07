'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Shield, History, LogIn, Edit2, AlertTriangle, FileText, Database, Brain,
  Link2, Download, Search, CheckCircle2, ChevronRight, Play, AlertOctagon,
  Clock, User, Terminal, Lock, UserCheck, ShieldAlert, BarChart3, HelpCircle, Save, ExternalLink
} from 'lucide-react';

type AuditTab =
  | 'overview'
  | 'logs'
  | 'login-history'
  | 'data-changes'
  | 'security'
  | 'ai-activity'
  | 'api-activity'
  | 'exports'
  | 'backup'
  | 'compliance'
  | 'investigation'
  | 'retention';

export default function AuditAndCompliancePage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<AuditTab>('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // KPI Overview Data
  const kpis = [
    { label: 'Login Attempts Today', value: '1,428', sub: '99.4% Auth Success', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Failed Logins', value: '8 Logins', sub: 'Blocked via lockout policy', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Security Alerts', value: '2 Medium', sub: 'Suspicious location attempt', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Critical Changes', value: '4 Settings', sub: 'System configurations altered', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Audit Events Today', value: '42,940', sub: 'Logs written to event bus', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Data Exports', value: '3 Sheets', sub: 'All exports approved by principal', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Backup Status', value: 'Successful', sub: 'Verified at 02:00 AM WAT', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Compliance Score', value: '98%', sub: 'WAEC / Data privacy compliant', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Open Incidents', value: '0 Open', sub: 'All issues resolved', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'AI Actions Logged', value: '14 Approvals', sub: 'Review parameters verified', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' }
  ];

  // Retention mock data
  const retentionPolicies = [
    { type: 'Login History', duration: '12 - 24 Months', platformMin: '12 Months', status: 'Enforced' },
    { type: 'Audit Event Logs', duration: '5 Years', platformMin: '5 Years', status: 'Enforced' },
    { type: 'Financial Auditing Logs', duration: '7 Years', platformMin: '7 Years', status: 'Enforced' },
    { type: 'Security Incident Logs', duration: '5 Years', platformMin: '2 Years', status: 'Enforced' },
    { type: 'AI Activity Logs', duration: '60 Days', platformMin: '30 Days', status: 'Enforced' },
    { type: 'API Connection Logs', duration: '12 Months', platformMin: '6 Months', status: 'Enforced' }
  ];

  // Mock list of main audit logs
  const auditLogs = [
    { id: 'EVT-9402', time: '15:42:01', user: 'Mrs. Patricia Osei', role: 'School Admin', module: 'Settings', action: 'Modified Term 3 Exam Dates', target: 'Academic Calendar', ip: '197.210.8.44', dev: 'Chrome / Win10', reqId: 'req-820491024', status: 'success' },
    { id: 'EVT-9401', time: '14:20:12', user: 'Mr. Benjamin Asante', role: 'Finance Officer', module: 'Finance', action: 'Recorded Fee Payment NGN-94', target: 'Student David Okafor', ip: '197.210.8.102', dev: 'Firefox / macOS', reqId: 'req-820491011', status: 'success' },
    { id: 'EVT-9400', time: '11:15:30', user: 'AI Assistant', role: 'System Copilot', module: 'AI Engine', action: 'Proposed Math Tutoring Intervention', target: 'SS2 Science Class', ip: '127.0.0.1', dev: 'Python API Server', reqId: 'req-820491000', status: 'success' },
    { id: 'EVT-9399', time: '09:12:00', user: 'Unknown', role: 'Guest', module: 'Auth', action: 'Failed Login Attempt', target: 'admin@school.edu', ip: '45.33.32.156', dev: 'Safari / iPhone', reqId: 'req-820490998', status: 'failed' },
    { id: 'EVT-9398', time: '08:14:22', user: 'Mr. Kofi Owusu', role: 'Teacher', module: 'Academics', action: 'Modified Gradebook Score Math Q2', target: 'Michael Chen: 68 -> 74', ip: '197.210.5.21', dev: 'Chrome / Linux', reqId: 'req-820490940', status: 'success' },
  ].filter(l => l.action.toLowerCase().includes(searchQuery.toLowerCase()) || l.module.toLowerCase().includes(searchQuery.toLowerCase()));

  // Mock list of data changes (version history)
  const dataChanges = [
    { record: 'Student Roster Name', field: 'first_name', oldVal: 'John', newVal: 'John B.', actor: 'Mrs. Patricia Osei', role: 'Registrar', reason: 'Legal name correction from birth certificate', time: 'Yesterday, 04:30 PM' },
    { record: 'Gradebook Entry - Math', field: 'final_score', oldVal: '68', newVal: '74', actor: 'Mr. Kofi Owusu', role: 'Teacher', reason: 'Recounting of paper assessment scripts', time: '2 days ago' },
    { record: 'Parent Sibling Group', field: 'discount_percentage', oldVal: '10%', newVal: '15%', actor: 'Mr. Benjamin Asante', role: 'Finance Officer', reason: 'Consolidated sibling discount code applied', time: '3 days ago' },
  ];

  // Mock list of security events
  const securityEvents = [
    { event: 'Suspicious Bulk Data Export Request', user: 'John Staff', severity: 'High', status: 'Under Investigation', time: 'Today, 10:42 AM', ip: '197.210.9.12' },
    { event: 'Failed MFA challenge twice consecutively', user: 'Mr. Kofi Owusu', severity: 'Medium', status: 'Audited', time: 'Yesterday, 08:15 AM', ip: '197.210.5.21' },
    { event: 'API rate limit threshold exceeded (429)', user: 'Twilio SMS Gateway Hook', severity: 'Low', status: 'Resolved', time: 'July 5, 2026', ip: '34.204.1.88' },
    { event: 'New school administrator role mapped', user: 'Mrs. Patricia Osei', severity: 'Critical', status: 'Verified', time: 'June 28, 2026', ip: '197.210.8.44' }
  ];

  // API Audits logs
  const apiLogs = [
    { client: 'Twilio SMS gateway', endpoint: 'POST /api/sms/callback', method: 'POST', status: 200, time: '12:04:15', size: '1.4 KB', rate: 'Normal' },
    { client: 'Paystack checkout API', endpoint: 'GET /api/finance/verify-payment', method: 'GET', status: 200, time: '11:42:10', size: '2.1 KB', rate: 'Normal' },
    { client: 'Supabase real-time client', endpoint: 'WS /database/realtime', method: 'UPGRADE', status: 101, time: '11:15:00', size: '0.8 KB', rate: 'Normal' },
    { client: 'Unauthorized client API key', endpoint: 'GET /api/students/active', method: 'GET', status: 401, time: '09:00:12', size: '0.2 KB', rate: 'Exceeded Rate Limit' }
  ];

  // AI activities log
  const aiLogs = [
    { prompt: 'Generate attendance report for mid-term management meeting', response: 'Attendance report PDF generated with 96.4% compliance averages.', accessed: 'Attendance Roster DB, staff logs', recommended: 'Notify parent of consecutive absences', approvedBy: 'Principal Patricia Osei', time: 'Today, 11:30 AM' },
    { prompt: 'Check teacher workload ratios', response: 'Workloads mapped. Mr. John Kamara is overloaded at 37 periods weekly.', accessed: 'Timetable allocations, staff DB', recommended: 'Assign additional mathematics tutor', approvedBy: 'Audited internally (Read-only)', time: 'Yesterday, 04:12 PM' }
  ];

  // Data exports logs
  const exportLogs = [
    { name: 'Grade 10 final transcript sheet.xlsx', user: 'Mrs. Patricia Osei', records: 412, format: 'Excel', size: '1.2 MB', approved: 'Approved by principal' },
    { name: 'Finance school receivables Q2.csv', user: 'Mr. Benjamin Asante', records: 108, format: 'CSV', size: '0.4 MB', approved: 'Approved by principal' }
  ];

  const menuItems = [
    { id: 'overview', label: 'Compliance Dashboard', icon: Shield },
    { id: 'logs', label: 'Central Audit Logs', icon: History },
    { id: 'login-history', label: 'Login & Session Logs', icon: LogIn },
    { id: 'data-changes', label: 'Data Version History', icon: Edit2 },
    { id: 'security', label: 'Security Events alerts', icon: ShieldAlert },
    { id: 'ai-activity', label: 'AI Operations Logs', icon: Brain },
    { id: 'api-activity', label: 'API Connection Audit', icon: Terminal },
    { id: 'exports', label: 'Data Export Registry', icon: Download },
    { id: 'backup', label: 'Backup Monitoring', icon: Database },
    { id: 'compliance', label: 'Compliance Reports', icon: FileText },
    { id: 'investigation', label: 'Incident Investigation', icon: Search },
    { id: 'retention', label: 'Retention Policies', icon: Clock }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <Shield className="w-8 h-8 text-[hsl(var(--accent))]" />
            Audit &amp; Compliance Center
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Immutable operation logging, real-time security events monitoring, automated backup verification, and incident timeline investigations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Log Storage Status: Immutable
          </span>
        </div>
      </div>

      {/* Main Settings Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 glass-card p-2 rounded-2xl border border-[hsl(var(--border))] space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AuditTab)}
              className={`flex items-center gap-3 w-full px-4.5 py-3 rounded-xl text-xs font-semibold text-left transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md shadow-[hsl(var(--accent)/0.15)]'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Configurations Forms Container */}
        <div className="lg:col-span-3">
          {/* Overview Dashboard */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {kpis.map((kpi, idx) => (
                  <div key={kpi.label} className={`glass-card p-4 border flex flex-col justify-between ${kpi.bg}`}>
                    <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block mb-2">{kpi.label}</span>
                    <div>
                      <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">{kpi.value}</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">{kpi.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Event Trend Chart and Quick actions side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-card p-5 space-y-4 border border-[hsl(var(--border))]">
                  <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--border))]">
                    <div>
                      <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Weekly Event Log Volume Trends</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))]">Central event bus dispatches</p>
                    </div>
                  </div>
                  <div className="h-40 w-full relative pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="auditTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 130 Q 100 80 200 100 T 400 40 L 400 150 L 0 150 Z" fill="url(#auditTrendGrad)" />
                      <path d="M 0 130 Q 100 80 200 100 T 400 40" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" />
                      <circle cx="200" cy="100" r="4.5" fill="hsl(var(--accent))" stroke="white" strokeWidth="1.5" />
                      <circle cx="400" cy="40" r="4.5" fill="hsl(var(--accent))" stroke="white" strokeWidth="1.5" />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-[hsl(var(--text-tertiary))] pt-1">
                      <span>Mon (38k)</span>
                      <span>Wed (41k)</span>
                      <span>Fri (42.9k)</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 space-y-3 border border-[hsl(var(--border))] flex flex-col justify-between">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Quick Compliance Actions</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setActiveTab('compliance')} className="w-full py-2.5 px-3 bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between">
                      Generate Compliance Report <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveTab('investigation')} className="w-full py-2.5 px-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] text-[hsl(var(--text-primary))] rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between">
                      Reconstruct Incident Timeline <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Central Audit Logs */}
          {activeTab === 'logs' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Centralized Immutable Audit Trail</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Immutable, write-once records of operations logged globally across the tenant.</p>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search query action, actor or ID..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                      <th className="py-2.5 px-2">Event ID &amp; Req ID</th>
                      <th className="py-2.5 px-2">Actor (Role)</th>
                      <th className="py-2.5 px-2">Action Description</th>
                      <th className="py-2.5 px-2">Target</th>
                      <th className="py-2.5 px-2">IP &amp; Device</th>
                      <th className="py-2.5 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                        <td className="py-3.5 px-2">
                          <p className="font-mono font-bold text-[hsl(var(--text-primary))]">{log.id}</p>
                          <p className="font-mono text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">{log.reqId}</p>
                        </td>
                        <td className="py-3.5 px-2">
                          <p className="font-bold text-[hsl(var(--text-primary))]">{log.user}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{log.role}</p>
                        </td>
                        <td className="py-3.5 px-2">
                          <p className="text-[hsl(var(--text-secondary))]">{log.action}</p>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] text-[9px] font-bold uppercase mt-1">{log.module}</span>
                        </td>
                        <td className="py-3.5 px-2 text-[hsl(var(--text-tertiary))] font-medium">{log.target}</td>
                        <td className="py-3.5 px-2">
                          <p className="font-mono text-[10px] text-[hsl(var(--text-secondary))]">{log.ip}</p>
                          <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">{log.dev}</p>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{log.status.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Activity & Login History */}
          {activeTab === 'login-history' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Login &amp; Authentication History</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Real-time authentication records including MFA completions, lockouts, and timeout events.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                      <th className="py-2.5 px-2">Time</th>
                      <th className="py-2.5 px-2">User Target</th>
                      <th className="py-2.5 px-2">Access Device</th>
                      <th className="py-2.5 px-2">MFA Status</th>
                      <th className="py-2.5 px-2">IP Location</th>
                      <th className="py-2.5 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { time: '08:14 AM', user: 'Principal Osei (Staff)', dev: 'Chrome / Win10', mfa: 'MFA Verified (TOTP)', ip: 'Lagos, Nigeria', status: 'Success' },
                      { time: '08:20 AM', user: 'Amara Johnson (Student)', dev: 'Android App', mfa: 'Not required (Standard)', ip: 'Bo, Sierra Leone', status: 'Success' },
                      { time: '09:11 AM', user: 'Unknown (admin@school.edu)', dev: 'Firefox / Linux', mfa: 'Failed Challenge', ip: 'Unknown', status: 'Failed' },
                    ].map((log, idx) => (
                      <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                        <td className="py-3 px-2 font-mono text-[hsl(var(--text-tertiary))]">{log.time}</td>
                        <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{log.user}</td>
                        <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{log.dev}</td>
                        <td className="py-3 px-2"><span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold">{log.mfa}</span></td>
                        <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{log.ip}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{log.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Version History */}
          {activeTab === 'data-changes' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Critical Data Change Records</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Audit log of modifications made to student records, gradebooks, and consolidated billing ledgers.</p>
              </div>

              <div className="space-y-4">
                {dataChanges.map((change, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--border))]">
                      <div>
                        <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{change.record}</p>
                        <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Field modified: <code className="font-mono bg-[hsl(var(--bg-tertiary))] px-1 rounded">{change.field}</code></p>
                      </div>
                      <span className="text-[9px] text-[hsl(var(--text-tertiary))] font-medium">{change.time}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                        <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider block mb-1">Old Value</span>
                        <p className="text-[hsl(var(--text-secondary))]">{change.oldVal}</p>
                      </div>
                      <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">Updated Value</span>
                        <p className="text-[hsl(var(--text-primary))]">{change.newVal}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[hsl(var(--text-tertiary))] pt-1">
                      <span>Reason: <strong>{change.reason}</strong></span>
                      <span>Modified by: <strong className="text-[hsl(var(--text-secondary))]">{change.actor} ({change.role})</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Events */}
          {activeTab === 'security' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Security Incidents &amp; Alerts</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">High-risk audit warnings, privilege escalation tracking, and security lockdowns status.</p>
              </div>

              <div className="space-y-3">
                {securityEvents.map((evt, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${evt.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : evt.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{evt.event}</p>
                        <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1 flex items-center gap-2">
                          <span>Time: {evt.time}</span>
                          <span>•</span>
                          <span>Actor: {evt.user}</span>
                          <span>•</span>
                          <span>IP: {evt.ip}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        evt.severity === 'Critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      }`}>{evt.severity}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] font-bold uppercase">{evt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Activity logs */}
          {activeTab === 'ai-activity' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">AI Assistant Activities Logging</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Audit log records of operations prompts, proposed decisions, and executive approvals.</p>
              </div>

              <div className="space-y-4">
                {aiLogs.map((ai, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3 text-xs">
                    <div>
                      <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">User Prompt</span>
                      <p className="text-[hsl(var(--text-secondary))] italic">"{ai.prompt}"</p>
                    </div>
                    <div className="p-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg">
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">AI Recommendation &amp; Actions</span>
                      <p className="text-[hsl(var(--text-primary))]">{ai.response}</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Data sources used: <strong className="font-mono">{ai.accessed}</strong></p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[hsl(var(--text-tertiary))] pt-1 border-t border-[hsl(var(--border))/0.4]">
                      <span>Approved by HOD/Admin: <strong className="text-[hsl(var(--text-primary))]">{ai.approvedBy}</strong></span>
                      <span>{ai.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Connection Audit */}
          {activeTab === 'api-activity' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">External API Audit logs</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Audit metrics and rate-limits logs for integrated school databases and SMS services.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                      <th className="py-2.5 px-2">Access Time</th>
                      <th className="py-2.5 px-2">API Client Key</th>
                      <th className="py-2.5 px-2">Endpoint URL</th>
                      <th className="py-2.5 px-2">HTTP Method</th>
                      <th className="py-2.5 px-2">Payload Weight</th>
                      <th className="py-2.5 px-2 text-right">Status Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiLogs.map((api, idx) => (
                      <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                        <td className="py-3 px-2 font-mono text-[hsl(var(--text-tertiary))]">{api.time}</td>
                        <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{api.client}</td>
                        <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{api.endpoint}</td>
                        <td className="py-3 px-2"><span className="px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] font-bold text-[9px]">{api.method}</span></td>
                        <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{api.size}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${api.status === 200 || api.status === 101 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{api.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Export Registry */}
          {activeTab === 'exports' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Operational Data Export logs</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Audit log of roster extractions, grades worksheets, and accounting invoices downloads.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                      <th className="py-2.5 px-2">Export File Name</th>
                      <th className="py-2.5 px-2">Exported By</th>
                      <th className="py-2.5 px-2">Records Extracted</th>
                      <th className="py-2.5 px-2">Format</th>
                      <th className="py-2.5 px-2">File Size</th>
                      <th className="py-2.5 px-2 text-right">Status Approvals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportLogs.map((exp, idx) => (
                      <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                        <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))] flex items-center gap-1"><FileText className="w-4 h-4 text-indigo-400" /> {exp.name}</td>
                        <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{exp.user}</td>
                        <td className="py-3 px-2 font-mono text-[hsl(var(--text-primary))]">{exp.records} rows</td>
                        <td className="py-3 px-2"><span className="px-1.5 py-0.5 bg-[hsl(var(--bg-tertiary))] rounded font-bold text-[9px]">{exp.format}</span></td>
                        <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{exp.size}</td>
                        <td className="py-3 px-2 text-right text-emerald-400 font-semibold text-[10px]">{exp.approved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Backup Monitoring */}
          {activeTab === 'backup' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Backup System Monitoring</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Independent monitoring of database automated backups schedules and test restores status.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3">
                  <span className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider block">Backup Integrity Snapshot</span>
                  <div className="space-y-1 text-xs">
                    <p className="text-[hsl(var(--text-secondary))]">Last backup: <strong className="text-[hsl(var(--text-primary))]">Today, 02:00 AM</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Verification: <strong className="text-emerald-400">PASSED</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Next Scheduled backup: <strong className="text-[hsl(var(--text-primary))]">Tomorrow, 02:00 AM WAT</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Backup size: <strong className="text-[hsl(var(--text-primary))]">424 MB</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3">
                  <span className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider block">Disaster Restore Test Logs</span>
                  <div className="space-y-1 text-xs">
                    <p className="text-[hsl(var(--text-secondary))]">Last restore test: <strong className="text-[hsl(var(--text-primary))]">July 01, 2026</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Logical location: <strong className="font-mono">AWS S3 (eu-west-1)</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Test verification status: <strong className="text-emerald-400">SUCCESSFUL (Latency 18.2s)</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Reports */}
          {activeTab === 'compliance' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Compliance &amp; Access Reporting</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Compile data privacy compliance summaries and school operations checklists.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'User Access Review report', desc: 'Lists active roles clearance scopes mapping logs.' },
                  { title: 'Financial Operations Audit support', desc: 'Summarizes payments transactions modifications history.' },
                  { title: 'Student Transcripts Modification Checklist', desc: 'Audits student gradebooks updates details.' },
                  { title: 'AI Assistant Usage & Approvals report', desc: 'Audits recommendations and system actions.' }
                ].map((rep, idx) => (
                  <div key={idx} className="p-4 border border-[hsl(var(--border))] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{rep.title}</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">{rep.desc}</p>
                    </div>
                    <button onClick={() => alert('Compliance report PDF compilation starting...')} className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all"><ExternalLink className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incident Investigation */}
          {activeTab === 'investigation' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Incident Investigation Reconstructor</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Query audit records by transaction timeline to investigate grading or settings anomalies.</p>
              </div>

              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-4">
                <p className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider block">1. Trace User Path Timeline (Investigation Timeline)</p>
                <div className="relative pl-6 space-y-6 border-l-2 border-[hsl(var(--border))] text-xs">
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[hsl(var(--bg-secondary))]" />
                    <p className="font-bold text-[hsl(var(--text-primary))]">User Login (Success)</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Actor: Mr. Kofi Owusu | Time: 08:12 AM | IP: 197.210.5.21</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0 w-3.5 h-3.5 rounded-full bg-indigo-400 border-2 border-[hsl(var(--bg-secondary))]" />
                    <p className="font-bold text-[hsl(var(--text-primary))]">Gradebook Access (Math Grade 7)</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Module: Academics | Time: 08:14 AM</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[hsl(var(--bg-secondary))]" />
                    <p className="font-bold text-[hsl(var(--text-primary))]">Marks Entry Modified (Michael Chen: 68 &rarr; 74)</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Action: update | Reason: paper scripts re-count | Time: 08:14 AM</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retention Policies */}
          {activeTab === 'retention' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Data Retention Policies</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configure duration thresholds for stored audit event payloads. Platform boundaries override minimum settings.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                      <th className="py-2.5 px-2">Data / Log Type</th>
                      <th className="py-2.5 px-2">Configured Retention Duration</th>
                      <th className="py-2.5 px-2">Platform Minimum Enforced</th>
                      <th className="py-2.5 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionPolicies.map((p, idx) => (
                      <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                        <td className="py-3.5 px-2 font-bold text-[hsl(var(--text-primary))]">{p.type}</td>
                        <td className="py-3.5 px-2 text-[hsl(var(--text-secondary))]">{p.duration}</td>
                        <td className="py-3.5 px-2 text-[hsl(var(--text-tertiary))] font-mono">{p.platformMin}</td>
                        <td className="py-3.5 px-2 text-right text-emerald-400 font-semibold">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
