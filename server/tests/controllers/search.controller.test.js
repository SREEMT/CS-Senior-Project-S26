import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("search.controller - searchController", () => {
  const loadSearchController = () =>
    import(
      "../../src/controllers/search.controller.js?search-controller-test"
    );

  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("returns results and passes parsed query/filters/user to service", async () => {
    let capturedArgs = null;

    mock.module("../../src/services/search.service.js", () => ({
      searchAll: async (args) => {
        capturedArgs = args;
        return [{ id: "r1", type: "training_log" }];
      },
    }));

    const { searchController } = await loadSearchController();

    const req = new Request(
      "http://localhost/search?q=main&type=training_log&sortBy=oldest&startDate=2026-04-01&endDate=2026-04-30&dogId=dog-1&eventId=evt-1&userId=user-2",
      { method: "GET" },
    );
    req.user = { id: "user-1", role: "user" };

    const res = await searchController(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results[0].id).toBe("r1");
    expect(capturedArgs.query).toBe("main");
    expect(capturedArgs.filters.type).toBe("training_log");
    expect(capturedArgs.filters.sortBy).toBe("oldest");
    expect(capturedArgs.filters.dogId).toBe("dog-1");
    expect(capturedArgs.filters.eventId).toBe("evt-1");
    expect(capturedArgs.filters.userId).toBe("user-2");
    expect(capturedArgs.user.id).toBe("user-1");
  });

  it("returns 500 when service throws", async () => {
    mock.module("../../src/services/search.service.js", () => ({
      searchAll: async () => {
        throw new Error("search failure");
      },
    }));

    const { searchController } = await loadSearchController();

    const req = new Request("http://localhost/search?q=fail", { method: "GET" });
    req.user = { id: "user-1", role: "user" };

    const res = await searchController(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("search failure");
  });
});
