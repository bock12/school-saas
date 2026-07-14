'use client';
import React from 'react';
import { TenantNode } from '../types/hierarchy';
import { STATUS_MAP } from '../constants/hierarchy.constants';
import { Building2, GraduationCap, Users, HardDrive, Plus, School } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAN_STYLES: Record<string, string> = {
  enterprise: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
  pro: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  starter: 'bg-teal-500/10 text-teal-400 ring-teal-500/20',
  trial: 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20',
};

interface OrgListProps {
  orgs: TenantNode[];
  isLoading: boolean;
  selectedId?: string;
  onSelect: (org: TenantNode) => void;
  onAdd: () => void;
}

export function OrgList({ orgs, isLoading, selectedId, onSelect, onAdd }: OrgListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] flex-shrink-0">
        <div>
          <h2 className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider">
            Organizations
          </h2>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">
            {isLoading ? '...' : `${orgs.length} tenants`}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.9)] text-white text-[11px] font-bold transition-colors shadow-sm"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-[76px] rounded-xl border border-[hsl(var(--border))] animate-pulse bg-[hsl(var(--bg-tertiary)/0.3)]" />
          ))
        ) : orgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Building2 className="w-8 h-8 text-[hsl(var(--text-tertiary))] mb-3" />
            <p className="text-sm font-semibold text-[hsl(var(--text-secondary))]">No organizations yet</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Click "New" to provision your first tenant.</p>
          </div>
        ) : (
          orgs.map(org => <OrgCard key={org.id} org={org} isSelected={org.id === selectedId} onSelect={onSelect} />)
        )}
      </div>
    </div>
  );
}

function OrgCard({ org, isSelected, onSelect }: { org: TenantNode; isSelected: boolean; onSelect: (o: TenantNode) => void }) {
  const statusConfig = STATUS_MAP[org.status];
  const planStyle = PLAN_STYLES[org.plan ?? 'starter'];

  return (
    <button
      onClick={() => onSelect(org)}
      className={cn(
        'w-full text-left p-3 rounded-xl border transition-all duration-150 group',
        isSelected
          ? 'border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.08)] shadow-sm'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--bg-tertiary))]'
      )}
    >
      {/* Top row: icon + name + status */}
      <div className="flex items-start gap-2.5">
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5',
          org.isStandaloneSchool ? 'bg-teal-500/10' : 'bg-[hsl(var(--bg-elevated))]'
        )}>
          {org.isStandaloneSchool
            ? <School className="w-4 h-4 text-teal-500" />
            : <Building2 className={cn('w-4 h-4', isSelected ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-secondary))]')} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-xs font-bold truncate leading-tight',
            isSelected ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-primary))]'
          )}>
            {org.name}
          </p>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {org.isStandaloneSchool && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-teal-500/10 text-teal-500 ring-1 ring-teal-500/20">
                Standalone
              </span>
            )}
            {org.plan && (
              <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded ring-1 capitalize', planStyle)}>
                {org.plan}
              </span>
            )}
            <span className={cn('flex items-center gap-0.5 text-[9px] font-semibold', statusConfig.textColor ?? 'text-[hsl(var(--text-tertiary))]')}>
              <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dot ?? 'bg-gray-400')} />
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: metrics */}
      <div className="flex items-center gap-3 mt-2.5 text-[10px] text-[hsl(var(--text-tertiary))]">
        <span className="flex items-center gap-1">
          <GraduationCap className="w-3 h-3" /> {org.childrenCount} school{org.childrenCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {org.usersCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <HardDrive className="w-3 h-3" /> {org.storageUsed} GB
        </span>
      </div>
    </button>
  );
}
