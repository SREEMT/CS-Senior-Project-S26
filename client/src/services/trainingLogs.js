import { getToken } from "./auth";

const API_BASE = "/api";

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createTrainingLog(data) {
  const res = await fetch(`${API_BASE}/training-logs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Failed to create training log");
  }

  return json ?? {};
}

export async function getMyTrainingLogs() {
  const res = await fetch(`${API_BASE}/training-logs`, {
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
    throw new Error(json?.error || json?.message || "Failed to load training logs");
  }

  // Server returns logs array.
  return Array.isArray(json) ? json : [];
}

export async function deleteTrainingLog(id) {
  const res = await fetch(`${API_BASE}/training-logs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    throw new Error(json?.error || json?.message || "Failed to delete training log");
  }

  return res.json();
}

export async function updateTrainingLog(id, data) {
  const res = await fetch(`${API_BASE}/training-logs/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Failed to update training log");
  }

  return json ?? {};
}
