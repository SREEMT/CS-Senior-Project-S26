import {
    createCommLog,
    findLogs,
    findLogById,
    updateCommLogById,
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

export async function updateComm(user, logId, data) {
    if (!user?._id) throw new Error("Unauthorized");

    const existing = await findLogById(logId);
    if (!existing) {
        throw new Error("Log not found");
    }

    if (existing.userId?.toString() !== user._id?.toString()) {
        throw new Error("Unauthorized");
    }

    const trim = (v) => (v != null ? String(v).trim() : "");
    const updates = {};

    if (data?.title !== undefined) updates.title = trim(data.title);
    if (data?.body !== undefined || data?.message !== undefined) {
        updates.body = trim(data.body ?? data.message);
    }
    if (data?.eventId !== undefined) updates.eventId = data.eventId ?? null;
    if (data?.dogId !== undefined) updates.dogId = data.dogId ?? null;
    if (data?.type !== undefined) updates.type = trim(data.type);
    if (data?.priority !== undefined) updates.priority = trim(data.priority);
    if (data?.location !== undefined) updates.location = trim(data.location);
    if (data?.radioChannel !== undefined) updates.radioChannel = trim(data.radioChannel);

    if (Object.keys(updates).length === 0) {
        throw new Error("No fields to update");
    }
    if (updates.title !== undefined && !updates.title) {
        throw new Error("Title is required");
    }
    if (updates.body !== undefined && !updates.body) {
        throw new Error("Body is required");
    }

    const updated = await updateCommLogById(logId, updates);
    if (!updated) {
        throw new Error("Log not found");
    }
    return updated;
}
