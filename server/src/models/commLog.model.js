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

// Find Logs by event

// Find log by Id

// Delete Log