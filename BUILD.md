# BUILD.md - limeriq-shared-types

## Prerequisites

- Node.js (any recent LTS)
- npm

## Setup

```bash
npm install
```

This installs only `typescript` (the sole devDependency).

## Type Checking

```bash
npm run typecheck
# equivalent to: tsc --noEmit
```

There is no build/compile step. The `tsconfig.json` has `noEmit: true`. This package is consumed directly as TypeScript source via path aliases in consuming repos.

## tsconfig.json Configuration

| Option | Value | Purpose |
|--------|-------|---------|
| `target` | ES2020 | Baseline JS target |
| `module` | ESNext | ESM module format |
| `moduleResolution` | bundler | Modern resolution for bundled consumers |
| `strict` | true | Full strict mode |
| `noEmit` | true | No JS output -- type checking only |
| `isolatedModules` | true | Ensures compatibility with single-file transpilers |
| `declaration` | true | Allows declaration generation (though noEmit prevents it) |

## How to Add New Types

1. **New enum-like constant:** Add to `src/constants.ts` using the const-object-plus-type pattern:
   ```typescript
   export const MyStatus = {
     ACTIVE: 'active',
     INACTIVE: 'inactive',
   } as const;
   export type MyStatus = (typeof MyStatus)[keyof typeof MyStatus];
   ```

2. **New API contract:** Add request/response interfaces to `src/api-contracts.ts` with a comment indicating the endpoint.

3. **New DB row type:** Add to `src/db-types.ts`, importing any needed enum types from `./constants`.

4. **New source file:** Create the file in `src/`, then add `export * from './your-file'` to `src/index.ts`.

5. **Validate:** Run `npm run typecheck` to ensure no errors.

## Consuming This Package

Other repos reference this package via git submodule and tsconfig path alias:

```json
// tsconfig.json in consuming repo
{
  "compilerOptions": {
    "paths": {
      "@limerclaw/shared-types": ["./shared-types/src"]
    }
  }
}
```

If the consuming repo uses vitest, add a matching alias in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@limerclaw/shared-types': './shared-types/src',
  },
},
```
