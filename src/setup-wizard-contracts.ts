/**
 * Setup wizard contracts for limerIQ self-hosted onboarding flow.
 * Used by /api/setup/* endpoints and the dashboard SetupWizard page.
 */

// ── Setup step definitions ──

export const SetupStepId = {
  ENV_CHECK: 'env-check',
  DB_MIGRATION: 'db-migration',
  GITHUB_APP: 'github-app',
  RUNNER_REGISTRATION: 'runner-registration',
  FIRST_AGENT: 'first-agent',
  VERIFICATION_RUN: 'verification-run',
} as const;

export type SetupStepId = (typeof SetupStepId)[keyof typeof SetupStepId];

export function isSetupStepId(value: unknown): value is SetupStepId {
  return typeof value === 'string' && Object.values(SetupStepId).includes(value as SetupStepId);
}

// ── Setup step result ──

export interface SetupStepResult {
  step_id: SetupStepId;
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'pending';
  message: string;
  remediation?: string;
  details?: Record<string, unknown>;
}

// ── Overall setup status ──

export interface SetupStatus {
  complete: boolean;
  steps: SetupStepResult[];
  current_step?: SetupStepId;
  timestamp: string;
}

// ── Runner bootstrap token ──

export interface RunnerBootstrapToken {
  token: string;
  control_api_url: string;
  /** Pre-built command the operator can copy-paste */
  start_command: string;
  /** When this token expires */
  expires_at: string;
  /** Whether this token has been used */
  used: boolean;
}

// ── Setup diagnostics ──

export interface SetupDiagnostic {
  category: 'env' | 'database' | 'github' | 'runner' | 'agent' | 'network';
  severity: 'info' | 'warning' | 'error';
  message: string;
  remediation?: string;
  timestamp: string;
}
