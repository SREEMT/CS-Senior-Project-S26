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