import {
    createLogController,
    getEventLogsController,
    deleteLogController
} from "../controllers/commLog.controller.js";

import { requireAuth } from "../middleware/auth.middleware";

export async function commLogRoutes(req) {
    const url = new URL(req.url);

    // Create new comm log
    if (req.method === "POST" && url.pathname === "/api/communications") {
        return await requireAuth(req, (r) => createLogController(r));
    }

    // Get logs for viewing
    if (req.method === "GET" && url.pathname === "/api/communications") {
        return await requireAuth(req, (r) => getEventLogsController(r));
    }

    // Delete log if Admin
    // Add admin checking later -----------
    if (req.method === "DELETE" && url.pathname.startsWith("/api/communications")) {
        const id = url.pathname.split("/").pop();
        return await requireAuth(req, (r) =>
        deleteLogController(r, {params: { id } })
        );
    }
    return null;
}