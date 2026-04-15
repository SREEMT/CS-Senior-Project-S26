import { searchAll } from "../services/search.service.js";

export async function searchController(req) {
    try {
        const url = new URL(req.url);
        
        // query params
        const query = url.searchParams.get("q") || "";

        const filters = {
            userId: url.searchParams.get("userId"),
            dogId: url.searchParams.get("dogId"),
            type: url.searchParams.get("type"),         //training_log or communication_log
            logType: url.searchParams.get("logType"),   // comm log subtype
            sortBy: url.searchParams.get("sortBy")      // createdAt or updatedAr 
        };

        const results = await searchAll({ query, filters });

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