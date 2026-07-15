import { useReducer, useCallback, useMemo } from 'react';
import { WizardState, WizardData, SchoolEntry, OrgMode } from '../types/provisioning';
import { STEPS, REGIONS } from '../constants/provisioning';
import { hierarchyApi } from '../api/hierarchy.api';
import { inviteTenantAdmin } from '@/app/actions/tenant';
import type { AdminRole } from '@/app/actions/tenant';

const INITIAL_DATA: WizardData = {
  orgMode: 'standalone',
  orgName: '',
  orgSlug: '',
  region: REGIONS[0],
  schoolLevels: [],
  schoolShifts: [],
  schools: [{ id: '1', name: '', slug: '', schoolType: 'Primary', schoolLevels: [], schoolShifts: [] }],
  plan: 'starter',
  modules: ['core'],
  adminName: '',
  adminEmail: '',
  adminRole: 'school_admin',
};

const INITIAL_STATE: WizardState = {
  step: 0,
  data: INITIAL_DATA,
  isProvisioning: false,
  provisionProgress: 0,
  provisionDone: false,
  provisionError: null,
  invitesSent: [],
};

type Action =
  | { type: 'NEXT_STEP'; payload: number }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ORG_MODE'; payload: OrgMode }
  | { type: 'UPDATE_FIELD'; payload: { key: keyof WizardData; value: any } }
  | { type: 'ADD_SCHOOL' }
  | { type: 'REMOVE_SCHOOL'; payload: string }
  | { type: 'UPDATE_SCHOOL'; payload: { id: string; field: keyof SchoolEntry; value: any } }
  | { type: 'TOGGLE_SCHOOL_LEVELS'; payload: { id: string; val: string } }
  | { type: 'TOGGLE_SCHOOL_SHIFTS'; payload: { id: string; val: string } }
  | { type: 'TOGGLE_LEVELS'; payload: string }
  | { type: 'TOGGLE_SHIFTS'; payload: string }
  | { type: 'TOGGLE_MODULE'; payload: string }
  | { type: 'PROVISION_START' }
  | { type: 'PROVISION_INCREMENT'; payload: number }
  | { type: 'PROVISION_SUCCESS'; payload: WizardState['invitesSent'] }
  | { type: 'PROVISION_ERROR'; payload: string }
  | { type: 'RESET' };

function wizardReducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, action.payload) };
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 0) };
    case 'SET_ORG_MODE':
      return {
        ...state,
        data: {
          ...state.data,
          orgMode: action.payload,
          // Reset schools list depending on mode
          schools: action.payload === 'standalone'
            ? [{ id: '1', name: '', slug: '', schoolType: 'Primary', schoolLevels: [], schoolShifts: [] }]
            : [{ id: '1', name: '', slug: '', schoolType: 'Primary', schoolLevels: [], schoolShifts: [] }],
        },
      };
    case 'UPDATE_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'ADD_SCHOOL':
      return {
        ...state,
        data: {
          ...state.data,
          schools: [
            ...state.data.schools,
            {
              id: String(Date.now()),
              name: '',
              slug: '',
              schoolType: 'Primary',
              schoolLevels: [],
              schoolShifts: [],
            },
          ],
        },
      };
    case 'REMOVE_SCHOOL':
      if (state.data.schools.length <= 1) return state;
      return {
        ...state,
        data: {
          ...state.data,
          schools: state.data.schools.filter((s) => s.id !== action.payload),
        },
      };
    case 'UPDATE_SCHOOL':
      return {
        ...state,
        data: {
          ...state.data,
          schools: state.data.schools.map((s) => {
            if (s.id !== action.payload.id) return s;
            const updated = { ...s, [action.payload.field]: action.payload.value };
            // Auto-slugify school slug if it's name update and slug is empty
            if (action.payload.field === 'name' && !s.slug) {
              updated.slug = action.payload.value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            }
            return updated as SchoolEntry;
          }),
        },
      };
    case 'TOGGLE_SCHOOL_LEVELS':
      return {
        ...state,
        data: {
          ...state.data,
          schools: state.data.schools.map((s) => {
            if (s.id !== action.payload.id) return s;
            const hasItem = s.schoolLevels.includes(action.payload.val);
            return {
              ...s,
              schoolLevels: hasItem
                ? s.schoolLevels.filter((x) => x !== action.payload.val)
                : [...s.schoolLevels, action.payload.val],
            };
          }),
        },
      };
    case 'TOGGLE_SCHOOL_SHIFTS':
      return {
        ...state,
        data: {
          ...state.data,
          schools: state.data.schools.map((s) => {
            if (s.id !== action.payload.id) return s;
            const hasItem = s.schoolShifts.includes(action.payload.val);
            return {
              ...s,
              schoolShifts: hasItem
                ? s.schoolShifts.filter((x) => x !== action.payload.val)
                : [...s.schoolShifts, action.payload.val],
            };
          }),
        },
      };
    case 'TOGGLE_LEVELS': {
      const hasItem = state.data.schoolLevels.includes(action.payload);
      return {
        ...state,
        data: {
          ...state.data,
          schoolLevels: hasItem
            ? state.data.schoolLevels.filter((x) => x !== action.payload)
            : [...state.data.schoolLevels, action.payload],
        },
      };
    }
    case 'TOGGLE_SHIFTS': {
      const hasItem = state.data.schoolShifts.includes(action.payload);
      return {
        ...state,
        data: {
          ...state.data,
          schoolShifts: hasItem
            ? state.data.schoolShifts.filter((x) => x !== action.payload)
            : [...state.data.schoolShifts, action.payload],
        },
      };
    }
    case 'TOGGLE_MODULE': {
      if (action.payload === 'core') return state; // core is required
      const hasItem = state.data.modules.includes(action.payload);
      return {
        ...state,
        data: {
          ...state.data,
          modules: hasItem
            ? state.data.modules.filter((x) => x !== action.payload)
            : [...state.data.modules, action.payload],
        },
      };
    }
    case 'PROVISION_START':
      return {
        ...state,
        isProvisioning: true,
        provisionProgress: 10,
        provisionError: null,
      };
    case 'PROVISION_INCREMENT':
      return {
        ...state,
        provisionProgress: Math.min(state.provisionProgress + action.payload, 88),
      };
    case 'PROVISION_SUCCESS':
      return {
        ...state,
        isProvisioning: false,
        provisionProgress: 100,
        provisionDone: true,
        invitesSent: action.payload,
      };
    case 'PROVISION_ERROR':
      return {
        ...state,
        isProvisioning: false,
        provisionProgress: 0,
        provisionError: action.payload,
      };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Step validation helpers
