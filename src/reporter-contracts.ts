import type { RunConclusion } from './run-contracts';
import type { Artifact } from './run-contracts';

// ── GitHub check conclusion mapping ──

export const GitHubCheckConclusionMap: Record<string, string> = {
  pass: 'success',
  warn: 'neutral',
  fail: 'failure',
  error: 'failure',
  skipped: 'skipped',
} as const;

export function mapRunConclusionToGitHub(conclusion: RunConclusion): string {
  return GitHubCheckConclusionMap[conclusion] ?? 'failure';
}

// ── GitHub check payload ──

export interface GitHubCheckAnnotation {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: 'notice' | 'warning' | 'failure';
  message: string;
}

export interface GitHubCheckPayload {
  name: string;
  head_sha: string;
  conclusion: string;
  summary: string;
  text?: string;
  annotations: GitHubCheckAnnotation[];
}

// ── GitHub comment payload ──

export interface GitHubCommentPayload {
  marker_id: string;
  body: string;
  pr_number: number;
}

// ── Reporter output ──

export interface ReporterOutput {
  check?: GitHubCheckPayload;
  comment?: GitHubCommentPayload;
  artifacts: Artifact[];
}
