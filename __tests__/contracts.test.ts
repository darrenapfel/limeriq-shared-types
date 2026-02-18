import { describe, it, expect } from 'vitest';
import {
  // agent-automation enums
  AgentRunnerTarget,
  TriggerEventType,
  AutonomyLevel,
  isAgentRunnerTarget,
  isTriggerEventType,
  isAutonomyLevel,
  // run-contracts enums
  RunConclusion,
  FindingSeverity,
  isRunConclusion,
  isFindingSeverity,
  isRunResult,
  isRunRequest,
  // reporter-contracts
  GitHubCheckConclusionMap,
  mapRunConclusionToGitHub,
  // constants enums
  RunConclusionEnum,
  SdlcTriggerEvent,
} from '../src';

import type {
  TriggerConfig,
  AutonomyConfig,
  AgentConfig,
  RunnerConfig,
  ReportingConfig,
  ProviderManifest,
  RunRequest,
  RunResult,
  RunTelemetry,
  Finding,
  Artifact,
  RunContext,
  RunHeartbeat,
  RunDispatch,
  GitHubCheckPayload,
  GitHubCheckAnnotation,
  GitHubCommentPayload,
  ReporterOutput,
} from '../src';

// ── Enum string literal uniqueness ──

describe('enum uniqueness', () => {
  const checkUniqueness = (name: string, obj: Record<string, string>) => {
    it(`${name} has no duplicate values`, () => {
      const values = Object.values(obj);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    it(`${name} values are all strings`, () => {
      for (const val of Object.values(obj)) {
        expect(typeof val).toBe('string');
      }
    });
  };

  checkUniqueness('AgentRunnerTarget', AgentRunnerTarget);
  checkUniqueness('TriggerEventType', TriggerEventType);
  checkUniqueness('AutonomyLevel', AutonomyLevel);
  checkUniqueness('RunConclusion', RunConclusion);
  checkUniqueness('FindingSeverity', FindingSeverity);
  checkUniqueness('RunConclusionEnum', RunConclusionEnum);
  checkUniqueness('SdlcTriggerEvent', SdlcTriggerEvent);
});

// ── RunConclusion / RunConclusionEnum consistency ──

describe('RunConclusion and RunConclusionEnum consistency', () => {
  it('have the same values', () => {
    const rcValues = new Set(Object.values(RunConclusion));
    const rceValues = new Set(Object.values(RunConclusionEnum));
    expect(rcValues).toEqual(rceValues);
  });
});

// ── TriggerEventType / SdlcTriggerEvent consistency ──

describe('TriggerEventType and SdlcTriggerEvent consistency', () => {
  it('have the same values', () => {
    const tetValues = new Set(Object.values(TriggerEventType));
    const steValues = new Set(Object.values(SdlcTriggerEvent));
    expect(tetValues).toEqual(steValues);
  });
});

// ── Type guards ──

describe('type guards', () => {
  describe('isAgentRunnerTarget', () => {
    it('accepts valid targets', () => {
      expect(isAgentRunnerTarget('github_actions')).toBe(true);
      expect(isAgentRunnerTarget('self_hosted')).toBe(true);
      expect(isAgentRunnerTarget('local')).toBe(true);
    });
    it('rejects invalid values', () => {
      expect(isAgentRunnerTarget('invalid')).toBe(false);
      expect(isAgentRunnerTarget(42)).toBe(false);
      expect(isAgentRunnerTarget(null)).toBe(false);
    });
  });

  describe('isTriggerEventType', () => {
    it('accepts valid events', () => {
      expect(isTriggerEventType('pull_request')).toBe(true);
      expect(isTriggerEventType('push')).toBe(true);
      expect(isTriggerEventType('schedule')).toBe(true);
    });
    it('rejects invalid values', () => {
      expect(isTriggerEventType('merge')).toBe(false);
      expect(isTriggerEventType(undefined)).toBe(false);
    });
  });

  describe('isAutonomyLevel', () => {
    it('accepts L0-L4', () => {
      for (const level of ['L0', 'L1', 'L2', 'L3', 'L4']) {
        expect(isAutonomyLevel(level)).toBe(true);
      }
    });
    it('rejects invalid levels', () => {
      expect(isAutonomyLevel('L5')).toBe(false);
      expect(isAutonomyLevel(0)).toBe(false);
    });
  });

  describe('isRunConclusion', () => {
    it('accepts all conclusions', () => {
      for (const c of ['pass', 'warn', 'fail', 'error', 'skipped']) {
        expect(isRunConclusion(c)).toBe(true);
      }
    });
    it('rejects invalid', () => {
      expect(isRunConclusion('success')).toBe(false);
    });
  });

  describe('isFindingSeverity', () => {
    it('accepts all severities', () => {
      for (const s of ['critical', 'high', 'medium', 'low', 'info']) {
        expect(isFindingSeverity(s)).toBe(true);
      }
    });
  });
});

// ── JSON serialization round-trip ──

describe('JSON round-trip', () => {
  const sampleRunRequest: RunRequest = {
    workflow_path: '/workflows/pr-guard.yaml',
    trigger: 'pull_request',
    context: {
      repo: 'limeriq/limeriq',
      pr_number: 42,
      sha: 'abc123def456',
      ref: 'refs/pull/42/head',
    },
    secrets_names: ['GITHUB_TOKEN', 'ANTHROPIC_API_KEY'],
    runner_target: 'github_actions',
  };

  const sampleRunResult: RunResult = {
    conclusion: 'pass',
    findings: [
      {
        severity: 'medium',
        message: 'Unused import on line 15',
        file: 'src/index.ts',
        line: 15,
        rule: 'no-unused-imports',
        category: 'lint',
      },
    ],
    artifacts: [
      {
        name: 'summary',
        type: 'markdown',
        content: '# Run Summary\nAll checks passed.',
      },
    ],
    telemetry: {
      duration_ms: 12345,
      token_count: 5000,
      steps_executed: 3,
      steps_skipped: 1,
      llm_calls: 2,
    },
    started_at: '2026-02-17T10:00:00Z',
    completed_at: '2026-02-17T10:00:12Z',
  };

  it('RunRequest survives JSON round-trip', () => {
    const serialized = JSON.stringify(sampleRunRequest);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toEqual(sampleRunRequest);
    expect(isRunRequest(deserialized)).toBe(true);
  });

  it('RunResult survives JSON round-trip', () => {
    const serialized = JSON.stringify(sampleRunResult);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toEqual(sampleRunResult);
    expect(isRunResult(deserialized)).toBe(true);
  });

  it('isRunResult rejects invalid objects', () => {
    expect(isRunResult(null)).toBe(false);
    expect(isRunResult({})).toBe(false);
    expect(isRunResult({ conclusion: 'pass' })).toBe(false);
    expect(isRunResult({ conclusion: 'invalid', findings: [], artifacts: [], telemetry: {}, started_at: '', completed_at: '' })).toBe(false);
  });

  it('isRunResult rejects invalid telemetry', () => {
    expect(isRunResult({
      conclusion: 'pass',
      findings: [],
      artifacts: [],
      telemetry: { duration_ms: 'not-a-number' },
      started_at: '2026-02-17T10:00:00Z',
      completed_at: '2026-02-17T10:00:12Z',
    })).toBe(false);
  });

  it('isRunResult rejects invalid findings', () => {
    expect(isRunResult({
      conclusion: 'pass',
      findings: [{ severity: 'bogus', message: 'test' }],
      artifacts: [],
      telemetry: { duration_ms: 0, token_count: 0, steps_executed: 0, steps_skipped: 0, llm_calls: 0 },
      started_at: '2026-02-17T10:00:00Z',
      completed_at: '2026-02-17T10:00:12Z',
    })).toBe(false);
  });

  it('isRunResult rejects invalid artifacts', () => {
    expect(isRunResult({
      conclusion: 'pass',
      findings: [],
      artifacts: [{ name: 'x', type: 'invalid_type', content: '' }],
      telemetry: { duration_ms: 0, token_count: 0, steps_executed: 0, steps_skipped: 0, llm_calls: 0 },
      started_at: '2026-02-17T10:00:00Z',
      completed_at: '2026-02-17T10:00:12Z',
    })).toBe(false);
  });

  it('isRunResult rejects non-string error field', () => {
    expect(isRunResult({
      conclusion: 'error',
      findings: [],
      artifacts: [],
      telemetry: { duration_ms: 0, token_count: 0, steps_executed: 0, steps_skipped: 0, llm_calls: 0 },
      started_at: '2026-02-17T10:00:00Z',
      completed_at: '2026-02-17T10:00:12Z',
      error: 42,
    })).toBe(false);
  });

  it('isRunRequest rejects invalid objects', () => {
    expect(isRunRequest(null)).toBe(false);
    expect(isRunRequest({})).toBe(false);
    expect(isRunRequest({ workflow_path: 'x' })).toBe(false);
  });

  it('isRunRequest rejects invalid trigger value', () => {
    expect(isRunRequest({
      workflow_path: '/workflows/test.yaml',
      trigger: 'not_a_real_trigger',
      context: { repo: 'r', sha: 's', ref: 'r' },
      secrets_names: ['TOKEN'],
      runner_target: 'github_actions',
    })).toBe(false);
  });

  it('isRunRequest rejects invalid runner_target', () => {
    expect(isRunRequest({
      workflow_path: '/workflows/test.yaml',
      trigger: 'pull_request',
      context: { repo: 'r', sha: 's', ref: 'r' },
      secrets_names: ['TOKEN'],
      runner_target: 'kubernetes',
    })).toBe(false);
  });

  it('isRunRequest rejects non-string secrets_names', () => {
    expect(isRunRequest({
      workflow_path: '/workflows/test.yaml',
      trigger: 'pull_request',
      context: { repo: 'r', sha: 's', ref: 'r' },
      secrets_names: [42],
      runner_target: 'github_actions',
    })).toBe(false);
  });

  it('isRunRequest rejects invalid context', () => {
    expect(isRunRequest({
      workflow_path: '/workflows/test.yaml',
      trigger: 'pull_request',
      context: { repo: 'r' },
      secrets_names: ['TOKEN'],
      runner_target: 'github_actions',
    })).toBe(false);
  });
});

// ── GitHub conclusion mapping ──

describe('GitHub conclusion mapping', () => {
  it('maps all RunConclusion values', () => {
    expect(mapRunConclusionToGitHub('pass')).toBe('success');
    expect(mapRunConclusionToGitHub('warn')).toBe('neutral');
    expect(mapRunConclusionToGitHub('fail')).toBe('failure');
    expect(mapRunConclusionToGitHub('error')).toBe('failure');
    expect(mapRunConclusionToGitHub('skipped')).toBe('skipped');
  });

  it('every RunConclusion value has a mapping', () => {
    for (const conclusion of Object.values(RunConclusion)) {
      expect(GitHubCheckConclusionMap[conclusion]).toBeDefined();
    }
  });
});

// ── No name collisions across modules ──

describe('no name collisions', () => {
  it('agent-automation and run-contracts do not share enum names (except intentional aliases)', () => {
    const agentKeys = new Set(Object.keys(AgentRunnerTarget));
    const runKeys = new Set(Object.keys(RunConclusion));
    const intersection = new Set([...agentKeys].filter(k => runKeys.has(k)));
    expect(intersection.size).toBe(0);
  });
});

// ── Interface structural tests ──

describe('interface structures', () => {
  it('AgentConfig has required fields', () => {
    const config: AgentConfig = {
      name: 'pr-guard',
      description: 'PR guard agent',
      triggers: [{ event: 'pull_request' }],
      runner: { target: 'github_actions', timeout_minutes: 10 },
      autonomy: { initial_level: 'L0', max_level: 'L2' },
      reporting: { github_check: true, pr_comment: true },
    };
    expect(config.name).toBe('pr-guard');
    expect(config.triggers).toHaveLength(1);
  });

  it('RunResult with error field', () => {
    const result: RunResult = {
      conclusion: 'error',
      findings: [],
      artifacts: [],
      telemetry: { duration_ms: 0, token_count: 0, steps_executed: 0, steps_skipped: 0, llm_calls: 0 },
      started_at: '2026-02-17T10:00:00Z',
      completed_at: '2026-02-17T10:00:00Z',
      error: 'Timeout exceeded',
    };
    expect(result.error).toBe('Timeout exceeded');
    expect(isRunResult(result)).toBe(true);
  });

  it('ReporterOutput can have optional fields', () => {
    const output: ReporterOutput = { artifacts: [] };
    expect(output.check).toBeUndefined();
    expect(output.comment).toBeUndefined();
  });
});
