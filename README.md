# Monorepo Demo – Developer Guide

This monorepo contains a full-stack web application with a Go backend and a React (Vite) frontend. This guide explains the architecture, folder structure, and step-by-step instructions for adding new API endpoints, integrating Tailwind CSS, and building new UI features. It is written for junior developers.

---

## 📁 Folder Structure & Architecture

```
monorepo-demo/
│
├── apps/
│   └── dashboard/         # Frontend React app (Vite, TypeScript)
│       ├── src/           # React components, main UI code
│       ├── public/        # Static assets
│       ├── package.json   # Frontend dependencies and scripts
│       └── ...            # Vite config, tsconfig, etc.
│
├── backend/
│   └── api/               # Go backend API (chi router, REST, OpenAPI)
│       ├── main.go        # Main backend entrypoint
│       └── Dockerfile     # Backend Dockerfile
│
├── packages/
│   └── api/               # Shared TypeScript types (OpenAPI-generated)
│       ├── src/contracts/ # OpenAPI JSON and generated TS types
│       └── package.json   # Type package config
│
├── .env                   # Environment variables (local)
├── Dockerfile             # Fullstack Dockerfile (backend + frontend)
├── Taskfile.yml           # Task runner for common dev/build tasks
├── README.md              # This guide
└── ...
```

- **Frontend:** `apps/dashboard` (React, Vite, TypeScript)
- **Backend:** `backend/api` (Go, chi, REST, OpenAPI)
- **Shared Types:** `packages/api` (OpenAPI JSON, generated TypeScript types)

---

## 🏗️ How the Repo Works

- **Monorepo:** All backend, frontend, and shared code in one repo.
- **Type Safety:** Backend OpenAPI spec generates TypeScript types for the frontend.
- **Taskfile:** Use `task` for dev, build, lint, and test commands.
- **Docker:** Build and run the full stack with Docker.

---

## 🚀 Adding a New API Endpoint (Backend)

1. **Open `backend/api/main.go`.**
2. **Add your handler using chi:**
   ```go
   // @summary Get all products
   // @produce json
   // @success 200 {object} []Product
   // @router /v1/products [get]
   router.Get("/v1/products", func(w http.ResponseWriter, r *http.Request) {
       // Your logic here
       w.Header().Set("Content-Type", "application/json")
       w.WriteHeader(200)
       _ = json.NewEncoder(w).Encode(products)
   })
   ```
3. **Add your struct(s) at the top of the file:**
   ```go
   type Product struct {
       ID   string `json:"id"`
       Name string `json:"name"`
   }
   ```
4. **Restart the backend:**
   ```
   task dev-backend
   ```
5. **(Optional) Update OpenAPI docs:**
   If you use huma or swaggo, your doc comments will be picked up for OpenAPI generation.

---

## 🎨 Adding Tailwind CSS (Frontend)

1. **Install Tailwind CSS:**
   ```
   cd apps/dashboard
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
2. **Configure `tailwind.config.js`:**
   ```js
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: { extend: {} },
     plugins: [],
   }
   ```
3. **Add Tailwind to your CSS:**
   In `src/index.css` or `src/App.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. **Use Tailwind classes in your React components:**
   ```jsx
   <button className="bg-blue-500 text-white px-4 py-2 rounded">Click me</button>
   ```
5. **Restart the frontend:**
   ```
   npm run dev
   ```

---

## 🖥️ Adding a New UI Feature (Frontend)

1. **Create a new component in `apps/dashboard/src/`:**
   ```tsx
   // src/NewFeature.tsx
   import React from "react";
   export default function NewFeature() {
     return <div className="p-4 bg-gray-100">New Feature!</div>;
   }
   ```
2. **Import and use it in `App.tsx`:**
   ```tsx
   import NewFeature from "./NewFeature";
   // ...
   <NewFeature />
   ```
3. **To fetch data from the backend:**
   ```tsx
   useEffect(() => {
     fetch("/v1/products")
       .then(res => res.json())
       .then(data => setProducts(data.products));
   }, []);
   ```
4. **Use Tailwind classes for styling.**

---

## 🗂️ Folder Structure Explained

- **apps/dashboard/src/**: All React components, hooks, and UI logic.
- **backend/api/main.go**: All backend API endpoints, business logic, and in-memory data.
- **packages/api/src/contracts/**: OpenAPI JSON and generated TypeScript types for API contracts.
- **Taskfile.yml**: Task runner for dev/build/test/lint commands.
- **.env**: Environment variables for local development.

---

## 🛠️ Development Workflow

- **Start backend:** `task dev-backend`
- **Start frontend:** `task dev-frontend`
- **Build everything:** `task build`
- **Generate OpenAPI types:** `task gen-contracts`
- **Lint:** `task lint`
- **Test:** `task test`
- **Docker build:** `task docker-build`
- **Docker run:** `task docker-run`

---

## 📝 Tips for Junior Developers

- Always check the folder structure before adding new files.
- Use the provided types from `@monorepo/api` in the frontend for type safety.
- Use Tailwind CSS utility classes for fast, consistent styling.
- Document new API endpoints with OpenAPI-style comments.
- Use the Taskfile for common commands to avoid mistakes.
- Ask for code review if unsure about Go or React patterns.

---

For more details, see the comments in each file and the OpenAPI doc comments above each backend handler.