// ---------------------------------------------------------------------------
export function validateCurrentStep(stepId: string, data: WizardData): { valid: boolean; error: string | null } {
  switch (stepId) {
    case 'type':
      if (!data.orgMode) {
        return { valid: false, error: 'Please select an organization type.' };
      }
      return { valid: true, error: null };
    case 'identity':
      if (!data.orgName.trim()) {
        return { valid: false, error: 'Name is required.' };
      }
      if (data.orgMode === 'standalone') {
        if (!data.orgSlug.trim()) {
          return { valid: false, error: 'Subdomain is required.' };
        }
        if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(data.orgSlug.trim())) {
          return { valid: false, error: 'Subdomain slug contains invalid characters.' };
        }
      }
      return { valid: true, error: null };
    case 'schools':
      if (data.orgMode === 'multi') {
        if (data.schools.length === 0) {
          return { valid: false, error: 'At least one school is required.' };
        }
        for (let i = 0; i < data.schools.length; i++) {
          const s = data.schools[i];
          if (!s.name.trim()) {
            return { valid: false, error: `School #${i + 1} name is required.` };
          }
          if (!s.slug.trim()) {
            return { valid: false, error: `School #${i + 1} subdomain is required.` };
          }
          if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(s.slug.trim())) {
            return { valid: false, error: `School #${i + 1} subdomain slug contains invalid characters.` };
          }
        }
        // Validate uniqueness of slugs
        const slugs = data.schools.map(s => s.slug.trim().toLowerCase());
        const hasDuplicates = slugs.some((s, idx) => slugs.indexOf(s) !== idx);
        if (hasDuplicates) {
          return { valid: false, error: 'Every school must have a unique subdomain slug.' };
        }
      }
      return { valid: true, error: null };
    case 'subscription':
      if (!data.plan) {
        return { valid: false, error: 'Please select a subscription plan.' };
      }
      return { valid: true, error: null };
    case 'modules':
      if (!data.modules.includes('core')) {
        return { valid: false, error: 'Core SIS module is required.' };
      }
      return { valid: true, error: null };
    case 'admin':
      if (!data.adminName.trim()) {
        return { valid: false, error: 'Administrator full name is required.' };
      }
      if (!data.adminEmail.trim()) {
        return { valid: false, error: 'Administrator email address is required.' };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.adminEmail.trim())) {
        return { valid: false, error: 'Please enter a valid email address.' };
      }
      // Validate per-school admin emails if provided
      if (data.orgMode === 'multi') {
        for (const school of data.schools) {
          if (school.adminEmail && !emailRegex.test(school.adminEmail.trim())) {
            return { valid: false, error: `Invalid email for school "${school.name || 'Unnamed'}".` };
          }
        }
      }
      return { valid: true, error: null };
    default:
      return { valid: true, error: null };
  }
}

