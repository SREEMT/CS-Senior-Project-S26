// Route for login and registration

import { loginController } from "../controllers/auth.controller.js";
import { registerController } from "../controllers/user.controller.js";

export async function authRoutes(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
        return await loginController(req);
    }

    if (req.method === "POST" && url.pathname === "/api/auth/register") {
        return await registerController(req);
    }

    return null;
}