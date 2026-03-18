import {
  listEvents,
  createEventForAdmin,
  updateEventForAdmin,
  deleteEventAdmin,
  getUserNoteForEvent,
  saveUserNoteForEvent,
  getUserRsvpForEvent,
  saveUserRsvpForEvent,
  listEventRsvps,
} from "../services/event.service.js";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function listEventsController(req) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start") ?? undefined;
  const end = url.searchParams.get("end") ?? undefined;
  const events = await listEvents({ start, end });
  return jsonResponse(events);
}

export async function createEventController(req) {
  try {
    const payload = await req.json();
    const event = await createEventForAdmin(req.user, payload);
    return jsonResponse(event, 201);
  } catch (err) {
    const message = err.message || "Failed to create event";
    const status = message === "Admin access required" ? 403 : 400;
    return jsonResponse({ error: message }, status);
  }
}

export async function updateEventController(req, { params }) {
  try {
    const payload = await req.json();
    const updated = await updateEventForAdmin(req.user, params.id, payload);
    return jsonResponse(updated);
  } catch (err) {
    const message = err.message || "Failed to update event";
    let status = 400;
    if (message === "Admin access required") status = 403;
    if (message === "Event not found") status = 404;
    return jsonResponse({ error: message }, status);
  }
}

export async function deleteEventController(req, { params }) {
  try {
    const deleted = await deleteEventAdmin(req.user, params.id);
    return jsonResponse(deleted);
  } catch (err) {
    const message = err.message || "Failed to delete event";
    let status = 400;
    if (message === "Admin access required") status = 403;
    if (message === "Event not found") status = 404;
    return jsonResponse({ error: message }, status);
  }
}

export async function getMyNoteController(req, { params }) {
  try {
    const note = await getUserNoteForEvent(req.user.id, params.id);
    return jsonResponse(note ?? { note: "" });
  } catch (err) {
    return jsonResponse({ error: err.message || "Failed to load note" }, 400);
  }
}

export async function saveMyNoteController(req, { params }) {
  try {
    const body = await req.json().catch(() => ({}));
    const noteText = body.note ?? "";
    const note = await saveUserNoteForEvent(req.user.id, params.id, noteText);
    return jsonResponse(note);
  } catch (err) {
    return jsonResponse({ error: err.message || "Failed to save note" }, 400);
  }
}

export async function getMyRsvpController(req, { params }) {
  try {
    const rsvp = await getUserRsvpForEvent(req.user.id, params.id);
    return jsonResponse(rsvp ?? { status: "" });
  } catch (err) {
    return jsonResponse({ error: err.message || "Failed to load RSVP" }, 400);
  }
}

export async function saveMyRsvpController(req, { params }) {
  try {
    const body = await req.json().catch(() => ({}));
    const status = body.status ?? "";
    const rsvp = await saveUserRsvpForEvent(req.user.id, params.id, status);
    return jsonResponse(rsvp);
  } catch (err) {
    return jsonResponse({ error: err.message || "Failed to save RSVP" }, 400);
  }
}

export async function listRsvpsController(req, { params }) {
  try {
    const rsvps = await listEventRsvps(params.id);
    return jsonResponse(rsvps);
  } catch (err) {
    return jsonResponse({ error: err.message || "Failed to load RSVPs" }, 400);
  }
}

