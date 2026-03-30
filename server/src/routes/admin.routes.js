// Admin-only routes: list users, delete user

import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import {
  getAllUsersController,
  deleteUserController,
  attachDogToUserController,
} from "../controllers/user.controller.js";

export async function adminRoutes(req) {
  const url = new URL(req.url);

  // GET /api/admin/users – list all users (admin only)
  if (req.method === "GET" && url.pathname === "/api/admin/users") {
    const authRes = await requireAuth(req, (r) => r);
    if (authRes instanceof Response) return authRes;
    const adminRes = requireAdmin(authRes, (r) => r);
    if (adminRes instanceof Response) return adminRes;
    return await getAllUsersController(req);
  }

  // DELETE /api/admin/users/:id (admin only)
  if (req.method === "DELETE" && url.pathname.startsWith("/api/admin/users/")) {
    const id = url.pathname.replace("/api/admin/users/", "").split("/")[0];
    if (!id) return new Response(JSON.stringify({ error: "User ID required" }), { status: 400 });
    const authRes = await requireAuth(req, (r) => r);
    if (authRes instanceof Response) return authRes;
    const adminRes = requireAdmin(authRes, (r) => r);
    if (adminRes instanceof Response) return adminRes;
    return await deleteUserController(req, { params: { id } });
  }

  // POST /api/admin/users/:userId/dogs/:dogId/attach (admin only)
  if (
    req.method === "POST" &&
    url.pathname.startsWith("/api/admin/users/") &&
    url.pathname.includes("/dogs/") &&
    url.pathname.endsWith("/attach")
  ) {
    const rest = url.pathname.slice("/api/admin/users/".length); // userId/dogs/dogId/attach
    const parts = rest.split("/");
    const userId = parts[0];
    const dogId = parts[2];
    if (!userId || !dogId) {
      return new Response(JSON.stringify({ error: "userId and dogId are required" }), { status: 400 });
    }

    const authRes = await requireAuth(req, (r) => r);
    if (authRes instanceof Response) return authRes;
    const adminRes = requireAdmin(authRes, (r) => r);
    if (adminRes instanceof Response) return adminRes;
    return await attachDogToUserController(req, { params: { userId, dogId } });
  }

  return null;
}
