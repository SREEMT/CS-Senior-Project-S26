import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import {
  listEventsController,
  createEventController,
  updateEventController,
  deleteEventController,
  getMyNoteController,
  saveMyNoteController,
  getMyRsvpController,
  saveMyRsvpController,
  listRsvpsController,
} from "../controllers/event.controller.js";

export async function eventRoutes(req) {
  const url = new URL(req.url);
  const { pathname } = url;

  // Public: list all events
  if (req.method === "GET" && pathname === "/api/events") {
    return listEventsController(req);
  }

  // Admin-only: create event
  if (req.method === "POST" && pathname === "/api/events") {
    return await requireAuth(req, (r) => requireAdmin(r, (r2) => createEventController(r2)));
  }

  // Admin-only: update/delete event
  if (pathname.startsWith("/api/events/")) {
    const parts = pathname.split("/").filter(Boolean);
    const id = parts[2];
    const tail = parts.slice(3);

    // Notes for current user: /api/events/:id/note
    if (tail.length === 1 && tail[0] === "note") {
      if (req.method === "GET") {
        return await requireAuth(req, (r) => getMyNoteController(r, { params: { id } }));
      }
      if (req.method === "PUT") {
        return await requireAuth(req, (r) => saveMyNoteController(r, { params: { id } }));
      }
      return null;
    }

    // RSVP for current user
    if (tail.length === 1 && tail[0] === "rsvp") {
      if (req.method === "GET") {
        return await requireAuth(req, (r) => getMyRsvpController(r, { params: { id } }));
      }
      if (req.method === "PUT") {
        return await requireAuth(req, (r) => saveMyRsvpController(r, { params: { id } }));
      }
      return null;
    }

    // RSVPs for event
    if (tail.length === 1 && tail[0] === "rsvps") {
      if (req.method === "GET") {
        return await requireAuth(req, (r) => listRsvpsController(r, { params: { id } }));
      }
      return null;
    }

    if (!id) return null;

    if (req.method === "PUT") {
      return await requireAuth(req, (r) =>
        requireAdmin(r, (r2) => updateEventController(r2, { params: { id } }))
      );
    }

    if (req.method === "DELETE") {
      return await requireAuth(req, (r) =>
        requireAdmin(r, (r2) => deleteEventController(r2, { params: { id } }))
      );
    }
  }

  return null;
}

