"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HierarchyHeader } from '../../../../../features/tenant-management/components/HierarchyHeader';
import { HierarchyToolbar } from '../../../../../features/tenant-management/components/HierarchyToolbar';
import { HierarchyTable } from '../../../../../features/tenant-management/components/HierarchyTable';
import { EmptyState } from '../../../../../features/tenant-management/components/EmptyState';
import { DetailsDrawer } from '../../../../../features/tenant-management/components/DetailsDrawer';
import { useHierarchy } from '../../../../../features/tenant-management/hooks/useHierarchy';
import { TenantNode, HierarchyType } from '../../../../../features/tenant-management/types/hierarchy';

// Create a client instance outside the component to avoid recreation, 
// or inside with useState.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function HierarchyPageContent() {
  const { 
    data, 
    isLoading, 
    params, 
    setSearch, 
    setType, 
    setStatus 
  } = useHierarchy({ type: 'organization' });

  const [selectedNode, setSelectedNode] = useState<TenantNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (node: TenantNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  const handleAdd = () => {
    console.log('Add new', params.type);
  };

  const currentType = params.type || 'organization';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto pb-24 h-full flex flex-col">
      <HierarchyHeader
        currentView={currentType}
        onAdd={handleAdd}
        totalCount={data?.total}
      />

      <div className="flex-1 min-h-0 bg-[hsl(var(--bg-secondary))] rounded-2xl border border-[hsl(var(--border))] shadow-sm p-4 sm:p-6 flex flex-col relative overflow-hidden">
        <HierarchyToolbar 
          searchQuery={params.search || ''}
          onSearchChange={setSearch}
          currentType={currentType}
          onTypeChange={setType}
          statusFilter={params.status}
          onStatusChange={setStatus}
        />

        <div className="flex-1 relative">
          {data?.data.length === 0 && !isLoading ? (
            <EmptyState 
              type={currentType} 
              searchQuery={params.search}
              onAdd={handleAdd}
              onClearSearch={() => setSearch('')}
            />
          ) : (
            <HierarchyTable 
              data={data?.data || []} 
              isLoading={isLoading} 
              onRowClick={handleRowClick}
            />
          )}
        </div>
        
        {/* Simple pagination mock for now */}
        {data && data.totalPages > 1 && (
           <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
             <div>Showing {data.data.length} of {data.total} records</div>
             <div className="flex items-center gap-2">
               <button className="px-3 py-1 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Previous</button>
               <button className="px-3 py-1 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Next</button>
             </div>
           </div>
        )}
      </div>

      <DetailsDrawer 
        node={selectedNode} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}

export default function HierarchyPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <HierarchyPageContent />
    </QueryClientProvider>
  );
}
