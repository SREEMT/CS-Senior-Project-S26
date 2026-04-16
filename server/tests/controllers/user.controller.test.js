import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

let registerController;
let updateController;
let getMeController;
let getUserController;
let getAllUsersController;
let deleteUserController;
let attachDogToUserController;

const state = {
  failGetAllUsers: false,
  failDelete: null,
  failAttachDog: null,
};

const loadController = () => import("../../src/controllers/user.controller.js");

describe("User controller tests", () => {
  beforeEach(async () => {
    mock.restore();
    state.failGetAllUsers = false;
    state.failDelete = null;
    state.failAttachDog = null;

    mock.module("../../src/services/user.service.js", () => ({
      registerUser: async (body) => {
        if (!body?.email) throw new Error("Missing required field: email");
        return { id: "u1", ...body };
      },
      updateUser: async (id, body) => {
        if (id === "bad-update") throw new Error("Bad update");
        return { id, ...body };
      },
      getUserById: async (id) => {
        if (id === "missing") throw new Error("User not found");
        return { id, name: "User A" };
      },
      getAllUsers: async () => {
        if (state.failGetAllUsers) throw new Error("List failed");
        return [{ id: "u1", name: "User A" }, { id: "u2", name: "User B" }];
      },
      deleteUserById: async (id) => {
        if (state.failDelete) throw new Error(state.failDelete);
        return { deleted: true, id };
      },
    }));

    mock.module("../../src/services/dog.service.js", () => ({
      getAllDogsLean: async () => [
        { id: "d1", ownerId: "u1", name: "Dog1" },
        { id: "d2", ownerId: null, name: "Dog2" },
      ],
      assignDogToOwner: async (dogId, userId) => {
        if (state.failAttachDog) throw new Error(state.failAttachDog);
        return { id: dogId, ownerId: userId };
      },
    }));

    const mod = await loadController();
    registerController = mod.registerController;
    updateController = mod.updateController;
    getMeController = mod.getMeController;
    getUserController = mod.getUserController;
    getAllUsersController = mod.getAllUsersController;
    deleteUserController = mod.deleteUserController;
    attachDogToUserController = mod.attachDogToUserController;
  });

  afterEach(() => {
    mock.restore();
  });

  it("returns 201 when user is successfully created", async () => {
    const req = new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "test",
        password: "test",
        name: "test name",
        email: "test@test.com",
      }),
    });

    const res = await registerController(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 when register payload fails validation", async () => {
    const req = new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await registerController(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 when user info is updated", async () => {
    const req = new Request("http://localhost/api/users/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: "456 New St" }),
    });

    const res = await updateController(req, { params: { id: "1" } });
    expect(res.status).toBe(200);
  });

  it("returns 400 when update body is invalid JSON", async () => {
    const req = new Request("http://localhost/api/users/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });

    const res = await updateController(req, { params: { id: "1" } });
    expect(res.status).toBe(400);
  });

  it("returns 200 and current user for getMeController", async () => {
    const req = new Request("http://localhost/api/users/me", { method: "GET" });
    req.user = { id: "user-1", role: "user" };

    const res = await getMeController(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "user-1", role: "user" });
  });

  it("returns user by id or 404 when not found", async () => {
    const ok = await getUserController(new Request("http://localhost/api/users/u1"), {
      params: { id: "u1" },
    });
    expect(ok.status).toBe(200);

    const missing = await getUserController(
      new Request("http://localhost/api/users/missing"),
      { params: { id: "missing" } },
    );
    expect(missing.status).toBe(404);
  });

  it("returns combined user/dog payload and handles list failure", async () => {
    const ok = await getAllUsersController(
      new Request("http://localhost/api/admin/users"),
    );
    const body = await ok.json();
    expect(ok.status).toBe(200);
    expect(body.users.length).toBe(2);
    expect(body.users[0].dogs.length).toBe(1);
    expect(body.standaloneDogs.length).toBe(1);

    state.failGetAllUsers = true;
    const bad = await getAllUsersController(
      new Request("http://localhost/api/admin/users"),
    );
    expect(bad.status).toBe(500);
  });

  it("deleteUserController maps status for success, not found, and generic errors", async () => {
    const ok = await deleteUserController(
      new Request("http://localhost/api/admin/users/u1"),
      { params: { id: "u1" } },
    );
    expect(ok.status).toBe(200);

    state.failDelete = "User not found";
    const notFound = await deleteUserController(
      new Request("http://localhost/api/admin/users/missing"),
      { params: { id: "missing" } },
    );
    expect(notFound.status).toBe(404);

    state.failDelete = "DB offline";
    const err = await deleteUserController(
      new Request("http://localhost/api/admin/users/oops"),
      { params: { id: "oops" } },
    );
    expect(err.status).toBe(500);
  });

  it("attachDogToUserController maps statuses for user/dog errors and success", async () => {
    const ok = await attachDogToUserController(
      new Request("http://localhost/api/admin/users/u1/dogs/d1"),
      { params: { userId: "u1", dogId: "d1" } },
    );
    expect(ok.status).toBe(200);

    const userMissing = await attachDogToUserController(
      new Request("http://localhost/api/admin/users/missing/dogs/d1"),
      { params: { userId: "missing", dogId: "d1" } },
    );
    expect(userMissing.status).toBe(404);

    state.failAttachDog = "Dog not found";
    const dogMissing = await attachDogToUserController(
      new Request("http://localhost/api/admin/users/u1/dogs/bad"),
      { params: { userId: "u1", dogId: "bad" } },
    );
    expect(dogMissing.status).toBe(404);

    state.failAttachDog = "Unexpected";
    const err = await attachDogToUserController(
      new Request("http://localhost/api/admin/users/u1/dogs/bad2"),
      { params: { userId: "u1", dogId: "bad2" } },
    );
    expect(err.status).toBe(500);
  });
});
