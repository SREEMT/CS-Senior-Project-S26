// Unit Tests for service logic for users

import { describe, it, expect, beforeEach, mock } from "bun:test";

// Use plain functions for Bun's mock.module (no Jest-style mock.fn)
mock.module("../../src/models/user.model.js", () => ({
    findUserByUsername: () => null,
    findUserByEmail: () => null,
    createUser: (user) => ({ id: "1", ...user }),
    updateUserModel: (id, data) => ({ id, ...data }),
    findUserById: () => null,
    deleteUser: () => true,
    clearUsers: () => {}
}));

// import services dynamically in beforeEach so tests can re-mock model per-test
let registerUser, updateUser;
import { password } from "bun";

// creating test user variables
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

describe("User service - registration & update", () => {
    beforeEach(async () => {
        mock.restore();
        // re-register default model mock and re-import service to pick up mocks
        mock.module("../../src/models/user.model.js", () => ({
            findUserByUsername: () => null,
            findUserByEmail: () => null,
            createUser: (user) => ({ id: "1", ...user }),
            updateUserModel: (id, data) => ({ id, ...data }),
            findUserById: () => null,
            deleteUser: () => true,
            clearUsers: () => {}
        }));
        const mod = await import("../../src/services/user.service.js");
        registerUser = mod.registerUser;
        updateUser = mod.updateUser;
    });

    // ----- REGISTRATION TESTS ------
    it("Creates user account when all requirement fields are valid", async () => {
        const user = await registerUser(validUser);
        expect(user.id).toBeDefined();
        expect(user.username).toBe("test");
    });

    it("Fails if there is any missing field", async () => {
        const { email, ...missingEmail } = validUser;

        await expect(registerUser(missingEmail))
            .rejects
            .toThrow("Missing required fields")
    });

    it("Fails if username exists already", async () => {
        // re-mock model so username appears to exist
        mock.restore();
        mock.module("../../src/models/user.model.js", () => ({
            findUserByUsername: () => ({ id: "existing-user" }),
            findUserByEmail: () => null,
            createUser: (user) => ({ id: "1", ...user }),
            updateUserModel: (id, data) => ({ id, ...data }),
            findUserById: () => null
        }));
        const mod = await import("../../src/services/user.service.js");
        registerUser = mod.registerUser;

        await expect(registerUser(validUser))
            .rejects
            .toThrow("Username already taken");
    });

    it("Fails if email already exists", async () => {
        mock.restore();
        mock.module("../../src/models/user.model.js", () => ({
            findUserByUsername: () => null,
            findUserByEamil: () => ({ id: "existing-user" }),
            createUser: (user) => ({ id: "1", ...user }),
            updateUserModel: (id, data) => ({ id, ...data }),
            findUserById: () => null
        }));
        const mod = await import("../../src/services/user.service.js");
        registerUser = mod.registerUser;

        await expect(registerUser(validUser))
            .rejects
            .toThrow("Email already registered");
    });


    // ----- UPDATE TESTS -----
    it("updates user info when valid fields are provided", async ()=> {
        const updated = await updateUser("1", {
            address: "456 New St",
            phone: "555-111-2222"
        });
        
        expect(updated.address).toBe("456 New St");
        expect(updated.phone).toBe("555-111-2222");
    });

    it("fails to update if update data is empty", async () => {
        await expect(updateUser("1", {}))
            .rejects
            .toThrow("No valid fields to update");
    });

    it("Fails if updating email to one that already exists", async () => {
        // Users are not allowed to update email; expect the service to reject
        await expect(updateUser("1", { email: "taken@test.com" }))
            .rejects
            .toThrow("No valid fields to update");
    });

    it("Fails if updating username to one that already exists", async () => {
        // Users are not allowed to update username; expect the service to reject
        await expect(updateUser("1", { username: "taken" }))
            .rejects
            .toThrow("No valid fields to update");
    })

})