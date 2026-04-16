import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("adminRoutes", () => {
  const loadAdminRoutes = () =>
    import("../../src/routes/admin.routes.js?admin-routes-test");

  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("returns 401 when not authenticated for list users", async () => {
    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async () =>
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      requireAdmin: (req, next) => next(req),
    }));

    const { adminRoutes } = await loadAdminRoutes();
    const req = new Request("http://localhost/api/admin/users", {
      method: "GET",
    });

    const res = await adminRoutes(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin for list users", async () => {
    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (_req, next) =>
        next({ user: { id: "user-1", role: "user" } }),
      requireAdmin: (req) =>
        new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
    }));

    const { adminRoutes } = await loadAdminRoutes();
    const req = new Request("http://localhost/api/admin/users", {
      method: "GET",
    });

    const res = await adminRoutes(req);
    expect(res.status).toBe(403);
  });

  it("calls controller when authenticated admin requests list users", async () => {
    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (_req, next) =>
        next({ user: { id: "admin-1", role: "admin" } }),
      requireAdmin: (req, next) => next(req),
    }));

    mock.module("../../src/controllers/user.controller.js", () => ({
      getAllUsersController: async () =>
        new Response(JSON.stringify([{ id: "1" }]), { status: 200 }),
      deleteUserController: async () =>
        new Response(JSON.stringify({ deleted: true }), { status: 200 }),
    }));

    const { adminRoutes } = await loadAdminRoutes();
    const req = new Request("http://localhost/api/admin/users", {
      method: "GET",
    });

    const res = await adminRoutes(req);
    expect(res.status).toBe(200);
  });

  it("returns 400 when DELETE /api/admin/users/ has no id", async () => {
    const { adminRoutes } = await loadAdminRoutes();

    const req = new Request("http://localhost/api/admin/users/", {
      method: "DELETE",
    });

    const res = await adminRoutes(req);
    expect(res.status).toBe(400);
  });

  it("calls deleteUserController for authenticated admin delete", async () => {
    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (_req, next) =>
        next({ user: { id: "admin-1", role: "admin" } }),
      requireAdmin: (req, next) => next(req),
    }));

    mock.module("../../src/controllers/user.controller.js", () => ({
      getAllUsersController: async () =>
        new Response(JSON.stringify([{ id: "1" }]), { status: 200 }),
      deleteUserController: async (_req, { params }) =>
        new Response(JSON.stringify({ deleted: true, id: params.id }), {
          status: 200,
        }),
    }));

    const { adminRoutes } = await loadAdminRoutes();
    const req = new Request("http://localhost/api/admin/users/123", {
      method: "DELETE",
    });

    const res = await adminRoutes(req);
    expect(res.status).toBe(200);
  });

  it("returns 401 when not authenticated for attaching a dog", async () => {
    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async () =>
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      requireAdmin: (req, next) => next(req),
    }));

    const { adminRoutes } = await loadAdminRoutes();
    const req = new Request("http://localhost/api/admin/users/u1/dogs/d1/attach", {
      method: "POST",
    });

    const res = await adminRoutes(req);
    expect(res.status).toBe(401);
  });

  it("calls attachDogToUserController for authenticated admin attach", async () => {
    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (_req, next) =>
        next({ user: { id: "admin-1", role: "admin" } }),
      requireAdmin: (req, next) => next(req),
    }));

    mock.module("../../src/controllers/user.controller.js", () => ({
      getAllUsersController: async () =>
        new Response(JSON.stringify([{ id: "1" }]), { status: 200 }),
      deleteUserController: async () =>
        new Response(JSON.stringify({ deleted: true }), { status: 200 }),
      attachDogToUserController: async () =>
        new Response(JSON.stringify({ message: "Dog attached" }), { status: 200 }),
    }));

    const { adminRoutes } = await loadAdminRoutes();
    const req = new Request("http://localhost/api/admin/users/u1/dogs/d1/attach", {
      method: "POST",
    });

    const res = await adminRoutes(req);
    expect(res.status).toBe(200);
  });
});
