-- ============================================================
-- Migration 045: Atomic Invitation Binding RPC
--
-- Replaces the application-level two-step INSERT profile + UPDATE invitation
-- pattern (with compensating DELETE on failure) with a single PostgreSQL
-- SECURITY DEFINER function that executes both writes inside one implicit
-- transaction. SELECT ... FOR UPDATE prevents concurrent acceptance races.
--
-- SECURITY INVARIANTS:
--   1. Role, tenant_id, email, and full_name come EXCLUSIVELY from the
--      locked invitation row. The caller supplies only invitation_id and
--      user_id. No parameter can inject or override authorization values.
--   2. SECURITY DEFINER runs under the migration owner role, not the caller.
--   3. search_path is fixed to prevent schema-injection attacks.
--   4. EXECUTE is revoked from PUBLIC, anon, and authenticated.
--      Only service_role may invoke this function.
--   5. SELECT FOR UPDATE acquires a row-level lock for the duration of the
--      transaction, preventing a second concurrent call from reading the same
--      pending row and accepting it simultaneously.
-- ============================================================

-- ----------------------------------------------------------------
-- Function: bind_invitation_to_user
-- ----------------------------------------------------------------
-- Parameters:
--   p_invitation_id  UUID  — the server-authoritative invitation row id
--   p_user_id        UUID  — the authenticated GoTrue user.id
--
-- Returns: JSONB with keys:
--   success    BOOLEAN
--   reason     TEXT        (present on failure)
--   role       TEXT        (present on success)
--   tenant_id  UUID        (present on success)
--   email      TEXT        (present on success, normalized)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bind_invitation_to_user(
  p_invitation_id UUID,
  p_user_id       UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_invitation RECORD;
  v_now        TIMESTAMPTZ := now();
BEGIN
  -- ── Step 1: Acquire a row-level lock on the invitation ───────────────────
  -- FOR UPDATE prevents any other concurrent transaction from reading this row
  -- in FOR UPDATE mode until the current transaction commits or rolls back.
  -- This is the sole mechanism preventing concurrent acceptance.
  SELECT *
  INTO   v_invitation
  FROM   public.user_invitations
  WHERE  id = p_invitation_id
  FOR    UPDATE;

  -- ── Step 2: Verify the invitation exists ─────────────────────────────────
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason',  'invitation_not_found'
    );
  END IF;

  -- ── Step 3: Verify status is pending ─────────────────────────────────────
  IF v_invitation.status <> 'pending' THEN
    -- Surface the exact status so the caller can differentiate accepted/revoked/expired
    RETURN jsonb_build_object(
      'success', false,
      'reason',  'invitation_not_pending',
      'status',  v_invitation.status
    );
  END IF;

  -- ── Step 4: Verify expiration ─────────────────────────────────────────────
  IF v_now > v_invitation.expires_at THEN
    -- Mark as expired within the same transaction for consistency
    UPDATE public.user_invitations
    SET    status = 'expired'
    WHERE  id = p_invitation_id;

    RETURN jsonb_build_object(
      'success', false,
      'reason',  'invitation_expired'
    );
  END IF;

  -- ── Step 5: Verify no rebinding to a second GoTrue user ──────────────────
  -- accepted_by being non-null while status is still 'pending' indicates a
  -- partially-consumed invitation; we treat it as bound to the first user.
  IF v_invitation.accepted_by IS NOT NULL
     AND v_invitation.accepted_by <> p_user_id
  THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason',  'invitation_bound_to_other_user'
    );
  END IF;

  -- ── Step 6: Verify the invited email is not already claimed by a DIFFERENT
  --           GoTrue user id (profile identity conflict) ─────────────────────
  IF EXISTS (
    SELECT 1
    FROM   public.profiles
    WHERE  lower(email) = lower(v_invitation.email)
      AND  id <> p_user_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason',  'conflicting_existing_profile_identity'
    );
  END IF;

  -- ── Steps 7 + 8: Atomically create the profile and consume the invitation ─
  --
  -- All values (role, tenant_id, email, full_name) come from the LOCKED
  -- invitation row. No caller-supplied parameter can influence them.
  --
  -- ON CONFLICT (id) DO NOTHING: if a profile for this user already exists,
  -- the INSERT is silently skipped. The UPDATE below still consumes the
  -- invitation so it cannot be replayed. The existing profile is returned as-is.

  INSERT INTO public.profiles (id, email, full_name, role, tenant_id)
  VALUES (
    p_user_id,
    lower(v_invitation.email),
    COALESCE(v_invitation.full_name, 'Staff Member'),
    v_invitation.role::public.user_role,
    v_invitation.tenant_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── Step 9: Consume the invitation ────────────────────────────────────────
  -- The AND status = 'pending' guard is a secondary safety check; the FOR
  -- UPDATE lock above is the primary concurrency control.
  UPDATE public.user_invitations
  SET
    status      = 'accepted',
    accepted_at = v_now,
    accepted_by = p_user_id
  WHERE id     = p_invitation_id
    AND status = 'pending';

  -- ── Step 10: Return the authoritative binding ─────────────────────────────
  RETURN jsonb_build_object(
    'success',   true,
    'role',      v_invitation.role,
    'tenant_id', v_invitation.tenant_id,
    'email',     lower(v_invitation.email)
  );

  -- ── Step 11: Any unhandled exception causes PostgreSQL to roll back the
  -- entire transaction automatically. No application-level compensating delete
  -- is needed or used.
END;
$$;

-- ----------------------------------------------------------------
-- Privilege hardening
-- ----------------------------------------------------------------

-- Revoke EXECUTE from PUBLIC (covers anon and authenticated implicitly)
REVOKE EXECUTE ON FUNCTION public.bind_invitation_to_user(UUID, UUID) FROM PUBLIC;

-- Explicitly revoke from anon and authenticated roles as belt-and-suspenders
REVOKE EXECUTE ON FUNCTION public.bind_invitation_to_user(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bind_invitation_to_user(UUID, UUID) FROM authenticated;

-- Grant EXECUTE only to service_role (server-side admin client)
GRANT  EXECUTE ON FUNCTION public.bind_invitation_to_user(UUID, UUID) TO service_role;

-- ----------------------------------------------------------------
-- RLS verification comment
-- ----------------------------------------------------------------
-- The user_invitations table already has RLS enabled (migration 044).
-- The SECURITY DEFINER function runs under the owner's privileges, bypassing
-- RLS on the tables it touches. This is intentional and correct: the function
-- itself enforces all authorization invariants internally.
--
-- Normal authenticated/anon users cannot call this function directly (no
-- EXECUTE grant). The function is called exclusively from the server-side
-- Next.js API handler via the service-role Supabase admin client, which
-- already bypasses RLS by design.
--
-- The RLS policies on user_invitations (migration 044) continue to protect
-- direct client-side reads (SELECT policy for admins only). They are not
-- weakened by this migration.
--
-- Existing invitation table RLS policy summary after this migration:
--   service_role  → full access (FROM migration 044)
--   authenticated → SELECT only, scoped to own tenant admins (FROM migration 044)
--   anon          → no access
--   PUBLIC        → no EXECUTE on this function
-- ----------------------------------------------------------------
