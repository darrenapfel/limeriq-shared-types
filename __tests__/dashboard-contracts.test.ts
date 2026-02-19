import { describe, it, expect } from 'vitest';
import type {
  DashboardRunSummary,
  DashboardAgentStatus,
  DashboardTelemetrySummary,
  DashboardDigestView,
  DashboardDispatchChain,
  DashboardHealthStatus,
} from '../src/dashboard-contracts';

describe('dashboard-contracts', () => {
  it('DashboardRunSummary has required fields', () => {
    const run: DashboardRunSummary = {
      run_id: 'run-1',
      agent_id: 'pr-guard',
      agent_name: 'PR Guard',
      repository: 'owner/repo',
      trigger_event: 'pull_request',
      status: 'completed',
      started_at: '2026-02-18T00:00:00Z',
      completed_at: '2026-02-18T00:05:00Z',
      duration_ms: 300000,
      autonomy_level: 'supervised',
      trust_score: 0.85,
      pr_number: 42,
      pr_url: 'https://github.com/owner/repo/pull/42',
    };
    expect(run.run_id).toBe('run-1');
    expect(run.status).toBe('completed');
    expect(run.pr_number).toBe(42);
  });

  it('DashboardRunSummary supports all statuses', () => {
    const statuses: DashboardRunSummary['status'][] = ['queued', 'running', 'completed', 'failed', 'cancelled'];
    for (const status of statuses) {
      const run: DashboardRunSummary = {
        run_id: 'r',
        agent_id: 'a',
        agent_name: 'A',
        repository: 'r',
        trigger_event: 'push',
        status,
        started_at: new Date().toISOString(),
        autonomy_level: 'full',
      };
      expect(run.status).toBe(status);
    }
  });

  it('DashboardAgentStatus has trust information', () => {
    const agent: DashboardAgentStatus = {
      agent_id: 'pr-guard',
      name: 'PR Guard',
      description: 'Reviews pull requests',
      trigger_events: ['pull_request', 'issue_comment'],
      trust_level: 'high',
      trust_score: 0.92,
      last_run_at: '2026-02-18T12:00:00Z',
      last_run_status: 'completed',
      total_runs: 150,
      success_rate: 0.95,
      active: true,
    };
    expect(agent.trust_level).toBe('high');
    expect(agent.trust_score).toBe(0.92);
    expect(agent.active).toBe(true);
  });

  it('DashboardTelemetrySummary tracks period metrics', () => {
    const summary: DashboardTelemetrySummary = {
      period: 'weekly',
      start_date: '2026-02-11',
      end_date: '2026-02-17',
      total_runs: 42,
      successful_runs: 38,
      failed_runs: 4,
      total_time_saved_minutes: 120,
      avg_duration_ms: 45000,
      agents_active: 3,
      top_agents: [
        { agent_id: 'pr-guard', name: 'PR Guard', runs: 30 },
        { agent_id: 'ci-triage', name: 'CI Triage', runs: 12 },
      ],
    };
    expect(summary.period).toBe('weekly');
    expect(summary.total_runs).toBe(42);
    expect(summary.top_agents).toHaveLength(2);
  });

  it('DashboardDigestView contains metrics and hotspots', () => {
    const digest: DashboardDigestView = {
      digest_id: 'digest-1',
      installation_id: 12345,
      period: 'weekly',
      generated_at: '2026-02-18T00:00:00Z',
      summary_text: 'Great week! 42 runs with 95% success rate.',
      highlights: ['PR Guard caught 3 security issues', 'Time saved: 2 hours'],
      metrics: {
        total_runs: 42,
        success_rate: 0.95,
        time_saved_minutes: 120,
        hotspot_count: 2,
      },
      hotspots: [
        { file_path: 'src/auth/login.ts', change_frequency: 15, failure_correlation: 0.8 },
        { file_path: 'src/api/routes.ts', change_frequency: 10, failure_correlation: 0.3 },
      ],
    };
    expect(digest.metrics.total_runs).toBe(42);
    expect(digest.hotspots).toHaveLength(2);
    expect(digest.highlights).toHaveLength(2);
  });

  it('DashboardDispatchChain tracks agent-to-agent dispatch', () => {
    const chain: DashboardDispatchChain = {
      rule_id: 'rule-1',
      source_agent_id: 'pr-guard',
      source_agent_name: 'PR Guard',
      target_agent_id: 'ci-triage',
      target_agent_name: 'CI Triage',
      trigger_event: 'run_completed',
      condition: 'status === "failed"',
      last_triggered_at: '2026-02-18T10:00:00Z',
      trigger_count: 5,
    };
    expect(chain.source_agent_id).toBe('pr-guard');
    expect(chain.target_agent_id).toBe('ci-triage');
    expect(chain.trigger_count).toBe(5);
  });

  it('DashboardHealthStatus tracks system health', () => {
    const health: DashboardHealthStatus = {
      control_plane: 'healthy',
      database: 'ok',
      github_app: 'ok',
      queue_depth: 3,
      active_runners: 2,
      last_webhook_at: '2026-02-18T14:30:00Z',
    };
    expect(health.control_plane).toBe('healthy');
    expect(health.queue_depth).toBe(3);
  });
});
