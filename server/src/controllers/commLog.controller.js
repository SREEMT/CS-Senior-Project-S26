import {
    logComm,
    getEventComm,
    deleteComm,
} from "../services/commLog.service.js";

// Create log controller, called by routes
export async function createLogController(req) {
    try {
        const body = await req.json();
        const id = await logComm(req.user, body);
        return new Response(JSON.stringify({ success: true, id }), {
            status: 201,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
        });
    }
}

// Get logs to view, called by routes
export async function getEventLogsController(req) {
    try {
        const url = new URL(req.url);
        const eventId = url.searchParams.get("eventId");
        const logs = await getEventComm(req.user, eventId);
        return Response.json(logs);
    } catch (err) {
        const status = err.message === "Unauthorized" ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), {
            status,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// Delete a log controller, called by routes
export async function deleteLogController(req, { params } = {}) {
    const url = new URL(req.url);
    const id = params?.id ?? url.searchParams.get("id");

    if (!id) {
        return new Response(JSON.stringify({ error: "Log ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    await deleteComm(req.user, id);

    return Response.json({ success: true });
}
