import type { AutonomyLevel } from './agent-automation';

// ── Trust Score Components (30-day rolling window) ──

export interface TrustComponent {
  accuracy: number;      // 0-1, finding false positive rate
  reliability: number;   // 0-1, run success rate
  safety: number;        // 0-1, no security violations
  usefulness: number;    // 0-1, override rate (low = useful)
  consistency: number;   // 0-1, outcome variance
}

export interface TrustScore {
  agent_definition_id: string;
  installation_id: number;
  score: number;            // 0-1 weighted composite
  components: TrustComponent;
  effective_level: AutonomyLevel;
  run_count_30d: number;
  last_calculated_at: string;
}

// ── Action Classification for Autonomy Gating ──

export const ActionCategory = {
  OBSERVE: 'observe',       // read-only: run workflow, collect findings
  COMMENT: 'comment',       // post PR comments, check results
  SUGGEST: 'suggest',       // suggest code changes (PR suggestions)
  COMMIT: 'commit',         // push commits to feature branches
  APPROVE: 'approve',       // approve/request-changes on PRs
} as const;

export type ActionCategory = (typeof ActionCategory)[keyof typeof ActionCategory];

export const ACTION_REQUIRED_LEVEL: Record<ActionCategory, AutonomyLevel> = {
  observe: 'L0',
  comment: 'L1',
  suggest: 'L2',
  commit: 'L3',
  approve: 'L4',
};

export interface ActionClassification {
  action: string;           // e.g. "push_commit", "post_comment"
  category: ActionCategory;
  required_level: AutonomyLevel;
  description: string;
}

export interface AutonomyGateResult {
  allowed: boolean;
  action: ActionClassification;
  agent_level: AutonomyLevel;
  trust_score: number;
  requires_approval: boolean;
  approval_id?: string;
  reason: string;
}

// ── Approval Routing ──

export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'timed_out';
export type ApprovalTimeoutDefault = 'deny' | 'approve_l0';
export type ApprovalChannel = 'github' | 'mobile' | 'timeout';

export interface AgentApprovalRequest {
  id: string;
  agent_definition_id: string;
  run_request_id: string;
  installation_id: number;
  repo_full_name: string;
  pr_number?: number;
  action: ActionClassification;
  agent_name: string;
  trust_score: number;
  context_summary: string;
  status: ApprovalStatus;
  timeout_seconds: number;
  default_on_timeout: ApprovalTimeoutDefault;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_channel?: ApprovalChannel;
}

// ── Agent Memory ──

export interface AgentMemoryEntry {
  id: string;
  agent_definition_id: string;
  installation_id: number;
  repo_full_name: string;
  memory_key: string;          // e.g. "false_positives", "learned_patterns"
  memory_value: unknown;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}
