# limeriq-shared-types


## Scope

- API request/response contracts for service endpoints.
- Agent/event payload types used by mobile and daemon.
- Runtime state transition contracts (`runtime-state.ts`) for invariant telemetry.

## Work Tracking (SoR)

Planning and commitment tracking for limeriq lives in `limeriq/limeriq-product-intent`:

- Canonical work items: https://github.com/limeriq/limeriq-product-intent/issues
- Org project board: https://github.com/orgs/limeriq/projects/1 (`Limeriq Product Ops`)

Use this repo for implementation changes to shared contracts, and link changes back to the canonical product-intent issue.

## Auth Note

`LIMERIQ_PROJECT_BOT_TOKEN` is only used by GitHub Actions in `limeriq-product-intent` for org project sync.

Local terminal runs use exported credentials; limeriq bootstrap scripts in `limeriq-ops` can fall back to `gh auth token` when `GITHUB_TOKEN` or `NODE_AUTH_TOKEN` is unset.

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
