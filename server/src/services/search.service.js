import mongoose from "mongoose";
import CommunicationLog from "../models/commLog.model";
import TrainingLog from "../models/trainingLog.model";
import { connectDB } from "../config/db";
import User from "../models/user.model.js";
import Dog from "../models/dog.model.js";

import { buildCreatedAtRangeQuery, buildTrainingDateRangeQuery } from "../utils/filterQuery";
import { buildSort } from "../utils/sortQuery";

const COMMUNICATION_TYPE = "communication_log";
const TRAINING_TYPE = "training_log";
const CERTIFICATION_TYPE = "certification";
const DOCUMENT_TYPE = "document";

function toObjectId(id) {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
    }
    return null;
}

function hasFields(obj) {
    return !!obj && Object.keys(obj).length > 0;
}

function toIdString(value) {
    return value?.toString?.() || null;
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildCaseInsensitiveRegex(query) {
    const normalized = typeof query === "string" ? query.trim() : "";
    if (!normalized) return null;
    return new RegExp(escapeRegex(normalized), "i");
}

function buildSearchTokens(query) {
    const normalized = typeof query === "string" ? query.trim() : "";
    if (!normalized) return [];

    return normalized
        .split(/[^a-zA-Z0-9]+/)
        .map((token) => token.trim())
        .filter(Boolean)
        .slice(0, 10);
}

function buildTokenRegexes(query) {
    const unique = Array.from(new Set(buildSearchTokens(query)));
    return unique.map((token) => new RegExp(escapeRegex(token), "i"));
}

function buildLoosePhraseRegex(query) {
    const tokens = buildSearchTokens(query);
    if (tokens.length === 0) return null;

    // Match tokens in order while tolerating punctuation/spacing differences.
    return new RegExp(tokens.map(escapeRegex).join(".*"), "i");
}

function mergeWithAnd(conditions) {
    const valid = conditions.filter((condition) => hasFields(condition));
    if (valid.length === 0) return {};
    if (valid.length === 1) return valid[0];
    return { $and: valid };
}

function normalizeType(type) {
    const normalized = String(type || "").toLowerCase();
    if (normalized === "communication" || normalized === COMMUNICATION_TYPE) {
        return COMMUNICATION_TYPE;
    }
    if (normalized === "training" || normalized === TRAINING_TYPE) {
        return TRAINING_TYPE;
    }
    if (normalized === "cert" || normalized === CERTIFICATION_TYPE) {
        return CERTIFICATION_TYPE;
    }
    if (normalized === "documents" || normalized === DOCUMENT_TYPE) {
        return DOCUMENT_TYPE;
    }
    return "";
}

function getCombinedSort(sortBy) {
    const normalized = String(sortBy || "").toLowerCase();
    const getTime = (value) => {
        const time = new Date(value || 0).getTime();
        return Number.isNaN(time) ? 0 : time;
    };

    if (normalized === "oldest") {
        return (a, b) => getTime(a.createdAt) - getTime(b.createdAt);
    }

    if (normalized === "updatedat") {
        return (a, b) => getTime(b.updatedAt) - getTime(a.updatedAt);
    }

    return (a, b) => getTime(b.createdAt) - getTime(a.createdAt);
}

export async function searchAll({ query, filters = {}, user }) {
    const isAdmin = user?.role === "admin";
    const currentUserId = toObjectId(user?._id || user?.id);

    if (!currentUserId) {
        throw new Error("Unauthorized");
    }

    const searchRegex = buildCaseInsensitiveRegex(query);
    const tokenRegexes = buildTokenRegexes(query);
    const loosePhraseRegex = buildLoosePhraseRegex(query);
    const createdAtRangeQuery = buildCreatedAtRangeQuery(filters);
    const trainingDateRangeQuery = buildTrainingDateRangeQuery(filters);
    const requestedType = normalizeType(filters.type);
    const requestedUserId = isAdmin ? toObjectId(filters.userId) : null;
    const requestedDogId = toObjectId(filters.dogId);
    const sort = buildSort({ sortBy: filters.sortBy });

    const includeCommunication = !requestedType || requestedType === COMMUNICATION_TYPE;
    const includeTraining = !requestedType || requestedType === TRAINING_TYPE;
    const includeCertification = !requestedType || requestedType === CERTIFICATION_TYPE;
    const includeDocument = !requestedType || requestedType === DOCUMENT_TYPE;

    let userIdsFromName = [];
    let dogIdsFromName = [];

    if (searchRegex) {
        const [matchingUsers, matchingDogs] = await Promise.all([
            User.find({ name: searchRegex }).select("_id").lean(),
            Dog.find({ name: searchRegex }).select("_id").lean(),
        ]);

        userIdsFromName = matchingUsers.map((doc) => doc._id);
        dogIdsFromName = matchingDogs.map((doc) => doc._id);
    }

    const ownershipQuery = isAdmin
        ? (requestedUserId ? { userId: requestedUserId } : {})
        : { userId: currentUserId };

    const communicationConditions = [
        ownershipQuery,
        createdAtRangeQuery,
        filters.eventId ? { eventId: filters.eventId } : {},
    ];

    if (searchRegex) {
        const commSearchConditions = [{ title: searchRegex }];

        if (tokenRegexes.length > 0) {
            commSearchConditions.push({
                $and: tokenRegexes.map((regex) => ({ title: regex })),
            });
        }

        if (userIdsFromName.length > 0) {
            commSearchConditions.push({ userId: { $in: userIdsFromName } });
        }

        communicationConditions.push({ $or: commSearchConditions });
    }

    const trainingConditions = [
        ownershipQuery,
        trainingDateRangeQuery,
        requestedDogId ? { dogId: requestedDogId } : {},
    ];

    if (searchRegex) {
        const trainingSearchConditions = [
            { location: searchRegex },
            { date: searchRegex },
            { time: searchRegex },
            { startTime: searchRegex },
            { stopTime: searchRegex },
        ];

        if (loosePhraseRegex) {
            trainingSearchConditions.push({ location: loosePhraseRegex });
        }

        if (tokenRegexes.length > 0) {
            trainingSearchConditions.push({
                $and: tokenRegexes.map((regex) => ({ location: regex })),
            });
        }

        if (dogIdsFromName.length > 0) {
            trainingSearchConditions.push({ dogId: { $in: dogIdsFromName } });
        }

        if (userIdsFromName.length > 0) {
            trainingSearchConditions.push({ userId: { $in: userIdsFromName } });
        }

        trainingConditions.push({ $or: trainingSearchConditions });
    }

    const certificationConditions = [
        ownershipQuery,
        createdAtRangeQuery,
    ];

    if (searchRegex) {
        const certificationSearchConditions = [
            { title: searchRegex },
            { issuer: searchRegex },
        ];

        if (userIdsFromName.length > 0) {
            certificationSearchConditions.push({ userId: { $in: userIdsFromName } });
        }

        certificationConditions.push({ $or: certificationSearchConditions });
    }

    const communicationQuery = mergeWithAnd(communicationConditions);
    const trainingQuery = mergeWithAnd(trainingConditions);
    const certificationQuery = mergeWithAnd(certificationConditions);

    const documentConditions = [{}, createdAtRangeQuery];

    if (searchRegex) {
        documentConditions.push({ title: searchRegex });
    }

    const documentQuery = mergeWithAnd(documentConditions);

    const conn = await connectDB();
    const certCollection = conn.db.collection("certifications");
    const documentCollection = conn.db.collection("documents");

    const [comms, training, certs, documents] = await Promise.all([
        includeCommunication
            ? CommunicationLog.find(communicationQuery).sort(sort).lean()
            : Promise.resolve([]),
        includeTraining
            ? TrainingLog.find(trainingQuery).sort(sort).lean()
            : Promise.resolve([]),
        includeCertification
            ? certCollection.find(certificationQuery).sort(sort).toArray()
            : Promise.resolve([]),
        includeDocument
            ? documentCollection.find(documentQuery).sort(sort).toArray()
            : Promise.resolve([]),
    ]);

    const userIds = new Set();
    const dogIds = new Set();

    for (const c of comms) {
        const userId = toIdString(c.userId);
        if (userId) userIds.add(userId);
    }

    for (const t of training) {
        const userId = toIdString(t.userId);
        const dogId = toIdString(t.dogId);
        if (userId) userIds.add(userId);
        if (dogId) dogIds.add(dogId);
    }

    for (const cert of certs) {
        const userId = toIdString(cert.userId);
        if (userId) userIds.add(userId);
    }

    for (const d of documents) {
        const userId = toIdString(d.userId);
        if (userId) userIds.add(userId);
    }

    const [users, dogs] = await Promise.all([
        userIds.size > 0
            ? User.find({ _id: { $in: Array.from(userIds).map((id) => toObjectId(id)).filter(Boolean) } })
                .select("name")
                .lean()
            : Promise.resolve([]),
        dogIds.size > 0
            ? Dog.find({ _id: { $in: Array.from(dogIds).map((id) => toObjectId(id)).filter(Boolean) } })
                .select("name")
                .lean()
            : Promise.resolve([]),
    ]);

    const userMap = Object.fromEntries(users.map((doc) => [doc._id.toString(), doc]));
    const dogMap = Object.fromEntries(dogs.map((doc) => [doc._id.toString(), doc]));

    const results = [
        ...comms.map((doc) => {
            const userId = toIdString(doc.userId);
            return {
                id: doc._id.toString(),
                type: COMMUNICATION_TYPE,
                title: doc.title || "Untitled",
                body: doc.body || doc.message || "",
                location: doc.location || "",
                userId,
                userName: userMap[userId]?.name || "Unknown User",
                priority: doc.priority,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            };
        }),
        ...training.map((doc) => {
            const userId = toIdString(doc.userId);
            const dogId = toIdString(doc.dogId);
            return {
                id: doc._id.toString(),
                type: TRAINING_TYPE,
                title: "Training Log",
                userId,
                userName: userMap[userId]?.name || "Unknown User",
                dogId,
                dogName: dogMap[dogId]?.name || "Unknown Dog",
                date: doc.date,
                location: doc.location,
                time: doc.time,
                startTime: doc.startTime,
                stopTime: doc.stopTime,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            };
        }),
        ...certs.map((doc) => {
            const userId = toIdString(doc.userId);
            return {
                id: doc._id.toString(),
                type: CERTIFICATION_TYPE,
                userId,
                userName: userMap[userId]?.name || "Unknown User",
                title: doc.title,
                issuer: doc.issuer,
                dateAdded: doc.createdAt,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            };
        }),
        ...documents.map((doc) => ({
            id: doc._id.toString(),
            type: DOCUMENT_TYPE,
            title: doc.title,
            dateAdded: doc.createdAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        })),
    ];

    results.sort(getCombinedSort(filters.sortBy));
    return results;
}
