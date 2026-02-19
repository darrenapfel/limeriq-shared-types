import { describe, it, expect } from 'vitest';
import type {
  ProviderKeyMapping,
  RunnerProviderConfig,
  ProviderValidationCheck,
  ProviderValidationResult,
} from '../src/runner-provider-contracts';
import {
  DEFAULT_PROVIDER_MAPPINGS,
  isProviderKeyMapping,
} from '../src/runner-provider-contracts';

describe('runner-provider-contracts', () => {
  it('ProviderKeyMapping has required fields', () => {
    const mapping: ProviderKeyMapping = {
      provider_id: 'anthropic',
      api_key_env: 'ANTHROPIC_API_KEY',
      required: true,
    };
    expect(mapping.provider_id).toBe('anthropic');
    expect(mapping.api_key_env).toBe('ANTHROPIC_API_KEY');
    expect(mapping.required).toBe(true);
    expect(mapping.display_name).toBeUndefined();
  });

  it('ProviderKeyMapping supports display_name', () => {
    const mapping: ProviderKeyMapping = {
      provider_id: 'openai',
      api_key_env: 'OPENAI_API_KEY',
      required: false,
      display_name: 'OpenAI',
    };
    expect(mapping.display_name).toBe('OpenAI');
  });

  it('RunnerProviderConfig holds provider mappings', () => {
    const config: RunnerProviderConfig = {
      providers: {
        anthropic: {
          provider_id: 'anthropic',
          api_key_env: 'ANTHROPIC_API_KEY',
          required: true,
        },
        openai: {
          provider_id: 'openai',
          api_key_env: 'OPENAI_API_KEY',
          required: false,
        },
      },
    };
    expect(Object.keys(config.providers)).toHaveLength(2);
    expect(config.skip_validation).toBeUndefined();
  });

  it('RunnerProviderConfig supports skip_validation', () => {
    const config: RunnerProviderConfig = {
      providers: {},
      skip_validation: true,
    };
    expect(config.skip_validation).toBe(true);
  });

  it('ProviderValidationCheck tracks presence', () => {
    const present: ProviderValidationCheck = {
      provider_id: 'anthropic',
      api_key_env: 'ANTHROPIC_API_KEY',
      present: true,
      required: true,
      message: 'ANTHROPIC_API_KEY is set',
    };
    expect(present.present).toBe(true);

    const missing: ProviderValidationCheck = {
      provider_id: 'openai',
      api_key_env: 'OPENAI_API_KEY',
      present: false,
      required: false,
      message: 'OPENAI_API_KEY is not set (optional)',
    };
    expect(missing.present).toBe(false);
    expect(missing.required).toBe(false);
  });

  it('ProviderValidationResult represents valid state', () => {
    const result: ProviderValidationResult = {
      valid: true,
      checks: [
        { provider_id: 'anthropic', api_key_env: 'ANTHROPIC_API_KEY', present: true, required: true, message: 'Set' },
      ],
      missing_required: [],
      missing_optional: [],
    };
    expect(result.valid).toBe(true);
    expect(result.missing_required).toHaveLength(0);
  });

  it('ProviderValidationResult represents invalid state', () => {
    const result: ProviderValidationResult = {
      valid: false,
      checks: [
        { provider_id: 'anthropic', api_key_env: 'ANTHROPIC_API_KEY', present: false, required: true, message: 'Missing' },
        { provider_id: 'openai', api_key_env: 'OPENAI_API_KEY', present: false, required: false, message: 'Missing (optional)' },
      ],
      missing_required: ['ANTHROPIC_API_KEY'],
      missing_optional: ['OPENAI_API_KEY'],
    };
    expect(result.valid).toBe(false);
    expect(result.missing_required).toContain('ANTHROPIC_API_KEY');
    expect(result.missing_optional).toContain('OPENAI_API_KEY');
  });

  it('DEFAULT_PROVIDER_MAPPINGS has anthropic and openai', () => {
    expect(DEFAULT_PROVIDER_MAPPINGS.anthropic).toBeDefined();
    expect(DEFAULT_PROVIDER_MAPPINGS.anthropic.api_key_env).toBe('ANTHROPIC_API_KEY');
    expect(DEFAULT_PROVIDER_MAPPINGS.anthropic.required).toBe(true);

    expect(DEFAULT_PROVIDER_MAPPINGS.openai).toBeDefined();
    expect(DEFAULT_PROVIDER_MAPPINGS.openai.api_key_env).toBe('OPENAI_API_KEY');
    expect(DEFAULT_PROVIDER_MAPPINGS.openai.required).toBe(false);
  });

  it('isProviderKeyMapping validates correctly', () => {
    expect(isProviderKeyMapping({
      provider_id: 'anthropic',
      api_key_env: 'ANTHROPIC_API_KEY',
      required: true,
    })).toBe(true);

    expect(isProviderKeyMapping({
      provider_id: 'openai',
      api_key_env: 'OPENAI_API_KEY',
      required: false,
      display_name: 'OpenAI',
    })).toBe(true);

    // Missing fields
    expect(isProviderKeyMapping({ provider_id: 'x' })).toBe(false);
    expect(isProviderKeyMapping(null)).toBe(false);
    expect(isProviderKeyMapping('string')).toBe(false);
    expect(isProviderKeyMapping(42)).toBe(false);
  });
});
