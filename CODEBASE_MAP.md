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

### `src/index.ts` (line 1-6)
Barrel export file. Re-exports everything from all four source modules:
- `export * from './constants'`
- `export * from './envelope'`
- `export * from './api-contracts'`
- `export * from './db-types'`

### `src/constants.ts` (line 1-112)
Protocol constants and enum-like type definitions.

**Constants (lines 2-20):**
- `PROTOCOL_VERSION = 1` (line 2)
- `MAX_ENVELOPE_BYTES = 65_536` (line 5)
- `MAX_BACKLOG_COUNT = 100` (line 8)
- `BACKLOG_TTL_SECONDS = 300` (line 11)
- `MAX_MSGS_PER_MINUTE = 60` (line 14)
- `PAIRING_SESSION_TTL_MINUTES = 10` (line 17)
- `HEARTBEAT_INTERVAL_SECONDS = 30` (line 20)

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

### `src/envelope.ts` (line 1-68)
Wire format types for relay communication.

- `EnvelopePeer` interface (line 4-8): Peer identity with `kind` and optional `device_id`
- `EncryptionBlock` interface (line 11-22): Encryption metadata (scheme, key_id, nonce, ciphertext, aad)
- `LimerClawEnvelope` interface (line 31-46): Full message envelope
- `RelayControlMessage` interface (line 49-55): Control messages (ping/pong/error/backlog_truncated)
- `RelayMessage` type (line 58): Union of `LimerClawEnvelope | RelayControlMessage`
- `isRelayControlMessage()` function (line 61-63): Type guard for control messages
- `isEnvelope()` function (line 66-68): Type guard for envelopes

### `src/api-contracts.ts` (line 1-78)
HTTP API request/response type definitions.

- `DeviceRegisterRequest/Response` (lines 5-16): Device registration
- `PairingCreateRequest/Response` (lines 20-29): Pairing session creation
- `PairingConfirmRequest/Response` (lines 33-40): Pairing confirmation
- `NodeDirectoryEntry` (lines 44-54): Single node info
- `NodesListResponse` (lines 56-58): List of nodes
- `PushNotifyRequest/Response` (lines 62-71): Push notification trigger
- `ApiErrorResponse` (lines 75-78): Standard error shape

### `src/db-types.ts` (line 1-61)
Supabase table row type definitions.

- `LimerClawNodeRow` (lines 11-25): `limerclaw_nodes` table
- `LimerClawDeviceRow` (lines 28-40): `limerclaw_devices` table
- `LimerClawPairingSessionRow` (lines 43-51): `limerclaw_pairing_sessions` table
- `LimerClawPairingRow` (lines 54-61): `limerclaw_pairings` join table
