import {
  createTrainingLogController,
  getMyTrainingLogsController,
  deleteMyTrainingLogController,
} from "../controllers/trainingLog.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

export async function trainingLogRoutes(req) {
  const url = new URL(req.url);
  const { pathname } = url;

  if (req.method === "POST" && pathname === "/api/training-logs") {
    return await requireAuth(req, (r) => createTrainingLogController(r));
  }

  if (req.method === "GET" && pathname === "/api/training-logs") {
    return await requireAuth(req, (r) => getMyTrainingLogsController(r));
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/training-logs/")) {
    return await requireAuth(req, (r) =>
      deleteMyTrainingLogController(r, { params: { id: pathname.split("/").pop() } })
    );
  }

  return null;
}

