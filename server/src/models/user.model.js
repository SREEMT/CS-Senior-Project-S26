// Model layer for user feature
// Handles data retrieval and access
// Methods: createUser, findUserByUsername, findUserByEamil, findUserById, updateUser, deleteUser, clearUsers

// Creates random ID for user
import { randomUUID } from "crypto";

const users = new Map();

//creates user
export function createUser(data) {
    const id = randomUUID();

    const user = {
        id,
        ...data
    };
    users.set(id, user);
    return user;
}

export function updateUser(id, updates) {
    const user = users.get(id);
    if (!user) return null;

    const updated = {
        ...user,
        ...updates
    };
    users.set(id, updated);
    return updated;
}