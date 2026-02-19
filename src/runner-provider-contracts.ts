/**
 * Runner provider configuration contracts for limerIQ self-hosted runners.
 * Defines how LLM provider keys are mapped, validated, and reported.
 */

// ── Provider key mapping ──

export interface ProviderKeyMapping {
  /** Provider identifier (e.g. 'anthropic', 'openai') */
  provider_id: string;
  /** Environment variable name that holds the API key */
  api_key_env: string;
  /** Whether this provider is required for the runner to start */
  required: boolean;
  /** Display name for error messages */
  display_name?: string;
}

// ── Runner provider configuration ──

export interface RunnerProviderConfig {
  /** Map of provider_id to key mapping */
  providers: Record<string, ProviderKeyMapping>;
  /** If true, skip key validation on startup (--skip-key-check) */
  skip_validation?: boolean;
}

// ── Validation results ──

export interface ProviderValidationCheck {
  provider_id: string;
  api_key_env: string;
  present: boolean;
  required: boolean;
  message: string;
}

export interface ProviderValidationResult {
  valid: boolean;
  checks: ProviderValidationCheck[];
  missing_required: string[];
  missing_optional: string[];
}

// ── Default provider mappings ──

export const DEFAULT_PROVIDER_MAPPINGS: Record<string, ProviderKeyMapping> = {
  anthropic: {
    provider_id: 'anthropic',
    api_key_env: 'ANTHROPIC_API_KEY',
    required: true,
    display_name: 'Anthropic',
  },
  openai: {
    provider_id: 'openai',
    api_key_env: 'OPENAI_API_KEY',
    required: false,
    display_name: 'OpenAI',
  },
} as const;

// ── Type guard ──

export function isProviderKeyMapping(value: unknown): value is ProviderKeyMapping {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.provider_id === 'string' &&
    typeof v.api_key_env === 'string' &&
    typeof v.required === 'boolean'
  );
}
