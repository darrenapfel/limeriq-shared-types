// ── Runtime state components ──

export const RuntimeStateComponent = {
  SPACE: 'space',
  AGENT: 'agent',
  SESSION: 'session',
  NODE_IDENTITY: 'node_identity',
  RELAY_CONNECTION: 'relay_connection',
} as const;

export type RuntimeStateComponent =
  (typeof RuntimeStateComponent)[keyof typeof RuntimeStateComponent];

// ── Component state enums ──

export const SpaceRuntimeState = {
  UNINITIALIZED: 'uninitialized',
  READY: 'ready',
  RUNNING: 'running',
} as const;

export type SpaceRuntimeState =
  (typeof SpaceRuntimeState)[keyof typeof SpaceRuntimeState];

export const AgentRuntimeState = {
  NONE: 'none',
  BOUND: 'bound',
} as const;

export type AgentRuntimeState =
  (typeof AgentRuntimeState)[keyof typeof AgentRuntimeState];

export const SessionRuntimeState = {
  IDLE: 'idle',
  ACTIVE: 'active',
} as const;

export type SessionRuntimeState =
  (typeof SessionRuntimeState)[keyof typeof SessionRuntimeState];

export const NodeIdentityRuntimeState = {
  UNKNOWN: 'unknown',
  LOADED: 'loaded',
  REGISTERING: 'registering',
  REGISTERED: 'registered',
  STALE_DETECTED: 'stale_detected',
} as const;

export type NodeIdentityRuntimeState =
  (typeof NodeIdentityRuntimeState)[keyof typeof NodeIdentityRuntimeState];

export const RelayConnectionRuntimeState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DEGRADED: 'degraded',
} as const;

export type RelayConnectionRuntimeState =
  (typeof RelayConnectionRuntimeState)[keyof typeof RelayConnectionRuntimeState];

export type RuntimeTransitionStatus = 'applied' | 'rejected';

export interface RuntimeStateTransitionEvent {
  space_id: string | null;
  agent_id: string | null;
  component: RuntimeStateComponent;
  from_state: string;
  to_state: string;
  status: RuntimeTransitionStatus;
  reason?: string;
  details?: Record<string, unknown>;
  created_at: string; // ISO 8601
}

export interface RuntimeStateSnapshot {
  key: string;
  space_state: SpaceRuntimeState;
  agent_state: AgentRuntimeState;
  session_state: SessionRuntimeState;
  node_identity_state: NodeIdentityRuntimeState;
  relay_connection_state: RelayConnectionRuntimeState;
  current_agent_id: string | null;
  updated_at: string; // ISO 8601
}
