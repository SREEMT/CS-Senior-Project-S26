import {
    createCommLog,
    findLogByEvent,
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

export async function getEventComm(eventId) {
    return await findLogByEvent(eventId);
}

export async function deleteComm(user, logId) {
    const log = await findLogById(logId);

    if (!log) {
        throw new Error("Log not found");
    }

    // Only allow users to delete their own communication logs.
    if (log.userId?.toString() !== user._id?.toString()) {
        throw new Error("Unauthorized");
    }

    await deleteCommLog(logId);
    return true;
}
