'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox, Search, Filter, RefreshCw, UserPlus, CheckCircle2, Clock,
  Calendar, Phone, Mail, MapPin, Building2, School, AlertCircle,
  ChevronRight, MoreVertical, Edit3, Trash2, Check, ExternalLink,
  MessageSquare, UserCheck, Shield, Sparkles, ArrowUpRight
} from 'lucide-react';

interface Lead {
  id: string;
  contact_name: string;
  email: string;
  institution_name: string;
  institution_type: string;
  phone: string | null;
  region: string | null;
  estimated_students: number | null;
  requirements: string | null;
  status: 'pending' | 'contacted' | 'scheduled' | 'provisioned' | 'archived';
  scheduled_at: string | null;
  notes: string | null;
  provisioned_tenant_id: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  created_at: string;
  updated_at: string;
}

export default function LeadsManagementPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, provisioned: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/super-admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      const res = await fetch('/api/super-admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setActionSuccess('Status updated successfully');
        setTimeout(() => setActionSuccess(null), 3000);
        fetchLeads();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const res = await fetch('/api/super-admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: editingNotes }),
      });
      if (res.ok) {
        setSelectedLead(null);
        fetchLeads();
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to remove this inquiry record?')) return;
    try {
      const res = await fetch(`/api/super-admin/leads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  // Launch Provisioning Wizard pre-filled with this school's details
  const handleProvisionLead = (lead: Lead) => {
    const params = new URLSearchParams({
      name: lead.institution_name,
      email: lead.email,
      contactName: lead.contact_name,
      type: lead.institution_type === 'organization' ? 'multi' : 'standalone',
      region: lead.region || '',
      leadId: lead.id,
    });
    router.push(`/super-admin/tenants/provisioning?${params.toString()}`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Inbox className="w-3.5 h-3.5" /> Institutional Inquiries &amp; Leads
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
            Onboarding &amp; Demonstration Requests
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] mt-1">
            Review incoming school inquiries, schedule discovery sessions, and provision new tenant environments in one click.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Metric Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-1">
          <p className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">{stats.total}</p>
          <p className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Total Inquiries</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">All received requests</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-1">
          <p className="text-2xl sm:text-3xl font-black text-amber-400">{stats.pending}</p>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Triage</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Requires consultant action</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-1">
          <p className="text-2xl sm:text-3xl font-black text-blue-400">{stats.in_progress}</p>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Contacted / Scheduled</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Discovery underway</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-1">
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.provisioned}</p>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Provisioned Tenants</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Active school environments</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[hsl(var(--bg-secondary))] p-3.5 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: 'Pending' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'provisioned', label: 'Provisioned' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search school, email, contact..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </form>
      </div>

      {/* ── Leads List / Table ─────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-[hsl(var(--border))] animate-pulse space-y-3">
              <div className="h-4 bg-[hsl(var(--bg-tertiary))] rounded w-1/3" />
              <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-[hsl(var(--border))] space-y-3">
          <Inbox className="w-14 h-14 text-[hsl(var(--text-tertiary))] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">No inquiry requests found</h3>
          <p className="text-xs text-[hsl(var(--text-secondary))] max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? `No requests currently marked as "${statusFilter}".`
              : 'New demonstration requests submitted from the global landing page will automatically appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map(lead => {
            const isProvisioned = lead.status === 'provisioned';
            const isPending = lead.status === 'pending';

            return (
              <div
                key={lead.id}
                className="glass-card p-6 rounded-3xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] transition-all space-y-4 bg-[hsl(var(--bg-secondary)/0.5)]"
              >
                {/* Top Row: Institution + Badges + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                      lead.institution_type === 'organization'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {lead.institution_type === 'organization' ? <Building2 className="w-5 h-5" /> : <School className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))]">
                          {lead.institution_name}
                        </h3>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          lead.status === 'provisioned'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : lead.status === 'scheduled'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : lead.status === 'contacted'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          ● {lead.status}
                        </span>

                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
                          {new Date(lead.created_at).toLocaleDateString()} at {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 font-medium">
                        Contact: <strong className="text-[hsl(var(--text-primary))]">{lead.contact_name}</strong> &middot; Type: <span className="capitalize">{lead.institution_type}</span>
                        {lead.estimated_students && <span> &middot; Est. Students: <strong>{lead.estimated_students}</strong></span>}
                      </p>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {isProvisioned ? (
                      <a
                        href={lead.tenant_slug ? `/${lead.tenant_slug}/admin` : `/super-admin/tenants/directory`}
                        className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tenant Active {lead.tenant_slug && `(${lead.tenant_slug})`}
                      </a>
                    ) : (
                      <button
                        onClick={() => handleProvisionLead(lead)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[hsl(var(--accent)/0.25)] hover:opacity-95 hover:scale-[1.02] transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Provision School Tenant
                      </button>
                    )}

                    {/* Quick Status Dropdown */}
                    <select
                      value={lead.status}
                      disabled={updatingStatus === lead.id}
                      onChange={e => handleUpdateStatus(lead.id, e.target.value)}
                      className="h-9 px-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
                    >
                      <option value="pending">Mark Pending</option>
                      <option value="contacted">Mark Contacted</option>
                      <option value="scheduled">Mark Scheduled</option>
                      <option value="provisioned">Mark Provisioned</option>
                      <option value="archived">Mark Archived</option>
                    </select>

                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setEditingNotes(lead.notes || '');
                      }}
                      className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      title="Add / View Notes"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle Row: Contact Coordinates & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0" />
                    <a href={`mailto:${lead.email}`} className="hover:text-[hsl(var(--accent))] transition-colors truncate">
                      {lead.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0" />
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="hover:text-[hsl(var(--accent))] transition-colors truncate">
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-[hsl(var(--text-tertiary))]">No phone provided</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0" />
                    <span>{lead.region || 'Sierra Leone / National'}</span>
                  </div>
                </div>

                {/* Requirements & Notes */}
                {lead.requirements && (
                  <div className="text-xs text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-tertiary)/0.4)] p-3 rounded-xl border border-[hsl(var(--border)/0.5)]">
                    <strong className="text-[hsl(var(--text-primary))] font-bold">Requirements / Inquiry: </strong>
                    <span>{lead.requirements}</span>
                  </div>
                )}

                {lead.notes && (
                  <div className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Internal Super Admin Note: </strong>
                      <span>{lead.notes}</span>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ── Notes Editor Modal ────────────────────────────────────── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 border border-[hsl(var(--border))] space-y-4 shadow-2xl bg-[hsl(var(--bg-secondary))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">
                Internal Notes for {selectedLead.institution_name}
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={4}
              value={editingNotes}
              onChange={e => setEditingNotes(e.target.value)}
              placeholder="Add discovery meeting notes, consultant follow-up dates, custom pricing agreements..."
              className="w-full p-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveNotes(selectedLead.id)}
                className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-black shadow-md hover:opacity-95"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
