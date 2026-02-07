// User service layer
// Handles busniess logic for the User feature
// Methods: registerUser, updateUser, getUserId

import {
    createUser,
    findUserByUsername,
    findUserByEmail,
    findUserById,
    updateUserModel,
    //deleteUser,
    //clearUsers
} from "../../src/models/user.model.js"

// Field requirements hardcoded into the service layer to prevent faulty input
const REQUIRED_FIELDS = [
  "username",
  "password",
  "name",
  "email",
  "birthdate",
  "address",
  "phone",
  "csdNumber",
  "emergencyContact",
  "emergencyPhone"
];

// creates new user by contacting the model layer
export async function registerUser(data) {
    for (const field of REQUIRED_FIELDS) {
        if (!data[field]) {
            throw new Error("Missing required fields");
        }
    }

    // Make sure user is unique
    // Implement once find user features are implemented
    if (findUserByUsername(data.username)) {
        throw new Error("Username already taken");
    }

    if (findUserByEmail(data.email)) {
        throw new Error("Email already registered");
    }

    //create user after checking if its unique
    return createUser(data)
}

// Update user information
export async function updateUser(id, data) {
    if (!id) {
        throw new Error("User ID is required");
    }

    const allowedFields = [
        "name",
        "address",
        "phone",
        "emergencyContact",
        "emergencyPhone"
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates[field] = data[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new Error("No valid fields to update");
    }

    return updateUserModel(id, updates);
}

// Get user id for data retrieval
export async function getUserByID(id) {
    const user = findUserById(id);

    if (!user)  {
        throw new Error("User not found");
    }

    return user;
}