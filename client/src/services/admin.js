import { getToken } from "./auth";

const API_BASE = "/api";

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAdminUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err?.error || (res.status === 403 ? "Admin access required" : res.status === 401 ? "Please log in again" : "Failed to load users");
    throw new Error(message);
  }
  return res.json();
}

export async function deleteAdminUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete user");
  }
  return res.json();
}
