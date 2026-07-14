'use client';
import React from 'react';
import { TenantNode } from '../types/hierarchy';
import { TreeNode } from './TreeNode';
import { STATUS_MAP } from '../constants/hierarchy.constants';
import { HIERARCHY_CONFIG } from '../config/hierarchy.config';
import {
  Building2, School, Users, HardDrive, GraduationCap,
  Settings, Eye, Ban, ExternalLink, RefreshCw, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAN_STYLES: Record<string, string> = {
  enterprise: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20',
  pro:        'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  starter:    'bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20',
  trial:      'bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20',
};

// Count total schools in the tree
function countSchools(node: TenantNode): number {
  if (node.type === 'school') return 1;
  return (node.children ?? []).reduce((acc, child) => acc + countSchools(child), 0);
}

interface OrgTreeProps {
  org: TenantNode | null;
  isLoading: boolean;
  onNodeSelect: (node: TenantNode) => void;
  selectedNodeId?: string;
  onBack?: () => void;
  onAddChild?: (parentNode: TenantNode) => void;
}

export function OrgTree({ org, isLoading, onNodeSelect, selectedNodeId, onBack, onAddChild }: OrgTreeProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-3 animate-pulse">
        <div className="h-24 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-7 rounded-lg bg-[hsl(var(--bg-tertiary)/0.3)]" style={{ marginLeft: `${(i % 4) * 16}px` }} />
        ))}
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <Building2 className="w-12 h-12 text-[hsl(var(--text-tertiary))] mb-4 opacity-40" />
        <h3 className="text-sm font-bold text-[hsl(var(--text-secondary))]">Select an organization</h3>
        <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 max-w-xs">
          Choose an organization from the list to view its full hierarchy tree.
        </p>
      </div>
    );
  }

  const statusConfig = STATUS_MAP[org.status];
  const planStyle = PLAN_STYLES[org.plan ?? 'starter'];
  const schoolCount = countSchools(org);
  const isStandalone = org.isStandaloneSchool;

  return (
    <div className="flex flex-col h-full">
      {/* Mobile back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] border-b border-[hsl(var(--border))] flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to organizations
        </button>
      )}

      {/* Org header card */}
      <div className="flex-shrink-0 m-4 mb-3 p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
            isStandalone ? 'bg-teal-500/10' : 'bg-[hsl(var(--accent)/0.1)]'
          )}>
            {isStandalone
              ? <School className="w-5 h-5 text-teal-500" />
              : <Building2 className="w-5 h-5 text-[hsl(var(--accent))]" />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black text-[hsl(var(--text-primary))] truncate">
                {org.name}
              </h2>
              {isStandalone && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-teal-500/10 text-teal-500 ring-1 ring-teal-500/20">
                  Standalone School
                </span>
              )}
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {org.plan && (
                <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded capitalize', planStyle)}>
                  {org.plan}
                </span>
              )}
              <span className={cn('flex items-center gap-1 text-[10px] font-semibold', statusConfig.textColor)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dot)} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1">
            {onAddChild && !isStandalone && (
              <button 
                onClick={() => onAddChild(org)}
                className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-teal-400 hover:bg-teal-500/10 transition-colors" 
                title="Add School/Group"
              >
                <School className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => onNodeSelect(org)}
              className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.1)] transition-colors" 
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNodeSelect(org)}
              className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors" 
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[hsl(var(--border))] text-[11px] text-[hsl(var(--text-tertiary))]">
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
            {schoolCount} school{schoolCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {org.usersCount.toLocaleString()} staff
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5" />
            {org.storageUsed} GB
          </span>
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 mb-1.5 flex-shrink-0">
        <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
          {isStandalone ? 'School Structure' : 'Organizational Hierarchy'}
        </p>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {!org.children || org.children.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <RefreshCw className="w-6 h-6 text-[hsl(var(--text-tertiary))] mb-2 opacity-40" />
            <p className="text-xs text-[hsl(var(--text-tertiary))]">No child nodes found.</p>
          </div>
        ) : (
          org.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={0}
              onSelect={onNodeSelect}
              selectedId={selectedNodeId}
              onAddChild={onAddChild}
            />
          ))
        )}
      </div>

      {/* Danger footer */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] text-[11px] font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> View Logs
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-500/20 bg-red-500/5 text-[11px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
            <Ban className="w-3.5 h-3.5" /> Suspend
          </button>
        </div>
      </div>
    </div>
  );
}
