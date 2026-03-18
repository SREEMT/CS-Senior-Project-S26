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
    const url = new URL(req.url);
    const eventId = url.searchParams.get("eventId");

    const logs = await getEventComm(eventId);

    return Response.json(logs);
}

// Delete a log controller, called by routes
export async function deleteLogController(req) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    await deleteComm(id);

    return Response.json({ success: true });
}