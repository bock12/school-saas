'use server';

import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import {
  type AuthorizationDecision,
  AuthorizationError,
  evaluateAuthorization,
  type ResourceTarget,
  type TrustedSecurityContext,
} from './authorization-engine';
import {
  type CanonicalPermission,
  isCanonicalPermission,
} from './permissions-registry';
import {
  resolveTrustedResourceTarget,
  resolveTrustedTenantTarget,
  type SupportedResourceType,
  type TrustedResourceTarget,
} from './resource-resolver';
import { resolveAuthorizationContext } from './authorization-context-resolver';

export interface ServerActionAuthorizationOptions {
  permission: CanonicalPermission;
  requestedTenantSlug: string;
  resolveResource?: {
    type: SupportedResourceType;
    id: string;
  };
  /**
   * Explicit trusted target is only for server-composed calls.
   * Client-provided objects must never be passed here.
   */
  resourceTarget?: ResourceTarget;
}

export interface ServerActionAuthorizationSuccess {
  ok: true;
  user: User;
  supabase: any;
  authContext: TrustedSecurityContext;
  decision: AuthorizationDecision;
  target: TrustedResourceTarget | ResourceTarget;
}

export interface ServerActionAuthorizationFailure {
  ok: false;
  error: string;
  code: string;
}

export type ServerActionAuthorizationResult =
  | ServerActionAuthorizationSuccess
  | ServerActionAuthorizationFailure;

/**
 * Canonical server-action authorization boundary.
 *
 * Every mutating Server Action in a tenant context must establish authorization
 * before performing any privileged/raw-PG mutation. Tenant identifiers supplied
 * by the caller are resolved to authoritative tenant facts and then evaluated
 * against the caller's trusted authorization context.
 */
export async function authorizeServerAction(
  options: ServerActionAuthorizationOptions
): Promise<ServerActionAuthorizationResult> {
  if (!options || !isCanonicalPermission(options.permission)) {
    return {
      ok: false,
      error: 'Invalid authorization request.',
      code: 'UNKNOWN_PERMISSION',
    };
  }

  if (
    typeof options.requestedTenantSlug !== 'string' ||
    options.requestedTenantSlug.trim() === '' ||
    options.requestedTenantSlug === 'undefined' ||
    options.requestedTenantSlug === 'null'
  ) {
    return {
      ok: false,
      error: 'Tenant context is required.',
      code: 'TENANT_CONTEXT_MISSING',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      error: 'Authentication required.',
      code: 'UNAUTHENTICATED',
    };
  }

  let authContext: TrustedSecurityContext;
  try {
    authContext = await resolveAuthorizationContext({
      supabaseClient: supabase,
      userId: user.id,
    });
  } catch (error: any) {
    return {
      ok: false,
      error: error?.message || 'Authorization context resolution failed.',
      code: 'AUTHORIZATION_CONTEXT_ERROR',
    };
  }

  if (!authContext.actorId || !authContext.isActive) {
    return {
      ok: false,
      error: authContext.isActive ? 'Authentication required.' : 'User account is inactive.',
      code: authContext.isActive ? 'UNAUTHENTICATED' : 'ACCOUNT_INACTIVE',
    };
  }

  let target: TrustedResourceTarget | ResourceTarget;

  try {
    if (options.resolveResource) {
      target = await resolveTrustedResourceTarget(
        supabase,
        options.resolveResource
      );
    } else if (options.resourceTarget) {
      target = options.resourceTarget;
    } else {
      target = await resolveTrustedTenantTarget(
        supabase,
        options.requestedTenantSlug.trim()
      );
    }
  } catch (error: any) {
    return {
      ok: false,
      error: error?.message || 'Authorization target resolution failed.',
      code: error?.code || 'INVALID_REQUEST',
    };
  }

  const decision = evaluateAuthorization(
    authContext,
    options.permission,
    target
  );

  if (!decision.allowed) {
    return {
      ok: false,
      error: decision.safeMessage,
      code: decision.code,
    };
  }

  return {
    ok: true,
    user,
    supabase,
    authContext,
    decision,
    target,
  };
}

/**
 * Throwing convenience wrapper for Server Actions that prefer exceptions.
 */
export async function requireServerActionAuthorization(
  options: ServerActionAuthorizationOptions
): Promise<Extract<ServerActionAuthorizationResult, { ok: true }>> {
  const result = await authorizeServerAction(options);

  if (!result.ok) {
    throw new AuthorizationError({
      allowed: false,
      decision: 'DENY',
      code: result.code as any,
      safeMessage: result.error,
      diagnostics: {
        requestedPermission: options.permission,
        reasonDetails: 'Server Action authorization boundary denied the request',
      },
    });
  }

  return result;
}
