import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("User controller extra branches", () => {
  const loadController = () =>
    import("../../src/controllers/user.controller.js?user-controller-extra-test");

  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("getUserController returns 200 on success and 404 on service error", async () => {
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async (id) => ({ id, name: "User A" }),
      getAllUsers: async () => [],
      deleteUserById: async () => ({}),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => ({}),
    }));

    const { getUserController } = await loadController();
    const okRes = await getUserController(new Request("http://localhost/api/users/u1"), {
      params: { id: "u1" },
    });
    expect(okRes.status).toBe(200);
    expect((await okRes.json()).id).toBe("u1");

    mock.restore();
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => {
        throw new Error("User not found");
      },
      getAllUsers: async () => [],
      deleteUserById: async () => ({}),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => ({}),
    }));

    const { getUserController: getUserControllerErr } = await loadController();
    const errRes = await getUserControllerErr(
      new Request("http://localhost/api/users/missing"),
      { params: { id: "missing" } },
    );
    expect(errRes.status).toBe(404);
    expect((await errRes.json()).error).toBe("User not found");
  });

  it("getAllUsersController builds usersWithDogs + standaloneDogs and handles failures", async () => {
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => ({}),
      getAllUsers: async () => [{ id: "u1", name: "A" }, { id: "u2", name: "B" }],
      deleteUserById: async () => ({}),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [
        { id: "d1", ownerId: "u1", name: "Dog1" },
        { id: "d2", ownerId: null, name: "Dog2" },
      ],
      assignDogToOwner: async () => ({}),
    }));

    const { getAllUsersController } = await loadController();
    const res = await getAllUsersController(new Request("http://localhost/api/admin/users"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.users.length).toBe(2);
    expect(body.users[0].dogs.length).toBe(1);
    expect(body.standaloneDogs.length).toBe(1);

    mock.restore();
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => ({}),
      getAllUsers: async () => {
        throw new Error("boom");
      },
      deleteUserById: async () => ({}),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => ({}),
    }));

    const { getAllUsersController: getAllUsersControllerErr } = await loadController();
    const errRes = await getAllUsersControllerErr(
      new Request("http://localhost/api/admin/users"),
    );
    expect(errRes.status).toBe(500);
    expect((await errRes.json()).error).toBe("boom");
  });

  it("deleteUserController returns 200, 404 for missing user, and 500 for other errors", async () => {
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => ({}),
      getAllUsers: async () => [],
      deleteUserById: async (id) => ({ deleted: true, id }),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => ({}),
    }));

    const { deleteUserController } = await loadController();
    const okRes = await deleteUserController(new Request("http://localhost/api/admin/users/u1"), {
      params: { id: "u1" },
    });
    expect(okRes.status).toBe(200);

    mock.restore();
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => ({}),
      getAllUsers: async () => [],
      deleteUserById: async () => {
        throw new Error("User not found");
      },
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => ({}),
    }));

    const { deleteUserController: deleteNotFound } = await loadController();
    const nfRes = await deleteNotFound(new Request("http://localhost/api/admin/users/missing"), {
      params: { id: "missing" },
    });
    expect(nfRes.status).toBe(404);

    mock.restore();
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => ({}),
      getAllUsers: async () => [],
      deleteUserById: async () => {
        throw new Error("db down");
      },
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => ({}),
    }));

    const { deleteUserController: deleteErr } = await loadController();
    const errRes = await deleteErr(new Request("http://localhost/api/admin/users/u9"), {
      params: { id: "u9" },
    });
    expect(errRes.status).toBe(500);
  });

  it("attachDogToUserController returns 200 and maps expected error statuses", async () => {
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async (id) => ({ id }),
      getAllUsers: async () => [],
      deleteUserById: async () => ({}),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async (dogId, userId) => ({ id: dogId, ownerId: userId }),
    }));

    const { attachDogToUserController } = await loadController();
    const okRes = await attachDogToUserController(
      new Request("http://localhost/api/admin/users/u1/dogs/d1"),
      { params: { userId: "u1", dogId: "d1" } },
    );
    expect(okRes.status).toBe(200);
    expect((await okRes.json()).message).toBe("Dog attached");

    mock.restore();
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => {
        throw new Error("User not found");
      },
      getAllUsers: async () => [],
      deleteUserById: async () => ({}),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => ({}),
    }));
    const { attachDogToUserController: attachUserMissing } = await loadController();
    const userMissingRes = await attachUserMissing(
      new Request("http://localhost/api/admin/users/u404/dogs/d1"),
      { params: { userId: "u404", dogId: "d1" } },
    );
    expect(userMissingRes.status).toBe(404);

    mock.restore();
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => ({ id: "u1" }),
      getAllUsers: async () => [],
      deleteUserById: async () => ({}),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => {
        throw new Error("Dog not found");
      },
    }));
    const { attachDogToUserController: attachDogMissing } = await loadController();
    const dogMissingRes = await attachDogMissing(
      new Request("http://localhost/api/admin/users/u1/dogs/d404"),
      { params: { userId: "u1", dogId: "d404" } },
    );
    expect(dogMissingRes.status).toBe(404);

    mock.restore();
    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async () => ({}),
      updateUser: async () => ({}),
      getUserById: async () => ({ id: "u1" }),
      getAllUsers: async () => [],
      deleteUserById: async () => ({}),
    }));
    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [],
      assignDogToOwner: async () => {
        throw new Error("unexpected");
      },
    }));
    const { attachDogToUserController: attachUnexpected } = await loadController();
    const errRes = await attachUnexpected(
      new Request("http://localhost/api/admin/users/u1/dogs/d9"),
      { params: { userId: "u1", dogId: "d9" } },
    );
    expect(errRes.status).toBe(500);
  });
});
