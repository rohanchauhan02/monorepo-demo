# Monorepo Demo

A production-ready monorepo template with Go backend and React + Vite + TypeScript apps/dashboard, managed with Taskfile and mise.

## Project Structure

```
.
├── backend/         # Go backend services
│   └── api/         # Main API service
├── apps/dashboard/        # React + Vite + TypeScript apps/dashboard
├── shared/          # Shared code (for future use)
├── Taskfile.yml     # Task runner for all workflows
├── mise.toml        # Tool version manager config
├── .env.example     # Example environment variables
└── README.md        # Project documentation
```

## Prerequisites

- [mise](https://mise.jdx.dev/) for managing Go, Node, and other tool versions
- Go 1.23+ (managed by mise)
- Node.js 18+ (managed by mise)
- Docker (optional, for containerization)

## Setup

1. **Clone the repo and trust mise config:**
   ```sh
   git clone <repo-url>
   cd monorepo-demo
   mise trust
   ```

2. **Install all dependencies:**
   ```sh
   task setup
   ```

3. **Copy and configure environment variables (single .env in root):**
   ```sh
   cp .env.example .env
   # Edit .env as needed (this file is used by both backend and frontend)
   ```

## Development

- **Start backend with auto-reload:**
  ```sh
  task dev
  ```
  - Starts the Go backend API with live reload (using Air).
  - Accessible at [http://localhost:3000/](http://localhost:3000/).

- **Start apps/dashboard (in another terminal):**
  ```sh
  cd apps/dashboard
  npm run dev
  ```
  - Starts the React dashboard (Vite dev server).
  - Accessible at [http://localhost:5175/](http://localhost:5175/).

- **Start all development services (backend, dashboard, and Storybook) in parallel:**
  ```sh
  task dev-all
  ```
  - Starts:
    - Backend API (auto-reload) at [http://localhost:3000/](http://localhost:3000/)
    - Dashboard (Vite) at [http://localhost:5175/](http://localhost:5175/)
    - Storybook (if configured) at [http://localhost:2995/](http://localhost:2995/)
  - All logs will appear in the same terminal.

**Summary of Development Ports:**
- Backend API: `http://localhost:3000/`
- Dashboard: `http://localhost:5175/`
- Storybook: `http://localhost:2995/` (if enabled)

## Production Build

- **Build backend and apps/dashboard:**
  ```sh
  task build-backend
  task build-apps/dashboard
  ```

- **Start backend and serve apps/dashboard:**
  ```sh
  task start-backend
  task start-apps/dashboard
  ```

## Linting & Testing

- **Lint backend:** `task lint-backend`
- **Lint apps/dashboard:** `task lint-apps/dashboard`
- **Test backend:** `task test-backend`
- **Test apps/dashboard:** `task test-apps/dashboard`

## Docker

### Backend API

Build and run the backend API with Docker:

```sh
docker build -t monorepo-backend ./backend/api
docker run --env-file .env -p 8080:8080 monorepo-backend
```

### Dashboard (Frontend)

Build and run the dashboard with Docker:

```sh
docker build -t monorepo-dashboard ./apps/dashboard
docker run --env-file .env -p 5175:5175 monorepo-dashboard
```

- Set environment variables in your root `.env` file for production (see `.env.example`).
- Do not use `.env` files in subfolders; only the root `.env` is needed.
- For orchestration, use `docker-compose` or deploy each service separately.

## OpenAPI & TypeScript Contracts

- The backend automatically generates `packages/api/src/contracts/v1.json` (OpenAPI spec) on build/startup.
- The Taskfile `gen-contracts` task generates both the OpenAPI JSON and TypeScript types:
  ```sh
  task gen-contracts
  ```
  - This runs the backend to generate `v1.json` and then uses openapi-typescript to generate `v1.ts`.
  - The generated `v1.ts` exports `components`, `paths`, and `operations` types for use in the frontend.

- **Frontend usage:**
  - Add `@monorepo/api` as a dependency in your app (already set up in this monorepo).
  - Import types and use the generated API client:
    ```ts
    import type { components } from "@monorepo/api";
    // Use components["schemas"]["User"], etc.
    ```

- This ensures your OpenAPI spec and TypeScript types are always in sync with your Go backend, and your frontend can make type-safe API calls.

## Tooling

- **Taskfile:** Unified task runner for all workflows.
- **Root package.json:** Lint, format, and test all packages with Biome.
- **mise:** Ensures consistent tool versions across all environments.

---

**Professional features:**
- Environment variable support via `.env`
- Automated setup and build tasks
- Linting and testing for both backend and apps/dashboard
- Ready for CI/CD and Docker integration
