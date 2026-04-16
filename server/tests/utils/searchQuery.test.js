import { describe, expect, it } from "bun:test";
import { buildSearchQuery } from "../../src/utils/searchQuery.js";

describe("searchQuery util - buildSearchQuery", () => {
  it("returns empty object for empty/blank query", () => {
    expect(buildSearchQuery("")).toEqual({});
    expect(buildSearchQuery("   ")).toEqual({});
    expect(buildSearchQuery(null)).toEqual({});
  });

  it("returns text search query for non-empty input", () => {
    expect(buildSearchQuery("  k9 cert  ")).toEqual({
      $text: { $search: "k9 cert" },
    });
  });
});
