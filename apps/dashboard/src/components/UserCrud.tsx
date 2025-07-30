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
    <div>
      <h2>User CRUD Demo</h2>
      <p className="mb-4">
        <strong>API URL:</strong> <span style={{ fontFamily: "monospace" }}>{API_URL}</span>
      </p>
      <form onSubmit={handleCreate}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm((f: CreateUserRequest) => ({ ...f, name: (e.target as HTMLInputElement).value }))
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm((f: CreateUserRequest) => ({ ...f, email: (e.target as HTMLInputElement).value }))
            }
            required
          />
        </div>
        <button
          type="submit"
          aria-label="Create User"
          className="primary"
        >
          Create User
        </button>
      </form>

      {editId && (
        <form onSubmit={handleUpdate}>
          <div className="form-row">
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
            />
          </div>
          <div className="flex">
            <button
              type="submit"
              aria-label="Update User"
              className="success"
            >
              Update User
            </button>
            <button
              type="button"
              onClick={() => setEditId(null)}
              aria-label="Cancel Edit"
              className="secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h3>User List</h3>
      {loading ? (
        <p className="status">Loading...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: User) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: "monospace" }}>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button
                      onClick={() => startEdit(u)}
                      aria-label={`Edit user ${u.name}`}
                      className="secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id!)}
                      aria-label={`Delete user ${u.name}`}
                      className="danger"
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
