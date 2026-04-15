export function buildSort({ sortBy, hasQuery }) {
    if (hasQuery) {
        return { score: { $meta: "textScore" } };
    }

    if (sortBy === "oldest") {
        return { createdAt: 1 };
    }

    if (sortBy === "updatedAt") {
        return { updatedAt: -1 };
    }

    // Default to recent (newest first)
    return { createdAt: -1 };
}