# CODEBASE_MAP.md - limeriq-shared-types

## File-by-File Reference

### `package.json`
- Package name: `@limerclaw/shared-types`
- Version: `0.1.0`, `private: true`
- Entry point: `src/index.ts` (both `main` and `types`)
- Single script: `typecheck` -> `tsc --noEmit`
- Only devDependency: `typescript ^5.6.0`

### `tsconfig.json`
- Target: ES2020, Module: ESNext, moduleResolution: bundler
- `noEmit: true` -- type checking only, no JS output
- `strict: true`, `isolatedModules: true`
- Includes `src/**/*.ts`

### `src/index.ts` (line 1-7)
Barrel export file. Re-exports everything from all five source modules:
- `export * from './constants'`
- `export * from './envelope'`
- `export * from './api-contracts'`
- `export * from './db-types'`
- `export * from './agent-types'`

### `src/constants.ts` (line 1-118)
Protocol constants and enum-like type definitions.

**Constants (lines 2-20):**
- `PROTOCOL_VERSION = 1` (line 2)
- `MAX_ENVELOPE_BYTES = 65_536` (line 5)
- `MAX_BACKLOG_COUNT = 100` (line 8)
- `BACKLOG_TTL_SECONDS = 300` (line 11)
- `MAX_MSGS_PER_MINUTE = 60` (line 14)
- `PAIRING_SESSION_TTL_MINUTES = 10` (line 17)
- `HEARTBEAT_INTERVAL_SECONDS = 30` (line 20)
- `BOSS_AGENT_ID = 'boss'` (line 117): Default agent ID for boss agent addressing

**Enum-like types (lines 24-112):**
- `EventType` (line 24-32): Push notification event types
- `NodeMode` (line 39-44): `local` | `hosted`
- `NodeStatus` (line 48-54): `active` | `disabled` | `pending`
- `DeviceStatus` (line 56-61): `active` | `revoked`
- `DeviceType` (line 63-68): `ios` | `android`
- `PairingSessionStatus` (line 70-77): `pending` | `confirmed` | `expired` | `canceled`
- `PairingStatus` (line 79-84): `active` | `revoked`
- `EncryptionScheme` (line 88-92): `sodium-session-v1`
- `PeerKind` (line 96-101): `device` | `node`
- `RelayControlType` (line 105-112): `ping` | `pong` | `backlog_truncated` | `error`

### `src/envelope.ts` (line 1-73)
Wire format types for relay communication.

- `EnvelopePeer` interface (line 4-8): Peer identity with `kind` and optional `device_id`
- `EncryptionBlock` interface (line 11-22): Encryption metadata (scheme, key_id, nonce, ciphertext, aad)
- `LimerClawEnvelope` interface (line 31-50): Full message envelope
  - `agent_id?: string` (line 47): Target agent ID (omit for boss agent)
  - `message_type?: string` (line 49): Routing hint (e.g. `'chat'`, `'interactive_prompt'`)
- `RelayControlMessage` interface (line 52-59): Control messages (ping/pong/error/backlog_truncated)
- `RelayMessage` type (line 62): Union of `LimerClawEnvelope | RelayControlMessage`
- `isRelayControlMessage()` function (line 65-67): Type guard for control messages
- `isEnvelope()` function (line 70-72): Type guard for envelopes

### `src/api-contracts.ts` (line 1-143)
HTTP API request/response type definitions. Imports `AgentKind`, `AgentStatus`, `ExecutionMode` from `./agent-types`.

- `DeviceRegisterRequest/Response` (lines 6-17): Device registration
- `NodeRegisterRequest/Response` (lines 21-38): Node registration
- `PairingCreateRequest/Response` (lines 42-51): Pairing session creation
- `PairingResolveRequest/Response` (lines 55-64): Pairing code resolution
- `PairingConfirmRequest/Response` (lines 68-75): Pairing confirmation
- `NodeDirectoryEntry` (lines 79-91): Single node info
- `NodesListResponse` (lines 93-95): List of nodes
- `PushNotifyRequest/Response` (lines 99-108): Push notification trigger
- `NodeAgentEntry` (lines 112-121): Agent info entry for a node (agent_id, name, kind, status, description, execution_mode, timestamps)
- `NodeAgentsListResponse` (lines 123-125): List of agents for a node
- `AgentSyncRequest` (lines 129-131): Bulk agent sync (array of `NodeAgentEntry`)
- `AgentSyncResponse` (lines 133-135): Sync result with `synced_count`
- `ApiErrorResponse` (lines 139-142): Standard error shape

### `src/db-types.ts` (line 1-77)
Supabase table row type definitions. Imports `AgentKind`, `ExecutionMode` from `./agent-types`.

- `LimerClawNodeRow` (lines 12-26): `limerclaw_nodes` table
- `LimerClawDeviceRow` (lines 29-41): `limerclaw_devices` table
- `LimerClawPairingSessionRow` (lines 44-52): `limerclaw_pairing_sessions` table
- `LimerClawPairingRow` (lines 55-62): `limerclaw_pairings` join table
- `LimerClawNodeAgentRow` (lines 65-76): `limerclaw_node_agents` table (node_id, agent_id, name, kind, status, description, execution_mode, timestamps)

### `src/agent-types.ts` (line 1-153)
Agent system type definitions. Uses the const-object-plus-type pattern for all enums.

**Enums (lines 1-44):**
- `AgentKind` (lines 3-9): `boss` | `persistent` | `on-demand`
- `AgentStatus` (lines 13-19): `active` | `paused` | `stopped`
- `ExecutionMode` (lines 23-28): `run-to-completion` | `interactive`
- `AgentEventType` (lines 32-44): Agent lifecycle and run events

**Core interfaces (lines 48-109):**
- `AgentInfo` (lines 48-58): Full agent record
- `AgentCreateRequest` (lines 62-68): Fields for creating an agent
- `AgentCreateResponse` (lines 70-72): Wraps `AgentInfo`
- `AgentUpdateRequest` (lines 74-80): Partial update fields
- `InteractivePrompt` (lines 84-91): Interactive agent question
- `InteractiveResponse` (lines 93-98): User response to interactive prompt
- `AgentEvent` (lines 102-109): Structured event for event log

**Decrypted payload types (lines 111-153):**
- `DecryptedMessageType` (lines 113-119): String literal union of all payload type discriminators
- `ChatMessage` (lines 123-127): Simple text message
- `ApprovalRequest` (lines 129-136): Tool-use approval request
- `ApprovalResponse` (lines 138-142): Approval decision (`approved` | `denied` | `approved_session`)
- `DecryptedPayload` (lines 146-152): Discriminated union of all decrypted message shapes
