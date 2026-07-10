'use client';
import React, { useState } from 'react';
import { Search, Filter, Download, X, ChevronDown } from 'lucide-react';
import { TenantStatus, HierarchyType } from '../types/hierarchy';

interface HierarchyToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currentType: HierarchyType;
  onTypeChange: (type: HierarchyType) => void;
  statusFilter?: TenantStatus;
  onStatusChange: (status?: TenantStatus) => void;
}

const typeOptions: { value: HierarchyType; label: string }[] = [
  { value: 'organization', label: 'Organizations' },
  { value: 'group',        label: 'Groups' },
  { value: 'district',     label: 'Districts' },
  { value: 'school',       label: 'Schools' },
  { value: 'campus',       label: 'Campuses' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'provisioning', label: 'Provisioning' },
  { value: 'suspended', label: 'Suspended' },
];

export function HierarchyToolbar({
  searchQuery,
  onSearchChange,
  currentType,
  onTypeChange,
  statusFilter,
  onStatusChange
}: HierarchyToolbarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount = [statusFilter].filter(Boolean).length;

  const filterBar = (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Type selector */}
      <div className="relative">
        <select
          value={currentType}
          onChange={(e) => onTypeChange(e.target.value as HierarchyType)}
          className="appearance-none h-9 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg pl-3 pr-8 text-xs font-medium text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.4)] transition-colors hover:border-[hsl(var(--border-hover))]"
        >
          {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--text-tertiary))]" />
      </div>

      {/* Status selector */}
      <div className="relative">
        <select
          value={statusFilter || ''}
          onChange={(e) => onStatusChange(e.target.value ? (e.target.value as TenantStatus) : undefined)}
          className="appearance-none h-9 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg pl-3 pr-8 text-xs font-medium text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.4)] transition-colors hover:border-[hsl(var(--border-hover))]"
        >
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--text-tertiary))]" />
      </div>

      {/* Export */}
      <button className="h-9 w-9 flex items-center justify-center border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
        <Download className="w-4 h-4" />
      </button>

      {/* Active filter clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={() => onStatusChange(undefined)}
          className="flex items-center gap-1 h-9 px-2.5 rounded-lg bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] text-[11px] font-bold"
        >
          <X className="w-3 h-3" /> Clear ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="mb-5">
      {/* Search + mobile filter toggle */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full h-9 pl-9 pr-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-xs text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.4)] transition-colors"
          />
        </div>

        {/* Mobile: filter button */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="sm:hidden flex items-center gap-1.5 h-9 px-3 border border-[hsl(var(--border))] rounded-lg text-xs font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors relative"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[hsl(var(--accent))] text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Desktop: inline filters */}
        <div className="hidden sm:flex">{filterBar}</div>
      </div>

      {/* Mobile: collapsible filter panel */}
      {showMobileFilters && (
        <div className="sm:hidden p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] mb-3">
          {filterBar}
        </div>
      )}
    </div>
  );
}
