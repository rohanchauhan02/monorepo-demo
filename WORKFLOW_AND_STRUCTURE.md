# How to Work with This Repository: Structure, Workflow, and Best Practices

This document is a comprehensive guide for contributors and maintainers. It explains the repository's structure, the responsibilities and interconnections of each folder and file, typical usage scenarios, troubleshooting advice, and best practices for maintaining the integrity and functionality of the project.

---

## 📁 Repository Structure Overview

```
monorepo-demo/
│
├── apps/
│   └── dashboard/
│       ├── public/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── UserCrud.tsx
│       │   ├── index.css
│       │   ├── main.tsx
│       │   ├── vite-env.d.ts
│       │   └── ...
│       ├── package.json
│       ├── tailwind.config.js
│       ├── postcss.config.cjs
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── ...
│
├── backend/
│   └── api/
│       ├── main.go
│       ├── Dockerfile
│       └── ...
│
├── packages/
│   └── api/
│       ├── src/
│       │   ├── contracts/
│       │   │   ├── v1.json
│       │   │   └── v1.ts
│       │   ├── index.ts
│       │   └── query-client-provider.tsx
│       ├── package.json
│       └── ...
│
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── Taskfile.yml
├── README.md
├── README.fullstack.md
├── FE_theory_and_tools.md
├── ARCHITECTURE_ENTERPRISE.md
└── ...
```

---

## 🗂️ apps/dashboard (Frontend) – In-Depth

### Folder Purpose
- The main React frontend app, built with Vite and TypeScript.
- Handles all user interface, state management, and API integration.

### Key Files and Their Roles

