import React from 'react';
import { X, Building2, Users, HardDrive, CreditCard, Clock, Activity, Settings, Eye, Ban, ExternalLink } from 'lucide-react';
import { TenantNode } from '../types/hierarchy';
import { STATUS_MAP } from '../constants/hierarchy.constants';
import { format } from 'date-fns';

interface DetailsDrawerProps {
  node: TenantNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailsDrawer({ node, isOpen, onClose }: DetailsDrawerProps) {
  if (!node) return null;

  const statusConfig = STATUS_MAP[node.status];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* === Desktop side drawer (right) === */}
      <div
        className={`hidden md:flex fixed inset-y-0 right-0 w-[480px] lg:w-[540px] flex-col bg-[hsl(var(--bg-secondary))] shadow-2xl border-l border-[hsl(var(--border))] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <DrawerContent node={node} statusConfig={statusConfig} onClose={onClose} />
      </div>

      {/* === Mobile bottom sheet === */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[hsl(var(--bg-secondary))] rounded-t-2xl shadow-2xl border-t border-[hsl(var(--border))] transform transition-transform duration-300 ease-in-out max-h-[90vh] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-12 h-1 rounded-full bg-[hsl(var(--border-hover))]" />
        </div>
        <DrawerContent node={node} statusConfig={statusConfig} onClose={onClose} />
      </div>
    </>
  );
}

interface DrawerContentProps {
  node: TenantNode;
  statusConfig: { color: string; label: string };
  onClose: () => void;
}

function DrawerContent({ node, statusConfig, onClose }: DrawerContentProps) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-[hsl(var(--border))] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[hsl(var(--text-primary))] leading-tight">
              {node.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[hsl(var(--text-tertiary))] capitalize">{node.type}</span>
              <span className="text-[hsl(var(--border-hover))]">·</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        {/* ID + Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[hsl(var(--bg-tertiary))] p-3.5 rounded-xl border border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 text-[hsl(var(--text-tertiary))] mb-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Created</span>
            </div>
            <div className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              {format(new Date(node.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
          <div className="bg-[hsl(var(--bg-tertiary))] p-3.5 rounded-xl border border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 text-[hsl(var(--text-tertiary))] mb-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Last Login</span>
            </div>
            <div className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              {node.lastLoginAt ? format(new Date(node.lastLoginAt), 'MMM d, yyyy') : '—'}
            </div>
          </div>
        </div>

        {/* Usage Metrics */}
        <div>
          <h3 className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">
            Usage Metrics
          </h3>
          <div className="space-y-2.5">
            {[
              { icon: Users, label: 'Active Users', sub: 'Staff and students', value: (node.usersCount + node.studentsCount).toLocaleString(), color: 'text-blue-500 bg-blue-500/10' },
              { icon: HardDrive, label: 'Storage Used', sub: 'Documents and media', value: `${node.storageUsed} GB`, color: 'text-purple-500 bg-purple-500/10' },
              { icon: CreditCard, label: 'Subscription', sub: 'Current active plan', value: 'Enterprise', color: 'text-green-500 bg-green-500/10' },
            ].map(item => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3.5 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl hover:border-[hsl(var(--border-hover))] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{item.label}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{item.sub}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[hsl(var(--text-primary))]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h3 className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">
            Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Eye, label: 'View Tenant', color: 'text-[hsl(var(--accent))]' },
              { icon: ExternalLink, label: 'View Logs', color: 'text-[hsl(var(--text-secondary))]' },
              { icon: Settings, label: 'Edit Config', color: 'text-[hsl(var(--text-secondary))]' },
              { icon: Users, label: 'Impersonate', color: 'text-orange-500' },
            ].map(action => (
              <button
                key={action.label}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors text-xs font-semibold ${action.color}`}
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danger footer */}
      <div className="p-5 border-t border-[hsl(var(--border))] flex-shrink-0">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-red-500/30 bg-red-500/5 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500/10 transition-colors">
          <Ban className="w-4 h-4" />
          Suspend Account
        </button>
      </div>
    </div>
  );
}
