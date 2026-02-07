// User controller layer
// Manages HTTP requests
// Methods: registerController, updateController, getUserController

import {
    registerUser,
    updateUser,
    getUserById
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
            JSON.stringify({ error: err.message }),
            {status: 400 }
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