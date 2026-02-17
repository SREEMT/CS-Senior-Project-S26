import { serve } from "bun";

import { userRoutes } from "./routes/user.routes.js";
import { dogRoutes } from "./routes/dog.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { authRoutes } from "./routes/auth.routes.js";

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

// Current port for local development.
// Will implement .env
import { connectDB } from "./config/db.js";
console.log("MONGO_URI:", process.env.MONGO_URI);
connectDB();
const PORT = 3049;

// Serve method to start API
serve({
    port: PORT,
    async fetch(req) {
        const res =
            (await userRoutes(req)) ??
            (await authRoutes(req)) ??
            (await dogRoutes(req)) ??
            (await adminRoutes(req)) ??
            null;
        return res ?? new Response("Not Found", { status: 404 });
    }
});

// Log for testing
console.log(`API Running on http://localhost:${PORT}`);
