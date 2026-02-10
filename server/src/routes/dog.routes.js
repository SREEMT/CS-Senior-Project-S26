import {
  createDog,
  getMyDogs,
  getAllDogs,
  deleteDog,
} from "../controllers/dog.controller.js";

import { authenticate, authorizeAdmin } from "../middleware/auth.js";

export function dogRoutes(req) {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/api/dogs") {
    return authenticate(req, () => createDog(req));
  }

  if (req.method === "GET" && url.pathname === "/api/dogs/mine") {
    return authenticate(req, () => getMyDogs(req));
  }

  if (req.method === "GET" && url.pathname === "/api/dogs") {
    return authenticate(req, () =>
      authorizeAdmin(req, () => getAllDogs(req))
    );
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/dogs/")) {
    req.params = { id: url.pathname.split("/").pop() };
    return authenticate(req, () =>
      authorizeAdmin(req, () => deleteDog(req))
    );
  }

  return null;
}