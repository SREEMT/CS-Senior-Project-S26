export function buildSort({ sortBy } = {}) {
    const normalized = String(sortBy || "").toLowerCase();

    if (normalized === "oldest") {
        return { createdAt: 1 };
    }

    if (normalized === "updatedat") {
        return { updatedAt: -1 };
    }

    // Default to latest/recent first.
    return { createdAt: -1 };
}
