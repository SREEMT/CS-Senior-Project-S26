import {
    createLogController,
    getEventLogsController,
    updateLogController,
    deleteLogController
} from "../controllers/commLog.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

export async function commLogRoutes(req) {
    const url = new URL(req.url);

    // Create new comm log
    if (req.method === "POST" && url.pathname === "/api/communications") {
        return await requireAuth(req, (r) => createLogController(r));
    }

    // Get logs
    if (req.method === "GET" && url.pathname === "/api/communications") {
        return await requireAuth(req, (r) => getEventLogsController(r));
    }

    // Delete log
    if (req.method === "DELETE" && url.pathname.startsWith("/api/communications/")) {
        const id = url.pathname.split("/").pop();

        return await requireAuth(req, (r) =>
            deleteLogController(r, { params: { id } })
        );
    }

    // Update log
    if (req.method === "PUT" && url.pathname.startsWith("/api/communications/")) {
        const id = url.pathname.split("/").pop();

        return await requireAuth(req, (r) =>
            updateLogController(r, { params: { id } })
        );
    }

    return null;
}
