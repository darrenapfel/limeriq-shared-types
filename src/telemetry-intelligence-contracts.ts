import type { AutonomyLevel, TriggerConfig, RunnerConfig, AutonomyConfig, ReportingConfig } from './agent-automation';

// ── Severity Breakdown (per-run findings by severity) ──

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

// ── Agent Telemetry (per-run metrics) ──

export interface AgentTelemetryRecord {
  id: string;
  run_execution_id: string;
  agent_definition_id: string;
  installation_id: number;
  repo_full_name: string;
  trigger_event: string;
  conclusion: string;  // pass | warn | fail | error | skipped
  findings_count: number;
  severity_breakdown: SeverityBreakdown;
  duration_ms: number;
  token_count: number;
  steps_executed: number;
  llm_calls: number;
  autonomy_level_used: string;  // L0-L4
  trust_score_at_run: number;
  created_at: string;
}

// ── Aggregation Rollups ──

export interface TelemetryDailyRollup {
  id: string;
  agent_definition_id: string;
  installation_id: number;
  rollup_date: string;
  total_runs: number;
  passed_runs: number;
  failed_runs: number;
  total_findings: number;
  severity_totals: SeverityBreakdown;
  avg_duration_ms: number;
  total_tokens: number;
  hotspot_paths: HotspotEntry[];
  created_at: string;
}

export interface TelemetryWeeklyRollup {
  id: string;
  agent_definition_id: string;
  installation_id: number;
  week_start: string;
  total_runs: number;
  passed_runs: number;
  failed_runs: number;
  total_findings: number;
  severity_totals: SeverityBreakdown;
  avg_duration_ms: number;
  total_tokens: number;
  hotspot_paths: HotspotEntry[];
  estimated_hours_saved: number;
  accuracy_delta_pct: number;
  recommendations: string[];
  created_at: string;
}

// ── Weekly Digest ──

export interface WeeklyDigest {
  installation_id: number;
  week_start: string;
  summary: DigestSummary;
  agent_details: AgentDigestDetail[];
  hotspots: HotspotEntry[];
  recommendations: string[];
}

export interface DigestSummary {
  total_runs: number;
  issues_caught: number;
  estimated_hours_saved: number;
  accuracy_change_pct: number;
}

export interface AgentDigestDetail {
  agent_definition_id: string;
  agent_name: string;
  total_runs: number;
  passed_runs: number;
  failed_runs: number;
  findings_count: number;
  avg_duration_ms: number;
  estimated_hours_saved: number;
}

export interface HotspotEntry {
  path: string;
  finding_count: number;
  risk_trend: 'rising' | 'stable' | 'falling';
}

// ── Time Savings Benchmarks ──

export const MANUAL_REVIEW_BENCHMARKS_MS: Record<string, number> = {
  'pr-guard': 25 * 60_000,
  'security-review-expert': 45 * 60_000,
  'root-cause-analysis': 60 * 60_000,
  'iac-preflight': 30 * 60_000,
  'consensus-code-approval': 90 * 60_000,
  'default': 30 * 60_000,
};

// ── Agent-to-Agent Dispatch ──

export interface DispatchCondition {
  type: 'conclusion' | 'finding_severity' | 'risk_score' | 'custom';
  operator: 'eq' | 'gte' | 'lte' | 'contains';
  value: string | number;
  field?: string;  // JSON path for custom
}

export interface ResultMapping {
  variable_mappings: Record<string, string>;  // target_var → JSON path in source result
  inherit_context: boolean;  // copy repo, sha, pr_number
}

export interface AgentDispatchRule {
  id: string;
  source_agent_id: string;
  target_agent_id: string;
  installation_id: number;
  condition: DispatchCondition;
  result_mapping: ResultMapping;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentDispatchResult {
  rule_id: string;
  source_run_request_id: string;
  target_run_request_id: string;
  target_agent_id: string;
  dispatched: boolean;
  reason: string;
}

// ── Automation Pack ──

export type PackCategory = 'code-review' | 'security' | 'ci-triage' | 'infrastructure' | 'release' | 'custom';

export interface AutomationPackManifest {
  pack_id: string;
  name: string;
  version: string;
  description: string;
  category: PackCategory;
  workflow_slug: string;
  agent_config: {
    triggers: TriggerConfig[];
    runner: RunnerConfig;
    autonomy: AutonomyConfig;
    reporting: ReportingConfig;
  };
  default_trust_level: AutonomyLevel;
  dispatch_rules?: Array<{
    target_pack: string;
    condition: DispatchCondition;
  }>;
}

export interface PackInstallRequest {
  pack_id: string;
  installation_id: number;
  repo_full_name: string;
  runner_target: string;
}

export interface PackInstallResult {
  agent_definition_id: string;
  trigger_ids: string[];
  github_actions_file?: string;
  dispatch_rule_ids: string[];
}

// ── Type Guards ──

export function isSeverityBreakdown(value: unknown): value is SeverityBreakdown {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.critical === 'number' &&
    typeof v.high === 'number' &&
    typeof v.medium === 'number' &&
    typeof v.low === 'number' &&
    typeof v.info === 'number'
  );
}

export function isDispatchCondition(value: unknown): value is DispatchCondition {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const validTypes = ['conclusion', 'finding_severity', 'risk_score', 'custom'];
  const validOps = ['eq', 'gte', 'lte', 'contains'];
  return (
    typeof v.type === 'string' && validTypes.includes(v.type) &&
    typeof v.operator === 'string' && validOps.includes(v.operator) &&
    (typeof v.value === 'string' || typeof v.value === 'number')
  );
}

export function isPackCategory(value: unknown): value is PackCategory {
  if (typeof value !== 'string') return false;
  const valid: PackCategory[] = ['code-review', 'security', 'ci-triage', 'infrastructure', 'release', 'custom'];
  return valid.includes(value as PackCategory);
}

export function isHotspotEntry(value: unknown): value is HotspotEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const validTrends = ['rising', 'stable', 'falling'];
  return (
    typeof v.path === 'string' &&
    typeof v.finding_count === 'number' &&
    typeof v.risk_trend === 'string' && validTrends.includes(v.risk_trend)
  );
}
