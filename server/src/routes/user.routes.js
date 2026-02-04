// Holds API endpoints for the User feature

// Import methods to create or login
import {
    registerController,
    loginController
} from "../controllers/user.controller.js";

// User routes for registering and login user
export function userRoutes(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/users/register") {
        return registerController(req);
    }

    if (req.method === "POST" && url.pathname === "/api/users/login") {
        return loginController(req);
    }

    return null;
}