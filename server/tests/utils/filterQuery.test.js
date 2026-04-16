import { describe, expect, it } from "bun:test";
import mongoose from "mongoose";
import {
  buildCreatedAtRangeQuery,
  buildFilterQuery,
  buildTrainingDateRangeQuery,
} from "../../src/utils/filterQuery.js";

describe("filterQuery utils", () => {
  it("buildFilterQuery maps object id filters and passthrough fields", () => {
    const userId = new mongoose.Types.ObjectId();
    const dogId = new mongoose.Types.ObjectId();

    const query = buildFilterQuery({
      userId: userId.toString(),
      dogId: dogId.toString(),
      logType: "note",
      eventId: "evt-1",
    });

    expect(query.userId instanceof mongoose.Types.ObjectId).toBe(true);
    expect(query.dogId instanceof mongoose.Types.ObjectId).toBe(true);
    expect(query.userId.toString()).toBe(userId.toString());
    expect(query.dogId.toString()).toBe(dogId.toString());
    expect(query.type).toBe("note");
    expect(query.eventId).toBe("evt-1");
  });

  it("buildCreatedAtRangeQuery handles start/end and end-of-day", () => {
    const query = buildCreatedAtRangeQuery({
      startDate: "2026-04-01",
      endDate: "2026-04-02",
    });

    expect(query.createdAt.$gte instanceof Date).toBe(true);
    expect(query.createdAt.$lte instanceof Date).toBe(true);
    expect(query.createdAt.$gte.toISOString().slice(0, 10)).toBe("2026-04-01");
    expect(query.createdAt.$lte.toISOString().slice(0, 10)).toBe("2026-04-02");
    expect(query.createdAt.$lte.getHours()).toBe(23);
    expect(query.createdAt.$lte.getMinutes()).toBe(59);
  });

  it("buildCreatedAtRangeQuery returns empty object for invalid values", () => {
    const query = buildCreatedAtRangeQuery({ startDate: "not-a-date" });
    expect(query).toEqual({});
  });

  it("buildTrainingDateRangeQuery normalizes date strings", () => {
    const query = buildTrainingDateRangeQuery({
      startDate: "2026-04-01T18:30:00.000Z",
      endDate: "2026-04-10",
    });

    expect(query).toEqual({
      date: {
        $gte: "2026-04-01",
        $lte: "2026-04-10",
      },
    });
  });

  it("buildTrainingDateRangeQuery returns empty object for invalid dates", () => {
    expect(buildTrainingDateRangeQuery({ startDate: "bad" })).toEqual({});
  });
});
