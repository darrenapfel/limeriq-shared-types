import { describe, it, expect } from 'vitest';
import type {
  DatabaseConfig,
  PostgRESTConfig,
  ComposeConfig,
  SelfHostedValidationCheck,
  SelfHostedValidationResult,
} from '../src/deployment-profile-contracts';
import {
  DeploymentProfile,
  isDeploymentProfile,
} from '../src/deployment-profile-contracts';

describe('deployment-profile-contracts', () => {
  it('DeploymentProfile enum has expected values', () => {
    expect(DeploymentProfile.POSTGRES).toBe('postgres');
    expect(DeploymentProfile.SUPABASE).toBe('supabase');
  });

  it('isDeploymentProfile validates correctly', () => {
    expect(isDeploymentProfile('postgres')).toBe(true);
    expect(isDeploymentProfile('supabase')).toBe(true);
    expect(isDeploymentProfile('mysql')).toBe(false);
    expect(isDeploymentProfile(42)).toBe(false);
    expect(isDeploymentProfile(null)).toBe(false);
  });

  it('DatabaseConfig has required fields', () => {
    const config: DatabaseConfig = {
      host: 'localhost',
      port: 5432,
      database: 'limeriq',
      user: 'limeriq',
      password_env: 'POSTGRES_PASSWORD',
    };
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.ssl_mode).toBeUndefined();
  });

  it('DatabaseConfig supports SSL mode', () => {
    const config: DatabaseConfig = {
      host: 'db.example.com',
      port: 5432,
      database: 'limeriq',
      user: 'limeriq',
      password_env: 'POSTGRES_PASSWORD',
      ssl_mode: 'verify-full',
    };
    expect(config.ssl_mode).toBe('verify-full');
  });

  it('PostgRESTConfig has required fields', () => {
    const config: PostgRESTConfig = {
      url: 'http://postgrest:3000',
      db_schemas: 'public',
      db_anon_role: 'anon',
      jwt_secret_env: 'PGRST_JWT_SECRET',
    };
    expect(config.url).toBe('http://postgrest:3000');
    expect(config.db_anon_role).toBe('anon');
  });

  it('ComposeConfig represents postgres profile', () => {
    const config: ComposeConfig = {
      profile: DeploymentProfile.POSTGRES,
      compose_file: 'docker-compose.postgres.yml',
      database: {
        host: 'postgres',
        port: 5432,
        database: 'limeriq',
        user: 'limeriq',
        password_env: 'POSTGRES_PASSWORD',
      },
      postgrest: {
        url: 'http://postgrest:3000',
        db_schemas: 'public',
        db_anon_role: 'anon',
        jwt_secret_env: 'PGRST_JWT_SECRET',
      },
      control_port: 3100,
    };
    expect(config.profile).toBe('postgres');
    expect(config.database).toBeDefined();
    expect(config.postgrest).toBeDefined();
    expect(config.supabase_url).toBeUndefined();
  });

  it('ComposeConfig represents supabase profile', () => {
    const config: ComposeConfig = {
      profile: DeploymentProfile.SUPABASE,
      compose_file: 'docker-compose.supabase.yml',
      supabase_url: 'https://my-project.supabase.co',
      supabase_service_role_key_env: 'SUPABASE_SERVICE_ROLE_KEY',
      control_port: 3100,
    };
    expect(config.profile).toBe('supabase');
    expect(config.supabase_url).toBeDefined();
    expect(config.database).toBeUndefined();
    expect(config.postgrest).toBeUndefined();
  });

  it('SelfHostedValidationCheck tracks all statuses', () => {
    const statuses: SelfHostedValidationCheck['status'][] = ['pass', 'fail', 'skip', 'warn'];
    for (const status of statuses) {
      const check: SelfHostedValidationCheck = {
        name: 'test-check',
        status,
        message: `Check ${status}`,
      };
      expect(check.status).toBe(status);
    }
  });

  it('SelfHostedValidationCheck supports remediation', () => {
    const check: SelfHostedValidationCheck = {
      name: 'db-connectivity',
      status: 'fail',
      message: 'Cannot connect to database',
      remediation: 'Verify POSTGRES_PASSWORD is set and database is running',
    };
    expect(check.remediation).toBeDefined();
  });

  it('SelfHostedValidationResult represents passing validation', () => {
    const result: SelfHostedValidationResult = {
      profile: DeploymentProfile.POSTGRES,
      passed: true,
      checks: [
        { name: 'db', status: 'pass', message: 'Connected' },
        { name: 'migrations', status: 'pass', message: 'Up to date' },
        { name: 'postgrest', status: 'pass', message: 'Reachable' },
      ],
      timestamp: new Date().toISOString(),
    };
    expect(result.passed).toBe(true);
    expect(result.checks).toHaveLength(3);
    expect(result.checks.every(c => c.status === 'pass')).toBe(true);
  });

  it('SelfHostedValidationResult represents failing validation', () => {
    const result: SelfHostedValidationResult = {
      profile: DeploymentProfile.SUPABASE,
      passed: false,
      checks: [
        { name: 'supabase-url', status: 'pass', message: 'Reachable' },
        { name: 'migrations', status: 'fail', message: 'Pending migrations', remediation: 'Run npm run db:migrate' },
      ],
      timestamp: new Date().toISOString(),
    };
    expect(result.passed).toBe(false);
    expect(result.checks[1].status).toBe('fail');
    expect(result.checks[1].remediation).toBeDefined();
  });
});
