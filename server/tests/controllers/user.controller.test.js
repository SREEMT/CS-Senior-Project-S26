// Tests the controller layer for user

import { describe, it, expect, mock } from "bun:test";

mock.module("../../src/services/user.service.js", () => ({
    registerUser: async (data) => ({
        id: "1",
        ...data
    }),
    updateUser: async (id, data) => ({
        id,
        ...data
    })
}));

import {
    registerController,
    updateController
} from "../../src/controllers/user.controller.js"

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

describe("User controller tests", () => {
    it("returns 201 when user is succesfully created", async () => {
        const req = new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validUser)
        });

        const res = await registerController(req);
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(body.username).toBe("test");
        expect(body.email).toBe("test@test.com");
    });

    it("Returns 400 when service throws an error", async () => {
        const { registerUser } =
            await import("../../src/services/user.service.js");
        
        registerUser.mockImplementationOnce(() => {
            throw new Error("Missing required fields");
        });

        const req = new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });

        try {
            await registerController(req);
        } catch (err) {
            expect(err.message).toBe("Missing required fields");
        }
    });

    it("Returns 200 when a user info is updated", async () => {
        const req = new Request("http://localhost/api/users/1", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address: "456 New St",
                phone: "111-111-1111"
            })
        });

        const res = await updateController(req, { params: {id: "1" } });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.address).toBe("456 New St");
        expect(body.phone).toBe("111-111-1111");
    });
});