import { describe, it, expect } from 'vitest';
import type {
  SetupStepResult,
  SetupStatus,
  RunnerBootstrapToken,
  SetupDiagnostic,
} from '../src/setup-wizard-contracts';
import {
  SetupStepId,
  isSetupStepId,
} from '../src/setup-wizard-contracts';

describe('setup-wizard-contracts', () => {
  it('SetupStepId has all expected values', () => {
    expect(SetupStepId.ENV_CHECK).toBe('env-check');
    expect(SetupStepId.DB_MIGRATION).toBe('db-migration');
    expect(SetupStepId.GITHUB_APP).toBe('github-app');
    expect(SetupStepId.RUNNER_REGISTRATION).toBe('runner-registration');
    expect(SetupStepId.FIRST_AGENT).toBe('first-agent');
    expect(SetupStepId.VERIFICATION_RUN).toBe('verification-run');
  });

  it('isSetupStepId validates correctly', () => {
    expect(isSetupStepId('env-check')).toBe(true);
    expect(isSetupStepId('github-app')).toBe(true);
    expect(isSetupStepId('runner-registration')).toBe(true);
    expect(isSetupStepId('bogus')).toBe(false);
    expect(isSetupStepId(42)).toBe(false);
    expect(isSetupStepId(null)).toBe(false);
  });

  it('SetupStepResult tracks all statuses', () => {
    const statuses: SetupStepResult['status'][] = ['pass', 'fail', 'skip', 'pending'];
    for (const status of statuses) {
      const result: SetupStepResult = {
        step_id: SetupStepId.ENV_CHECK,
        name: 'Environment Check',
        status,
        message: `Step is ${status}`,
      };
      expect(result.status).toBe(status);
    }
  });

  it('SetupStepResult supports remediation', () => {
    const result: SetupStepResult = {
      step_id: SetupStepId.DB_MIGRATION,
      name: 'Database Migration',
      status: 'fail',
      message: 'Pending migrations found',
      remediation: 'Run: npm run db:migrate',
      details: { pending_count: 2 },
    };
    expect(result.remediation).toBe('Run: npm run db:migrate');
    expect(result.details).toHaveProperty('pending_count', 2);
  });

  it('SetupStatus represents complete setup', () => {
    const status: SetupStatus = {
      complete: true,
      steps: [
        { step_id: SetupStepId.ENV_CHECK, name: 'Env', status: 'pass', message: 'OK' },
        { step_id: SetupStepId.DB_MIGRATION, name: 'DB', status: 'pass', message: 'OK' },
        { step_id: SetupStepId.GITHUB_APP, name: 'GitHub', status: 'pass', message: 'OK' },
        { step_id: SetupStepId.RUNNER_REGISTRATION, name: 'Runner', status: 'pass', message: 'OK' },
        { step_id: SetupStepId.FIRST_AGENT, name: 'Agent', status: 'pass', message: 'OK' },
        { step_id: SetupStepId.VERIFICATION_RUN, name: 'Verify', status: 'pass', message: 'OK' },
      ],
      timestamp: new Date().toISOString(),
    };
    expect(status.complete).toBe(true);
    expect(status.steps).toHaveLength(6);
    expect(status.steps.every(s => s.status === 'pass')).toBe(true);
  });

  it('SetupStatus represents incomplete setup', () => {
    const status: SetupStatus = {
      complete: false,
      steps: [
        { step_id: SetupStepId.ENV_CHECK, name: 'Env', status: 'pass', message: 'OK' },
        { step_id: SetupStepId.DB_MIGRATION, name: 'DB', status: 'fail', message: 'Pending' },
        { step_id: SetupStepId.GITHUB_APP, name: 'GitHub', status: 'pending', message: 'Not checked' },
      ],
      current_step: SetupStepId.DB_MIGRATION,
      timestamp: new Date().toISOString(),
    };
    expect(status.complete).toBe(false);
    expect(status.current_step).toBe('db-migration');
  });

  it('RunnerBootstrapToken has required fields', () => {
    const token: RunnerBootstrapToken = {
      token: 'rbt_abc123',
      control_api_url: 'http://control:3100',
      start_command: 'limeriq agent runner start --config runner.yaml',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      used: false,
    };
    expect(token.token).toBe('rbt_abc123');
    expect(token.used).toBe(false);
  });

  it('RunnerBootstrapToken tracks used state', () => {
    const token: RunnerBootstrapToken = {
      token: 'rbt_xyz789',
      control_api_url: 'http://control:3100',
      start_command: 'limeriq agent runner start',
      expires_at: new Date().toISOString(),
      used: true,
    };
    expect(token.used).toBe(true);
  });

  it('SetupDiagnostic tracks categories and severities', () => {
    const categories: SetupDiagnostic['category'][] = ['env', 'database', 'github', 'runner', 'agent', 'network'];
    const severities: SetupDiagnostic['severity'][] = ['info', 'warning', 'error'];

    for (const category of categories) {
      const diag: SetupDiagnostic = {
        category,
        severity: 'info',
        message: `Check ${category}`,
        timestamp: new Date().toISOString(),
      };
      expect(diag.category).toBe(category);
    }

    for (const severity of severities) {
      const diag: SetupDiagnostic = {
        category: 'env',
        severity,
        message: `Severity ${severity}`,
        timestamp: new Date().toISOString(),
      };
      expect(diag.severity).toBe(severity);
    }
  });

  it('SetupDiagnostic supports remediation', () => {
    const diag: SetupDiagnostic = {
      category: 'database',
      severity: 'error',
      message: 'Cannot connect to Postgres',
      remediation: 'Check DATABASE_URL and ensure Postgres is running',
      timestamp: new Date().toISOString(),
    };
    expect(diag.remediation).toBeDefined();
  });
});
