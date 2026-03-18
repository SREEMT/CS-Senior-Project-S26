import {
    createCommLog,
    findLogByEvent,
    findLogById,
    deleteCommLog,
} from "../models/commLog.model.js";

export async function logComm(user, data) {
    if (!data.eventId) {
        throw new Error("Event ID is required");
    }

    if (!data.message || !data.message.trim()) {
        throw new Error("Message is required");
    }

    return await createCommLog({
        ...data,
        userId: user._id,
    });
}

export async function getEventComm(eventId) {
    if (!eventId) {
        throw new Error("Event ID is required");
    }

    return await findLogByEvent(eventId);
}

export async function deleteComm(user, logId) {
    const log = await findLogById(logId);

    if (!log) {
        throw new Error("Log not found");
    }

    if (
        log.userId.toString() !== user._id.toString() &&
        user.role !== "admin"
    ) {
        throw new Error("Unauthorized");
    }

    await deleteCommLog(logId);
    return true;
}
