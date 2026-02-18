/** Protocol version for envelope framing. Increment on breaking changes. */
export const PROTOCOL_VERSION = 1;

/** Maximum envelope size in bytes (64 KB). */
export const MAX_ENVELOPE_BYTES = 65_536;

/** Maximum backlog envelopes per relay room. */
export const MAX_BACKLOG_COUNT = 100;

/** Backlog TTL in seconds (5 minutes). */
export const BACKLOG_TTL_SECONDS = 300;

/** Rate limit: messages per minute per sender in relay. */
export const MAX_MSGS_PER_MINUTE = 60;

/** Pairing session TTL in minutes. */
export const PAIRING_SESSION_TTL_MINUTES = 10;

/** Relay heartbeat interval in seconds. */
export const HEARTBEAT_INTERVAL_SECONDS = 30;

// ── Event types (push notification shoulder taps) ──

export const EventType = {
  APPROVAL_PENDING: 'approval_pending',
  MESSAGE_RECEIVED: 'message_received',
  RUN_COMPLETED: 'run_completed',
  RUN_FAILED: 'run_failed',
  NODE_STATUS_CHANGED: 'node_status_changed',
  CONFIG_CHANGED: 'config_changed',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

/** Allowed event types for push notifications. */
export const ALLOWED_EVENT_TYPES: readonly EventType[] = Object.values(EventType);

// ── Node modes ──

export const NodeMode = {
  LOCAL: 'local',
  HOSTED: 'hosted',
} as const;

export type NodeMode = (typeof NodeMode)[keyof typeof NodeMode];

// ── Status enums ──

export const NodeStatus = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  PENDING: 'pending',
} as const;

export type NodeStatus = (typeof NodeStatus)[keyof typeof NodeStatus];

export const DeviceStatus = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
} as const;

export type DeviceStatus = (typeof DeviceStatus)[keyof typeof DeviceStatus];

export const DeviceType = {
  IOS: 'ios',
  ANDROID: 'android',
} as const;

export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType];

export const PairingSessionStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
} as const;

export type PairingSessionStatus = (typeof PairingSessionStatus)[keyof typeof PairingSessionStatus];

export const PairingStatus = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
} as const;

export type PairingStatus = (typeof PairingStatus)[keyof typeof PairingStatus];

// ── Encryption schemes ──

export const EncryptionScheme = {
  SODIUM_SESSION_V1: 'sodium-session-v1',
} as const;

export type EncryptionScheme = (typeof EncryptionScheme)[keyof typeof EncryptionScheme];

// ── Sender/Recipient kinds ──

export const PeerKind = {
  DEVICE: 'device',
  NODE: 'node',
} as const;

export type PeerKind = (typeof PeerKind)[keyof typeof PeerKind];

// ── Relay control message types ──

export const RelayControlType = {
  PING: 'ping',
  PONG: 'pong',
  BACKLOG_TRUNCATED: 'backlog_truncated',
  ERROR: 'error',
} as const;

export type RelayControlType = (typeof RelayControlType)[keyof typeof RelayControlType];

// ── Boss agent addressing ──

/** Default agent ID for the boss agent. */
export const BOSS_AGENT_ID = 'boss';

// ── Run conclusion (agent run outcomes) ──

export const RunConclusionEnum = {
  PASS: 'pass',
  WARN: 'warn',
  FAIL: 'fail',
  ERROR: 'error',
  SKIPPED: 'skipped',
} as const;

export type RunConclusionEnum = (typeof RunConclusionEnum)[keyof typeof RunConclusionEnum];

// ── SDLC trigger events ──

export const SdlcTriggerEvent = {
  PULL_REQUEST: 'pull_request',
  ISSUE_COMMENT: 'issue_comment',
  PUSH: 'push',
  SCHEDULE: 'schedule',
  WORKFLOW_DISPATCH: 'workflow_dispatch',
} as const;

export type SdlcTriggerEvent = (typeof SdlcTriggerEvent)[keyof typeof SdlcTriggerEvent];
