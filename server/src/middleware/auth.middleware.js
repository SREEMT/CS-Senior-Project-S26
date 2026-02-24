import { verifyJWT } from "../utils/jwt.js";
import { findUserById } from "../models/user.model.js";

export async function requireAuth(req, next) {
    const auth = req.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const token = auth.split(" ")[1];
        const payload = verifyJWT(token);

        const user = await findUserById(payload.userId);
        if (!user) throw new Error();

        req.user = user;
        return next(req);
    } catch {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export function requireAdmin(req, next) {
    if (req.user?.role !== "admin") {
        return new Response(
            JSON.stringify({ error: "Admin access required" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
        );
    }
    return next(req);
}