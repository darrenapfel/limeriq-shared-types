// ── Agent runner targets ──

export const AgentRunnerTarget = {
  GITHUB_ACTIONS: 'github_actions',
  SELF_HOSTED: 'self_hosted',
  LOCAL: 'local',
} as const;

export type AgentRunnerTarget = (typeof AgentRunnerTarget)[keyof typeof AgentRunnerTarget];

// ── SDLC trigger event types ──

export const TriggerEventType = {
  PULL_REQUEST: 'pull_request',
  ISSUE_COMMENT: 'issue_comment',
  PUSH: 'push',
  SCHEDULE: 'schedule',
  WORKFLOW_DISPATCH: 'workflow_dispatch',
  AGENT_COMPLETED: 'agent_completed',
} as const;

export type TriggerEventType = (typeof TriggerEventType)[keyof typeof TriggerEventType];

// ── Autonomy levels ──

export const AutonomyLevel = {
  L0: 'L0',
  L1: 'L1',
  L2: 'L2',
  L3: 'L3',
  L4: 'L4',
} as const;

export type AutonomyLevel = (typeof AutonomyLevel)[keyof typeof AutonomyLevel];

// ── Configuration interfaces ──

export interface TriggerConfig {
  event: TriggerEventType;
  actions?: string[];
  paths?: string[];
  paths_exclude?: string[];
  pattern?: string;
  cron?: string;
}

export interface AutonomyConfig {
  initial_level: AutonomyLevel;
  max_level: AutonomyLevel;
  trust_threshold?: number;
}

export interface ConcurrencyConfig {
  group: string;
  cancel_in_progress: boolean;
}

export interface ReportingConfig {
  github_check: boolean;
  pr_comment: boolean;
  check_name?: string;
}

export interface RunnerConfig {
  target: AgentRunnerTarget;
  timeout_minutes: number;
  concurrency?: ConcurrencyConfig;
}

export interface AgentConfig {
  name: string;
  description: string;
  triggers: TriggerConfig[];
  runner: RunnerConfig;
  autonomy: AutonomyConfig;
  reporting: ReportingConfig;
  memory?: Record<string, unknown>;
}

export interface ProviderManifest {
  provider_id: string;
  cli_command: string;
  required_secrets: string[];
  auth_mode: string;
}

// ── Type guards ──

export function isAgentRunnerTarget(value: unknown): value is AgentRunnerTarget {
  return typeof value === 'string' && Object.values(AgentRunnerTarget).includes(value as AgentRunnerTarget);
}

export function isTriggerEventType(value: unknown): value is TriggerEventType {
  return typeof value === 'string' && Object.values(TriggerEventType).includes(value as TriggerEventType);
}

export function isAutonomyLevel(value: unknown): value is AutonomyLevel {
  return typeof value === 'string' && Object.values(AutonomyLevel).includes(value as AutonomyLevel);
}
