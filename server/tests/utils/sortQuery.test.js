import { describe, expect, it } from "bun:test";
import { buildSort } from "../../src/utils/sortQuery.js";

describe("sortQuery util - buildSort", () => {
  it("returns oldest sort", () => {
    expect(buildSort({ sortBy: "oldest" })).toEqual({ createdAt: 1 });
  });

  it("returns updatedAt sort (case-insensitive)", () => {
    expect(buildSort({ sortBy: "updatedAt" })).toEqual({ updatedAt: -1 });
  });

  it("defaults to latest createdAt sort", () => {
    expect(buildSort({})).toEqual({ createdAt: -1 });
    expect(buildSort({ sortBy: "latest" })).toEqual({ createdAt: -1 });
  });
});
