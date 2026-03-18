// Tests the controller layer for user

import { describe, it, expect, beforeEach } from "bun:test";

let registerController, updateController, getMeController;

describe("User controller tests", () => {
    beforeEach(async () => {
        // Each test re-imports
        const mod = await import("../../src/controllers/user.controller.js");
        registerController = mod.registerController;
        updateController = mod.updateController;
        getMeController = mod.getMeController;
    });

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

    it("returns 201 when user is succesfully created", async () => {
        const req = new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validUser)
        });

        const res = await registerController(req);
        
        expect(res).toBeDefined();
        expect(typeof res.status).toBe("number");
    });

    it("Returns 400 when server error occurs", async () => {
        const req = new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });

        const res = await registerController(req);
        
        expect(res.status).toBe(400);
        expect(res.headers.get("Content-Type")).toBe("application/json");
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
        
        expect(res).toBeDefined();
        expect(typeof res.status).toBe("number");
    });

    it("Returns 400 when update body is invalid JSON", async () => {
        // req.json() will throw if body isn't valid JSON
        const req = new Request("http://localhost/api/users/1", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: "{",
        });

        const res = await updateController(req, { params: { id: "1" } });
        expect(res.status).toBe(400);
    });

    it("Returns 200 and current user for getMeController", async () => {
        const req = new Request("http://localhost/api/users/me", { method: "GET" });
        req.user = { id: "user-1", role: "user" };

        const res = await getMeController(req);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ id: "user-1", role: "user" });
    });
});
