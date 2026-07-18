import { createClient } from '@/lib/supabase/client';
import {
  HierarchyFilterParams,
  TenantNode,
  SubscriptionPlan,
} from '../types/hierarchy';
import { NodeFormData } from '../components/NodeFormModal';

// ---------------------------------------------------------------------------
// DB row → TenantNode mapper
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToNode(row: any): TenantNode {
  return {
    id: row.id,
    name: row.name,
    type: row.type ?? 'school',
    parentId: row.parent_id ?? undefined,
    plan: row.plan as SubscriptionPlan | undefined,
    status: row.status ?? 'active',
    isStandaloneSchool: row.is_standalone_school ?? false,
    slug: row.slug ?? undefined,
    region: row.region ?? undefined,
    schoolType: row.school_type ?? undefined,
    schoolLevels: row.school_levels ?? [],
    schoolShifts: row.school_shifts ?? [],
    childrenCount: 0,
    usersCount: row.users_count ?? 0,
    studentsCount: row.students_count ?? 0,
    storageUsed: row.storage_used ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Build a nested tree from a flat list
// ---------------------------------------------------------------------------
function buildTree(nodes: TenantNode[], parentId?: string): TenantNode[] {
  return nodes
    .filter(n => n.parentId === parentId)
    .map(n => ({
      ...n,
      children: buildTree(nodes, n.id),
    }));
}

// ---------------------------------------------------------------------------
// Utility: check if a node is a descendant of an org
// ---------------------------------------------------------------------------
function isDescendant(nodeId: string, orgId: string, nodes: TenantNode[]): boolean {
  const node = nodes.find(n => n.id === nodeId);
  if (!node || !node.parentId) return false;
  if (node.parentId === orgId) return true;
  return isDescendant(node.parentId, orgId, nodes);
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const hierarchyApi = {
  /** Fetch all top-level organization nodes from Supabase */
  getOrganizations: async (): Promise<TenantNode[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[hierarchyApi.getOrganizations]', error.message);
      return [];
    }
    return (data ?? []).map(rowToNode);
  },

  /** Fetch full nested tree for one organization */
  getOrgTree: async (orgId: string): Promise<TenantNode | null> => {
    const supabase = createClient();

    // Fetch the org itself
    const { data: orgRow, error: orgErr } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', orgId)
      .single();

    if (orgErr || !orgRow) {
      console.error('[hierarchyApi.getOrgTree] org fetch error:', orgErr?.message);
      return null;
    }

    // Fetch all descendants using a recursive CTE (or fallback to client-side tree build)
    // For now we do a broad fetch of all tenants that trace back to this org via parent_id
    // (works well for orgs up to a few hundred nodes)
    const { data: allRows, error: allErr } = await supabase
      .from('tenants')
      .select('*')
      .neq('type', 'organization'); // everything below org level

    if (allErr) {
      console.error('[hierarchyApi.getOrgTree] descendants fetch error:', allErr.message);
      return rowToNode(orgRow);
    }

    const allNodes: TenantNode[] = [rowToNode(orgRow), ...(allRows ?? []).map(rowToNode)];
    const underOrg = allNodes.filter(n => n.id === orgId || isDescendant(n.id, orgId, allNodes));

    // Build tree rooted at orgId
    const [tree] = buildTree(underOrg, undefined).filter(n => n.id === orgId);
    return tree ?? rowToNode(orgRow);
  },

  /** Direct children of a node */
  getChildren: async (parentId: string): Promise<TenantNode[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[hierarchyApi.getChildren]', error.message);
      return [];
    }
    return (data ?? []).map(rowToNode);
  },

  /** Create a new node (from NodeFormModal or Provisioning Wizard) */
  createNode: async (formData: NodeFormData): Promise<TenantNode> => {
    const supabase = createClient();

    let planId = null;
    const planName = formData.plan ?? 'starter';
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('id')
      .ilike('name', planName)
      .single();
    
    if (planData) {
      planId = planData.id;
    }

    const insertPayload = {
      name: formData.name,
      type: formData.type,
      parent_id: formData.parentId ?? null,
      slug: formData.slug ?? null,
      status: formData.type === 'organization' ? 'active' : 'trial',
      is_standalone_school: formData.isStandaloneSchool ?? false,
      region: formData.region ?? null,
      school_type: formData.schoolType ?? null,
      school_levels: formData.schoolLevels ?? [],
      school_shifts: formData.schoolShifts ?? [],
      address: formData.address ?? null,
      plan_id: planId,
    };

    const { data, error } = await supabase
      .from('tenants')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[hierarchyApi.createNode]', error.message);
      throw new Error(error.message);
    }
    return rowToNode(data);
  },

  /** Delete a node completely */
  deleteNode: async (id: string): Promise<void> => {
    // We must use the server action to securely delete Auth Users before the tenant rows
    const { deleteTenantCompletely } = await import('@/app/actions/tenant');
    await deleteTenantCompletely(id);
  },

  /**
   * Provision a full organization from the Provisioning Wizard.
   * Creates the org row + all school rows in sequence.
   */
  provisionOrganization: async (opts: {
    orgName: string;
    orgMode: 'standalone' | 'multi';
    orgSlug?: string;
    region: string;
    plan: SubscriptionPlan;
    isStandaloneSchool: boolean;
    schools: { name: string; slug: string; schoolType: string; schoolLevels?: string[]; schoolShifts?: string[] }[];
    adminName: string;
    adminEmail: string;
    modules: string[];
    schoolLevels?: string[]; // for standalone
    schoolShifts?: string[]; // for standalone
  }): Promise<{ orgId: string; schoolIds: string[] }> => {
    const supabase = createClient();

    let planId = null;
    const finalStatus = opts.plan === 'trial' ? 'trial' : 'active';
    const dbPlanName = opts.plan === 'pro' ? 'Professional' : 
                       opts.plan === 'starter' ? 'Starter' : 
                       opts.plan === 'enterprise' ? 'Enterprise' : null;

    if (dbPlanName) {
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('id')
        .ilike('name', dbPlanName)
        .single();
      
      if (planData) {
        planId = planData.id;
      }
    }

    // 1. Insert the organization
    const { data: orgRow, error: orgErr } = await supabase
      .from('tenants')
      .insert({
        name: opts.orgName,
        type: 'organization',
        slug: (opts.isStandaloneSchool ? null : opts.orgSlug) || null,
        is_standalone_school: opts.isStandaloneSchool,
        status: 'provisioning',
        region: opts.region,
        parent_id: null,
        plan_id: planId,
        school_levels: opts.isStandaloneSchool ? opts.schoolLevels : [],
        school_shifts: opts.isStandaloneSchool ? opts.schoolShifts : [],
      })
      .select()
      .single();

    if (orgErr || !orgRow) {
      throw new Error(orgErr?.message ?? 'Failed to create organization');
    }

    const orgId: string = orgRow.id;
    const schoolIds: string[] = [];

    // 2. Insert schools (for multi-school mode)
    if (!opts.isStandaloneSchool && opts.schools.length > 0) {
      for (const school of opts.schools) {
        const { data: schoolRow, error: schoolErr } = await supabase
          .from('tenants')
          .insert({
            name: school.name,
            type: 'school',
            slug: school.slug || null,
            parent_id: orgId,
            status: finalStatus,
            school_type: school.schoolType,
            school_levels: school.schoolLevels ?? [],
            school_shifts: school.schoolShifts ?? [],
            region: opts.region,
            plan_id: planId,
          })
          .select('id')
          .single();

        if (schoolErr) {
          console.error('[hierarchyApi.provisionOrganization] school insert error:', schoolErr.message);
          continue;
        }
        if (schoolRow) schoolIds.push(schoolRow.id);
      }
    }

    // 3. For standalone: also insert the paired school row
    if (opts.isStandaloneSchool) {
      const { data: schoolRow, error: schoolErr } = await supabase
        .from('tenants')
        .insert({
          name: opts.orgName,
          type: 'school',
          slug: opts.orgSlug || null,
          parent_id: orgId,
          status: finalStatus,
          region: opts.region,
          school_levels: opts.schoolLevels ?? [],
          school_shifts: opts.schoolShifts ?? [],
          plan_id: planId,
        })
        .select('id')
        .single();

      if (!schoolErr && schoolRow) schoolIds.push(schoolRow.id);
    }

    // 4. Mark org as active after provisioning
    await supabase
      .from('tenants')
      .update({ status: finalStatus })
      .eq('id', orgId);

    return { orgId, schoolIds };
  },

  /**
   * Adds a new school to an existing organization, enforcing subscription plan limits.
   */
  addSchoolToOrganization: async (
    orgId: string,
    opts: {
      name: string;
      slug: string;
      schoolType: string;
      schoolLevels?: string[];
      schoolShifts?: string[];
    }
  ): Promise<{ id: string }> => {
    const supabase = createClient();

    // 1. Fetch organization details to get plan_id and region
    const { data: org, error: orgErr } = await supabase
      .from('tenants')
      .select('plan_id, region, status')
      .eq('id', orgId)
      .single();

    if (orgErr || !org) {
      throw new Error('Organization not found');
    }

    // 2. Determine max schools based on the plan
    let maxSchools = 1; // Default fallback
    if (org.plan_id) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('max_schools')
        .eq('id', org.plan_id)
        .single();
      if (plan && plan.max_schools !== undefined) {
        maxSchools = plan.max_schools;
      }
    }

    // 3. Count existing schools
    const { count, error: countErr } = await supabase
      .from('tenants')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', orgId)
      .eq('type', 'school');

    if (countErr) {
      throw new Error('Failed to verify current school count');
    }

    const currentCount = count || 0;
    if (currentCount >= maxSchools) {
      throw new Error(`Subscription limit reached. Your current plan only allows up to ${maxSchools} schools.`);
    }

    // 4. Insert the new school
    const { data: newSchool, error: insertErr } = await supabase
      .from('tenants')
      .insert({
        name: opts.name,
        slug: opts.slug,
        type: 'school',
        parent_id: orgId,
        status: org.status === 'trial' ? 'trial' : 'active',
        region: org.region,
        school_type: opts.schoolType,
        school_levels: opts.schoolLevels ?? [],
        school_shifts: opts.schoolShifts ?? [],
      })
      .select('id')
      .single();

    if (insertErr || !newSchool) {
      throw new Error(insertErr?.message ?? 'Failed to add school');
    }

    return { id: newSchool.id };
  },

  /** Flat search/filter — for Tenant Directory page */
  getNodes: async (params: HierarchyFilterParams): Promise<{
    data: TenantNode[]; total: number; page: number; limit: number; totalPages: number;
  }> => {
    const supabase = createClient();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('tenants')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
    }
    if (params.type) query = query.eq('type', params.type);
    if (params.status) query = query.eq('status', params.status);
    if (params.parentId !== undefined) query = query.eq('parent_id', params.parentId);

    if (params.sortBy) {
      const colMap: Record<string, string> = {
        name: 'name', status: 'status', createdAt: 'created_at', updatedAt: 'updated_at',
      };
      const col = colMap[params.sortBy] ?? 'created_at';
      query = query.order(col, { ascending: params.sortOrder !== 'desc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[hierarchyApi.getNodes]', error.message);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const total = count ?? 0;
    return {
      data: (data ?? []).map(rowToNode),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
