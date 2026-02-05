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