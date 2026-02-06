import { serve } from "bun";
import { userRoutes } from "./routes/user.routes.js"

// Current port for local development.
// Will implement .env
const PORT = 3049;

// Serve method to start API
serve({
    port: PORT,
    fetch(req) {
        return (
            userRoutes(req) ??
            // authRoutes(req) ??
            new Response("Note Found", { status: 404 })
        );
    }
});

// Log for testing
console.log(`API Running on http://localhost:${PORT}`);
