import CommunicationLog from "../models/commLog.model";
import TrainingLog from "../models/trainingLog.model";
import { connectDB } from "../config/db";

import { buildSearchQuery } from "../utils/searchQuery";
import { buildFilterQuery, buildCreatedAtRangeQuery, buildTrainingDateRangeQuery } from "../utils/filterQuery";
import { buildSort } from "../utils/sortQuery";

export async function searchAll({ query, filters }) {
    const searchQuery = buildSearchQuery(query);
    const filterQuery = buildFilterQuery(filters);
    const createdAtRangeQuery = buildCreatedAtRangeQuery(filters);
    const trainingDateRangeQuery = buildTrainingDateRangeQuery(filters);
    const hasQuery = !!query;

    const commQuery = {
        ...searchQuery,
        ...filterQuery,
        ...createdAtRangeQuery
    };

    const trainingQuery = {
        ...searchQuery,
        ...filterQuery,
        ...trainingDateRangeQuery
    };

    const certQuery = {
        ...searchQuery,
        ...filterQuery,
        ...createdAtRangeQuery
    };

    const sort = buildSort({ sortBy: filters.sortBy, hasQuery });

    const conn = await connectDB();
    const certCollection = conn.db.collection("certifications");

    const [comms, training, certs] = await Promise.all([
        CommunicationLog.find(commQuery)
            .sort(sort)
            .lean(),

        TrainingLog.find(trainingQuery)
            .sort(sort)
            .lean(),

        certCollection.find(certQuery).sort(sort).toArray()
    ]);

    let results = [
        ...comms.map(c => ({
            id: c._id.toString(),
            type: "communication_log",
            title: c.title || "Untitled",
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        })),

        ...training.map(t => ({
            id: t._id.toString(),
            type: "training_log",
            title: "Training Log",
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        })),

        ...certs.map(c => ({
            id: c._id.toString(),
            type: "certification",
            title: c.title,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }))
    ];

    if (filters.type) {
        results = results.filter(r => r.type === filters.type);
    }

    return results;
}