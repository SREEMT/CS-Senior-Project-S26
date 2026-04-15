export function buildSort({ sortBy, hasQuery }) {
    if (hasQuery) {
        return { score: { $meta: "textScore" } };
    }

    if (sortBy === "updatedAt") {
        return { updatedAt: -1 };
    }

    return { createdAt: -1 };
}