import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("search.routes - searchRoutes", () => {
  const loadSearchRoutes = () =>
    import("../../src/routes/search.routes.js?search-routes-test");

  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("uses requireAuth and delegates GET /search to searchController", async () => {
    let authCalled = false;
    let controllerCalled = false;

    mock.module("../../src/middleware/auth.middleware.js", () => ({
      requireAuth: async (req, next) => {
        authCalled = true;
        req.user = { id: "user-1", role: "user" };
        return next(req);
      },
    }));

    mock.module("../../src/controllers/search.controller.js", () => ({
      searchController: async () => {
        controllerCalled = true;
        return new Response(JSON.stringify({ results: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    }));

    const { searchRoutes } = await loadSearchRoutes();

    const req = new Request("http://localhost/search?q=test", { method: "GET" });
    const res = await searchRoutes(req);

    expect(authCalled).toBe(true);
    expect(controllerCalled).toBe(true);
    expect(res.status).toBe(200);
  });

  it("returns null for non-matching path/method", async () => {
    const { searchRoutes } = await loadSearchRoutes();

    const req = new Request("http://localhost/api/search", { method: "POST" });
    const res = await searchRoutes(req);

    expect(res).toBeNull();
  });
});
