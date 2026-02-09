import type {
  DeviceStatus,
  DeviceType,
  NodeMode,
  NodeStatus,
  PairingSessionStatus,
  PairingStatus,
} from './constants';

/** Row type for `limerclaw_nodes` table. */
export interface LimerClawNodeRow {
  id: string;
  user_id: string;
  mode: NodeMode;
  status: NodeStatus;
  display_name: string | null;
  endpoint_url: string | null;
  identity_fingerprint: string;
  identity_pubkey: string;
  software_version: string | null;
  capabilities: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

/** Row type for `limerclaw_devices` table. */
export interface LimerClawDeviceRow {
  id: string;
  user_id: string;
  device_type: DeviceType;
  device_name: string;
  status: DeviceStatus;
  expo_push_token: string | null;
  identity_fingerprint: string;
  identity_pubkey: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

/** Row type for `limerclaw_pairing_sessions` table. */
export interface LimerClawPairingSessionRow {
  id: string;
  user_id: string;
  node_id: string;
  pairing_code_hash: string;
  expires_at: string;
  status: PairingSessionStatus;
  created_at: string;
}

/** Row type for `limerclaw_pairings` join table. */
export interface LimerClawPairingRow {
  id: string;
  device_id: string;
  node_id: string;
  user_id: string;
  paired_at: string;
  status: PairingStatus;
}
