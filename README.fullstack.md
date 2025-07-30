# Full-Stack Project Setup Guide (React + Vite + Tailwind CSS + Backend API)

This guide walks backend developers through setting up a modern full-stack project from scratch, focusing on building and integrating a React frontend (using Vite and Tailwind CSS) with a backend API. It covers both practical steps and theoretical background, and is beginner-friendly.

---

## 🏗️ Project Architecture Overview

A typical full-stack project consists of:
- **Frontend:** User interface, built with React (component-based UI), Vite (fast dev/build tool), and Tailwind CSS (utility-first styling).
- **Backend:** API server (e.g., Go, Node.js, Python) that handles business logic, data storage, and serves data to the frontend via HTTP.

**How they work together:**
- The frontend (React) runs in the browser, fetches data from the backend API using HTTP requests (usually via `fetch` or `axios`).
- The backend exposes RESTful endpoints (e.g., `/api/users`) that the frontend calls to get or update data.

---

## 1️⃣ Initialize the Frontend with Vite

**Vite** is a modern build tool that provides instant dev server start and fast HMR (Hot Module Replacement) for React.

### Step-by-step:

1. **Create the frontend app:**
   ```sh
   npm create vite@latest my-frontend -- --template react-ts
   cd my-frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Project structure:**
   ```
   my-frontend/
   ├── src/           # React components and code
   ├── public/        # Static assets
   ├── index.html     # Main HTML file
   ├── package.json   # Project config and scripts
   └── ...
   ```

---

## 2️⃣ Install and Configure Tailwind CSS

**Tailwind CSS** is a utility-first CSS framework that lets you style your UI by composing classes in your HTML/JSX.

### Step-by-step:

1. **Install Tailwind and dependencies:**
   ```sh
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Configure Tailwind:**
   Edit `tailwind.config.js`:
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
   In `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. **Use Tailwind classes in your components:**
   ```tsx
   <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
     Click me
   </button>
   ```

---

## 3️⃣ Connect the Frontend to the Backend API

**How React communicates with the backend:**
- Use `fetch` or `axios` to make HTTP requests to your backend API.
- The backend should expose REST endpoints (e.g., `/api/users`).

### Example: Fetching data in React

```tsx
import React, { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/v1/users")
      .then(res => res.json())
      .then(data => setUsers(data.users));
  }, []);

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

**CORS:**
- The backend must allow cross-origin requests (CORS) from the frontend's origin (e.g., `http://localhost:5173`).
- In Go, use the `github.com/go-chi/cors` middleware.

---

## 4️⃣ Theoretical Background

### React
- **Component-based:** UI is built from reusable components.
- **State management:** Use `useState`, `useEffect`, etc. for local state and side effects.
- **JSX:** Write HTML-like syntax in JavaScript.

### Vite
- **Dev server:** Fast startup, instant HMR.
- **Build tool:** Uses ES modules, optimized for modern browsers.
- **Config:** Minimal, but extensible via plugins.

### Tailwind CSS
- **Utility-first:** Compose UI by combining small, single-purpose classes.
- **No custom CSS needed:** Most styling is done via class names.
- **Responsive and themeable:** Use responsive and dark mode variants easily.

### How They Work Together
- **Vite** serves and builds your React app.
- **React** renders the UI and manages state.
- **Tailwind** provides styling via classes in your JSX.
- **Frontend** fetches data from the **backend API** and displays it.

---

## 5️⃣ Practical Example: Add a Feature

**Add a "Create User" form:**

```tsx
function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    fetch("http://localhost:8080/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })
      .then(res => res.json())
      .then(user => {
        // handle new user
      });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input className="border p-2" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <input className="border p-2" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}
```

---

## 6️⃣ Package Explanations

- **react, react-dom:** Core React libraries for building UI.
- **vite:** Dev server and build tool for React.
- **tailwindcss:** Utility-first CSS framework.
- **postcss, autoprefixer:** CSS processing for Tailwind.
- **@types/react, @types/react-dom:** TypeScript types for React.
- **go-chi/chi, go-chi/cors:** Go router and CORS middleware for backend.

---

## 7️⃣ Summary: End-to-End Flow

1. **Frontend (React + Vite + Tailwind):**
   - User interacts with UI.
   - UI makes HTTP requests to backend API.
   - UI is styled with Tailwind classes.

2. **Backend (API):**
   - Receives requests, processes data, returns JSON.
   - Allows CORS for frontend.

3. **Integration:**
   - Frontend and backend run separately in dev, communicate via HTTP.
   - In production, can be served together via Docker or reverse proxy.

---

## 8️⃣ Tips for Beginners

- Use `npm run dev` to start the frontend, `go run main.go` (or `task dev-backend`) for the backend.
- Use browser dev tools (Network tab) to debug API requests.
- Use Tailwind's documentation for class references: https://tailwindcss.com/docs
- Keep backend and frontend code modular and well-documented.
- Ask for help and code review if stuck!

---

Happy coding!
