/**
 * Deployment profile contracts for limerIQ self-hosted Command Center.
 * Supports two profiles: standard Postgres (with PostgREST sidecar) and hosted Supabase.
 */

// ── Deployment profiles ──

export const DeploymentProfile = {
  POSTGRES: 'postgres',
  SUPABASE: 'supabase',
} as const;

export type DeploymentProfile = (typeof DeploymentProfile)[keyof typeof DeploymentProfile];

export function isDeploymentProfile(value: unknown): value is DeploymentProfile {
  return typeof value === 'string' && Object.values(DeploymentProfile).includes(value as DeploymentProfile);
}

// ── Database configuration ──

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  /** Postgres role used for application queries */
  user: string;
  /** Connection password (sourced from env) */
  password_env: string;
  /** SSL mode: disable, require, verify-ca, verify-full */
  ssl_mode?: 'disable' | 'require' | 'verify-ca' | 'verify-full';
}

// ── PostgREST configuration ──

export interface PostgRESTConfig {
  /** PostgREST base URL (e.g. http://postgrest:3000) */
  url: string;
  /** Postgres schemas to expose */
  db_schemas: string;
  /** Anonymous role for unauthenticated access */
  db_anon_role: string;
  /** JWT secret for PostgREST token verification */
  jwt_secret_env: string;
}

// ── Compose configuration ──

export interface ComposeConfig {
  profile: DeploymentProfile;
  /** Path to docker-compose file */
  compose_file: string;
  database?: DatabaseConfig;
  postgrest?: PostgRESTConfig;
  /** Supabase project URL (supabase profile only) */
  supabase_url?: string;
  /** Supabase service role key env var name (supabase profile only) */
  supabase_service_role_key_env?: string;
  /** Control plane container port */
  control_port: number;
  /** Runner container name */
  runner_name?: string;
}

// ── Self-hosted validation ──

export interface SelfHostedValidationCheck {
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'warn';
  message: string;
  remediation?: string;
}

export interface SelfHostedValidationResult {
  profile: DeploymentProfile;
  passed: boolean;
  checks: SelfHostedValidationCheck[];
  timestamp: string;
}
