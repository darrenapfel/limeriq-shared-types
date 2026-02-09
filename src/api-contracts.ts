import type { DeviceType, EventType, NodeMode } from './constants';

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
  opaque_id: string;
}

export interface PushNotifyResponse {
  sent_count: number;
  failed_count: number;
}

// ── Common error response ──

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
