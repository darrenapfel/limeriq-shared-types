/**
 * Setup & Onboarding contracts for limerIQ self-service onboarding.
 * Used by `limeriq setup github-app` and control plane /api/setup/* routes.
 */

/** Request to set up a GitHub App connection */
export interface GitHubAppSetupRequest {
  app_id: number;
  webhook_secret: string;
  private_key_path?: string;
  /** If true, skip interactive prompts */
  non_interactive?: boolean;
}

/** Result of GitHub App setup validation */
export interface GitHubAppSetupResult {
  valid: boolean;
  app_id: number;
  app_name?: string;
  installation_id?: number;
  permissions_ok: boolean;
  missing_permissions: string[];
  webhook_configured: boolean;
  errors: string[];
}

/** Validation result for setup steps */
export interface SetupValidationResult {
  step: string;
  valid: boolean;
  message: string;
  details?: Record<string, unknown>;
}

/** Onboarding step tracking */
export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  required: boolean;
  error?: string;
  completed_at?: string;
}

/** Health check result from /health/deep */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  timestamp: string;
  uptime_seconds: number;
  components: HealthCheckComponent[];
}

/** Individual component health */
export interface HealthCheckComponent {
  name: string;
  status: 'ok' | 'degraded' | 'error';
  latency_ms?: number;
  message?: string;
  last_checked: string;
}

/** Required GitHub App permissions for limerIQ agents */
export const REQUIRED_GITHUB_APP_PERMISSIONS = {
  checks: 'write',
  contents: 'read',
  issues: 'write',
  metadata: 'read',
  pull_requests: 'write',
} as const;

/** Default webhook events the GitHub App should subscribe to */
export const DEFAULT_WEBHOOK_EVENTS = [
  'check_run',
  'pull_request',
  'push',
] as const;
