import mongoose from "mongoose";

const toObjectId = (id) =>
    typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;

export function buildFilterQuery(filters = {}) {
    return {
        ...(filters.userId && { userId: toObjectId(filters.userId) }),
        ...(filters.dogId && { dogId: toObjectId(filters.dogId) }),
        ...(filters.logType && { type: filters.logType }),
        ...(filters.eventId && { eventId: filters.eventId })
    };
}