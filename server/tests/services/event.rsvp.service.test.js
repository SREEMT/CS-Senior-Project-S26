import { describe, it, expect, beforeEach, mock } from "bun:test";

describe("Event service - RSVPs", () => {
  beforeEach(async () => {
    mock.restore();
    mock.module("../../src/models/eventRsvp.model.js", () => ({
      RSVP_STATUSES: ["Yes", "Maybe", "No"],
      getRsvpForUser: async () => null,
      upsertRsvp: async ({ eventId, userId, status }) => ({
        id: "rsvp-1",
        eventId,
        userId,
        status,
        updatedAt: new Date().toISOString(),
      }),
      listRsvpsForEvent: async (eventId) => [
        {
          id: "rsvp-1",
          eventId,
          status: "Yes",
          updatedAt: "2026-01-01T10:05:00.000Z",
          user: { id: "u1", name: "Alice" },
        },
      ],
      deleteRsvpsByEventId: async () => ({ deletedCount: 0 }),
    }));

    mock.module("../../src/models/eventNote.model.js", () => ({
      getNoteForUser: async () => null,
      upsertNote: async () => ({ id: "note-1", note: "" }),
      deleteNotesByEventId: async () => ({ deletedCount: 0 }),
    }));

    mock.module("../../src/models/event.model.js", () => ({
      createEvent: async () => ({}),
      updateEvent: async () => ({}),
      deleteEventById: async () => ({}),
      findEventById: async () => ({}),
      findEventsInRange: async () => [],
    }));
  });

  it("saves RSVP when status is valid (upsert behavior)", async () => {
    const mod = await import("../../src/services/event.service.js");
    const { saveUserRsvpForEvent } = mod;

    const saved = await saveUserRsvpForEvent("user-1", "event-1", "Maybe");
    expect(saved.status).toBe("Maybe");
    expect(saved.userId).toBe("user-1");
    expect(saved.eventId).toBe("event-1");
  });

  it("rejects invalid RSVP status", async () => {
    const mod = await import("../../src/services/event.service.js");
    const { saveUserRsvpForEvent } = mod;

    await expect(saveUserRsvpForEvent("user-1", "event-1", "Later")).rejects.toThrow(
      "Invalid RSVP status"
    );
  });

  it("lists RSVPs for an event", async () => {
    const mod = await import("../../src/services/event.service.js");
    const { listEventRsvps } = mod;

    const list = await listEventRsvps("event-1");
    expect(Array.isArray(list)).toBe(true);
    expect(list[0].user.name).toBe("Alice");
    expect(list[0].status).toBe("Yes");
  });
});

