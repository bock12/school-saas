'use client';
import React, { useState } from 'react';
import { TenantNode } from '../types/hierarchy';
import { HIERARCHY_CONFIG } from '../config/hierarchy.config';
import { STATUS_MAP } from '../constants/hierarchy.constants';
import {
  ChevronRight, ChevronDown, Plus, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TreeNodeProps {
  node: TenantNode;
  depth?: number;
  onSelect: (node: TenantNode) => void;
  selectedId?: string;
  onAddChild?: (parentNode: TenantNode) => void;
}

const INDENT_PX = 20;

const DEPTH_LINE_COLORS = [
  'border-indigo-400/30',
  'border-purple-400/30',
  'border-blue-400/30',
  'border-teal-400/30',
  'border-green-400/30',
];

export function TreeNode({ node, depth = 0, onSelect, selectedId, onAddChild }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const config = HIERARCHY_CONFIG[node.type];
  const statusConfig = STATUS_MAP[node.status];
  const isSelected = node.id === selectedId;
  const Icon = node.type === 'school' && node.isStandaloneSchool
    ? GraduationCap
    : config.icon;

  const lineColor = DEPTH_LINE_COLORS[Math.min(depth, DEPTH_LINE_COLORS.length - 1)];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Node row */}
      <div
        style={{ paddingLeft: `${depth * INDENT_PX}px` }}
        className={cn(
          'relative flex items-center gap-2 py-1.5 pr-2 rounded-lg cursor-pointer transition-colors group',
          isSelected
            ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]'
            : 'hover:bg-[hsl(var(--bg-tertiary))]'
        )}
        onClick={() => onSelect(node)}
      >
        {/* Vertical depth guide line */}
        {depth > 0 && (
          <div
            className={cn('absolute left-0 top-0 bottom-0 border-l', lineColor)}
            style={{ left: `${(depth - 1) * INDENT_PX + 10}px` }}
          />
        )}

        {/* Expand toggle */}
        <button
          onClick={handleToggle}
          className={cn(
            'flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors',
            hasChildren
              ? 'hover:bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-tertiary))]'
              : 'invisible'
          )}
        >
          {hasChildren && (
            isOpen
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Type icon */}
        <div className={cn(
          'flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center',
          isSelected ? 'bg-[hsl(var(--accent)/0.15)]' : 'bg-[hsl(var(--bg-elevated))]'
        )}>
          <Icon className={cn('w-3.5 h-3.5', isSelected ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-secondary))]')} />
        </div>

        {/* Name */}
        <span className={cn(
          'flex-1 text-xs font-semibold truncate',
          isSelected ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-primary))]'
        )}>
          {node.name}
        </span>

        {/* Status dot + inline Add Child */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', statusConfig.dot ?? 'bg-gray-400')}
            title={statusConfig.label}
          />
          {/* ➕ Add child — appears on hover, hidden for campus (leaf node) */}
          {node.type !== 'campus' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild?.(node);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.1)] transition-all"
              title={`Add child to ${node.name}`}
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {isOpen && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
