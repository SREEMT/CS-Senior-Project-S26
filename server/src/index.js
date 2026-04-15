import { serve } from "bun";

import { userRoutes } from "./routes/user.routes.js";
import { dogRoutes } from "./routes/dog.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { certificationRoutes } from "./routes/certification.routes.js";
import { commLogRoutes } from "./routes/commLog.routes.js";
import { eventRoutes } from "./routes/event.routes.js";
import { trainingLogRoutes } from "./routes/trainingLog.routes.js";
import { searchRoutes } from "./routes/search.routes.js";

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

// Current port for local development.
// Will implement .env
import { connectDB } from "./config/db.js";
import { initDB } from "./config/db.init.js";
console.log("MONGO_URI:", process.env.MONGO_URI);
await connectDB();
await initDB();
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
            (await certificationRoutes(req)) ??
            (await commLogRoutes(req)) ??
            (await eventRoutes(req)) ??
            (await trainingLogRoutes(req)) ??
            (await searchRoutes(req)) ??
            null;
        return res ?? new Response("Not Found", { status: 404 });
    }
});

// Log for testing
console.log(`API Running on http://localhost:${PORT}`);
