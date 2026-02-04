// Unit Tests for service logic for users

import { describe, it, expect, beforeEach, mock } from "bun:test";

// Mock model for testing
mock.module("../../src/models/user.model.js", () => ({
    findUserByUsername: mock.fn(),
    findUserByEamil: mock.fn(),
    createUser: mock.fn((user) => ({ id: "1", ...user })),
    updateUser: mock.fn((id, data) => ({ id, ...data }))
}));

//importing necessary methods for testing user creation and updating
import {
    registerUser,
    updateUser
} from "../../src/services/user.service.js";
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
    beforeEach(() => {
        mock.restore();
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
            .toThrow("Missing required field")
    });

    it("Fails if username exists already", async () => {
        const { findUserByUsername } =
            await import("../../src/models/user.model.js");

        findUserByUsername.mockReturnValueOnce({ id: "existing-user" });

        await expect(registerUser(validUser))
            .rejects
            .toThrow("Username already taken");
    });

    it("Fails if email already exists", async () => {
        const { findUserByEamil } =
            await import("../../src/models/user.model.js");
        
            findUserByEamil.mockReturnValueOnce({ id: "existing-user" });

            await expect(registeruser(validUser))
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
            .toThrow("No fields provided for update");
    });

    it("Fails if updating email to one that already exists", async () => {
        const { findUserByEamil } =
            await import("../../src/models/user.models.js");
        
        findUserByEamil.mockReturnValueOnce({ id: "another-user" });

        await expect(updateUser("1", { email: "taken@test.com" }))
            .rejects
            .toThrow("Email already registered");
    });

    it("Fails if updating username to one that already exists", async () => {
        const { findUserByUsername } =
            await import("../../src/models/user.model.js");

        findUserByUsername.mockReturnValueOnce({ id: "another-user" });

        await expect(updateUser("1", { username: "taken" }))
            .rejects
            .toThrow("Username already taken");
    })

})