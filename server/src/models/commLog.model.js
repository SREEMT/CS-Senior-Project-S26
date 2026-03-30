// Model layer for comm logs
// Handles communictions with database and administers changes

import mongoose from "mongoose";

const commLogSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
            ref: "Event",
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },

        dogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dog",
            default: null,
        },

        title: {
            type: String,
            required: false,
            trim: true,
        },

        body: {
            type: String,
            required: false,
            trim: true,
        },

        type: {
            type: String,
            enum: ["note", "radio", "incident", "trainer", "observation"],
            default: "note",
        },

        priority: {
            type: String,
            enum: ["low", "normal", "high"],
            default: "normal",
        },

        message: {
            type: String,
            required: false,
            trim: true,
        },

        location: {
            type: String,
            trim: true,
        },

        radioChannel: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const CommunicationLog = mongoose.model(
    "CommunicationLog",
    commLogSchema
);

export default CommunicationLog;

// Create comms log
export async function createCommLog(data) {
    const trim = (v) => (v != null ? String(v).trim() : undefined);

    const body = trim(data.body ?? data.message);
    const doc = {
        eventId: data.eventId ?? null,
        userId: data.userId,
        dogId: data.dogId ?? null,
        type: trim(data.type),
        priority: trim(data.priority),
        title: trim(data.title),
        body,

        message: body,
        location: trim(data.location),
        radioChannel: trim(data.radioChannel),
    };

    const log = await CommunicationLog.create(doc);

    const obj = log.toObject();
    obj.id = obj._id.toString();

    return obj;
}

// Find Logs by event
export async function findLogByEvent(eventId) {
    const query = eventId ? { eventId } : {};

    const logs = await CommunicationLog.find(query)
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .lean();
    
    return logs.map((l) => ({
        ...l,
        userName: l.userId?.name ?? "Unknown",
        userId: l.userId?._id ? l.userId._id.toString() : l.userId?.toString?.() ?? null,
        title: l.title ?? "Untitled",
        body: l.body ?? l.message ?? "",
        id: l._id.toString(),
        _id: undefined,
    }));
}

// Find log by Id
export async function findLogById(id) {
    const log = await CommunicationLog.findById(id).lean();
    if (!log) return null;

    return {
        ...log,
        id: log._id.toString(),
        _id: undefined,
    };
}

// Delete Log
export async function deleteCommLog(id) {
    return await CommunicationLog.findByIdAndDelete(id);
}