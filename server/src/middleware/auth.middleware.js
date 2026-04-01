import { verifyJWT } from "../utils/jwt.js";
import { findUserById } from "../models/user.model.js";

export async function requireAuth(req, next) {
    const url = new URL(req.url);
    const auth = req.headers.get("authorization");
    // Allow token to be passed as query param for file download links
    const tokenParam = url.searchParams.get("token");

    const token = auth?.startsWith("Bearer ")
        ? auth.split(" ")[1]
        : tokenParam;

    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
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
