import { describe, it, expect } from 'vitest';
import type {
  GitHubAppSetupRequest,
  GitHubAppSetupResult,
  SetupValidationResult,
  OnboardingStep,
  HealthCheckResult,
  HealthCheckComponent,
} from '../src/setup-onboarding-contracts';
import {
  REQUIRED_GITHUB_APP_PERMISSIONS,
  DEFAULT_WEBHOOK_EVENTS,
} from '../src/setup-onboarding-contracts';

describe('setup-onboarding-contracts', () => {
  it('GitHubAppSetupRequest has required fields', () => {
    const req: GitHubAppSetupRequest = {
      app_id: 12345,
      webhook_secret: 'whsec_test',
    };
    expect(req.app_id).toBe(12345);
    expect(req.webhook_secret).toBe('whsec_test');
    expect(req.private_key_path).toBeUndefined();
    expect(req.non_interactive).toBeUndefined();
  });

  it('GitHubAppSetupRequest supports non-interactive mode', () => {
    const req: GitHubAppSetupRequest = {
      app_id: 99,
      webhook_secret: 'secret',
      private_key_path: '/path/to/key.pem',
      non_interactive: true,
    };
    expect(req.non_interactive).toBe(true);
    expect(req.private_key_path).toBe('/path/to/key.pem');
  });

  it('GitHubAppSetupResult represents valid setup', () => {
    const result: GitHubAppSetupResult = {
      valid: true,
      app_id: 12345,
      app_name: 'limeriq-test',
      installation_id: 67890,
      permissions_ok: true,
      missing_permissions: [],
      webhook_configured: true,
      errors: [],
    };
    expect(result.valid).toBe(true);
    expect(result.missing_permissions).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('GitHubAppSetupResult represents invalid setup', () => {
    const result: GitHubAppSetupResult = {
      valid: false,
      app_id: 12345,
      permissions_ok: false,
      missing_permissions: ['checks:write', 'pull_requests:write'],
      webhook_configured: false,
      errors: ['App not installed', 'Missing permissions'],
    };
    expect(result.valid).toBe(false);
    expect(result.missing_permissions).toHaveLength(2);
    expect(result.errors).toHaveLength(2);
  });

  it('SetupValidationResult tracks step validation', () => {
    const result: SetupValidationResult = {
      step: 'github-app',
      valid: true,
      message: 'GitHub App connection verified',
      details: { app_id: 12345 },
    };
    expect(result.step).toBe('github-app');
    expect(result.valid).toBe(true);
  });

  it('OnboardingStep tracks all statuses', () => {
    const statuses: OnboardingStep['status'][] = ['pending', 'in_progress', 'completed', 'failed', 'skipped'];
    for (const status of statuses) {
      const step: OnboardingStep = {
        id: 'test-step',
        name: 'Test Step',
        description: 'A test step',
        status,
        required: true,
      };
      expect(step.status).toBe(status);
    }
  });

  it('HealthCheckResult represents healthy system', () => {
    const result: HealthCheckResult = {
      status: 'healthy',
      service: 'limeriq-control',
      timestamp: new Date().toISOString(),
      uptime_seconds: 3600,
      components: [
        { name: 'supabase', status: 'ok', latency_ms: 12, last_checked: new Date().toISOString() },
        { name: 'github-app', status: 'ok', latency_ms: 45, last_checked: new Date().toISOString() },
      ],
    };
    expect(result.status).toBe('healthy');
    expect(result.components).toHaveLength(2);
    expect(result.components.every((c: HealthCheckComponent) => c.status === 'ok')).toBe(true);
  });

  it('HealthCheckResult represents degraded system', () => {
    const result: HealthCheckResult = {
      status: 'degraded',
      service: 'limeriq-control',
      timestamp: new Date().toISOString(),
      uptime_seconds: 100,
      components: [
        { name: 'supabase', status: 'ok', latency_ms: 12, last_checked: new Date().toISOString() },
        { name: 'github-app', status: 'error', message: 'Key expired', last_checked: new Date().toISOString() },
      ],
    };
    expect(result.status).toBe('degraded');
    expect(result.components[1].status).toBe('error');
  });

  it('REQUIRED_GITHUB_APP_PERMISSIONS has expected permissions', () => {
    expect(REQUIRED_GITHUB_APP_PERMISSIONS.checks).toBe('write');
    expect(REQUIRED_GITHUB_APP_PERMISSIONS.pull_requests).toBe('write');
    expect(REQUIRED_GITHUB_APP_PERMISSIONS.contents).toBe('read');
    expect(REQUIRED_GITHUB_APP_PERMISSIONS.metadata).toBe('read');
  });

  it('DEFAULT_WEBHOOK_EVENTS includes essential events', () => {
    expect(DEFAULT_WEBHOOK_EVENTS).toContain('pull_request');
    expect(DEFAULT_WEBHOOK_EVENTS).toContain('issue_comment');
    expect(DEFAULT_WEBHOOK_EVENTS).toContain('push');
    expect(DEFAULT_WEBHOOK_EVENTS).toContain('installation');
  });
});