export function useProvisionWizard() {
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_STATE);

  const visibleSteps = useMemo(() => {
    return STEPS.filter((s) =>
      state.data.orgMode === 'standalone' ? s.id !== 'schools' : true
    );
  }, [state.data.orgMode]);

  const currentStepDef = useMemo(() => {
    return visibleSteps[state.step];
  }, [visibleSteps, state.step]);

  const totalSteps = visibleSteps.length;
  const progressPercent = totalSteps > 1 ? (state.step / (totalSteps - 1)) * 100 : 0;

  const setOrgMode = useCallback((mode: OrgMode) => {
    dispatch({ type: 'SET_ORG_MODE', payload: mode });
  }, []);

  const updateField = useCallback((key: keyof WizardData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { key, value } });
  }, []);

  const addSchool = useCallback(() => {
    dispatch({ type: 'ADD_SCHOOL' });
  }, []);

  const removeSchool = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SCHOOL', payload: id });
  }, []);

  const updateSchool = useCallback((id: string, field: keyof SchoolEntry, value: any) => {
    dispatch({ type: 'UPDATE_SCHOOL', payload: { id, field, value } });
  }, []);

  const toggleSchoolLevels = useCallback((id: string, val: string) => {
    dispatch({ type: 'TOGGLE_SCHOOL_LEVELS', payload: { id, val } });
  }, []);

  const toggleSchoolShifts = useCallback((id: string, val: string) => {
    dispatch({ type: 'TOGGLE_SCHOOL_SHIFTS', payload: { id, val } });
  }, []);

  const toggleLevels = useCallback((val: string) => {
    dispatch({ type: 'TOGGLE_LEVELS', payload: val });
  }, []);

  const toggleShifts = useCallback((val: string) => {
    dispatch({ type: 'TOGGLE_SHIFTS', payload: val });
  }, []);

  const toggleModule = useCallback((val: string) => {
    dispatch({ type: 'TOGGLE_MODULE', payload: val });
  }, []);

  const prev = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const next = useCallback(() => {
    const { valid, error } = validateCurrentStep(currentStepDef.id, state.data);
    if (!valid && error) {
      dispatch({ type: 'PROVISION_ERROR', payload: error });
      return;
    }
    dispatch({ type: 'NEXT_STEP', payload: totalSteps - 1 });
  }, [currentStepDef.id, state.data, totalSteps]);

  const clearError = useCallback(() => {
    dispatch({ type: 'PROVISION_ERROR', payload: '' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const provision = useCallback(async () => {
    const { valid, error } = validateCurrentStep('admin', state.data);
    if (!valid && error) {
      dispatch({ type: 'PROVISION_ERROR', payload: error });
      return;
    }

    dispatch({ type: 'PROVISION_START' });

    let ticker: NodeJS.Timeout | undefined;
    const invitesSent: WizardState['invitesSent'] = [];

    try {
      ticker = setInterval(() => {
        const increment = Math.floor(Math.random() * 10) + 5;
        dispatch({ type: 'PROVISION_INCREMENT', payload: increment });
      }, 500);

      const { orgId, schoolIds } = await hierarchyApi.provisionOrganization({
        orgName: state.data.orgName,
        orgMode: state.data.orgMode,
        orgSlug: state.data.orgSlug,
        region: state.data.region,
        plan: state.data.plan,
        isStandaloneSchool: state.data.orgMode === 'standalone',
        schools: state.data.schools,
        schoolLevels: state.data.orgMode === 'standalone' ? state.data.schoolLevels : [],
        schoolShifts: state.data.orgMode === 'standalone' ? state.data.schoolShifts : [],
        adminName: state.data.adminName,
        adminEmail: state.data.adminEmail,
        modules: state.data.modules,
      });

      // ── Send invites ───────────────────────────────────────────
      if (state.data.adminEmail) {
        // For standalone: invite as school_admin scoped to the actual school (schoolIds[0])
        // For multi-school org: invite as org_admin scoped to the org
        const primaryTenantId = state.data.orgMode === 'standalone'
          ? (schoolIds[0] ?? orgId)
          : orgId;
        const primaryRole: AdminRole = state.data.orgMode === 'standalone'
          ? 'school_admin'
          : (state.data.adminRole ?? 'org_admin');
        const primaryTenantName = state.data.orgName;

        await inviteTenantAdmin(
          state.data.adminEmail,
          state.data.adminName,
          primaryTenantId,
          primaryRole
        );
        invitesSent.push({ email: state.data.adminEmail, name: state.data.adminName, role: primaryRole, tenantName: primaryTenantName });
      }

      // For multi-school orgs, send per-school admin invites
      if (state.data.orgMode === 'multi') {
        for (let i = 0; i < state.data.schools.length; i++) {
          const school = state.data.schools[i];
          const schoolId = schoolIds[i];
          if (school.adminEmail && schoolId) {
            try {
              await inviteTenantAdmin(
                school.adminEmail,
                school.adminName ?? '',
                schoolId,
                'school_admin'
              );
              invitesSent.push({ email: school.adminEmail, name: school.adminName ?? '', role: 'school_admin', tenantName: school.name });
            } catch (inviteErr: any) {
              // Don't fail the whole provisioning if one school invite fails
              console.error(`[provision] Failed to invite admin for school "${school.name}":`, inviteErr.message);
            }
          }
        }
      }

      if (ticker) clearInterval(ticker);
      dispatch({ type: 'PROVISION_SUCCESS', payload: invitesSent });
    } catch (err: any) {
      if (ticker) clearInterval(ticker);
      dispatch({ type: 'PROVISION_ERROR', payload: err.message || 'Provisioning failed. Please try again.' });
    }
  }, [state.data]);

  return {
    state,
    visibleSteps,
    currentStepDef,
    totalSteps,
    progressPercent,
    setOrgMode,
    updateField,
    addSchool,
    removeSchool,
    updateSchool,
    toggleSchoolLevels,
    toggleSchoolShifts,
    toggleLevels,
    toggleShifts,
    toggleModule,
    prev,
    next,
    clearError,
    reset,
    provision,
  };
}
