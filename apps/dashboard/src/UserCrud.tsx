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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      alert("Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>User CRUD Demo</h2>
      <p>
        <strong>API URL:</strong> {API_URL}
      </p>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
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
        <button type="submit" aria-label="Create User">Create User</button>
      </form>

      {editId && (
        <form onSubmit={handleUpdate} style={{ marginBottom: 16 }}>
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
          <button type="submit" aria-label="Update User">Update User</button>
          <button type="button" onClick={() => setEditId(null)} aria-label="Cancel Edit">
            Cancel
          </button>
        </form>
      )}

      <h3>User List</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: "100%" }}>
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
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <button onClick={() => startEdit(u)} aria-label={`Edit user ${u.name}`}>Edit</button>
                  <button onClick={() => handleDelete(u.id!)} aria-label={`Delete user ${u.name}`}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
