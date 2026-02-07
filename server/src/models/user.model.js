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

// update user model information
export function updateUserModel(id, updates) {
    const user = users.get(id);
    if (!user) return null;

    const updated = {
        ...user,
        ...updates
    };
    users.set(id, updated);
    return updated;
}

// find a user by their id
export function findUserById(id) {
    return users.get(id) || null;
}

//find user by username
export function findUserByUsername(username) {
    for (const user of users.values()) {
        if (user.username === username) {
            return user;
        }
    }
    return null;
}

//find a user by their email
export function findUserByEmail(email) {
    for (const user of users.values()) {
        if (user.email === email) {
            return user;
        }
    }
    return null;
}

// delete user by id
export function deleteUser(id) {
    return users.delete(id);
}

// Clears users for tests only
export function clearUsers() {
    users.clear();
}