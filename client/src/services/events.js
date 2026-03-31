import { getToken } from "./auth";

const API_BASE = "/api";

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`, {
    method: "GET",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load events");
  }
  return res.json();
}

export async function createEvent(event) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create event");
  }
  return res.json();
}

export async function updateEvent(eventId, updates) {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update event");
  }
  return res.json();
}

export async function deleteEvent(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete event");
  }
  return res.json();
}

export async function getMyNote(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/note`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load note");
  }
  return res.json();
}

export async function saveMyNote(eventId, note) {
  const res = await fetch(`${API_BASE}/events/${eventId}/note`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ note }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save note");
  }
  return res.json();
}

export async function getMyRsvp(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load RSVP");
  }
  return res.json();
}

export async function saveMyRsvp(eventId, status) {
  const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save RSVP");
  }
  return res.json();
}

export async function listRsvps(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/rsvps`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load RSVPs");
  }
  return res.json();
}

