import { serve } from "bun";

import { userRoutes } from "./routes/user.routes.js";
import { dogRoutes } from "./routes/dog.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { authRoutes } from "./routes/auth.routes.js";

import dotenv from "dotenv";
dotenv.config();

// Current port for local development.
// Will implement .env
import { connectDB } from "./config/db.js";
console.log("MONGO_URI:", process.env.MONGO_URI);
connectDB();
const PORT = 3049;

// Serve method to start API
serve({
    port: PORT,
    fetch(req) {
        return (
            userRoutes(req) ??
            authRoutes(req) ??
            dogRoutes(req) ??
            adminRoutes(req) ??
            new Response("Note Found", { status: 404 })
        );
    }
});

// Log for testing
console.log(`API Running on http://localhost:${PORT}`);
