import React from 'react';
import { Plus, ChevronRight, Home, Hash } from 'lucide-react';
import { HIERARCHY_CONFIG } from '../config/hierarchy.config';
import { HierarchyType } from '../types/hierarchy';

interface HierarchyHeaderProps {
  currentView: HierarchyType;
  onAdd: () => void;
  totalCount?: number;
}

export function HierarchyHeader({ currentView, onAdd, totalCount }: HierarchyHeaderProps) {
  const config = HIERARCHY_CONFIG[currentView];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-6">
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[11px] text-[hsl(var(--text-tertiary))] mb-2 flex-wrap">
          <Home className="w-3 h-3" />
          <span>Tenant Management</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[hsl(var(--text-secondary))] font-semibold">{config.plural}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
            {config.plural}
          </h1>
          {totalCount !== undefined && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] text-[11px] font-bold text-[hsl(var(--text-secondary))]">
              <Hash className="w-3 h-3" />
              {totalCount.toLocaleString()}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] mt-1">
          {config.description}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.9)] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> {config.label}
        </button>
      </div>
    </div>
  );
}
