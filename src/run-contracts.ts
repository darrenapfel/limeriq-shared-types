import type { AgentConfig } from './agent-automation';
import type { TriggerEventType, AgentRunnerTarget } from './agent-automation';
import { isTriggerEventType, isAgentRunnerTarget } from './agent-automation';

// ── Run conclusion ──

export const RunConclusion = {
  PASS: 'pass',
  WARN: 'warn',
  FAIL: 'fail',
  ERROR: 'error',
  SKIPPED: 'skipped',
} as const;

export type RunConclusion = (typeof RunConclusion)[keyof typeof RunConclusion];

// ── Finding severity ──

export const FindingSeverity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

export type FindingSeverity = (typeof FindingSeverity)[keyof typeof FindingSeverity];

// ── Data interfaces ──

export interface Finding {
  severity: FindingSeverity;
  message: string;
  file?: string;
  line?: number;
  rule?: string;
  category?: string;
}

export interface Artifact {
  name: string;
  type: 'markdown' | 'json' | 'log';
  content: string;
}

export interface RunTelemetry {
  duration_ms: number;
  token_count: number;
  steps_executed: number;
  steps_skipped: number;
  llm_calls: number;
}

export interface RunContext {
  repo: string;
  pr_number?: number;
  sha: string;
  ref: string;
}

export interface RunRequest {
  workflow_path: string;
  trigger: TriggerEventType;
  context: RunContext;
  secrets_names: string[];
  runner_target: AgentRunnerTarget;
  agent_config?: AgentConfig;
}

export interface RunResult {
  conclusion: RunConclusion;
  findings: Finding[];
  artifacts: Artifact[];
  telemetry: RunTelemetry;
  started_at: string;
  completed_at: string;
  error?: string;
}

export interface RunHeartbeat {
  run_id: string;
  status: string;
  progress_pct?: number;
  current_step?: string;
}

export interface RunDispatch {
  run_id: string;
  request: RunRequest;
  runner_id: string;
  dispatched_at: string;
}

// ── Type guards ──

export function isRunConclusion(value: unknown): value is RunConclusion {
  return typeof value === 'string' && Object.values(RunConclusion).includes(value as RunConclusion);
}

export function isFindingSeverity(value: unknown): value is FindingSeverity {
  return typeof value === 'string' && Object.values(FindingSeverity).includes(value as FindingSeverity);
}

function isTelemetry(value: unknown): value is RunTelemetry {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.duration_ms === 'number' &&
    typeof t.token_count === 'number' &&
    typeof t.steps_executed === 'number' &&
    typeof t.steps_skipped === 'number' &&
    typeof t.llm_calls === 'number'
  );
}

function isFinding(value: unknown): value is Finding {
  if (typeof value !== 'object' || value === null) return false;
  const f = value as Record<string, unknown>;
  return isFindingSeverity(f.severity) && typeof f.message === 'string';
}

function isArtifact(value: unknown): value is Artifact {
  if (typeof value !== 'object' || value === null) return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.name === 'string' &&
    typeof a.type === 'string' &&
    (a.type === 'markdown' || a.type === 'json' || a.type === 'log') &&
    typeof a.content === 'string'
  );
}

function isRunContext(value: unknown): value is RunContext {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Record<string, unknown>;
  return typeof c.repo === 'string' && typeof c.sha === 'string' && typeof c.ref === 'string';
}

export function isRunResult(value: unknown): value is RunResult {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (
    !isRunConclusion(obj.conclusion) ||
    !Array.isArray(obj.findings) ||
    !Array.isArray(obj.artifacts) ||
    !isTelemetry(obj.telemetry) ||
    typeof obj.started_at !== 'string' ||
    typeof obj.completed_at !== 'string'
  ) return false;
  // Validate each finding and artifact
  for (const f of obj.findings as unknown[]) {
    if (!isFinding(f)) return false;
  }
  for (const a of obj.artifacts as unknown[]) {
    if (!isArtifact(a)) return false;
  }
  // Optional error must be string if present
  if (obj.error !== undefined && typeof obj.error !== 'string') return false;
  return true;
}

export function isRunRequest(value: unknown): value is RunRequest {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.workflow_path === 'string' &&
    isTriggerEventType(obj.trigger) &&
    isRunContext(obj.context) &&
    Array.isArray(obj.secrets_names) &&
    (obj.secrets_names as unknown[]).every(s => typeof s === 'string') &&
    isAgentRunnerTarget(obj.runner_target)
  );
}
