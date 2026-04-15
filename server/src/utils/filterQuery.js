import mongoose from "mongoose";

const toObjectId = (id) =>
    typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;

const parseDateParam = (value, endOfDay = false) => {
    if (!value || typeof value !== "string") return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    if (endOfDay && value.length === 10 && !value.includes("T")) {
        date.setHours(23, 59, 59, 999);
    }

    return date;
};

const normalizeDateString = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
};

export function buildFilterQuery(filters = {}) {
    return {
        ...(filters.userId && { userId: toObjectId(filters.userId) }),
        ...(filters.dogId && { dogId: toObjectId(filters.dogId) }),
        ...(filters.logType && { type: filters.logType }),
        ...(filters.eventId && { eventId: filters.eventId })
    };
}

export function buildCreatedAtRangeQuery(filters = {}) {
    const startDate = parseDateParam(filters.startDate);
    const endDate = parseDateParam(filters.endDate, true);
    const dateRange = {
        ...(startDate && { $gte: startDate }),
        ...(endDate && { $lte: endDate })
    };
    return Object.keys(dateRange).length > 0 ? { createdAt: dateRange } : {};
}

export function buildTrainingDateRangeQuery(filters = {}) {
    const start = normalizeDateString(filters.startDate);
    const end = normalizeDateString(filters.endDate);
    const range = {
        ...(start && { $gte: start }),
        ...(end && { $lte: end })
    };
    return Object.keys(range).length > 0 ? { date: range } : {};
}
