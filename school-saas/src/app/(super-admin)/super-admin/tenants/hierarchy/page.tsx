"use client";
import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { hierarchyApi } from '../../../../../features/tenant-management/api/hierarchy.api';
import { TenantNode } from '../../../../../features/tenant-management/types/hierarchy';
import { OrgList } from '../../../../../features/tenant-management/components/OrgList';
import { OrgTree } from '../../../../../features/tenant-management/components/OrgTree';
import { DetailsDrawer } from '../../../../../features/tenant-management/components/DetailsDrawer';
import { NodeFormModal, NodeFormData } from '../../../../../features/tenant-management/components/NodeFormModal';
import { Search } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

// ---------------------------------------------------------------------------
function HierarchyContent() {
  const queryClient = useQueryClient();
  const [selectedOrg, setSelectedOrg] = useState<TenantNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TenantNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orgSearch, setOrgSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'tree'>('list');

  // NodeFormModal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParentNode, setModalParentNode] = useState<TenantNode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch all top-level organizations
  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: hierarchyApi.getOrganizations,
  });

  // Fetch the full tree for the selected org
  const { data: orgTree, isLoading: treeLoading } = useQuery({
    queryKey: ['org-tree', selectedOrg?.id],
    queryFn: () => hierarchyApi.getOrgTree(selectedOrg!.id),
    enabled: !!selectedOrg,
  });

  const filteredOrgs = orgs.filter(o =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const handleOrgSelect = useCallback((org: TenantNode) => {
    setSelectedOrg(org);
    setMobileView('tree');
  }, []);

  const handleNodeSelect = useCallback((node: TenantNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  }, []);

  // Opens the NodeFormModal with no parent → creates new Organization
  const handleNewOrg = useCallback(() => {
    setModalParentNode(null);
    setIsModalOpen(true);
  }, []);

  // Opens the NodeFormModal with a parent node → adds a child
  const handleAddChild = useCallback((parentNode: TenantNode) => {
    setModalParentNode(parentNode);
    setIsModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(async (data: NodeFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await hierarchyApi.createNode(data);
      // Refresh the org list and the open tree
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      if (selectedOrg) {
        await queryClient.invalidateQueries({ queryKey: ['org-tree', selectedOrg.id] });
      }
      setIsModalOpen(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create node');
    } finally {
      setIsSubmitting(false);
    }
  }, [queryClient, selectedOrg]);

  const handleDeleteNode = useCallback(async (id: string) => {
    try {
      await hierarchyApi.deleteNode(id);
      setIsDrawerOpen(false);
      // Refresh queries
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      if (selectedOrg) {
        await queryClient.invalidateQueries({ queryKey: ['org-tree', selectedOrg.id] });
        if (selectedOrg.id === id) {
          setSelectedOrg(null);
          setMobileView('list');
        }
      }
    } catch (err) {
      console.error('Failed to delete node:', err);
      alert('Failed to delete node. ' + (err instanceof Error ? err.message : ''));
    }
  }, [queryClient, selectedOrg]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 border-b border-[hsl(var(--border))]">
        <h1 className="text-xl font-black text-[hsl(var(--text-primary))] tracking-tight">
          Tenant Hierarchy
        </h1>
        <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
          Select an organization to explore its structure — Groups, Districts, Schools, and Campuses.
        </p>
      </div>

      {/* Two-panel body */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT PANEL: Org List ────────────────────────────────────────── */}
        <div className={`
          flex-shrink-0 flex flex-col
          w-full md:w-[300px] lg:w-[320px]
          border-r border-[hsl(var(--border))]
          bg-[hsl(var(--bg-secondary))]
          ${mobileView === 'tree' ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Org search */}
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] pointer-events-none" />
              <input
                type="text"
                value={orgSearch}
                onChange={e => setOrgSearch(e.target.value)}
                placeholder="Search organizations..."
                className="w-full h-8 pl-8 pr-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.4)] transition-colors"
              />
            </div>
          </div>

          <OrgList
            orgs={filteredOrgs}
            isLoading={orgsLoading}
            selectedId={selectedOrg?.id}
            onSelect={handleOrgSelect}
            onAdd={handleNewOrg}
          />
        </div>

        {/* ── RIGHT PANEL: Org Tree ───────────────────────────────────────── */}
        <div className={`
          flex-1 flex flex-col overflow-hidden
          bg-[hsl(var(--bg-primary))]
          ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
        `}>
          <OrgTree
            org={orgTree ?? null}
            isLoading={treeLoading && !!selectedOrg}
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedNode?.id}
            onBack={() => setMobileView('list')}
            onAddChild={handleAddChild}
          />
        </div>
      </div>

      {/* Details Drawer */}
      <DetailsDrawer
        node={selectedNode}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onDelete={handleDeleteNode}
        onAddChild={handleAddChild}
      />

      {/* Node Form Modal — for creating orgs and adding children */}
      <NodeFormModal
        isOpen={isModalOpen}
        parentNode={modalParentNode}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function HierarchyPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <HierarchyContent />
    </QueryClientProvider>
  );
}
