import { describe, it, expect } from 'vitest';
import {
  MANUAL_REVIEW_BENCHMARKS_MS,
  isSeverityBreakdown,
  isDispatchCondition,
  isPackCategory,
  isHotspotEntry,
  isTriggerEventType,
} from '../src';

import type {
  SeverityBreakdown,
  AgentTelemetryRecord,
  TelemetryDailyRollup,
  TelemetryWeeklyRollup,
  WeeklyDigest,
  DigestSummary,
  AgentDigestDetail,
  HotspotEntry,
  DispatchCondition,
  ResultMapping,
  AgentDispatchRule,
  AgentDispatchResult,
  AutomationPackManifest,
  PackInstallRequest,
  PackInstallResult,
  PackCategory,
} from '../src';

// ── Severity Breakdown type guard ──

describe('isSeverityBreakdown', () => {
  it('accepts valid breakdown', () => {
    const valid: SeverityBreakdown = { critical: 1, high: 2, medium: 3, low: 4, info: 5 };
    expect(isSeverityBreakdown(valid)).toBe(true);
  });

  it('accepts zero values', () => {
    expect(isSeverityBreakdown({ critical: 0, high: 0, medium: 0, low: 0, info: 0 })).toBe(true);
  });

  it('rejects null', () => {
    expect(isSeverityBreakdown(null)).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(isSeverityBreakdown({ critical: 1, high: 2 })).toBe(false);
  });

  it('rejects string values', () => {
    expect(isSeverityBreakdown({ critical: '1', high: 2, medium: 3, low: 4, info: 5 })).toBe(false);
  });
});

// ── Dispatch Condition type guard ──

describe('isDispatchCondition', () => {
  it('accepts conclusion-type condition', () => {
    const cond: DispatchCondition = { type: 'conclusion', operator: 'eq', value: 'fail' };
    expect(isDispatchCondition(cond)).toBe(true);
  });

  it('accepts finding_severity with numeric value', () => {
    expect(isDispatchCondition({ type: 'finding_severity', operator: 'gte', value: 3 })).toBe(true);
  });

  it('accepts risk_score condition', () => {
    expect(isDispatchCondition({ type: 'risk_score', operator: 'lte', value: 0.5 })).toBe(true);
  });

  it('accepts custom condition with field', () => {
    expect(isDispatchCondition({ type: 'custom', operator: 'contains', value: 'sql-injection', field: '$.findings[0].rule' })).toBe(true);
  });

  it('rejects invalid type', () => {
    expect(isDispatchCondition({ type: 'invalid', operator: 'eq', value: 'x' })).toBe(false);
  });

  it('rejects invalid operator', () => {
    expect(isDispatchCondition({ type: 'conclusion', operator: 'ne', value: 'x' })).toBe(false);
  });

  it('rejects null', () => {
    expect(isDispatchCondition(null)).toBe(false);
  });

  it('rejects missing value', () => {
    expect(isDispatchCondition({ type: 'conclusion', operator: 'eq' })).toBe(false);
  });
});

// ── Pack Category type guard ──

describe('isPackCategory', () => {
  const validCategories: PackCategory[] = ['code-review', 'security', 'ci-triage', 'infrastructure', 'release', 'custom'];

  it('accepts all valid categories', () => {
    for (const cat of validCategories) {
      expect(isPackCategory(cat)).toBe(true);
    }
  });

  it('rejects invalid strings', () => {
    expect(isPackCategory('monitoring')).toBe(false);
    expect(isPackCategory('workflow')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isPackCategory(42)).toBe(false);
    expect(isPackCategory(null)).toBe(false);
    expect(isPackCategory(undefined)).toBe(false);
  });
});

// ── Hotspot Entry type guard ──

describe('isHotspotEntry', () => {
  it('accepts valid hotspot', () => {
    const entry: HotspotEntry = { path: 'src/lib/auth.ts', finding_count: 5, risk_trend: 'rising' };
    expect(isHotspotEntry(entry)).toBe(true);
  });

  it('accepts all trend values', () => {
    for (const trend of ['rising', 'stable', 'falling'] as const) {
      expect(isHotspotEntry({ path: '/test', finding_count: 1, risk_trend: trend })).toBe(true);
    }
  });

  it('rejects invalid trend', () => {
    expect(isHotspotEntry({ path: '/test', finding_count: 1, risk_trend: 'unknown' })).toBe(false);
  });

  it('rejects non-numeric finding_count', () => {
    expect(isHotspotEntry({ path: '/test', finding_count: 'many', risk_trend: 'stable' })).toBe(false);
  });

  it('rejects null', () => {
    expect(isHotspotEntry(null)).toBe(false);
  });
});

// ── MANUAL_REVIEW_BENCHMARKS_MS completeness ──

