import type { EncryptionScheme, PeerKind } from './constants';

/** Sender or recipient peer identity within an envelope. */
export interface EnvelopePeer {
  kind: PeerKind;
  /** Present when kind === 'device'. */
  device_id?: string;
}

/** Encryption block within a LimerClaw envelope. */
export interface EncryptionBlock {
  /** Encryption scheme identifier (e.g. 'sodium-session-v1'). */
  scheme: EncryptionScheme;
  /** Key identifier for session key rotation tracking. */
  key_id: string;
  /** Base64-encoded nonce. */
  nonce: string;
  /** Base64-encoded ciphertext. */
  ciphertext: string;
  /** Base64-encoded additional authenticated data (AAD). */
  aad: string;
}

/**
 * LimerClaw message envelope.
 *
 * This is the wire format for all messages between devices and nodes,
 * whether routed through the relay or sent via direct connect.
 * The relay only inspects routing metadata — never the ciphertext.
 */
export interface LimerClawEnvelope {
  /** Protocol version (currently 1). */
  protocol_version: number;
  /** Unique message identifier (ULID or UUID) for deduplication. */
  message_id: string;
  /** ISO 8601 timestamp of when the message was sent. */
  sent_at: string;
  /** Target node ID (UUID). */
  node_id: string;
  /** Sender identity. */
  sender: EnvelopePeer;
  /** Recipient identity. */
  recipient: EnvelopePeer;
  /** Encrypted payload. */
  encryption: EncryptionBlock;
  /** Target agent ID (omit for boss agent). */
  agent_id?: string;
  /** Hint for routing (e.g. 'chat', 'interactive_prompt'). */
  message_type?: string;
}

/** Relay control messages (ping, pong, backlog_truncated, error). */
export interface RelayControlMessage {
  type:
    | 'ping'
    | 'pong'
    | 'backlog_truncated'
    | 'error'
    | 'connect_challenge'
    | 'connect_auth'
    | 'connect_ack';
  /** Present for error type. */
  message?: string;
  /** Present for backlog_truncated: how many were dropped. */
  dropped_count?: number;
  /** Present for connect_challenge/connect_auth. */
  nonce?: string;
  /** Present for connect_challenge/connect_ack/connect_auth. */
  ts?: number;
  /** Present for connect_auth. */
  proof?: string;
  /** Present for connect_auth. */
  peer_kind?: PeerKind;
  /** Present for connect_auth. */
  peer_id?: string;
  /** Present for connect_auth. */
  node_id?: string;
}

/** Union type for all messages on the relay WebSocket. */
export type RelayMessage = LimerClawEnvelope | RelayControlMessage;

/** Type guard: is this a control message (not an envelope)? */
export function isRelayControlMessage(msg: unknown): msg is RelayControlMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg && !('protocol_version' in msg);
}

/** Type guard: is this an envelope? */
export function isEnvelope(msg: unknown): msg is LimerClawEnvelope {
  return typeof msg === 'object' && msg !== null && 'protocol_version' in msg && 'encryption' in msg;
}
