# @monorepo/api

Shared OpenAPI contracts, types, and React Query provider for monorepo apps.

## Usage

- Import OpenAPI types:
  ```ts
  import type { components, paths, operations } from "@monorepo/api";
  ```

- Use the React Query client provider:
  ```tsx
  import { QueryClientProvider } from "@monorepo/api";
  ```

- Types are generated from the backend OpenAPI spec.

## Development

- To regenerate types, run:
  ```
  npm run gen:types
  ```

- Ensure dependencies are up to date and compatible with consumers.
