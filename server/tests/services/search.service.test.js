import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import mongoose from "mongoose";

const ids = {
  admin: new mongoose.Types.ObjectId("65aaaaaa0000000000000001"),
  user1: new mongoose.Types.ObjectId("65aaaaaa0000000000000002"),
  user2: new mongoose.Types.ObjectId("65aaaaaa0000000000000003"),
  dog1: new mongoose.Types.ObjectId("65aaaaaa0000000000000004"),
  comm1: new mongoose.Types.ObjectId("65aaaaaa0000000000000011"),
  train1: new mongoose.Types.ObjectId("65aaaaaa0000000000000012"),
  cert1: new mongoose.Types.ObjectId("65aaaaaa0000000000000013"),
  cert2: new mongoose.Types.ObjectId("65aaaaaa0000000000000014"),
};

const userDocs = [
  { _id: ids.user1, name: "Alice Handler" },
  { _id: ids.user2, name: "Bob Trainer" },
];

const dogDocs = [{ _id: ids.dog1, name: "Rex" }];

const commDocs = [
  {
    _id: ids.comm1,
    userId: ids.user1,
    title: "Dispatch Update",
    body: "Body should not be searched for communication logs",
    message: "radio body",
    priority: "normal",
    createdAt: new Date("2026-04-11T10:00:00.000Z"),
    updatedAt: new Date("2026-04-11T10:10:00.000Z"),
  },
];

const trainingDocs = [
  {
    _id: ids.train1,
    userId: ids.user1,
    dogId: ids.dog1,
    date: "2026-04-08",
    location: "123 Main St., Apt #5, Boston MA",
    time: "09:00",
    startTime: "09:00",
    stopTime: "10:00",
    createdAt: new Date("2026-04-10T09:00:00.000Z"),
    updatedAt: new Date("2026-04-10T09:15:00.000Z"),
  },
];

const certDocs = [
  {
    _id: ids.cert1,
    userId: ids.user1,
    title: "K9 Cert Alpha",
    issuer: "Dept A",
    createdAt: new Date("2026-04-06T10:00:00.000Z"),
    updatedAt: new Date("2026-04-06T11:00:00.000Z"),
  },
  {
    _id: ids.cert2,
    userId: ids.user2,
    title: "K9 Cert Beta",
    issuer: "Dept B",
    createdAt: new Date("2026-04-07T10:00:00.000Z"),
    updatedAt: new Date("2026-04-07T11:00:00.000Z"),
  },
];

function makeSelectChain(rows) {
  return {
    select: () => ({
      lean: async () => rows,
    }),
    lean: async () => rows,
  };
}

