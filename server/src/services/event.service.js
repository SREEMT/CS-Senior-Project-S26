import {
  createEvent,
  updateEvent,
  deleteEventById,
  findEventById,
  findEventsInRange,
} from "../models/event.model.js";
import { getNoteForUser, upsertNote, deleteNotesByEventId } from "../models/eventNote.model.js";
import {
  RSVP_STATUSES,
  getRsvpForUser,
  upsertRsvp,
  listRsvpsForEvent,
  deleteRsvpsByEventId,
} from "../models/eventRsvp.model.js";

export async function listEvents({ start, end }) {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  return findEventsInRange(startDate, endDate);
}

export async function createEventForAdmin(user, payload) {
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
  if (!payload?.title || !payload?.startTime || !payload?.endTime) {
    throw new Error("Missing required fields");
  }

  const startTime = new Date(payload.startTime);
  const endTime = new Date(payload.endTime);
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new Error("Invalid date format");
  }
  if (endTime < startTime) {
    throw new Error("End time must be after start time");
  }

  return createEvent({
    title: String(payload.title).trim(),
    description: String(payload.description ?? "").trim(),
    location: String(payload.location ?? "").trim(),
    startTime,
    endTime,
    createdBy: user.id,
  });
}

export async function updateEventForAdmin(user, id, payload) {
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }

  const existing = await findEventById(id);
  if (!existing) {
    throw new Error("Event not found");
  }

  const updates = {};
  if (payload.title !== undefined) updates.title = String(payload.title).trim();
  if (payload.description !== undefined) {
    updates.description = String(payload.description).trim();
  }
  if (payload.startTime !== undefined) {
    const d = new Date(payload.startTime);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid start time");
    updates.startTime = d;
  }
  if (payload.endTime !== undefined) {
    const d = new Date(payload.endTime);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid end time");
    updates.endTime = d;
  }

  if (payload.location !== undefined) {
    updates.location = payload.location == null ? "" : String(payload.location).trim();
  }

  if (updates.startTime && updates.endTime && updates.endTime < updates.startTime) {
    throw new Error("End time must be after start time");
  }

  return updateEvent(id, updates);
}

export async function deleteEventAdmin(user, id) {
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
  await deleteNotesByEventId(id);
  await deleteRsvpsByEventId(id);
  const deleted = await deleteEventById(id);
  if (!deleted) {
    throw new Error("Event not found");
  }
  return deleted;
}

export async function getUserNoteForEvent(userId, eventId) {
  if (!userId) throw new Error("User required");
  if (!eventId) throw new Error("Event ID required");
  return getNoteForUser(eventId, userId);
}

export async function saveUserNoteForEvent(userId, eventId, note) {
  if (!userId) throw new Error("User required");
  if (!eventId) throw new Error("Event ID required");
  return upsertNote({ userId, eventId, note: note ?? "" });
}

export async function getUserRsvpForEvent(userId, eventId) {
  if (!userId) throw new Error("User required");
  if (!eventId) throw new Error("Event ID required");
  return getRsvpForUser(eventId, userId);
}

export async function saveUserRsvpForEvent(userId, eventId, status) {
  if (!userId) throw new Error("User required");
  if (!eventId) throw new Error("Event ID required");
  if (!RSVP_STATUSES.includes(status)) {
    throw new Error("Invalid RSVP status");
  }
  return upsertRsvp({ userId, eventId, status });
}

export async function listEventRsvps(eventId) {
  if (!eventId) throw new Error("Event ID required");
  return listRsvpsForEvent(eventId);
}

