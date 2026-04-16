import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

function buildUserModelMock(findUserByEmailImpl) {
  return {
    findUserByEmail: findUserByEmailImpl,
    findUserById: async () => null,
    findUserByUsername: async () => null,
    createUser: async () => null,
    updateUserModel: async () => null,
    deleteUser: async () => null,
    findAllUsers: async () => [],
    clearUsers: async () => {},
  };
}

describe("Auth service - login", () => {
  const loadAuthService = () =>
    import("../../src/services/auth.service.js?auth-service-test");

  beforeEach(() => {
    mock.restore();

    mock.module("../../src/models/user.model.js", () =>
      buildUserModelMock(async (email) => ({
        id: "user-1",
        email,
        password: "hashed-password",
      })),
    );

    mock.module("../../src/utils/password.js", () => ({
      comparePassword: async (plain, hashed) =>
        plain === "correct-password" && hashed === "hashed-password",
    }));

    mock.module("../../src/utils/jwt.js", () => ({
      __esModule: true,
      signJWT: (payload) => `signed-token-for-${payload.userId}`,
      verifyJWT: () => ({}),
    }));
  });

  afterEach(() => {
    mock.restore();
  });

  it("returns a token when credentials are valid", async () => {
    const { login } = await loadAuthService();
    const token = await login("test@example.com", "correct-password");
    expect(token).toBe("signed-token-for-user-1");
  });

  it("throws when user is not found", async () => {
    mock.restore();

    mock.module("../../src/models/user.model.js", () =>
      buildUserModelMock(async () => null),
    );
    mock.module("../../src/utils/password.js", () => ({
      comparePassword: async () => false,
    }));
    mock.module("../../src/utils/jwt.js", () => ({
      __esModule: true,
      signJWT: () => "should-not-be-called",
      verifyJWT: () => ({}),
    }));

    const { login } = await loadAuthService();
    await expect(login("missing@example.com", "any")).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("throws when password does not match", async () => {
    mock.restore();

    mock.module("../../src/models/user.model.js", () =>
      buildUserModelMock(async (email) => ({
        id: "user-1",
        email,
        password: "hashed-password",
      })),
    );
    mock.module("../../src/utils/password.js", () => ({
      comparePassword: async () => false,
    }));
    mock.module("../../src/utils/jwt.js", () => ({
      __esModule: true,
      signJWT: () => "should-not-be-called",
      verifyJWT: () => ({}),
    }));

    const { login } = await loadAuthService();
    await expect(login("test@example.com", "wrong-password")).rejects.toThrow(
      "Invalid credentials",
    );
  });
});
