import {
  createDog,
  registerDog,
  getMyDogs,
  getAllDogs,
  deleteDog,
} from "../controllers/dog.controller.js";

import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

export async function dogRoutes(req) {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/api/dogs/register") {
    return await registerDog(req);
  }

  if (req.method === "POST" && url.pathname === "/api/dogs") {
    return requireAuth(req, (r) => createDog(r));
  }

  if (req.method === "GET" && url.pathname === "/api/dogs/mine") {
    return requireAuth(req, (r) => getMyDogs(r));
  }

  if (req.method === "GET" && url.pathname === "/api/dogs") {
    return requireAuth(req, (r) => requireAdmin(r, () => getAllDogs(r)));
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/dogs/")) {
    const id = url.pathname.split("/").pop();
    if (id && id !== "register") {
      req.params = { id };
      return requireAuth(req, (r) =>
        requireAdmin(r, () => deleteDog(r))
      );
    }
  }

  return null;
}