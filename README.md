# limeriq-shared-types

Shared protocol and API contracts for the LimerClaw stack.

## Scope

- Envelope framing (`LimerClawEnvelope`, control messages).
- API request/response contracts for service endpoints.
- Database row interfaces for core LimerClaw tables.
- Agent/event payload types used by mobile and daemon.
- Runtime state transition contracts (`runtime-state.ts`) for invariant telemetry.

## Consumers

- `/Users/darrenapfel/DEVELOPER/limeriq-client`
- `/Users/darrenapfel/DEVELOPER/limeriq-mobile-app`
- `/Users/darrenapfel/DEVELOPER/limeriq-relay`
- `/Users/darrenapfel/DEVELOPER/limeriq-service`

## Change Rules

1. Backward-compatible additions only in minor updates.
2. Breaking envelope/API changes require protocol version review and coordinated rollout.
3. Keep field names and enum values aligned with live service and relay behavior.

## Validation

```bash
cd /Users/darrenapfel/DEVELOPER/limeriq-shared-types
npm run typecheck
```

## Reference

Cross-repo architecture and ops runbook:
- `/Users/darrenapfel/DEVELOPER/limeriq-client/docs/20260216-limerclaw-multi-agent-architecture-ops.md`
