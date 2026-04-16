import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("commLog.routes - update route", () => {
  const loadRoutes = () =>
    import("../../src/routes/commLog.routes.js?comm-log-routes-test");

  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("uses requireAuth and delegates PUT /api/communications/:id", async () => {
    let authCalled = false;
    let receivedId = null;

    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (req, next) => {
        authCalled = true;
        req.user = { _id: "user-1" };
        return next(req);
      },
    }));

    mock.module("../../src/controllers/commLog.controller.js", () => ({
      createLogController: async () => new Response("created", { status: 201 }),
      getEventLogsController: async () => new Response("ok", { status: 200 }),
      updateLogController: async (_req, { params }) => {
        receivedId = params.id;
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
      deleteLogController: async () => new Response("deleted", { status: 200 }),
    }));

    const { commLogRoutes } = await loadRoutes();
    const req = new Request("http://localhost/api/communications/comm-9", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });

    const res = await commLogRoutes(req);
    expect(authCalled).toBe(true);
    expect(receivedId).toBe("comm-9");
    expect(res.status).toBe(200);
  });
});
