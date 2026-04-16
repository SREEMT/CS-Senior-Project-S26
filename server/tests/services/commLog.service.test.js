import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("commLog.service - update ownership", () => {
  const loadService = () =>
    import("../../src/services/commLog.service.js?comm-log-service-test");

  let calls;

  beforeEach(() => {
    mock.restore();
    calls = {
      updateArgs: null,
    };

    mock.module("../../src/models/commLog.model.js", () => ({
      createCommLog: async () => ({ id: "comm-1" }),
      findLogs: async () => [],
      findLogById: async (id) => ({
        id,
        userId: "owner-1",
        title: "Initial",
        body: "Body",
      }),
      updateCommLogById: async (id, updates) => {
        calls.updateArgs = { id, updates };
        return { id, ...updates };
      },
      deleteCommLog: async () => ({}),
    }));
  });

  afterEach(() => {
    mock.restore();
  });

  it("rejects update when user is missing", async () => {
    const { updateComm } = await loadService();
    await expect(updateComm(null, "comm-1", { title: "T" })).rejects.toThrow("Unauthorized");
  });

  it("rejects update when log is not found", async () => {
    mock.restore();
    mock.module("../../src/models/commLog.model.js", () => ({
      createCommLog: async () => ({}),
      findLogs: async () => [],
      findLogById: async () => null,
      updateCommLogById: async () => ({}),
      deleteCommLog: async () => ({}),
    }));

    const { updateComm } = await loadService();
    await expect(updateComm({ _id: "owner-1" }, "missing", { title: "T" })).rejects.toThrow(
      "Log not found",
    );
  });

  it("rejects update when user does not own the log", async () => {
    const { updateComm } = await loadService();
    await expect(updateComm({ _id: "other-user" }, "comm-1", { title: "T" })).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("validates payload and trims updated fields", async () => {
    const { updateComm } = await loadService();

    await expect(updateComm({ _id: "owner-1" }, "comm-1", {})).rejects.toThrow(
      "No fields to update",
    );
    await expect(updateComm({ _id: "owner-1" }, "comm-1", { title: "   " })).rejects.toThrow(
      "Title is required",
    );
    await expect(updateComm({ _id: "owner-1" }, "comm-1", { body: "   " })).rejects.toThrow(
      "Body is required",
    );

    const updated = await updateComm({ _id: "owner-1" }, "comm-1", {
      title: "  Updated title ",
      body: "  Updated body ",
      priority: " high ",
    });

    expect(updated.id).toBe("comm-1");
    expect(calls.updateArgs).toEqual({
      id: "comm-1",
      updates: {
        title: "Updated title",
        body: "Updated body",
        priority: "high",
      },
    });
  });
});
