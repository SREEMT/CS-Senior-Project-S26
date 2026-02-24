// User controller layer
// Manages HTTP requests
// Methods: registerController, updateController, getUserController

import {
    registerUser,
    updateUser,
    getUserById,
    getAllUsers,
    deleteUserById,
} from "../services/user.service.js";

// POST /api/users
// Creates new user (registration)
export async function registerController(req) {
    try {
        const body = await req.json();
        const user = await registerUser(body);

        return new Response(JSON.stringify(user), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message, message: err.message }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}

// PUT /api/users/:id
// Update user profile based on ID (Will have middleware for security)
export async function updateController(req, { params }) {
    try {
        const body = await req.json();
        const updatedUser = await updateUser(params.id, body);

        return new Response(JSON.stringify(updatedUser), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            {status: 400 }
        );
    }
}

// GET /api/users/me (requires auth)
export async function getMeController(req) {
    const user = req.user;
    return new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

//GET /api/users/:id
//Get user by ID
export async function getUserController(req, { params }) {
    try {
        const user = await getUserById(params.id);

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 404 }
        );
    }
}

// GET /api/admin/users – list all users (admin only)
export async function getAllUsersController(req) {
    try {
        const users = await getAllUsers();
        return new Response(JSON.stringify(users), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// DELETE /api/admin/users/:id – delete user (admin only)
export async function deleteUserController(req, { params }) {
    try {
        const result = await deleteUserById(params.id);
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        const status = err.message === "User not found" ? 404 : 500;
        return new Response(
            JSON.stringify({ error: err.message }),
            { status, headers: { "Content-Type": "application/json" } }
        );
    }
}