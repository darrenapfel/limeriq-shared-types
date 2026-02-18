import type { TriggerEventType, AgentRunnerTarget, AutonomyLevel, ReportingConfig } from './agent-automation';
import type { RunRequest, RunResult } from './run-contracts';

// ── Run Request Status ──

export const RunRequestStatus = {
  QUEUED: 'queued',
  CLAIMED: 'claimed',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DEAD_LETTER: 'dead_letter',
} as const;

export type RunRequestStatus = (typeof RunRequestStatus)[keyof typeof RunRequestStatus];

// ── GitHub App Installation ──

export interface GitHubAppInstallation {
  id: string;
  installation_id: number;
  account_login: string;
  account_type: 'Organization' | 'User';
  target_type: 'all' | 'selected';
  repositories: string[];
  permissions: Record<string, string>;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Agent Definition ──

export interface AgentDefinition {
  id: string;
  installation_id: number;
  name: string;
  description: string;
  workflow_source: string;
  repo_full_name: string;
  runner_target: AgentRunnerTarget;
  autonomy_level: AutonomyLevel;
  max_autonomy_level: AutonomyLevel;
  reporting_config: ReportingConfig;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ── Agent Trigger ──

export interface AgentTrigger {
  id: string;
  agent_definition_id: string;
  event: TriggerEventType;
  actions: string[] | null;
  paths: string[] | null;
  paths_exclude: string[] | null;
  pattern: string | null;
  cron: string | null;
  created_at: string;
}

// ── Control Plane Run Request ──

export interface ControlPlaneRunRequest {
  id: string;
  agent_definition_id: string;
  installation_id: number;
  repo_full_name: string;
  trigger_event: TriggerEventType;
  webhook_delivery_id: string | null;
  dedup_hash: string | null;
  status: RunRequestStatus;
  run_request_payload: RunRequest;
  runner_id: string | null;
  lease_expires_at: string | null;
  retry_count: number;
  max_retries: number;
  error: string | null;
  claimed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  source_run_request_id?: string;
  inherited_variables?: Record<string, string>;
}

// ── Run Execution ──

export interface RunExecution {
  id: string;
  run_request_id: string;
  runner_id: string;
  status: 'running' | 'succeeded' | 'failed' | 'timed_out';
  started_at: string;
  completed_at: string | null;
  run_result: RunResult | null;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
}

// ── Org Policy ──

export interface OrgPolicy {
  id: string;
  installation_id: number;
  repo_full_name: string | null;
  ai_allowed: boolean;
  ai_allowed_conditions: Record<string, unknown> | null;
  sensitive_paths: string[] | null;
  max_autonomy: AutonomyLevel;
  created_at: string;
  updated_at: string;
}

// ── Runner Poll/Claim Contracts ──

export interface RunnerPollRequest {
  runner_id: string;
  capabilities: string[];
}

export interface RunnerPollResponse {
  run_request: ControlPlaneRunRequest | null;
  poll_interval_ms: number;
}

export interface RunClaimResponse {
  claimed: boolean;
  run_request: ControlPlaneRunRequest | null;
  lease_seconds: number;
}

export interface RunCompleteRequest {
  run_request_id: string;
  runner_id: string;
  result: RunResult;
}

export interface RunFailRequest {
  run_request_id: string;
  runner_id: string;
  error: string;
  retry: boolean;
}

// ── Normalized Event (used by control plane internally) ──

export interface NormalizedEvent {
  event: TriggerEventType;
  action: string;
  repo: string;
  sha: string;
  ref: string;
  pr_number: number | null;
  changed_files: string[] | null;
  comment_body: string | null;
  sender: string;
  installation_id: number;
  delivery_id: string;
  is_fork: boolean;
}

// ── Dispatch Result ──

export type DispatchOutcome = 'dispatched' | 'blocked' | 'deduped' | 'error';

export interface DispatchResult {
  agent_definition_id: string;
  agent_name: string;
  outcome: DispatchOutcome;
  run_request_id: string | null;
  reason: string | null;
}

// ── Policy Decision ──

export interface PolicyDecision {
  allowed: boolean;
  deterministic_only: boolean;
  capped_autonomy: AutonomyLevel;
  sensitive_files_touched: string[];
  reason: string | null;
}
