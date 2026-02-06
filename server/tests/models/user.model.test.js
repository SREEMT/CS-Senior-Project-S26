// TEsting for User model

import { describe, it, expect, beforeEach, } from "bun:test";

import {
    createUser,
    findUserByUsername,
    findUserByEamil,
    updateUser,
    deleteUser,
    clearUsers
} from "../../src/models/user.model.js"

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
    beforeEach(() => {
        clearUsers();
    });
    
    it("stores and retrieves a user by username", () => {
        createUser(validUser);

        const user = findUserByUsername("test");
        expect(user.username).toBe("test");
        expect(user.email).toBe("test@test.com");
        expect(user.name).toBe("test name");
    });

    it("retrieves user by email", () => {
        createUser(validUser);

        const user = findUserByEamil("test@test.com");
        expect(user.username).toBe("test");
    });

    it("updates stored user fields", () => {
        const user = createUser(validUser);

        const updated = updateUser(user.id, {
            name: "Updated Name",
            address: "456 New St"
        });

        expect(updated.name).toBe("Updated Name");
        expect(updated.address).toBe("456 New St");
    });

    it("deletes a user", () => {
        const user = createUser(validUser);

        deleteUser(user.id);

        const found = findUserByUsername("test");
        expect(found).toBeNull();
    });
});
