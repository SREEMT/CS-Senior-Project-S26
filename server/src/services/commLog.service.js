import {
    createCommLog,
    findLogs,
    findLogById,
    deleteCommLog,
} from "../models/commLog.model.js";

export async function logComm(user, data) {
    const trim = (v) => (v != null ? String(v).trim() : "");

    if (!user?._id) throw new Error("Unauthorized");

    const title = trim(data?.title);
    const body = trim(data?.body ?? data?.message);

    if (!title) throw new Error("Title is required");
    if (!body) throw new Error("Body is required");

    return await createCommLog({
        ...data,
        title,
        body,
        userId: user._id,
    });
}

export async function getEventComm(user, eventId) {
    if (!user?._id) throw new Error("Unauthorized");

    const query = {};
    if (eventId) {
        query.eventId = eventId;
    }

    // Non-admin users can only retrieve their own communication logs.
    if (user.role !== "admin") {
        query.userId = user._id;
    }

    return await findLogs(query);
}

export async function deleteComm(user, logId) {
    const log = await findLogById(logId);

    if (!log) {
        throw new Error("Log not found");
    }

    // Users can delete their own logs; admins can delete any log.
    if (user.role !== "admin" && log.userId?.toString() !== user._id?.toString()) {
        throw new Error("Unauthorized");
    }

    await deleteCommLog(logId);
    return true;
}
