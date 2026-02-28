# ARCHITECTURE.md - limeriq-shared-types

## Overview

This package defines five categories of shared types, organized by concern:

```
src/
  index.ts            # Barrel re-export
  constants.ts        # Protocol constants + enum-like const objects
  envelope.ts         # Wire format types + type guards
  api-contracts.ts    # HTTP API request/response shapes
  db-types.ts         # Supabase database row types
  agent-types.ts      # Agent system enums, interfaces, and decrypted payload types
```

## Type Hierarchy

### Constants (`src/constants.ts`)

All enum-like values use the **const-object-plus-type** pattern for type safety with string literal inference:

```
PROTOCOL_VERSION (number)
MAX_ENVELOPE_BYTES (number)
MAX_BACKLOG_COUNT (number)
BACKLOG_TTL_SECONDS (number)
MAX_MSGS_PER_MINUTE (number)
PAIRING_SESSION_TTL_MINUTES (number)
HEARTBEAT_INTERVAL_SECONDS (number)

EventType: approval_pending | message_received | run_completed | run_failed | node_status_changed
NodeMode: local | hosted
NodeStatus: active | disabled | pending
DeviceStatus: active | revoked
DeviceType: ios | android
PairingSessionStatus: pending | confirmed | expired | canceled
PairingStatus: active | revoked
EncryptionScheme: sodium-session-v1
PeerKind: device | node
RelayControlType: ping | pong | backlog_truncated | error

BOSS_AGENT_ID = 'boss' (string constant for default agent addressing)
```

### Envelope Types (`src/envelope.ts`)

The envelope is the wire format for all messages between devices and nodes:

```
LimerClawEnvelope
  +-- protocol_version: number
  +-- message_id: string (ULID or UUID)
  +-- sent_at: string (ISO 8601)
  +-- node_id: string (UUID)
  +-- sender: EnvelopePeer
  |     +-- kind: PeerKind
  |     +-- device_id?: string
  +-- recipient: EnvelopePeer
  +-- encryption: EncryptionBlock
  |     +-- scheme: EncryptionScheme
  |     +-- key_id: string
  |     +-- nonce: string (base64)
  |     +-- ciphertext: string (base64)
  |     +-- aad: string (base64)
  +-- agent_id?: string (target agent, omit for boss)
  +-- message_type?: string (routing hint, e.g. 'chat', 'interactive_prompt')

RelayControlMessage
  +-- type: 'ping' | 'pong' | 'backlog_truncated' | 'error'
  +-- message?: string
  +-- dropped_count?: number

RelayMessage = LimerClawEnvelope | RelayControlMessage
```

Type guards:
- `isRelayControlMessage(msg)` -- checks for `type` key without `protocol_version`
- `isEnvelope(msg)` -- checks for `protocol_version` and `encryption` keys

### API Contracts (`src/api-contracts.ts`)

Eight API endpoint pairs:

| Endpoint | Request Type | Response Type |
|----------|-------------|---------------|
| `POST /api/limerclaw/devices/register` | `DeviceRegisterRequest` | `DeviceRegisterResponse` |
| `POST /api/limerclaw/pairing/create` | `PairingCreateRequest` | `PairingCreateResponse` |
| `POST /api/limerclaw/pairing/resolve` | `PairingResolveRequest` | `PairingResolveResponse` |
| `POST /api/limerclaw/pairing/confirm` | `PairingConfirmRequest` | `PairingConfirmResponse` |
| `GET /api/limerclaw/nodes/me` | (none) | `NodesListResponse` |
| `POST /api/limerclaw/push/notify` | `PushNotifyRequest` | `PushNotifyResponse` |
| `GET /api/limerclaw/nodes/:nodeId/agents` | (none) | `NodeAgentsListResponse` |
| `POST /api/limerclaw/nodes/:nodeId/agents/sync` | `AgentSyncRequest` | `AgentSyncResponse` |

Error responses use `ApiErrorResponse { error: string; details?: string }`.

### Database Row Types (`src/db-types.ts`)

Maps 1:1 to Supabase table schemas:

| Type | Table |
|------|-------|
| `LimerClawNodeRow` | `limerclaw_nodes` |
| `LimerClawDeviceRow` | `limerclaw_devices` |
| `LimerClawPairingSessionRow` | `limerclaw_pairing_sessions` |
| `LimerClawPairingRow` | `limerclaw_pairings` |
| `LimerClawNodeAgentRow` | `limerclaw_node_agents` |

### Agent Types (`src/agent-types.ts`)

Defines the agent system's type surface. All enums use the const-object-plus-type pattern.

**Enums:**
```
AgentKind: boss | persistent | on-demand
AgentStatus: active | paused | stopped
ExecutionMode: run-to-completion | interactive
AgentEventType: agent_created | agent_started | agent_stopped | agent_paused
              | run_started | run_completed | run_failed
              | interactive_waiting | interactive_responded
```

**Core interfaces:**
- `AgentInfo` -- full agent record (id, name, kind, status, description, default_workflow_path, execution_mode, timestamps)
- `AgentCreateRequest` / `AgentCreateResponse` -- create an agent
- `AgentUpdateRequest` -- partial update of agent fields
- `InteractivePrompt` / `InteractiveResponse` -- interactive agent Q&A messages
- `AgentEvent` -- structured event for the agent event log
- `ChatMessage` -- simple text message (optionally tagged with agent_id)
- `ApprovalRequest` / `ApprovalResponse` -- tool-use approval flow

**Decrypted payload types:**

The encrypted `ciphertext` inside `LimerClawEnvelope.encryption` decrypts to one of these payload shapes, discriminated by the `type` field:

```
DecryptedPayload = ChatMessage
                 | InteractivePrompt
                 | InteractiveResponse
                 | AgentEvent
                 | ApprovalRequest
                 | ApprovalResponse

DecryptedMessageType = 'chat' | 'interactive_prompt' | 'interactive_response'
                     | 'agent_event' | 'approval_request' | 'approval_response'
```

## Versioning Strategy

- The package is `private: true` and versioned at `0.1.0`.
- It is consumed via git submodule, not npm publish.
- Breaking changes to envelope format require bumping `PROTOCOL_VERSION` in `src/constants.ts`.
- All consumers must be updated simultaneously when envelope format changes.