describe("search.service - searchAll", () => {
  let captured;
  let serviceModulePromise;
  const loadSearchService = () => {
    if (!serviceModulePromise) {
      serviceModulePromise = import(
        "../../src/services/search.service.js?search-service-test"
      );
    }
    return serviceModulePromise;
  };

  beforeEach(() => {
    mock.restore();
    serviceModulePromise = null;
    captured = {
      commQuery: null,
      trainingQuery: null,
      certQuery: null,
      commSort: null,
      trainingSort: null,
      certSort: null,
    };

    mock.module("../../src/config/db.js", () => ({
      connectDB: async () => ({
        db: {
          collection: () => ({
            find: (query) => {
              captured.certQuery = query;
              return {
                sort: (sortArg) => {
                  captured.certSort = sortArg;
                  return {
                    toArray: async () => certDocs,
                  };
                },
              };
            },
          }),
        },
      }),
    }));

    mock.module("../../src/models/commLog.model.js", () => ({
      default: {
        find: (query) => {
          captured.commQuery = query;
          return {
            sort: (sortArg) => {
              captured.commSort = sortArg;
              return {
                lean: async () => commDocs,
              };
            },
          };
        },
      },
    }));

    mock.module("../../src/models/trainingLog.model.js", () => ({
      default: {
        find: (query) => {
          captured.trainingQuery = query;
          return {
            sort: (sortArg) => {
              captured.trainingSort = sortArg;
              return {
                lean: async () => trainingDocs,
              };
            },
          };
        },
      },
    }));

    mock.module("../../src/models/user.model.js", () => ({
      findUserByEmail: async () => null,
      findUserById: async () => null,
      findUserByUsername: async () => null,
      createUser: async () => null,
      updateUserModel: async () => null,
      deleteUser: async () => null,
      findAllUsers: async () => [],
      clearUsers: async () => {},
      default: {
        find: (query = {}) => {
          if (query.name instanceof RegExp) {
            const rows = userDocs
              .filter((u) => query.name.test(u.name))
              .map((u) => ({ _id: u._id }));
            return makeSelectChain(rows);
          }

          if (query._id?.$in) {
            const idsSet = new Set(query._id.$in.map((x) => x.toString()));
            const rows = userDocs.filter((u) => idsSet.has(u._id.toString()));
            return makeSelectChain(rows);
          }

          return makeSelectChain([]);
        },
      },
    }));

    mock.module("../../src/models/dog.model.js", () => ({
      default: {
        find: (query = {}) => {
          if (query.name instanceof RegExp) {
            const rows = dogDocs
              .filter((d) => query.name.test(d.name))
              .map((d) => ({ _id: d._id }));
            return makeSelectChain(rows);
          }

          if (query._id?.$in) {
            const idsSet = new Set(query._id.$in.map((x) => x.toString()));
            const rows = dogDocs.filter((d) => idsSet.has(d._id.toString()));
            return makeSelectChain(rows);
          }

          return makeSelectChain([]);
        },
      },
    }));
  });

  afterEach(() => {
    mock.restore();
  });

  it("throws unauthorized when user id is missing", async () => {
    const { searchAll } = await loadSearchService();

    await expect(
      searchAll({ query: "anything", filters: {}, user: { role: "user" } }),
    ).rejects.toThrow("Unauthorized");
  });

  it("builds communication query using title and username only (not body/message)", async () => {
    const { searchAll } = await loadSearchService();

    const results = await searchAll({
      query: "alice dispatch",
      filters: { type: "communication_log" },
      user: { _id: ids.user1, role: "user" },
    });

    const orConditions =
      captured.commQuery?.$and?.find((c) => Array.isArray(c.$or))?.$or ?? [];

    expect(orConditions.some((c) => c.title instanceof RegExp)).toBe(true);
    expect(orConditions.some((c) => c.body)).toBe(false);
    expect(orConditions.some((c) => c.message)).toBe(false);
    expect(results.length).toBe(1);
    expect(results[0].type).toBe("communication_log");
    expect(results[0].userName).toBe("Alice Handler");
  });

  it("supports address-style training location query and converts dogId filter", async () => {
    const { searchAll } = await loadSearchService();

    const results = await searchAll({
      query: "123 Main St., Apt #5",
      filters: { type: "training_log", dogId: ids.dog1.toString() },
      user: { _id: ids.user1, role: "user" },
    });

    const andConditions = captured.trainingQuery?.$and ?? [];
    const dogCondition = andConditions.find((c) => c.dogId);
    const orConditions = andConditions.find((c) => Array.isArray(c.$or))?.$or ?? [];

    expect(dogCondition?.dogId instanceof mongoose.Types.ObjectId).toBe(true);
    expect(orConditions.some((c) => c.location instanceof RegExp)).toBe(true);
    expect(
      orConditions.some(
        (c) =>
          Array.isArray(c.$and) &&
          c.$and.length > 0 &&
          c.$and.every((piece) => piece.location instanceof RegExp),
      ),
    ).toBe(true);

    expect(results.length).toBe(1);
    expect(results[0].type).toBe("training_log");
    expect(results[0].location).toContain("Main St");
    expect(results[0].dogName).toBe("Rex");
  });

  it("allows admin to filter certifications by userId and includes owner + dateAdded", async () => {
    const { searchAll } = await loadSearchService();

    const results = await searchAll({
      query: "",
      filters: {
        type: "certification",
        userId: ids.user2.toString(),
        sortBy: "oldest",
      },
      user: { _id: ids.admin, role: "admin" },
    });

    expect(captured.certQuery?.userId?.toString()).toBe(ids.user2.toString());
    expect(results.some((r) => r.type === "certification")).toBe(true);

    const cert = results.find((r) => r.id === ids.cert2.toString());
    expect(cert?.userName).toBe("Bob Trainer");
    expect(cert?.dateAdded).toBeDefined();
  });

  it("sorts combined results by createdAt when sortBy=oldest", async () => {
    const { searchAll } = await loadSearchService();

    const results = await searchAll({
      query: "",
      filters: { sortBy: "oldest" },
      user: { _id: ids.admin, role: "admin" },
    });

    const times = results.map((r) => new Date(r.createdAt).getTime());
    const expected = [...times].sort((a, b) => a - b);
    expect(times).toEqual(expected);
  });
});
