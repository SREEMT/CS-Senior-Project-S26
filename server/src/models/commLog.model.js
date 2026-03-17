// Model layer for comm logs
// Handles communictions with database and administers changes

import mongoose from "mongoose";

const commLogSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
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
            required: true,
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
    communicationLogSchema
);

export default CommunicationLog;

// Create comms log
export async function createCommLog(data) {
    const trim = (v) => (v != null ? String(v).trim() : undefined);

    const doc = {
        eventId: data.eventId,
        userId: data.userId,
        dogId: data.dogId ?? null,
        type: trim(data.type),
        priority: trim(data.priority),
        message: trim(data.message),
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
    const logs = await CommunicationLog.find({ eventId })
        .sort({ createdAt: -1 })
        .lean();
    
    return logs.map((1) => ({
        ...l,
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
export async function deleteCommunicationLog(id) {
    return await CommunicationLog.findByIdAndDelete(id);
}