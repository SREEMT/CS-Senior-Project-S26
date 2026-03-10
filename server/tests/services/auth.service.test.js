import { describe, it, expect, mock, beforeEach } from "bun:test";

// We will mock user model, password utils, and JWT utils so that
// the auth service can be tested in isolation.

describe("Auth service - login", () => {
  beforeEach(async () => {
    mock.restore();

    // default mocks: user exists, password matches, JWT signing returns token
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
        signJWT: (payload) => `signed-token-for-${payload.userId}`,
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
        signJWT: () => "should-not-be-called",
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
        signJWT: () => "should-not-be-called",
      };
    });

    const mod = await import("../../src/services/auth.service.js");
    const { login } = mod;

    await expect(login("test@example.com", "wrong-password")).rejects.toThrow(
      "Invalid credentials",
    );
  });
});

