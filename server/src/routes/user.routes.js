// Holds API endpoints for the User feature

// Import methods to create or login
import {
    registerController,
    updateController,
    getUserController
} from "../controllers/user.controller.js";

// User routes for registering and login user
export async function userRoutes(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/users") {
        return registerController(req);
    }

    
    if (req.method === "GET" && url.pathname.startsWith("/api/users")) {
        const id = url.pathname.split("/").pop();
        return await getUserController(req, {params: { id } });
    }

    if (req.method === "PUT" && url.pathname.startsWith("/api/users")) {
        const id = url.pathname.split("/").pop();
        return await updateController(req, { params: { id } });
    }
    
    return null;
}