describe('MANUAL_REVIEW_BENCHMARKS_MS', () => {
  it('contains all expected agent types', () => {
    const expected = ['pr-guard', 'security-review-expert', 'root-cause-analysis', 'iac-preflight', 'consensus-code-approval', 'default'];
    for (const key of expected) {
      expect(MANUAL_REVIEW_BENCHMARKS_MS[key]).toBeDefined();
      expect(typeof MANUAL_REVIEW_BENCHMARKS_MS[key]).toBe('number');
    }
  });

  it('all benchmarks are positive milliseconds', () => {
    for (const [key, value] of Object.entries(MANUAL_REVIEW_BENCHMARKS_MS)) {
      expect(value).toBeGreaterThan(0);
    }
  });

  it('has a default fallback', () => {
    expect(MANUAL_REVIEW_BENCHMARKS_MS['default']).toBe(30 * 60_000);
  });
});

// ── AGENT_COMPLETED trigger event ──

describe('AGENT_COMPLETED trigger event', () => {
  it('is a valid TriggerEventType', () => {
    expect(isTriggerEventType('agent_completed')).toBe(true);
  });
});

// ── Interface structural tests ──

describe('telemetry interface structures', () => {
  it('AgentTelemetryRecord has all required fields', () => {
    const record: AgentTelemetryRecord = {
      id: 'tel-1',
      run_execution_id: 're-1',
      agent_definition_id: 'ad-1',
      installation_id: 12345,
      repo_full_name: 'org/repo',
      trigger_event: 'pull_request',
      conclusion: 'pass',
      findings_count: 3,
      severity_breakdown: { critical: 0, high: 1, medium: 1, low: 1, info: 0 },
      duration_ms: 15000,
      token_count: 8000,
      steps_executed: 4,
      llm_calls: 2,
      autonomy_level_used: 'L1',
      trust_score_at_run: 0.75,
      created_at: '2026-03-01T00:00:00Z',
    };
    expect(record.id).toBe('tel-1');
    expect(record.findings_count).toBe(3);
    expect(isSeverityBreakdown(record.severity_breakdown)).toBe(true);
  });

  it('WeeklyDigest has summary and details', () => {
    const digest: WeeklyDigest = {
      installation_id: 12345,
      week_start: '2026-02-24',
      summary: {
        total_runs: 50,
        issues_caught: 15,
        estimated_hours_saved: 6,
        accuracy_change_pct: 5,
      },
      agent_details: [{
        agent_definition_id: 'ad-1',
        agent_name: 'pr-guard',
        total_runs: 30,
        passed_runs: 28,
        failed_runs: 2,
        findings_count: 10,
        avg_duration_ms: 12000,
        estimated_hours_saved: 4,
      }],
      hotspots: [{
        path: 'src/auth/',
        finding_count: 8,
        risk_trend: 'rising',
      }],
      recommendations: ['Consider adding security-review-expert for high-severity findings'],
    };
    expect(digest.summary.total_runs).toBe(50);
    expect(digest.agent_details).toHaveLength(1);
    expect(digest.hotspots).toHaveLength(1);
  });

  it('AgentDispatchRule has all required fields', () => {
    const rule: AgentDispatchRule = {
      id: 'dr-1',
      source_agent_id: 'ad-1',
      target_agent_id: 'ad-2',
      installation_id: 12345,
      condition: { type: 'finding_severity', operator: 'gte', value: 'high' },
      result_mapping: {
        variable_mappings: { 'PR_NUMBER': '$.context.pr_number' },
        inherit_context: true,
      },
      enabled: true,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
    };
    expect(rule.id).toBe('dr-1');
    expect(rule.enabled).toBe(true);
    expect(isDispatchCondition(rule.condition)).toBe(true);
  });

  it('AutomationPackManifest has all required fields', () => {
    const manifest: AutomationPackManifest = {
      pack_id: 'pr-guard-pack',
      name: 'PR Guard',
      version: '1.0.0',
      description: 'Automated PR review agent',
      category: 'code-review',
      workflow_slug: 'pr-guard-orchestrator',
      agent_config: {
        triggers: [{ event: 'pull_request' }],
        runner: { target: 'github_actions', timeout_minutes: 10 },
        autonomy: { initial_level: 'L0', max_level: 'L2' },
        reporting: { github_check: true, pr_comment: true },
      },
      default_trust_level: 'L0',
    };
    expect(manifest.pack_id).toBe('pr-guard-pack');
    expect(isPackCategory(manifest.category)).toBe(true);
  });

  it('PackInstallResult tracks created resources', () => {
    const result: PackInstallResult = {
      agent_definition_id: 'ad-1',
      trigger_ids: ['t-1', 't-2'],
      github_actions_file: '.github/workflows/limeriq-pr-guard.yml',
      dispatch_rule_ids: ['dr-1'],
    };
    expect(result.trigger_ids).toHaveLength(2);
    expect(result.github_actions_file).toBeDefined();
  });
});
