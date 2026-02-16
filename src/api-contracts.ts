import type { DeviceType, EventType, NodeMode } from './constants';
import type { AgentKind, AgentStatus, ExecutionMode } from './agent-types';

// ── POST /api/limerclaw/devices/register ──

export interface DeviceRegisterRequest {
  device_type: DeviceType;
  device_name: string;
  expo_push_token: string | null;
  device_identity_pubkey: string;
}

export interface DeviceRegisterResponse {
  device_id: string;
  device_identity_fingerprint: string;
  server_time: string;
}

// ── POST /api/limerclaw/nodes/register ──

export interface NodeRegisterRequest {
  mode?: NodeMode;
  status?: string;
  display_name?: string | null;
  endpoint_url?: string | null;
  identity_pubkey: string;
  /** Optional: can be provided for debugging; server recomputes and validates when present. */
  identity_fingerprint?: string;
  software_version?: string | null;
  capabilities?: Record<string, unknown> | null;
}

export interface NodeRegisterResponse {
  node_id: string;
  identity_fingerprint: string;
  identity_pubkey: string;
  server_time: string;
}

// ── POST /api/limerclaw/nodes/:nodeId/heartbeat ──

export interface NodeHeartbeatRequest {
  node_id: string;
}

export interface NodeHeartbeatResponse {
  node_id: string;
  server_time: string;
}

// ── POST /api/limerclaw/pairing/create ──

export interface PairingCreateRequest {
  node_id: string;
}

export interface PairingCreateResponse {
  pairing_session_id: string;
  pairing_code: string;
  expires_at: string;
  node_identity_fingerprint: string;
}

// ── POST /api/limerclaw/pairing/resolve ──

export interface PairingResolveRequest {
  pairing_code: string;
}

export interface PairingResolveResponse {
  pairing_session_id: string;
  node_id: string;
  node_identity_fingerprint: string;
  expires_at: string;
}

// ── POST /api/limerclaw/pairing/confirm ──

export interface PairingConfirmRequest {
  pairing_session_id: string;
  device_id: string;
}

export interface PairingConfirmResponse {
  status: 'confirmed';
}

// ── GET /api/limerclaw/nodes/me ──

export interface NodeDirectoryEntry {
  node_id: string;
  mode: NodeMode;
  endpoint_url: string | null;
  identity_fingerprint: string;
  /** Base64url-no-pad X25519 public key for session key derivation. */
  identity_pubkey?: string;
  display_name: string | null;
  status: string;
  software_version: string | null;
  capabilities: Record<string, unknown> | null;
  last_seen_at: string | null;
}

export interface NodesListResponse {
  nodes: NodeDirectoryEntry[];
}

// ── POST /api/limerclaw/push/notify ──

export interface PushNotifyRequest {
  node_id: string;
  event_type: EventType;
  opaque_id?: string;
}

export interface PushNotifyResponse {
  sent_count: number;
  failed_count: number;
}

// ── GET /api/limerclaw/nodes/:nodeId/agents ──

export interface NodeAgentEntry {
  agent_id: string;
  name: string;
  kind: AgentKind;
  status: AgentStatus;
  description: string | null;
  execution_mode: ExecutionMode;
  created_at: string;
  updated_at: string;
}

export interface NodeAgentsListResponse {
  agents: NodeAgentEntry[];
}

// ── POST /api/limerclaw/nodes/:nodeId/agents/sync ──

export interface AgentSyncRequest {
  agents: NodeAgentEntry[];
}

export interface AgentSyncResponse {
  synced_count: number;
}

// ── Common error response ──

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
