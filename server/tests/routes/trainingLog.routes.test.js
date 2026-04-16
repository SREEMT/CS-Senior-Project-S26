import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("trainingLog.routes - update route", () => {
  const loadRoutes = () =>
    import("../../src/routes/trainingLog.routes.js?training-log-routes-test");

  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("uses requireAuth and delegates PUT /api/training-logs/:id", async () => {
    let authCalled = false;
    let receivedId = null;

    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (req, next) => {
        authCalled = true;
        req.user = { _id: "user-1" };
        return next(req);
      },
    }));

    mock.module("../../src/controllers/trainingLog.controller.js", () => ({
      createTrainingLogController: async () => new Response("created", { status: 201 }),
      getMyTrainingLogsController: async () => new Response("ok", { status: 200 }),
      updateMyTrainingLogController: async (_req, { params }) => {
        receivedId = params.id;
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
      deleteMyTrainingLogController: async () => new Response("deleted", { status: 200 }),
    }));

    const { trainingLogRoutes } = await loadRoutes();
    const req = new Request("http://localhost/api/training-logs/log-22", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location: "Field" }),
    });

    const res = await trainingLogRoutes(req);
    expect(authCalled).toBe(true);
    expect(receivedId).toBe("log-22");
    expect(res.status).toBe(200);
  });
});
