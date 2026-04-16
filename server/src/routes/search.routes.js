import { searchController } from "../controllers/search.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export async function searchRoutes(req) {
    const url = new URL(req.url);

    if (url.pathname === "/search" && req.method === "GET") {
        return await requireAuth(req, (r) => searchController(r));
    }

    return null;
}