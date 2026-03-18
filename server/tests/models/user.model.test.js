// Testing for User model

import { describe, it, expect, beforeEach, mock } from "bun:test";

let createUser, findUserByUsername, findUserByEmail, updateUserModel, deleteUser;

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
        mock.restore();

        // Mock mongoose so the model module executes and counts toward coverage
        let store = [];

        const mkDoc = (obj) => {
            const _id = obj._id ?? `u-${store.length + 1}`;
            return {
                ...obj,
                _id: { toString: () => String(_id) },
                toObject: () => ({ ...obj, _id: { toString: () => String(_id) } }),
            };
        };

        const User = {
            create: async (doc) => {
                const created = mkDoc({ ...doc, _id: `u-${store.length + 1}` });
                store.push(created);
                return created;
            },
            findOne: async (query) => {
                if (query?.username) {
                    return store.find((u) => u.username === query.username) ?? null;
                }
                if (query?.email) {
                    return (
                        store.find((u) => u.email === query.email) ??
                        store.find((u) => String(u.email).toLowerCase() === query.email) ??
                        null
                    );
                }
                return null;
            },
            findById: (id) => ({
                select: () => store.find((u) => u._id.toString() === String(id)) ?? null,
            }),
            findByIdAndUpdate: (id, updates) => ({
                select: () => {
                    const idx = store.findIndex((u) => u._id.toString() === String(id));
                    if (idx === -1) return null;
                    const existing = store[idx];
                    const merged = mkDoc({
                        ...existing.toObject(),
                        ...updates,
                        _id: existing._id.toString(),
                    });
                    store[idx] = merged;
                    return merged;
                },
            }),
            findByIdAndDelete: async (id) => {
                const idx = store.findIndex((u) => u._id.toString() === String(id));
                if (idx === -1) return null;
                const [deleted] = store.splice(idx, 1);
                return deleted;
            },
            deleteMany: async () => {
                store = [];
            },
            find: () => ({
                select: () => ({
                    lean: async () => store.map((u) => u.toObject()),
                }),
            }),
        };

        mock.module("mongoose", () => ({
            default: {
                Schema: class Schema {
                    constructor(def, opts) {
                        this.def = def;
                        this.opts = opts;
                    }
                },
                model: () => User,
            },
        }));

        // Cache-bust
        const mod = await import(`../../src/models/user.model.js?test=${Date.now()}`);
        createUser = mod.createUser;
        findUserByUsername = mod.findUserByUsername;
        findUserByEmail = mod.findUserByEmail;
        updateUserModel = mod.updateUserModel;
        deleteUser = mod.deleteUser;
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
