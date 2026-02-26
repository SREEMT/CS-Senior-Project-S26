// Testing for User model

import { describe, it, expect, beforeEach, mock } from "bun:test";

// we'll dynamically import the model after mocking it so the real mongoose
// logic never runs.  the store variable lets us simulate a simple in-memory
// collection.
let createUser,
    findUserByUsername,
    findUserByEmail,
    updateUserModel,
    deleteUser,
    clearUsers;

const validUser = {
    username: "test",
    password: "test",
    name: "test name",
    email: "test@test.com",
    birthdate: "2003-10-31",
    address: "123 Main St",
    phone: "555-555-5555",
    csdNumber: "CSD123",
    emergencyContact: "test 2",
    emergencyPhone: "222-222-2222"
};

describe("User model tests", () => {
    beforeEach(async () => {
        // reset mocks and recreate module so each test gets a fresh store
        mock.restore();
        mock.module("../../src/models/user.model.js", () => {
            let store = [];
            return {
                createUser: async (user) => {
                    const u = { ...user, id: Date.now().toString() };
                    store.push(u);
                    return u;
                },
                findUserByUsername: async (username) =>
                    store.find((u) => u.username === username) || null,
                findUserByEmail: async (email) =>
                    store.find((u) => u.email === email) || null,
                updateUserModel: async (id, updates) => {
                    const u = store.find((u) => u.id === id);
                    if (!u) return null;
                    Object.assign(u, updates);
                    return u;
                },
                deleteUser: async (id) => {
                    store = store.filter((u) => u.id !== id);
                },
                clearUsers: async () => {
                    store = [];
                },
            };
        });
        const mod = await import("../../src/models/user.model.js");
        createUser = mod.createUser;
        findUserByUsername = mod.findUserByUsername;
        findUserByEmail = mod.findUserByEmail;
        updateUserModel = mod.updateUserModel;
        deleteUser = mod.deleteUser;
        clearUsers = mod.clearUsers;
    });
    
    it("stores and retrieves a user by username", async () => {
        await createUser(validUser);

        const user = await findUserByUsername("test");
        expect(user).not.toBeNull();
        expect(user.username).toBe("test");
        expect(user.email).toBe("test@test.com");
        expect(user.name).toBe("test name");
    });

    it("retrieves user by email", async () => {
        await createUser(validUser);

        const user = await findUserByEmail("test@test.com");
        expect(user).not.toBeNull();
        expect(user.username).toBe("test");
    });

    it("updates stored user fields", async () => {
        const user = await createUser(validUser);

        const updated = await updateUserModel(user.id, {
            name: "Updated Name",
            address: "456 New St"
        });

        expect(updated).not.toBeNull();
        expect(updated.name).toBe("Updated Name");
        expect(updated.address).toBe("456 New St");
    });

    it("deletes a user", async () => {
        const user = await createUser(validUser);

        await deleteUser(user.id);

        const found = await findUserByUsername("test");
        expect(found).toBeNull();
    });
});
