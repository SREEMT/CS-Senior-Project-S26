import { searchAll } from "../services/search.service.js";

export async function searchController(req) {
    try {
        const url = new URL(req.url);
        
        // query params
        const query = url.searchParams.get("q") || "";

        const filters = {
            type: url.searchParams.get("type"),         // training_log, communication_log, or certification
            sortBy: url.searchParams.get("sortBy"),     // latest, oldest, or updatedAt
            startDate: url.searchParams.get("startDate"),
            endDate: url.searchParams.get("endDate"),
            dogId: url.searchParams.get("dogId"),
            eventId: url.searchParams.get("eventId"),
            userId: url.searchParams.get("userId")
        };

        const results = await searchAll({ query, filters, user: req.user });

        return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }), 
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}
