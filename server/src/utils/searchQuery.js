// Search query helper

export function buildSearchQuery(query) {
    if (!query || !query.trim()) return {};

    return {
        $text: {
            $search: query.trim()
        }
    };
}