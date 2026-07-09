'use client';

import { useSearchParams } from 'next/navigation';
import { 
  Building2, FolderTree, MapPin, GraduationCap, Tent, 
  Search, Plus, ChevronRight, MoreHorizontal, Globe 
} from 'lucide-react';
import { Suspense } from 'react';

const mockHierarchy = [
  {
    id: 'org1',
    name: 'DreamDay Education Group',
    type: 'Organization',
    children: 3,
    status: 'active'
  },
  {
    id: 'org2',
    name: 'Global Learning Partners',
    type: 'Organization',
    children: 5,
    status: 'active'
  },
  {
    id: 'grp1',
    name: 'North America Operations',
    type: 'Group',
    parent: 'DreamDay Education Group',
    children: 2,
    status: 'active'
  }
];

function HierarchyContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'organizations';

  const viewConfig = {
    organizations: { title: 'Organizations', icon: Building2, desc: 'Top-level educational holding companies.' },
    groups: { title: 'Groups', icon: FolderTree, desc: 'Regional or structural groupings of districts.' },
    districts: { title: 'Districts', icon: MapPin, desc: 'School districts or local education agencies.' },
    schools: { title: 'Schools', icon: GraduationCap, desc: 'Individual school institutions.' },
    campuses: { title: 'Campuses', icon: Tent, desc: 'Physical campuses belonging to a single school.' },
  }[view] || { title: 'Hierarchy', icon: Globe, desc: 'Tenant structural hierarchy.' };

  return (
    <div className="space-y-6 max-w-[1200px] animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2">
            <viewConfig.icon className="w-7 h-7 text-[hsl(var(--accent))]" />
            Manage {viewConfig.title}
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            {viewConfig.desc}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--text-primary))] text-[hsl(var(--bg-primary))] text-sm font-bold hover:opacity-90 transition-opacity shadow-lg">
          <Plus className="w-4 h-4" /> Add {viewConfig.title.slice(0, -1)}
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input 
              type="text" 
              placeholder={`Search ${viewConfig.title.toLowerCase()}...`} 
              className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg pl-9 pr-4 py-2 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {mockHierarchy.filter(h => h.type.toLowerCase() === view.slice(0, -1) || (view === 'organizations' && h.type === 'Organization')).map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between table-row-hover transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex items-center justify-center flex-shrink-0">
                  <viewConfig.icon className="w-5 h-5 text-[hsl(var(--text-secondary))]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[hsl(var(--text-tertiary))]">
                    {item.parent && (
                      <>
                        <span>Parent: {item.parent}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{item.children} children nodes</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase">
                  {item.status}
                </span>
                <button className="p-1.5 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {mockHierarchy.filter(h => h.type.toLowerCase() === view.slice(0, -1) || (view === 'organizations' && h.type === 'Organization')).length === 0 && (
            <div className="p-12 text-center">
              <viewConfig.icon className="w-12 h-12 text-[hsl(var(--text-tertiary))] mx-auto mb-3 opacity-20" />
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">No {viewConfig.title} Found</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">There are no entries in this hierarchy level yet.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default function HierarchyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[hsl(var(--text-secondary))]">Loading hierarchy...</div>}>
      <HierarchyContent />
    </Suspense>
  );
}
