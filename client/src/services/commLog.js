import { getToken } from "./auth.js";

const API_BASE = "/api"; // works with Vite proxy

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createCommunicationLog(data) {
  console.log("Sending log:", data);

  const res = await fetch(`/api/communications`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    let errMsg = "Failed to create log";

    try {
      const err = JSON.parse(text);
      errMsg = err.error || err.message || errMsg;
    } catch {
      if (text) errMsg = text;
    }

    throw new Error(errMsg);
  }

  return text ? JSON.parse(text) : {};
}

export async function getCommunicationLogs(eventId) {
  const url = eventId
    ? `${API_BASE}/communications?eventId=${encodeURIComponent(eventId)}`
    : `${API_BASE}/communications`;

  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    throw new Error("Failed to fetch logs");
  }

  return res.json();
}

export async function deleteCommunicationLog(id) {
  const res = await fetch(`${API_BASE}/communications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete log");
  }

  return res.json();
}