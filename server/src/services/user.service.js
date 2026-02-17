// User service layer
// Handles busniess logic for the User feature
// Methods: registerUser, updateUser, getUserId

import {
    createUser,
    findUserByUsername,
    findUserByEmail,
    findUserById,
    updateUserModel,
    deleteUser,
    clearUsers
} from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";

// Field requirements hardcoded into the service layer to prevent faulty input
const REQUIRED_FIELDS = [
  "username", "password", "name", "email",
  "birthdate", "address", "phone",
  "csdnumber", "emergencycontact", "emergencyphone",
];

// creates new user by contacting the model layer
export async function registerUser(data) {
    for (const field of REQUIRED_FIELDS) {
        const val = data[field];
        if (val == null || String(val).trim() === "") {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Make sure user is unique
    if (await findUserByUsername(data.username)) {
        throw new Error("Username already taken");
    }

    if (await findUserByEmail(data.email)) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await hashPassword(data.password);
    const userData = {
        ...data,
        password: hashedPassword,
        csdnumber: data.csdnumber ?? data.csdNumber,
        emergencycontact: data.emergencycontact ?? data.emergencyContact,
        emergencyphone: data.emergencyphone ?? data.emergencyPhone,
    };
    return createUser(userData);
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
export async function getUserById(id) {
    const user = await findUserById(id);

    if (!user)  {
        throw new Error("User not found");
    }

    return user;
}

