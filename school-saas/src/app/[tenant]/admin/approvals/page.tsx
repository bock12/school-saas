'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ClipboardList, CheckCircle2, XCircle, Clock, UserPlus, GraduationCap, DollarSign,
  CalendarCheck, Edit2, FileText, ChevronRight, Play, AlertOctagon, HelpCircle, Save,
  Search, Shield, Users, Layers, Brain, Zap, Link2, Download, History, Sparkles, Menu, Plus, Loader2
} from 'lucide-react';
import { resolveApprovalRequest, createApprovalRequest, getApprovalRequests } from '@/app/actions/approvals';

type WorkflowTab =
  | 'overview'
  | 'pending'
  | 'my-requests'
  | 'templates'
  | 'designer'
  | 'delegations'
  | 'escalations'
  | 'sla'
  | 'history'
  | 'analytics'
  | 'settings';

export default function ApprovalsPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<WorkflowTab>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Workflow Designer mock config states
  const [newWorkflowName, setNewWorkflowName] = useState('Admission Approval Process');
  const [approvalLevels, setApprovalLevels] = useState([
    { level: 1, role: 'Registrar Officer', timeLimit: '24 Hours', action: 'Verify Document Integrity' },
    { level: 2, role: 'Vice Principal Academics', timeLimit: '48 Hours', action: 'Approve Placement Grade' },
    { level: 3, role: 'Principal / School Director', timeLimit: '24 Hours', action: 'Sign Enrollment Certificate' }
  ]);

  // Delegations mock config states
  const [delegations, setDelegations] = useState([
    { delegatedFrom: 'Principal Patricia Osei', delegatedTo: 'VP Samuel Mensah', startDate: '2026-07-10', endDate: '2026-07-24', scope: 'All Academic & Leave Requests', status: 'Scheduled' }
  ]);

  // SLA Mock Data
  const slaMetrics = [
    { type: 'Student Admission Approval', target: '48 Hours', actual: '22 Hours', status: 'Compliant' },
    { type: 'Grade Modification Approval', target: '24 Hours', actual: '8 Hours', status: 'Compliant' },
    { type: 'Staff Leave Request', target: '48 Hours', actual: '52 Hours', status: 'SLA Exceeded' },
    { type: 'Consolidated Fee waiver', target: '72 Hours', actual: '36 Hours', status: 'Compliant' },
    { type: 'ICT Procurement Purchase', target: '5 Days', actual: '6.2 Days', status: 'SLA Exceeded' }
  ];

  // Real data from DB — loaded lazily when the pending tab is active
  const [dbRequests, setDbRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqType, setNewReqType] = useState('admission');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newReqSubmitting, setNewReqSubmitting] = useState(false);

  // Pending requests: use DB data if available, otherwise empty list
  const pendingRequests = dbRequests.filter(r => r.status === 'pending');

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    const res = await getApprovalRequests(tenant, []);
    if (res.data) setDbRequests(res.data);
    setLoadingRequests(false);
  }, [tenant]);

  useEffect(() => {
    if (activeTab === 'pending' || activeTab === 'my-requests' || activeTab === 'overview') {
      loadRequests();
    }
  }, [activeTab, loadRequests]);

  const handleSubmitNewRequest = async () => {
    if (!newReqTitle.trim()) return;
    setNewReqSubmitting(true);
    await createApprovalRequest(tenant, {
      title: newReqTitle.trim(),
      type: newReqType as any,
      priority: 'medium',
    });
    setNewReqTitle('');
    setShowNewForm(false);
    await loadRequests();
    setNewReqSubmitting(false);
    setSavedMessage('Request submitted successfully!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleAction = async (action: 'approved' | 'rejected', reqId: string) => {
    setSaving(true);
    setSavedMessage(null);
    const res = await resolveApprovalRequest(reqId, action);
    setSaving(false);
    if (res.success) {
      setSavedMessage(`Request has been successfully ${action}!`);
      loadRequests();
    } else {
      setSavedMessage(`Error: ${res.error}`);
    }
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const menuItems = [
    { id: 'overview', label: 'Workflow Dashboard', icon: ClipboardList },
    { id: 'pending', label: 'Pending Approvals Queue', icon: Clock },
    { id: 'my-requests', label: 'My Submitted Requests', icon: UserPlus },
    { id: 'templates', label: 'Workflow Templates', icon: Layers },
    { id: 'designer', label: 'Workflow Designer Builder', icon: Sparkles },
    { id: 'delegations', label: 'Temporary Delegations', icon: Users },
    { id: 'escalations', label: 'Escalation Rules', icon: Zap },
    { id: 'sla', label: 'SLA Monitoring Performance', icon: Link2 },
    { id: 'history', label: 'Workflow History Log', icon: History },
    { id: 'analytics', label: 'Rejection & SLA Analytics', icon: Download },
    { id: 'settings', label: 'Workflow General Settings', icon: Save }
  ];

  const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    admission: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Admissions' },
    grade_change: { icon: Edit2, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Academics' },
    leave: { icon: CalendarCheck, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Staff HR' },
    fee_discount: { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Finance' },
  };

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[hsl(var(--accent))]" />
            Workflow &amp; Approvals Engine
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Configure multi-level, conditional routing rules across Student Services, Academics, HR, and Finance modules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold shadow-glow">
            Pending Queue: {pendingRequests.length} Requests
          </span>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Desktop Horizontal Tabs */}
      <div className="hidden md:flex flex-wrap gap-2 pb-2 border-b border-[hsl(var(--border))] overflow-x-auto whitespace-nowrap scrollbar-none">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as WorkflowTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md shadow-[hsl(var(--accent)/0.15)]'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet Sticky Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] flex items-center justify-around py-2 px-4 shadow-2xl md:hidden">
        {menuItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as WorkflowTab);
              setShowMoreMenu(false);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-center transition-all ${
              activeTab === item.id && !showMoreMenu
                ? 'text-[hsl(var(--accent))] font-bold'
                : 'text-[hsl(var(--text-tertiary))]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMoreMenu(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-center transition-all ${
            showMoreMenu
              ? 'text-[hsl(var(--accent))] font-bold'
              : 'text-[hsl(var(--text-tertiary))]'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {!menuItems.slice(0, 4).map(i => i.id).includes(activeTab) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight">More</span>
        </button>
      </div>

      {/* Bottom Sheet Backdrop & Panel for Mobile */}
      {showMoreMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="fixed bottom-14 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto md:hidden animate-slide-up">
            <div className="flex justify-between items-center pb-3 border-b border-[hsl(var(--border))] mb-3">
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Workflow Menu</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as WorkflowTab);
                    setShowMoreMenu(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] font-bold'
                      : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Configurations Container */}
      <div className="pb-20 md:pb-0">
        {/* Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Pending Approvals', value: '12 Requests', sub: '3 High Priority', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Approved Today', value: '18 Actions', sub: 'Admissions & Leaves', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Rejected Today', value: '2 Requests', sub: 'Budget limits exceeded', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                { label: 'Overdue Requests', value: '2 Overdue', sub: 'Staff leave review delayed', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                { label: 'Average Approval Time', value: '18.4 Hours', sub: 'SLA target: 48 Hours', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                { label: 'Escalated Requests', value: '1 Active', sub: 'Escalated to principal', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                { label: 'Delegated Requests', value: '1 Active', sub: 'Principal delegating to VP', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Workflow Success Rate', value: '94.2%', sub: 'SLA compliant closures', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' }
              ].map(card => (
                <div key={card.label} className={`glass-card p-4 border flex flex-col justify-between ${card.bg}`}>
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block mb-2">{card.label}</span>
                  <div>
                    <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">{card.value}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4">
              <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Quick Engine Actions</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setActiveTab('pending')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Review Pending Queue</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Open awaiting review inbox list</p>
                </button>
                <button onClick={() => setActiveTab('designer')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Create Workflow Template</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Open visual designer drag steps</p>
                </button>
                <button onClick={() => setActiveTab('delegations')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Delegate Authority Proxy</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Assign Vice Principal delegation</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals Queue */}
        {activeTab === 'pending' && (
          <div className="space-y-4 animate-fade-in">
            {pendingRequests.map(req => {
              const typeCfg = typeConfig[req.type] || { icon: ClipboardList, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Generic' };
              const Icon = typeCfg.icon;
              return (
                <div key={req.id} className="glass-card p-5 border border-[hsl(var(--border))] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeCfg.bg}`}>
                        <Icon className={`w-5 h-5 ${typeCfg.color}`} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{req.title}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 uppercase`}>{req.priority}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] font-semibold rounded">{req.id}</span>
                        </div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">
                          Submitted: {req.date} | Target due: <strong className="text-[hsl(var(--text-secondary))]">{req.due}</strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">{req.stage}</span>
                  </div>

                  <p className="text-xs text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-tertiary)/0.3)] p-3 rounded-lg border border-[hsl(var(--border))] leading-relaxed">
                    {req.details}
                  </p>

                  <div className="flex justify-between items-center flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))/0.4]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Requested by: <strong>{req.requester}</strong></span>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction('approved', req.id)} className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">Approve Request</button>
                      <button onClick={() => handleAction('rejected', req.id)} className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">Reject</button>
                      <button onClick={() => handleAction('rejected', req.id)} className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border))]">Return</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Workflow Templates */}
        {activeTab === 'templates' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Workflow Templates Definition</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configured reusable approval blueprints mapped globally across modules.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Admissions Workflow blueprint', desc: 'Registrar (Level 1) -> Vice Principal Academics (Level 2) -> Principal sign-off (Level 3).' },
                { title: 'Gradebook Modification moderation', desc: 'Subject HOD approval (Level 1) -> Vice Principal Academics override sign (Level 2).' },
                { title: 'Consolidated Fee waiver approval', desc: 'Accountant verification (Level 1) -> Bursar review (Level 2) -> Principal waiver (Level 3).' },
                { title: 'Staff Annual Leave requests', desc: 'Line Manager approval (Level 1) -> HR Officer verification (Level 2).' }
              ].map((tmpl, idx) => (
                <div key={idx} className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))] flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{tmpl.title}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 leading-relaxed">{tmpl.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setActiveTab('designer'); setNewWorkflowName(tmpl.title); }} className="text-[10px] px-3 py-1 bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] rounded font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">Edit Levels Mapping</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Designer */}
        {activeTab === 'designer' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Multi-Level Workflow Designer</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configure step hierarchies, time limits, and conditional routing parameters.</p>
              </div>
              <button onClick={() => {
                const newLevel = { level: approvalLevels.length + 1, role: 'New Approver Role', timeLimit: '24 Hours', action: 'Verify details' };
                setApprovalLevels([...approvalLevels, newLevel]);
              }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" /> Append Approval Stage
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Workflow Name *</label>
                <input type="text" value={newWorkflowName} onChange={e => setNewWorkflowName(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
              </div>

              {/* Steps Timeline Visual */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider">Approval Level Sequence</p>
                <div className="relative pl-6 space-y-6 border-l-2 border-[hsl(var(--border))] text-xs">
                  {approvalLevels.map((lvl, idx) => (
                    <div key={idx} className="relative bg-[hsl(var(--bg-tertiary)/0.3)] border border-[hsl(var(--border))] p-4 rounded-xl space-y-3">
                      <span className="absolute -left-[32px] top-4 w-4.5 h-4.5 rounded-full bg-[hsl(var(--accent))] border-2 border-[hsl(var(--bg-secondary))] flex items-center justify-center text-white text-[9px] font-bold">{lvl.level}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Assigned Approver Role</label>
                          <input type="text" value={lvl.role} onChange={e => {
                            const copy = [...approvalLevels];
                            copy[idx].role = e.target.value;
                            setApprovalLevels(copy);
                          }} className="w-full h-8 px-2 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Time Limit (SLA Target)</label>
                          <input type="text" value={lvl.timeLimit} onChange={e => {
                            const copy = [...approvalLevels];
                            copy[idx].timeLimit = e.target.value;
                            setApprovalLevels(copy);
                          }} className="w-full h-8 px-2 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Action Description Required</label>
                          <input type="text" value={lvl.action} onChange={e => {
                            const copy = [...approvalLevels];
                            copy[idx].action = e.target.value;
                            setApprovalLevels(copy);
                          }} className="w-full h-8 px-2 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => {
                          setApprovalLevels(approvalLevels.filter((_, i) => i !== idx));
                        }} className="text-[9px] text-rose-400 font-bold hover:underline">Delete Stage</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditional Routing Rules */}
              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3 pt-3">
                <span className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider block">Rule-Based Conditional Overrides (Conditional Workflows)</span>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))]">Establish thresholds routing logic bypassing intermediate approval levels where appropriate.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[9px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Parameter Field</label>
                    <select className="w-full h-8 px-2 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                      <option>Discount Percentage waiver</option>
                      <option>Purchase Request Amount limit</option>
                      <option>Leave Request Duration days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Routing Condition Criteria</label>
                    <select className="w-full h-8 px-2 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                      <option>Amount exceeds ₦100,000 threshold</option>
                      <option>Waiver percentage exceeds 10%</option>
                      <option>Bypass level 2 if duration &lt; 3 days</option>
                    </select>
                  </div>
                  <button onClick={() => alert('Routing override rule compiled.')} className="h-8 px-4 bg-[hsl(var(--accent))] text-white rounded text-xs font-bold hover:opacity-90 transition-opacity">Add Condition Rule</button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
              <button onClick={() => handleAction('approved', newWorkflowName)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                <Save className="w-4 h-4" /> Save Sequence blueprint
              </button>
            </div>
          </div>
        )}

        {/* Delegations */}
        {activeTab === 'delegations' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Proxy Delegations Management</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Delegate approvals authority temporarily during leaves, travel, or temporary absences.</p>
              </div>
              <button onClick={() => {
                const newD = { delegatedFrom: 'VP Samuel Mensah', delegatedTo: 'HOD Kofi Owusu', startDate: '2026-08-01', endDate: '2026-08-15', scope: 'Marks Moderation & Timetable swap approvals', status: 'Scheduled' };
                setDelegations([...delegations, newD]);
              }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" /> Map Proxy Delegate
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Delegated From</th>
                    <th className="py-2.5 px-2">Delegated To (Proxy)</th>
                    <th className="py-2.5 px-2">Duration (Dates)</th>
                    <th className="py-2.5 px-2">Clearance Scope</th>
                    <th className="py-2.5 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {delegations.map((d, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{d.delegatedFrom}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{d.delegatedTo}</td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-tertiary))]">{d.startDate} &rarr; {d.endDate}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{d.scope}</td>
                      <td className="py-3 px-2 text-right text-indigo-400 font-semibold">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLA Monitoring */}
        {activeTab === 'sla' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">SLA Monitoring Console</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Independent monitoring of approval process delays and bottleneck workloads.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Workflow / Process Type</th>
                    <th className="py-2.5 px-2">Target SLA Limit</th>
                    <th className="py-2.5 px-2">Actual turnaround time</th>
                    <th className="py-2.5 px-2 text-right">Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slaMetrics.map((sla, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3.5 px-2 font-bold text-[hsl(var(--text-primary))]">{sla.type}</td>
                      <td className="py-3.5 px-2 text-[hsl(var(--text-secondary))]">{sla.target}</td>
                      <td className="py-3.5 px-2 text-[hsl(var(--text-tertiary))] font-mono">{sla.actual}</td>
                      <td className="py-3.5 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${sla.status === 'Compliant' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{sla.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
