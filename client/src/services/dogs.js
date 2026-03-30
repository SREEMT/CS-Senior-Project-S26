import { getToken } from "./auth";

const API_BASE = "/api";

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getMyDogs() {
  const res = await fetch(`${API_BASE}/dogs/mine`, {
    method: "GET",
    headers: authHeaders(),
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Failed to fetch dogs");
  }

  const dogs = json?.data ?? [];
  return (Array.isArray(dogs) ? dogs : []).map((d) => ({
    id: d.id ?? d._id ?? "",
    name: d.name ?? "",
  }));
}

