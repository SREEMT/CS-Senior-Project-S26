import { describe, it, expect, mock, beforeEach } from "bun:test";

// We will mock user model, password utils, and JWT utils so that
// the auth service can be tested in isolation.

describe("Auth service - login", () => {
  beforeEach(async () => {
    mock.restore();

    //user exists, password matches, JWT signing returns token
    mock.module("../../src/models/user.model.js", () => {
      return {
        findUserByEmail: async (email) => ({
          id: "user-1",
          email,
          password: "hashed-password",
        }),
      };
    });

    mock.module("../../src/utils/password.js", () => {
      return {
        comparePassword: async (plain, hashed) =>
          plain === "correct-password" && hashed === "hashed-password",
      };
    });

    mock.module("../../src/utils/jwt.js", () => {
      return {
        __esModule: true,
        signJWT: (payload) => `signed-token-for-${payload.userId}`,
        verifyJWT: () => ({}),
      };
    });
  });

  it("returns a token when credentials are valid", async () => {
    const mod = await import("../../src/services/auth.service.js");
    const { login } = mod;

    const token = await login("test@example.com", "correct-password");
    expect(token).toBe("signed-token-for-user-1");
  });

  it("throws when user is not found", async () => {
    mock.restore();

    mock.module("../../src/models/user.model.js", () => {
      return {
        findUserByEmail: async () => null,
      };
    });

    mock.module("../../src/utils/password.js", () => {
      return {
        comparePassword: async () => false,
      };
    });

    mock.module("../../src/utils/jwt.js", () => {
      return {
        __esModule: true,
        signJWT: () => "should-not-be-called",
        verifyJWT: () => ({}),
      };
    });

    const mod = await import("../../src/services/auth.service.js");
    const { login } = mod;

    await expect(login("missing@example.com", "any")).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("throws when password does not match", async () => {
    mock.restore();

    mock.module("../../src/models/user.model.js", () => {
      return {
        findUserByEmail: async (email) => ({
          id: "user-1",
          email,
          password: "hashed-password",
        }),
      };
    });

    mock.module("../../src/utils/password.js", () => {
      return {
        comparePassword: async () => false,
      };
    });

    mock.module("../../src/utils/jwt.js", () => {
      return {
        __esModule: true,
        signJWT: () => "should-not-be-called",
        verifyJWT: () => ({}),
      };
    });

    const mod = await import("../../src/services/auth.service.js");
    const { login } = mod;

    await expect(login("test@example.com", "wrong-password")).rejects.toThrow(
      "Invalid credentials",
    );
  });
});

