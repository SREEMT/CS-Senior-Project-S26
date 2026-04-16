import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("trainingLog.service - update ownership", () => {
  const loadService = () =>
    import("../../src/services/trainingLog.service.js?training-log-service-test");

  let calls;

  beforeEach(() => {
    mock.restore();
    calls = {
      findByIdArgs: [],
      updateArgs: null,
    };

    mock.module("../../src/models/trainingLog.model.js", () => ({
      createTrainingLog: async () => ({ id: "log-1" }),
      findMyTrainingLogs: async () => [],
      findTrainingLogById: async (id) => {
        calls.findByIdArgs.push(id);
        return { id, userId: "owner-1" };
      },
      updateTrainingLogById: async (id, updates) => {
        calls.updateArgs = { id, updates };
        return { id, ...updates };
      },
      deleteTrainingLogById: async () => ({}),
    }));
  });

  afterEach(() => {
    mock.restore();
  });

  it("rejects update when user is missing", async () => {
    const { updateMyTrainingLog } = await loadService();

    await expect(updateMyTrainingLog(null, "log-1", { location: "Field" })).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("rejects update when log is not found", async () => {
    mock.restore();
    mock.module("../../src/models/trainingLog.model.js", () => ({
      createTrainingLog: async () => ({}),
      findMyTrainingLogs: async () => [],
      findTrainingLogById: async () => null,
      updateTrainingLogById: async () => ({}),
      deleteTrainingLogById: async () => ({}),
    }));

    const { updateMyTrainingLog } = await loadService();
    await expect(
      updateMyTrainingLog({ _id: "owner-1" }, "missing-log", { location: "Field" }),
    ).rejects.toThrow("Training log not found");
  });

  it("rejects update when user does not own the log", async () => {
    const { updateMyTrainingLog } = await loadService();

    await expect(
      updateMyTrainingLog({ _id: "other-user" }, "log-1", { location: "Field" }),
    ).rejects.toThrow("Unauthorized");
  });

  it("validates payload and trims updated fields", async () => {
    const { updateMyTrainingLog } = await loadService();

    await expect(
      updateMyTrainingLog({ _id: "owner-1" }, "log-1", {}),
    ).rejects.toThrow("No fields to update");

    await expect(
      updateMyTrainingLog({ _id: "owner-1" }, "log-1", { location: "   " }),
    ).rejects.toThrow("Location is required");

    const updated = await updateMyTrainingLog({ _id: "owner-1" }, "log-1", {
      date: " 2026-05-01 ",
      location: "  Training Field ",
      time: " 08:00 ",
      startTime: " 08:00 ",
      stopTime: " 09:00 ",
      dogId: "dog-1",
      eventId: null,
    });

    expect(updated.id).toBe("log-1");
    expect(calls.updateArgs).toEqual({
      id: "log-1",
      updates: {
        date: "2026-05-01",
        location: "Training Field",
        time: "08:00",
        startTime: "08:00",
        stopTime: "09:00",
        dogId: "dog-1",
        eventId: null,
      },
    });
  });
});
