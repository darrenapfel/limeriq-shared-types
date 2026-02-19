/**
 * Dashboard view-model contracts for the limerIQ control plane dashboard.
 * Consumed by limeriq-control/dashboard SPA.
 */

/** Summary of an agent run for the dashboard */
export interface DashboardRunSummary {
  run_id: string;
  agent_id: string;
  agent_name: string;
  repository: string;
  trigger_event: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  autonomy_level: string;
  trust_score?: number;
  pr_number?: number;
  pr_url?: string;
}

/** Agent status card for the dashboard */
export interface DashboardAgentStatus {
  agent_id: string;
  name: string;
  description?: string;
  trigger_events: string[];
  trust_level: 'none' | 'low' | 'medium' | 'high';
  trust_score: number;
  last_run_at?: string;
  last_run_status?: string;
  total_runs: number;
  success_rate: number;
  active: boolean;
}

/** Telemetry summary for the overview page */
export interface DashboardTelemetrySummary {
  period: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  total_time_saved_minutes: number;
  avg_duration_ms: number;
  agents_active: number;
  top_agents: Array<{ agent_id: string; name: string; runs: number }>;
}

/** Digest view for the dashboard */
export interface DashboardDigestView {
  digest_id: string;
  installation_id: number;
  period: 'weekly' | 'monthly';
  generated_at: string;
  summary_text: string;
  highlights: string[];
  metrics: {
    total_runs: number;
    success_rate: number;
    time_saved_minutes: number;
    hotspot_count: number;
  };
  hotspots: Array<{
    file_path: string;
    change_frequency: number;
    failure_correlation: number;
  }>;
}

/** Dispatch chain visualization */
export interface DashboardDispatchChain {
  rule_id: string;
  source_agent_id: string;
  source_agent_name: string;
  target_agent_id: string;
  target_agent_name: string;
  trigger_event: string;
  condition?: string;
  last_triggered_at?: string;
  trigger_count: number;
}

/** Overall dashboard health status */
export interface DashboardHealthStatus {
  control_plane: 'healthy' | 'degraded' | 'unhealthy';
  database: 'ok' | 'degraded' | 'error';
  github_app: 'ok' | 'degraded' | 'error';
  queue_depth: number;
  active_runners: number;
  last_webhook_at?: string;
}
