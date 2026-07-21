'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Users, CalendarCheck,
  BarChart3, User, Heart, Shield, DollarSign, FileText, CheckCircle2, ChevronRight, MessageSquare, Briefcase
} from 'lucide-react';





const messagesLogs = [
  { date: 'Jul 3, 2026', type: 'Email', subject: 'Grade 10 Report Card Dispatched', body: 'Sent end of term grades to parent email portal.' },
  { date: 'Jul 1, 2026', type: 'SMS', subject: 'Late Check-in Notification', body: 'Sarah Smith arrived late to morning registration.' },
  { date: 'Jun 12, 2026', type: 'Meeting', subject: 'Parent-Teacher Consultations', body: 'Discussion on Davids performance improvement.' }
];

const ledgerTransactions = [
  { date: 'Jun 10, 2026', desc: 'Paid Term 1 Tuition - Sarah Smith', amount: 1800, method: 'Paystack Card' },
  { date: 'Sep 01, 2025', desc: 'Paid Reg Fees - David Smith', amount: 1200, method: 'Bank Transfer' }
];

const staffDocs = [
  { name: 'Parent Identification Card.pdf', category: 'ID Card', date: 'Jul 15, 2025', size: '1.1 MB' },
  { name: 'Financial Tuition Agreement Signed.pdf', category: 'Finance Agreement', date: 'Sep 01, 2025', size: '2.4 MB' }
];

export function ParentDetailClient({ tenant, parent, linkedChildren }: { tenant: string, parent: any, linkedChildren: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: BookOpen },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'communication', label: 'Communication Center', icon: MessageSquare },
    { id: 'finance', label: 'Finance & Tuition', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-indigo-400 text-2xl font-bold flex-shrink-0">
            {parent.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">{parent.name}</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                PORTAL: {parent.portalStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
              Parent ID: <code className="font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{parent.id.split('-')[0]}</code>
              <span className="mx-2">•</span> Occupation: {parent.occupation || 'N/A'}
            </p>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Contact: {parent.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-[hsl(var(--border))]">
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Outstanding Balance</p>
            <p className="text-lg font-bold text-amber-400">${parent.outstanding_balance || 0}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Contact Method</p>
            <p className="text-lg font-bold text-[hsl(var(--accent))]">{parent.prefContact || 'Email'}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Linked Children</p>
            <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{linkedChildren.length} students</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="glass-card p-1 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 animate-fade-in">
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Overview Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Employer Company</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.employer}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Preferred contact</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.prefContact}</p>
                  </div>
                </div>
              </div>

              {/* Children */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))] mb-4 font-semibold">Linked Children</h3>
                <div className="space-y-3">
                  {linkedChildren.map((child, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)]">
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{child.name}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">{child.grade} • {child.stream}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{child.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline communications logs */}
            <div className="glass-card p-5 space-y-4 animate-fade-in">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Recent Message logs</h3>
              <div className="space-y-6 relative pl-4 border-l border-[hsl(var(--border))] ml-2 mt-4">
                {messagesLogs.map((ev, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute w-2 h-2 rounded-full bg-[hsl(var(--accent))] -left-[21px] top-1.5" />
                    <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">{ev.subject}</h4>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">{ev.date} • {ev.type}</span>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 leading-relaxed">{ev.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL INFO TAB */}
        {activeTab === 'personal' && (
          <div className="glass-card p-5 max-w-4xl animate-fade-in space-y-6">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Full Legal Name</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.name}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Gender</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.gender.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Date of Birth</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.dob}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Nationality</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.nationality}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Identification Number</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.idNumber}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Preferred Language</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.language}</p>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT INFORMATION TAB */}
        {activeTab === 'contact' && (
          <div className="glass-card p-5 max-w-4xl animate-fade-in space-y-6">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Mobile Number</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.phone}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Work Phone Number</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.work_phone}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Primary Email</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.email}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Home Address</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.address}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Work Address</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{parent.work_address}</p>
              </div>
            </div>
          </div>
        )}

        {/* LINKED CHILDREN TAB */}
        {activeTab === 'children' && (
          <div className="glass-card p-5 animate-fade-in space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Assigned Sibling Group</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {linkedChildren.map((child, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{child.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{child.grade} • {child.stream}</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">{child.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMUNICATIONS TAB */}
        {activeTab === 'communication' && (
          <div className="glass-card p-5 animate-fade-in space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Communication Ledger Logs</h3>
            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {messagesLogs.map((log, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{log.subject}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{log.body}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">{log.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Fee Statement Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Outstanding Balance</span>
                  <span className="text-lg font-bold text-amber-400">${parent.outstanding_balance}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Transaction Ledger</h3>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {ledgerTransactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{tx.desc}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{tx.date} • {tx.method}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">${tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="glass-card p-5 animate-fade-in space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Digital Consent Documents Archive</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staffDocs.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{doc.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{doc.category} • {doc.size}</p>
                  </div>
                  <button className="text-xs text-[hsl(var(--accent))] hover:underline flex-shrink-0">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