- **public/**
  - Static assets (favicon, images, etc.).
  - Impact: Missing assets can break branding or UI.

- **src/**
  - **App.tsx**
    - Root React component. Sets up the main layout and renders child components.
    - Usage: Entry point for all UI features.
    - Impact: Errors here break the entire UI.
  - **UserCrud.tsx**
    - Handles all user CRUD operations (list, create, update, delete).
    - Integrates with backend API using fetch and generated types.
    - Usage: Main user management UI.
    - Impact: Bugs here affect user management features.
  - **main.tsx**
    - React app bootstrapper. Renders `<App />` into the DOM.
    - Usage: Only needs to be changed for global providers or root-level config.
    - Impact: Errors here prevent the app from loading.
  - **index.css**
    - Global styles and Tailwind CSS directives.
    - Usage: Add global or utility styles here.
    - Impact: Broken or missing styles affect the entire UI.
  - **vite-env.d.ts**
    - TypeScript environment definitions for Vite.
    - Impact: Missing or incorrect types can cause build errors.
  - **Other components/files**
    - Modular UI features (e.g., forms, cards, modals).
    - Usage: Add new features as separate components for maintainability.

- **package.json**
  - Lists all frontend dependencies (React, Vite, Tailwind, etc.), scripts, and config.
  - Usage: Add/remove dependencies, update scripts.
  - Impact: Version mismatches or missing dependencies break builds.

- **tailwind.config.js**
  - Tailwind CSS configuration (content paths, theme, plugins).
  - Usage: Add custom colors, fonts, or enable JIT mode.
  - Impact: Misconfiguration breaks CSS or disables Tailwind.

- **postcss.config.cjs**
  - PostCSS configuration for Tailwind and autoprefixer.
  - Usage: Should be CommonJS (.cjs) if using "type": "module" in package.json.
  - Impact: Misconfiguration breaks CSS build.

- **tsconfig.json**
  - TypeScript configuration for the frontend.
  - Usage: Controls strictness, module resolution, and path aliases.
  - Impact: Incorrect config causes type errors or build failures.

- **vite.config.ts**
  - Vite configuration (plugins, server options, build settings).
  - Usage: Add plugins (e.g., React, Tailwind), configure dev server.
  - Impact: Misconfiguration can break HMR, builds, or plugin integration.

### Workflow and Dependencies

- **App.tsx** imports and renders **UserCrud.tsx** and other components.
- **UserCrud.tsx** imports types from **@monorepo/api** (see packages/api).
- **index.css** is imported in **main.tsx** to apply global styles.
- **Tailwind CSS** is configured via tailwind.config.js and postcss.config.cjs.
- **Vite** uses vite.config.ts for dev server and build.

### Usage Scenarios

- **Adding a new feature:**
  Create a new component in src/, import it in App.tsx, and use Tailwind classes for styling.
- **Changing API integration:**
  Update fetch calls in UserCrud.tsx, and update types from @monorepo/api if backend changes.
- **Styling:**
  Add or modify Tailwind classes in components or global styles in index.css.

### Troubleshooting & Impact

- **Build fails:**
  Check node_modules, Tailwind/PostCSS config, and .env variables.
- **UI not updating:**
  Check state management in components and API responses.
- **Type errors:**
  Run `task gen-contracts` to regenerate types from backend.

---

## 🗂️ packages/api (Shared Types) – In-Depth

### Folder Purpose
- Provides TypeScript types generated from the backend OpenAPI spec.
- Ensures type safety and contract consistency between backend and frontend.

### Key Files and Their Roles

- **src/contracts/v1.json**
  - OpenAPI spec generated from backend (huma doc comments).
  - Usage: Source of truth for API contracts.
  - Impact: Outdated spec causes type mismatches and runtime bugs.

- **src/contracts/v1.ts**
  - TypeScript types generated from v1.json using openapi-typescript.
  - Usage: Import types in frontend for type-safe API calls.
  - Impact: Outdated types cause TypeScript errors or runtime bugs.

- **src/index.ts**
  - Exports generated types and utility providers for frontend.
  - Usage: Import from @monorepo/api in frontend code.

- **query-client-provider.tsx**
  - Provides a React Query client context for the app.
  - Usage: Wrap your app with this provider for data fetching.

- **package.json**
  - Lists dependencies for type generation and usage (openapi-typescript, etc.).
  - Usage: Add/update dependencies for type generation.

### Workflow and Dependencies

- **Backend** generates v1.json via huma doc comments and OpenAPI generation.
- **openapi-typescript** generates v1.ts from v1.json.
- **Frontend** imports types from @monorepo/api for type-safe API integration.

### Usage Scenarios

- **Backend API changes:**
  Update doc comments in main.go, run `task gen-contracts` to regenerate v1.json and v1.ts.
- **Frontend type errors:**
  Run `task gen-contracts` to update types, then update frontend code as needed.
- **Adding new endpoints:**
  Add doc comments and handlers in backend, regenerate types, and use new types in frontend.

### Troubleshooting & Impact

- **Type errors in frontend:**
  v1.ts is outdated or missing types. Run `task gen-contracts`.
- **API contract mismatch:**
  v1.json is outdated. Regenerate from backend.
- **Missing types:**
  Ensure backend doc comments reference all request/response structs.

---

## 🔗 Interconnections and Workflow

- **Frontend (apps/dashboard)** imports types from **packages/api** for type-safe API calls.
- **Backend (backend/api)** generates OpenAPI spec, which is used to generate types in **packages/api**.
- **Taskfile.yml** automates the workflow: build, lint, test, generate types, run dev servers.
- **.env** files are used by both frontend and backend for configuration.
- **Dockerfile** and **Taskfile.yml** enable local and production deployment.

---

## 🛠️ Step-by-Step Contributor Guidance

1. **Clone the repo.**
2. **Install environment tools:**
   Run `mise install` (if using mise) to set up Node.js, Go, etc.
3. **Install dependencies:**
   - Frontend: `cd apps/dashboard && npm install`
   - Backend: `cd backend/api && go mod tidy`
   - Shared: `cd packages/api && npm install`
4. **Start dev servers:**
   - Backend: `task dev-backend`
   - Frontend: `task dev-frontend`
5. **Generate types:**
   `task gen-contracts`
6. **Build and test:**
   `task build`, `task test`, `task lint`
7. **Make changes:**
   - UI: Edit files in `apps/dashboard/src/`
   - API: Edit `backend/api/main.go`
   - Types: Regenerate after backend changes
8. **Troubleshoot:**
   - Check logs, browser console, and Taskfile output.
   - Use `task` commands for automation.
   - Check .env and config files for missing/incorrect values.

---

## 🧰 Troubleshooting Advice

- **Frontend build fails:**
  - Check node_modules, Tailwind/PostCSS config, and .env variables.
- **Backend won't start:**
  - Check Go version, dependencies, and .env.
- **Type errors in frontend:**
  - Run `task gen-contracts` to regenerate types.
- **API returns 404/500:**
  - Check endpoint registration and handler logic in main.go.
- **Docker build fails:**
  - Check Dockerfile paths and context.

---

## 🏆 Best Practices

- **Keep dependencies up to date.**
- **Regenerate types after backend changes.**
- **Write clear OpenAPI doc comments for all API endpoints.**
- **Use Tailwind utility classes for consistent styling.**
- **Automate with Taskfile and mise for reproducibility.**
- **Document new features and changes in README.**
- **Review PRs for code quality, type safety, and test coverage.**

---

## ⚠️ Impact of Issues in Each Folder/File

- **apps/dashboard/src/UserCrud.tsx:**
  Bugs here break user management UI and API integration.
- **apps/dashboard/src/App.tsx:**
  Errors here can break the entire UI or routing.
- **apps/dashboard/src/index.css:**
  Broken or missing styles affect the entire UI.
- **apps/dashboard/vite.config.ts:**
  Misconfiguration can break HMR, builds, or plugin integration.
- **backend/api/main.go:**
  Bugs here break API endpoints, OpenAPI spec, and type generation.
- **packages/api/src/contracts/v1.ts:**
  Outdated types cause frontend-backend mismatches and TypeScript errors.
- **Taskfile.yml:**
  Broken tasks block builds, tests, and type generation.
- **.env:**
  Missing or incorrect values break API connections, builds, or deployments.
- **Dockerfile:**
  Errors block container builds and deployments.

---

**Maintaining this structure and following these best practices ensures a robust, scalable, and contributor-friendly project.**
