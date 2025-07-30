import React, { useEffect, useState } from "react";
// Import the generated types from the shared package

import type { components } from "@monorepo/api";
type User = components["schemas"]["User"];
type CreateUserRequest = components["schemas"]["CreateUserRequest"];
type UpdateUserRequest = components["schemas"]["UpdateUserRequest"];
type UsersListResponse = { users: User[] };
type DeleteUserResponse = { deleted: boolean };

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/v1/users";

export default function UserCrud() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<CreateUserRequest>({ name: "", email: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    name: undefined,
    email: undefined,
  });
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      console.log("fetchUsers response", res.status, data);
      // Use the generated type for list response
      const usersList: UsersListResponse = data;
      setUsers(usersList.users || []);
      console.log("setUsers called with", usersList.users);
    } catch {
      alert("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create user");
      setForm({ name: "", email: "" });
      await fetchUsers();
      console.log("After create, users state:", users);
    } catch {
      alert("Error creating user");
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEdit = (user: User) => {
    setEditId(user.id || "");
    setEditForm({ name: user.name, email: user.email });
  };

  // Update user
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update user");
      setEditId(null);
      setEditForm({ name: undefined, email: undefined });
      await fetchUsers();
    } catch {
      alert("Error updating user");
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      // Optionally, check the delete response
      const data = await res.json();
      const del: DeleteUserResponse = data;
      if (!del.deleted) throw new Error("Delete failed");
      await fetchUsers();
    } catch {
      alert("Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-blue-700">User CRUD Demo</h2>
      <p className="mb-4 text-sm text-gray-500">
        <strong>API URL:</strong> <span className="font-mono">{API_URL}</span>
      </p>
      <form onSubmit={handleCreate} className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm((f: CreateUserRequest) => ({ ...f, name: (e.target as HTMLInputElement).value }))
          }
          required
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm((f: CreateUserRequest) => ({ ...f, email: (e.target as HTMLInputElement).value }))
          }
          required
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          aria-label="Create User"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create User
        </button>
      </form>

      {editId && (
        <form onSubmit={handleUpdate} className="flex flex-col gap-3 mb-6 bg-blue-50 p-4 rounded">
          <input
            type="text"
            placeholder="Name"
            value={editForm.name || ""}
            onChange={(e) =>
              setEditForm((f: UpdateUserRequest) => ({
                ...f,
                name: (e.target as HTMLInputElement).value,
              }))
            }
            required
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={editForm.email || ""}
            onChange={(e) =>
              setEditForm((f: UpdateUserRequest) => ({
                ...f,
                email: (e.target as HTMLInputElement).value,
              }))
            }
            required
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              aria-label="Update User"
              className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Update User
            </button>
            <button
              type="button"
              onClick={() => setEditId(null)}
              aria-label="Cancel Edit"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h3 className="text-lg font-semibold mb-2">User List</h3>
      {loading ? (
        <p className="text-blue-600">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: User) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2 font-mono">{u.id}</td>
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => startEdit(u)}
                      aria-label={`Edit user ${u.name}`}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id!)}
                      aria-label={`Delete user ${u.name}`}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
