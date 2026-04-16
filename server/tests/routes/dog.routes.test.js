import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("dogRoutes", () => {
  const loadDogRoutes = () =>
    import("../../src/routes/dog.routes.js?dog-routes-test");

  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("handles public dog registration", async () => {
    mock.module("../../src/controllers/dog.controller.js", () => ({
      registerDog: async () =>
        new Response(JSON.stringify({ message: "ok" }), { status: 201 }),
      createDog: async () =>
        new Response(JSON.stringify({ message: "created" }), { status: 201 }),
      getMyDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      getAllDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      deleteDog: async () =>
        new Response(JSON.stringify({ message: "deleted" }), { status: 200 }),
    }));

    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (req, next) =>
        next({ ...req, user: { id: "user-1", role: "user" } }),
      requireAdmin: (req, next) =>
        next({ ...req, user: { id: "admin-1", role: "admin" } }),
    }));

    const { dogRoutes } = await loadDogRoutes();

    const req = new Request("http://localhost/api/dogs/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bajo" }),
    });

    const res = await dogRoutes(req);
    expect(res.status).toBe(201);
  });

  it("requires auth for POST /api/dogs", async () => {
    let requireAuthCalled = false;

    mock.module("../../src/controllers/dog.controller.js", () => ({
      registerDog: async () =>
        new Response(JSON.stringify({ message: "ok" }), { status: 201 }),
      createDog: async () =>
        new Response(JSON.stringify({ message: "created" }), { status: 201 }),
      getMyDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      getAllDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      deleteDog: async () =>
        new Response(JSON.stringify({ message: "deleted" }), { status: 200 }),
    }));

    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (req, next) => {
        requireAuthCalled = true;
        return next({ ...req, user: { id: "user-1", role: "user" } });
      },
      requireAdmin: (req, next) =>
        next({ ...req, user: { id: "admin-1", role: "admin" } }),
    }));

    const { dogRoutes } = await loadDogRoutes();
    const req = new Request("http://localhost/api/dogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Dog" }),
    });

    const res = await dogRoutes(req);
    expect(requireAuthCalled).toBe(true);
    expect(res.status).toBe(201);
  });

  it("requires admin for GET /api/dogs", async () => {
    let requireAdminCalled = false;

    mock.module("../../src/controllers/dog.controller.js", () => ({
      registerDog: async () =>
        new Response(JSON.stringify({ message: "ok" }), { status: 201 }),
      createDog: async () =>
        new Response(JSON.stringify({ message: "created" }), { status: 201 }),
      getMyDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      getAllDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      deleteDog: async () =>
        new Response(JSON.stringify({ message: "deleted" }), { status: 200 }),
    }));

    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (req, next) =>
        next({ ...req, user: { id: "user-1", role: "user" } }),
      requireAdmin: (req, next) => {
        requireAdminCalled = true;
        return next({ ...req, user: { id: "admin-1", role: "admin" } });
      },
    }));

    const { dogRoutes } = await loadDogRoutes();
    const req = new Request("http://localhost/api/dogs", {
      method: "GET",
    });

    const res = await dogRoutes(req);
    expect(requireAdminCalled).toBe(true);
    expect(res.status).toBe(200);
  });

  it("requires auth for GET /api/dogs/mine", async () => {
    let requireAuthCalled = false;

    mock.module("../../src/controllers/dog.controller.js", () => ({
      registerDog: async () =>
        new Response(JSON.stringify({ message: "ok" }), { status: 201 }),
      createDog: async () =>
        new Response(JSON.stringify({ message: "created" }), { status: 201 }),
      getMyDogs: async () =>
        new Response(JSON.stringify({ data: [{ id: "dog-1" }] }), { status: 200 }),
      getAllDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      deleteDog: async () =>
        new Response(JSON.stringify({ message: "deleted" }), { status: 200 }),
    }));

    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (req, next) => {
        requireAuthCalled = true;
        return next({ ...req, user: { id: "user-1", role: "user" } });
      },
      requireAdmin: (req, next) =>
        next({ ...req, user: { id: "admin-1", role: "admin" } }),
    }));

    const { dogRoutes } = await loadDogRoutes();
    const req = new Request("http://localhost/api/dogs/mine", { method: "GET" });

    const res = await dogRoutes(req);
    expect(requireAuthCalled).toBe(true);
    expect(res.status).toBe(200);
  });

  it("handles DELETE /api/dogs/:id with auth + admin checks", async () => {
    let requireAuthCalled = false;
    let requireAdminCalled = false;

    mock.module("../../src/controllers/dog.controller.js", () => ({
      registerDog: async () =>
        new Response(JSON.stringify({ message: "ok" }), { status: 201 }),
      createDog: async () =>
        new Response(JSON.stringify({ message: "created" }), { status: 201 }),
      getMyDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      getAllDogs: async () =>
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      deleteDog: async (req) =>
        new Response(JSON.stringify({ message: "deleted", id: req.params?.id }), {
          status: 200,
        }),
    }));

    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (req, next) => {
        requireAuthCalled = true;
        return next({ ...req, user: { id: "user-1", role: "user" } });
      },
      requireAdmin: (req, next) => {
        requireAdminCalled = true;
        return next({ ...req, user: { id: "admin-1", role: "admin" } });
      },
    }));

    const { dogRoutes } = await loadDogRoutes();
    const req = new Request("http://localhost/api/dogs/dog-9", { method: "DELETE" });

    const res = await dogRoutes(req);
    const body = await res.json();
    expect(requireAuthCalled).toBe(true);
    expect(requireAdminCalled).toBe(true);
    expect(res.status).toBe(200);
    expect(body.id).toBe("dog-9");
  });

  it("returns null for DELETE /api/dogs/register special-case", async () => {
    const { dogRoutes } = await loadDogRoutes();
    const req = new Request("http://localhost/api/dogs/register", { method: "DELETE" });
    const res = await dogRoutes(req);
    expect(res).toBeNull();
  });

  it("returns null for unrelated routes", async () => {
    const { dogRoutes } = await loadDogRoutes();

    const req = new Request("http://localhost/other", {
      method: "GET",
    });

    const res = await dogRoutes(req);
    expect(res).toBeNull();
  });
});
