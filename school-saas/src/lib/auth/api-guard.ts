import { NextRequest, NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

function getFallbackAdminClient() {
  // Lazily loaded so server-only is not triggered at module import time
  const { createAdminClient } = require('@/lib/supabase/admin');
  return createAdminClient();
}

export type AppRole =
  | 'super_admin'
  | 'org_admin'
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'exam_officer';

export interface AuthenticatedProfile {
  id: string;
  tenant_id: string | null;
  role: AppRole;
  email: string | null;
  full_name: string | null;
  is_active: boolean;
  requires_password_change?: boolean;
}

export interface ResourceAuthorizationSpec {
  table: string;
  id: string;
  tenantColumn?: string; // defaults to 'tenant_id'
}

export interface ApiAuthorizationOptions {
  /** Allowed roles for this operation. If omitted, any authenticated active user is permitted. */
  roles?: AppRole[];
  /**
   * Explicit scope of the operation:
   * - 'tenant': Route operates within a specific institution/tenant (default).
   *             Requires actor to have verified tenant authority.
   * - 'platform': Route operates across the entire platform (e.g. platform administration).
   *               Requires explicit platform administrator authorization.
   */
  scope?: 'tenant' | 'platform';
  /** Legacy alias for scope. Default: true (equivalent to scope: 'tenant'). Set false for platform-scoped routes. */
  requireTenant?: boolean;
  /** Optional requested target tenant slug (e.g. from query param or header). Untrusted client input. */
  requestedTenantSlug?: string;
  /** Alias for requestedTenantSlug. Untrusted client input. */
  targetTenantSlug?: string;
  /** Optional requested target tenant UUID. Untrusted client input. */
  requestedTenantId?: string;
  /** Alias for requestedTenantId. Untrusted client input. */
  targetTenantId?: string;
  /** Optional resource-level ownership check. Enforces id AND tenant_id constraints in DB using user-scoped client. */
  resource?: ResourceAuthorizationSpec;
  /** Allow inactive accounts if explicitly set. Default: false. */
  allowInactive?: boolean;
  /** Optional Supabase client injection for deterministic unit testing. */
  supabaseClient?: any;
  /** Optional privileged client factory injection for deterministic unit testing. */
  adminClientFactory?: () => any;
}

export type ApiAuthorizationSuccess = {
  ok: true;
  user: User;
  profile: AuthenticatedProfile;
  tenantId: string | null;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  /** Lazy accessor: instantiated strictly AFTER all authorization checks succeed. */
  adminClient: () => ReturnType<typeof getFallbackAdminClient>;
};

export type ApiAuthorizationFailure = {
  ok: false;
  response: NextResponse;
};

export type ApiAuthorizationResult = ApiAuthorizationSuccess | ApiAuthorizationFailure;

/**
 * Creates standardized JSON error responses for API route handlers.
 * Never uses redirect() from next/navigation.
 */
export function apiError(message: string, code: string, status: number): NextResponse {
  return NextResponse.json(
    { error: message, code },
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Server-side authorization boundary for Next.js Route Handlers.
 * Enforces:
 *  1. User Authentication (via Supabase session)
 *  2. Profile Resolution (user-scoped RLS query)
 *  3. Account Active Status
 *  4. Role / Permission Check (denies by default)
 *  5. Fail-Closed Tenant Resolution and Scope Verification (client inputs treated strictly as requested targets)
 *  6. Resource-Level Authorization (verified via user-scoped client enforcing id AND tenant_id)
 *  7. Privileged Client Boundary (accessible only as a downstream factory after authorization succeeds)
 */
export async function authorizeApiRequest(
  req: NextRequest,
  options: ApiAuthorizationOptions = {}
): Promise<ApiAuthorizationResult> {
  const {
    roles,
    scope = options.requireTenant === false ? 'platform' : 'tenant',
    requestedTenantSlug = options.targetTenantSlug,
    requestedTenantId = options.targetTenantId,
    resource,
    allowInactive = false,
    supabaseClient,
    adminClientFactory = getFallbackAdminClient,
  } = options;

  // ── 1. Authentication ───────────────────────────────────────────────────────
  const supabase = supabaseClient || (await createClient());
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: apiError('Unauthorized', 'UNAUTHENTICATED', 401),
    };
  }

  // ── 2. Actor Profile Resolution (User-Scoped RLS) ──────────────────────────
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, tenant_id, role, email, full_name, is_active, requires_password_change')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      response: apiError('Forbidden: User profile not found', 'PROFILE_NOT_FOUND', 403),
    };
  }

  if (!allowInactive && profile.is_active === false) {
    return {
      ok: false,
      response: apiError('Forbidden: Account is inactive', 'ACCOUNT_INACTIVE', 403),
    };
  }

  const isSuperAdmin = profile.role === 'super_admin';
  const isOrgAdmin = profile.role === 'org_admin';

  // ── 3. Role / Permission Authorization ─────────────────────────────────────
  if (roles && roles.length > 0) {
    const hasRole = roles.includes(profile.role);
    if (!hasRole) {
      return {
        ok: false,
        response: apiError('Forbidden: Insufficient role permissions', 'INSUFFICIENT_ROLE', 403),
      };
    }
  }

  // ── 4. Scope & Tenant Verification (Fail-Closed) ────────────────────────────
  let resolvedTenantId: string | null = null;

  if (scope === 'tenant') {
    // Determine and resolve the requested candidate tenant
    let candidateTenant: { id: string; slug?: string; parent_id?: string | null } | null = null;

    if (requestedTenantId) {
      // Validate requested UUID against server database
      const { data: tenantRecord, error: tenantErr } = await supabase
        .from('tenants')
        .select('id, slug, parent_id')
        .eq('id', requestedTenantId)
        .maybeSingle();

      if (tenantErr || !tenantRecord) {
        return {
          ok: false,
          response: apiError('Tenant not found', 'TENANT_NOT_FOUND', 404),
        };
      }
      candidateTenant = tenantRecord;
    } else if (requestedTenantSlug) {
      // Resolve requested slug from server database
      const { data: tenantRecord, error: tenantErr } = await supabase
        .from('tenants')
        .select('id, slug, parent_id')
        .eq('slug', requestedTenantSlug.toLowerCase().trim())
        .maybeSingle();

      if (tenantErr || !tenantRecord) {
        return {
          ok: false,
          response: apiError('Tenant not found', 'TENANT_NOT_FOUND', 404),
        };
      }
      candidateTenant = tenantRecord;
    } else {
      // Default to actor's own verified tenant
      if (!profile.tenant_id) {
        return {
          ok: false,
          response: apiError('Forbidden: Tenant context required', 'TENANT_REQUIRED', 403),
        };
      }
      candidateTenant = { id: profile.tenant_id, slug: '', parent_id: null };
    }

    if (!candidateTenant) {
      return {
        ok: false,
        response: apiError('Tenant not found', 'TENANT_NOT_FOUND', 404),
      };
    }

    // Verify actor's explicit authority over the candidate tenant
    let isAuthorizedForTenant = false;

    if (isSuperAdmin && roles?.includes('super_admin')) {
      // Explicit super-admin tenant operation
      isAuthorizedForTenant = true;
    } else if (profile.tenant_id === candidateTenant.id) {
      // Direct tenant membership
      isAuthorizedForTenant = true;
    } else if (isOrgAdmin && profile.tenant_id) {
      // Check organizational hierarchy: child school's parent_id must match org_admin's tenant_id
      if (candidateTenant.parent_id !== undefined && candidateTenant.parent_id !== null) {
        isAuthorizedForTenant = candidateTenant.parent_id === profile.tenant_id;
      } else {
        const { data: childTenant } = await supabase
          .from('tenants')
          .select('parent_id')
          .eq('id', candidateTenant.id)
          .maybeSingle();

        if (childTenant && childTenant.parent_id === profile.tenant_id) {
          isAuthorizedForTenant = true;
        }
      }
    }

    if (!isAuthorizedForTenant) {
      return {
        ok: false,
        response: apiError('Forbidden: Cross-tenant access denied', 'TENANT_ACCESS_DENIED', 403),
      };
    }

    resolvedTenantId = candidateTenant.id;
  } else {
    // Explicit platform-scoped operation (scope: 'platform')
    // Normal tenant users can never access platform-scoped routes
    if (!isSuperAdmin) {
      return {
        ok: false,
        response: apiError('Forbidden: Platform administration required', 'INSUFFICIENT_ROLE', 403),
      };
    }
  }

  // ── 5. Resource-Level Authorization (Using User-Scoped Client) ──────────────
  // The service-role/admin client is NOT instantiated here.
  // We use the authenticated user-scoped client (respecting RLS) to verify resource ownership.
  if (resource) {
    const tenantCol = resource.tenantColumn || 'tenant_id';

    let resQuery = supabase.from(resource.table).select('id').eq('id', resource.id);

    // If tenant-scoped, enforce both resource id AND verified tenantId in the query itself
    if (resolvedTenantId) {
      resQuery = resQuery.eq(tenantCol, resolvedTenantId);
    }

    const { data: resourceData, error: resourceErr } = await resQuery.maybeSingle();

    if (resourceErr || !resourceData) {
      // Return 404 Not Found (indistinguishable to prevent cross-tenant enumeration)
      return {
        ok: false,
        response: apiError('Resource not found', 'NOT_FOUND', 404),
      };
    }
  }

  // ── 6. Authorized Success Context ──────────────────────────────────────────
  // Privileged client is exposed strictly as a downstream factory function,
  // accessible only after all authorization and resource checks have passed.
  return {
    ok: true,
    user,
    profile: profile as AuthenticatedProfile,
    tenantId: resolvedTenantId,
    isSuperAdmin,
    isOrgAdmin,
    adminClient: adminClientFactory,
  };
}
