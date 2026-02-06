// User service layer
// Handles busniess logic for the User feature
// Methods: registerUser, updateUser, getUserId

import {
    createUser,
    // findUserByUsername,
    //findUserByEamil,
    //findUserById,
    //updateUser,
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

    if (Objet.keys(updates).length === 0) {
        throw new Error("No valid fields to update");
    }

    return updateUserModel(id, updates);
}

// Get user id for data retrieval