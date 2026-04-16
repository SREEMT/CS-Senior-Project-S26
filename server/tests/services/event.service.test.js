import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("Event service - admin/event/note flows", () => {
  const loadService = () =>
    import("../../src/services/event.service.js?event-service-test");

  let calls;

  beforeEach(() => {
    mock.restore();
    calls = {
      createEventPayload: null,
      updateEventArgs: null,
      deleteEventId: null,
      noteDeleteId: null,
      rsvpDeleteId: null,
      upsertNotePayload: null,
      getNoteArgs: null,
      getRsvpArgs: null,
      upsertRsvpPayload: null,
      listRsvpsEventId: null,
      listRange: null,
      findEventId: null,
    };

    mock.module("../../src/models/event.model.js", () => ({
      createEvent: async (payload) => {
        calls.createEventPayload = payload;
        return { id: "event-1", ...payload };
      },
      updateEvent: async (id, updates) => {
        calls.updateEventArgs = { id, updates };
        return { id, ...updates };
      },
      deleteEventById: async (id) => {
        calls.deleteEventId = id;
        return { deleted: true, id };
      },
      findEventById: async (id) => {
        calls.findEventId = id;
        return { id, title: "Existing Event" };
      },
      findEventsInRange: async (start, end) => {
        calls.listRange = { start, end };
        return [{ id: "event-1", start, end }];
      },
    }));

    mock.module("../../src/models/eventNote.model.js", () => ({
      getNoteForUser: async (eventId, userId) => {
        calls.getNoteArgs = { eventId, userId };
        return { id: "note-1", eventId, userId, note: "Keep distance" };
      },
      upsertNote: async (payload) => {
        calls.upsertNotePayload = payload;
        return { id: "note-1", ...payload };
      },
      deleteNotesByEventId: async (id) => {
        calls.noteDeleteId = id;
        return { deletedCount: 1 };
      },
    }));

    mock.module("../../src/models/eventRsvp.model.js", () => ({
      RSVP_STATUSES: ["Yes", "Maybe", "No"],
      getRsvpForUser: async (eventId, userId) => {
        calls.getRsvpArgs = { eventId, userId };
        return { eventId, userId, status: "Yes" };
      },
      upsertRsvp: async (payload) => {
        calls.upsertRsvpPayload = payload;
        return { id: "rsvp-1", ...payload };
      },
      listRsvpsForEvent: async (eventId) => {
        calls.listRsvpsEventId = eventId;
        return [{ id: "r1", eventId, status: "Yes" }];
      },
      deleteRsvpsByEventId: async (id) => {
        calls.rsvpDeleteId = id;
        return { deletedCount: 1 };
      },
    }));
  });

  afterEach(() => {
    mock.restore();
  });

  it("listEvents converts date params and delegates to model", async () => {
    const { listEvents } = await loadService();

    const list = await listEvents({
      start: "2026-05-01T10:00:00.000Z",
      end: "2026-05-02T10:00:00.000Z",
    });

    expect(Array.isArray(list)).toBe(true);
    expect(calls.listRange.start instanceof Date).toBe(true);
    expect(calls.listRange.end instanceof Date).toBe(true);
  });

  it("listEvents sends null range bounds when filters are omitted", async () => {
    const { listEvents } = await loadService();

    await listEvents({});

    expect(calls.listRange).toEqual({ start: null, end: null });
  });

  it("createEventForAdmin validates admin and payload rules", async () => {
    const { createEventForAdmin } = await loadService();

    await expect(
      createEventForAdmin({ id: "u1", role: "user" }, {}),
    ).rejects.toThrow("Admin access required");

    await expect(
      createEventForAdmin({ id: "a1", role: "admin" }, { title: "x" }),
    ).rejects.toThrow("Missing required fields");

    await expect(
      createEventForAdmin(
        { id: "a1", role: "admin" },
        { title: "x", startTime: "bad", endTime: "also-bad" },
      ),
    ).rejects.toThrow("Invalid date format");

    await expect(
      createEventForAdmin(
        { id: "a1", role: "admin" },
        {
          title: "x",
          startTime: "2026-05-02T10:00:00.000Z",
          endTime: "2026-05-01T10:00:00.000Z",
        },
      ),
    ).rejects.toThrow("End time must be after start time");

    const created = await createEventForAdmin(
      { id: "a1", role: "admin" },
      {
        title: "  K9 Drill ",
        description: " desc ",
        location: "  123 Main St ",
        startTime: "2026-05-01T10:00:00.000Z",
        endTime: "2026-05-01T11:00:00.000Z",
      },
    );

    expect(created.id).toBe("event-1");
    expect(calls.createEventPayload.title).toBe("K9 Drill");
    expect(calls.createEventPayload.description).toBe("desc");
    expect(calls.createEventPayload.location).toBe("123 Main St");
    expect(calls.createEventPayload.createdBy).toBe("a1");
  });

  it("createEventForAdmin defaults optional fields to empty strings", async () => {
    const { createEventForAdmin } = await loadService();

    const created = await createEventForAdmin(
      { id: "a1", role: "admin" },
      {
        title: "  Briefing  ",
        startTime: "2026-05-03T10:00:00.000Z",
        endTime: "2026-05-03T11:00:00.000Z",
      },
    );

    expect(created.id).toBe("event-1");
    expect(calls.createEventPayload.title).toBe("Briefing");
    expect(calls.createEventPayload.description).toBe("");
    expect(calls.createEventPayload.location).toBe("");
  });

  it("updateEventForAdmin validates access, existence, time fields, and trims updates", async () => {
    const { updateEventForAdmin } = await loadService();

    await expect(
      updateEventForAdmin({ id: "u1", role: "user" }, "event-1", {}),
    ).rejects.toThrow("Admin access required");

    mock.restore();
    mock.module("../../src/models/event.model.js", () => ({
      createEvent: async () => ({}),
      updateEvent: async () => ({}),
      deleteEventById: async () => ({}),
      findEventById: async () => null,
      findEventsInRange: async () => [],
    }));
    mock.module("../../src/models/eventNote.model.js", () => ({
      getNoteForUser: async () => null,
      upsertNote: async () => ({}),
      deleteNotesByEventId: async () => ({}),
    }));
    mock.module("../../src/models/eventRsvp.model.js", () => ({
      RSVP_STATUSES: ["Yes", "Maybe", "No"],
      getRsvpForUser: async () => null,
      upsertRsvp: async () => ({}),
      listRsvpsForEvent: async () => [],
      deleteRsvpsByEventId: async () => ({}),
    }));

    const missingMod = await loadService();
    await expect(
      missingMod.updateEventForAdmin({ id: "a1", role: "admin" }, "event-1", {}),
    ).rejects.toThrow("Event not found");

    // Re-mock happy-path model for validation branches.
    mock.restore();
    calls = { ...calls, updateEventArgs: null };
    mock.module("../../src/models/event.model.js", () => ({
      createEvent: async () => ({}),
      updateEvent: async (id, updates) => {
        calls.updateEventArgs = { id, updates };
        return { id, ...updates };
      },
      deleteEventById: async () => ({}),
      findEventById: async () => ({ id: "event-1" }),
      findEventsInRange: async () => [],
    }));
    mock.module("../../src/models/eventNote.model.js", () => ({
      getNoteForUser: async () => null,
      upsertNote: async () => ({}),
      deleteNotesByEventId: async () => ({}),
    }));
    mock.module("../../src/models/eventRsvp.model.js", () => ({
      RSVP_STATUSES: ["Yes", "Maybe", "No"],
      getRsvpForUser: async () => null,
      upsertRsvp: async () => ({}),
      listRsvpsForEvent: async () => [],
      deleteRsvpsByEventId: async () => ({}),
    }));

    const { updateEventForAdmin: update } = await loadService();

    await expect(
      update({ id: "a1", role: "admin" }, "event-1", { startTime: "bad" }),
    ).rejects.toThrow("Invalid start time");

    await expect(
      update({ id: "a1", role: "admin" }, "event-1", { endTime: "bad" }),
    ).rejects.toThrow("Invalid end time");

    await expect(
      update(
        { id: "a1", role: "admin" },
        "event-1",
        {
          startTime: "2026-05-02T10:00:00.000Z",
          endTime: "2026-05-01T10:00:00.000Z",
        },
      ),
    ).rejects.toThrow("End time must be after start time");

    const updated = await update(
      { id: "a1", role: "admin" },
      "event-1",
      {
        title: "  New Title ",
        description: "  details ",
        location: null,
        startTime: "2026-05-01T08:00:00.000Z",
        endTime: "2026-05-01T09:00:00.000Z",
      },
    );

    expect(updated.id).toBe("event-1");
    expect(calls.updateEventArgs.updates.title).toBe("New Title");
    expect(calls.updateEventArgs.updates.description).toBe("details");
    expect(calls.updateEventArgs.updates.location).toBe("");
    expect(calls.updateEventArgs.updates.startTime instanceof Date).toBe(true);
  });

  it("updateEventForAdmin supports partial location updates", async () => {
    const { updateEventForAdmin } = await loadService();

    const updated = await updateEventForAdmin(
      { id: "a1", role: "admin" },
      "event-1",
      { location: "  Training Yard  " },
    );

    expect(updated.id).toBe("event-1");
    expect(calls.findEventId).toBe("event-1");
    expect(calls.updateEventArgs).toEqual({
      id: "event-1",
      updates: { location: "Training Yard" },
    });
  });

  it("deleteEventAdmin validates admin, handles missing event, and deletes related docs", async () => {
    const { deleteEventAdmin } = await loadService();

    await expect(deleteEventAdmin({ role: "user" }, "event-1")).rejects.toThrow(
      "Admin access required",
    );

    // Missing delete result branch.
    mock.restore();
    mock.module("../../src/models/event.model.js", () => ({
      createEvent: async () => ({}),
      updateEvent: async () => ({}),
      deleteEventById: async () => null,
      findEventById: async () => ({}),
      findEventsInRange: async () => [],
    }));
    mock.module("../../src/models/eventNote.model.js", () => ({
      getNoteForUser: async () => null,
      upsertNote: async () => ({}),
      deleteNotesByEventId: async () => ({}),
    }));
    mock.module("../../src/models/eventRsvp.model.js", () => ({
      RSVP_STATUSES: ["Yes", "Maybe", "No"],
      getRsvpForUser: async () => null,
      upsertRsvp: async () => ({}),
      listRsvpsForEvent: async () => [],
      deleteRsvpsByEventId: async () => ({}),
    }));

    const missingMod = await loadService();
    await expect(
      missingMod.deleteEventAdmin({ id: "a1", role: "admin" }, "event-1"),
    ).rejects.toThrow("Event not found");

    // Success branch.
    mock.restore();
    calls = { ...calls, noteDeleteId: null, rsvpDeleteId: null, deleteEventId: null };
    mock.module("../../src/models/event.model.js", () => ({
      createEvent: async () => ({}),
      updateEvent: async () => ({}),
      deleteEventById: async (id) => {
        calls.deleteEventId = id;
        return { deleted: true, id };
      },
      findEventById: async () => ({}),
      findEventsInRange: async () => [],
    }));
    mock.module("../../src/models/eventNote.model.js", () => ({
      getNoteForUser: async () => null,
      upsertNote: async () => ({}),
      deleteNotesByEventId: async (id) => {
        calls.noteDeleteId = id;
        return { deletedCount: 1 };
      },
    }));
    mock.module("../../src/models/eventRsvp.model.js", () => ({
      RSVP_STATUSES: ["Yes", "Maybe", "No"],
      getRsvpForUser: async () => null,
      upsertRsvp: async () => ({}),
      listRsvpsForEvent: async () => [],
      deleteRsvpsByEventId: async (id) => {
        calls.rsvpDeleteId = id;
        return { deletedCount: 1 };
      },
    }));

    const successMod = await loadService();
    const deleted = await successMod.deleteEventAdmin(
      { id: "a1", role: "admin" },
      "event-55",
    );

    expect(deleted.deleted).toBe(true);
    expect(calls.noteDeleteId).toBe("event-55");
    expect(calls.rsvpDeleteId).toBe("event-55");
    expect(calls.deleteEventId).toBe("event-55");
  });

  it("deleteEventAdmin runs note and RSVP cleanup before missing-event error", async () => {
    const deleteOrder = [];

    mock.restore();
    mock.module("../../src/models/event.model.js", () => ({
      createEvent: async () => ({}),
      updateEvent: async () => ({}),
      deleteEventById: async (id) => {
        deleteOrder.push(`event:${id}`);
        return null;
      },
      findEventById: async () => ({}),
      findEventsInRange: async () => [],
    }));
    mock.module("../../src/models/eventNote.model.js", () => ({
      getNoteForUser: async () => null,
      upsertNote: async () => ({}),
      deleteNotesByEventId: async (id) => {
        deleteOrder.push(`note:${id}`);
        return { deletedCount: 1 };
      },
    }));
    mock.module("../../src/models/eventRsvp.model.js", () => ({
      RSVP_STATUSES: ["Yes", "Maybe", "No"],
      getRsvpForUser: async () => null,
      upsertRsvp: async () => ({}),
      listRsvpsForEvent: async () => [],
      deleteRsvpsByEventId: async (id) => {
        deleteOrder.push(`rsvp:${id}`);
        return { deletedCount: 1 };
      },
    }));

    const mod = await loadService();
    await expect(mod.deleteEventAdmin({ id: "a1", role: "admin" }, "event-9")).rejects.toThrow(
      "Event not found",
    );
    expect(deleteOrder).toEqual(["note:event-9", "rsvp:event-9", "event:event-9"]);
  });

  it("covers note and RSVP helper validations/flows", async () => {
    const {
      getUserNoteForEvent,
      saveUserNoteForEvent,
      getUserRsvpForEvent,
      saveUserRsvpForEvent,
      listEventRsvps,
    } = await loadService();

    await expect(getUserNoteForEvent("", "event-1")).rejects.toThrow("User required");
    await expect(getUserNoteForEvent("user-1", "")).rejects.toThrow("Event ID required");
    const note = await getUserNoteForEvent("user-1", "event-1");
    expect(note.note).toBe("Keep distance");
    expect(calls.getNoteArgs).toEqual({ eventId: "event-1", userId: "user-1" });

    await expect(saveUserNoteForEvent("", "event-1", "x")).rejects.toThrow("User required");
    await expect(saveUserNoteForEvent("user-1", "", "x")).rejects.toThrow("Event ID required");
    const savedNote = await saveUserNoteForEvent("user-1", "event-1");
    expect(savedNote.note).toBe("");
    expect(calls.upsertNotePayload).toEqual({
      userId: "user-1",
      eventId: "event-1",
      note: "",
    });

    await expect(getUserRsvpForEvent("", "event-1")).rejects.toThrow("User required");
    await expect(getUserRsvpForEvent("user-1", "")).rejects.toThrow("Event ID required");
    const rsvp = await getUserRsvpForEvent("user-1", "event-1");
    expect(rsvp.status).toBe("Yes");
    expect(calls.getRsvpArgs).toEqual({ eventId: "event-1", userId: "user-1" });

    await expect(saveUserRsvpForEvent("", "event-1", "Yes")).rejects.toThrow("User required");
    await expect(saveUserRsvpForEvent("user-1", "", "Yes")).rejects.toThrow("Event ID required");
    await expect(saveUserRsvpForEvent("user-1", "event-1", "Later")).rejects.toThrow(
      "Invalid RSVP status",
    );
    const savedRsvp = await saveUserRsvpForEvent("user-1", "event-1", "Maybe");
    expect(savedRsvp.status).toBe("Maybe");
    expect(calls.upsertRsvpPayload).toEqual({
      userId: "user-1",
      eventId: "event-1",
      status: "Maybe",
    });

    await expect(listEventRsvps("")).rejects.toThrow("Event ID required");
    const list = await listEventRsvps("event-1");
    expect(Array.isArray(list)).toBe(true);
    expect(calls.listRsvpsEventId).toBe("event-1");
  });

  it("saveUserNoteForEvent keeps the provided note text", async () => {
    const { saveUserNoteForEvent } = await loadService();

    await saveUserNoteForEvent("user-1", "event-1", "  Bring K9 vest  ");

    expect(calls.upsertNotePayload).toEqual({
      userId: "user-1",
      eventId: "event-1",
      note: "  Bring K9 vest  ",
    });
  });
});
