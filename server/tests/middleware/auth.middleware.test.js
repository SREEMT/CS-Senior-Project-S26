import { describe, it, expect, mock, beforeEach } from "bun:test";

describe("auth.middleware - requireAuth", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("returns 401 when Authorization header is missing", async () => {
    mock.module("../../src/utils/jwt.js", () => ({
      verifyJWT: () => ({}),
    }));
    mock.module("../../src/models/user.model.js", () => ({
      findUserById: async () => null,
    }));

    const mod = await import("../../src/middleware/auth.middleware.js");
    const { requireAuth } = mod;

    const req = new Request("http://localhost/protected", {
      method: "GET",
    });

    const res = await requireAuth(req, () => {
      throw new Error("next should not be called");
    });

    expect(res.status).toBe(401);
  });

  it("attaches user and calls next when token and user are valid", async () => {
    mock.module("../../src/utils/jwt.js", () => ({
      verifyJWT: () => ({ userId: "user-1" }),
    }));

    mock.module("../../src/models/user.model.js", () => ({
      findUserById: async (id) => ({ id, role: "user" }),
    }));

    const mod = await import("../../src/middleware/auth.middleware.js");
    const { requireAuth } = mod;

    const req = new Request("http://localhost/protected", {
      method: "GET",
      headers: {
        authorization: "Bearer test-token",
      },
    });

    let nextCalled = false;
    const res = await requireAuth(req, (r) => {
      nextCalled = true;
      expect(r.user).toBeDefined();
      expect(r.user.role).toBe("user");
      return new Response("ok", { status: 200 });
    });

    expect(nextCalled).toBe(true);
    expect(res.status).toBe(200);
  });

  it("returns 401 when verifyJWT or user lookup fails", async () => {
    mock.module("../../src/utils/jwt.js", () => ({
      verifyJWT: () => {
        throw new Error("bad token");
      },
    }));

    mock.module("../../src/models/user.model.js", () => ({
      findUserById: async () => null,
    }));

    const mod = await import("../../src/middleware/auth.middleware.js");
    const { requireAuth } = mod;

    const req = new Request("http://localhost/protected", {
      method: "GET",
      headers: {
        authorization: "Bearer invalid",
      },
    });

    const res = await requireAuth(req, () => {
      throw new Error("next should not be called");
    });

    expect(res.status).toBe(401);
  });
});

describe("auth.middleware - requireAdmin", () => {
  it("returns 403 when user is not admin", () => {
    const req = {
      user: { id: "user-1", role: "user" },
    };

    // dynamic import inside test to keep isolation
    return import("../../src/middleware/auth.middleware.js").then(
      ({ requireAdmin }) => {
        const res = requireAdmin(req, () => {
          throw new Error("next should not be called");
        });
        expect(res.status).toBe(403);
      },
    );
  });

  it("calls next when user is admin", async () => {
    const req = {
      user: { id: "admin-1", role: "admin" },
    };

    const { requireAdmin } = await import(
      "../../src/middleware/auth.middleware.js"
    );

    let nextCalled = false;
    const res = requireAdmin(req, (r) => {
      nextCalled = true;
      expect(r.user.role).toBe("admin");
      return new Response("admin-ok", { status: 200 });
    });

    expect(nextCalled).toBe(true);
    expect(res.status).toBe(200);
  });
});

