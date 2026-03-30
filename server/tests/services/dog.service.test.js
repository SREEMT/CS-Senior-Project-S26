import { describe, it, expect, mock, beforeEach } from "bun:test";

describe("Dog service - create & queries", () => {
  beforeEach(() => {
    mock.restore();

    mock.module("../../src/models/dog.model.js", () => {
      const store = [];
      return {
        default: {
          create: async (payload) => {
            const doc = { _id: "dog-1", ...payload };
            store.push(doc);
            return doc;
          },
          findById: async (id) => {
            const found = store.find((d) => d._id === id);
            return found ?? null;
          },
          find: async (query = {}) => {
            if (query.ownerId) {
              return store.filter((d) => d.ownerId === query.ownerId);
            }
            return store;
          },
          findByIdAndDelete: async (id) => {
            const idx = store.findIndex((d) => d._id === id);
            if (idx === -1) return null;
            const [deleted] = store.splice(idx, 1);
            return deleted;
          },
          populate: () => ({
            // very light-weight populate stub used by getAllDogs
            exec: async () => store,
          }),
          lean: async () => store,
        },
      };
    });
  });

  it("creates dog when name is provided and normalizes payload", async () => {
    const mod = await import("../../src/services/dog.service.js");
    const { createDog } = mod;

    const dog = await createDog({
      name: "  Fido ",
      dateOfBirth: "2020-01-01",
      veterinarian: "Dr. Vet",
      status: "active",
      color: "brown",
      ownerId: "owner-1",
    });

    expect(dog.name).toBe("Fido");
    expect(dog.birthDate).toBe("2020-01-01");
    expect(dog.vet).toBe("Dr. Vet");
    expect(dog.status).toBe("active");
    expect(dog.color).toBe("brown");
    expect(dog.ownerId).toBe("owner-1");
  });

  it("throws when name is missing or blank", async () => {
    const { createDog } = await import("../../src/services/dog.service.js");

    await expect(
      createDog({ name: "   " }),
    ).rejects.toThrow("Missing required field: name");
  });

  it("gets dogs by owner", async () => {
    const mod = await import("../../src/services/dog.service.js");
    const { createDog, getDogsByOwner } = mod;

    await createDog({ name: "Dog1", ownerId: "owner-1" });
    await createDog({ name: "Dog2", ownerId: "owner-2" });

    const mine = await getDogsByOwner("owner-1");
    expect(Array.isArray(mine)).toBe(true);
    expect(mine.length).toBe(1);
    expect(mine[0].ownerId).toBe("owner-1");
  });

  it("returns mapped lean dogs for getAllDogsLean", async () => {
    mock.restore();

    mock.module("../../src/models/dog.model.js", () => ({
      default: {
        find: () => ({
          lean: async () => [
            {
              _id: "dog-1",
              name: "Dog1",
              birthDate: "2020-01-01",
              vet: "Dr. Vet",
              status: "active",
              color: "brown",
              ownerId: "owner-1",
            },
          ],
        }),
      },
    }));

    const { getAllDogsLean } = await import(
      "../../src/services/dog.service.js"
    );
    const dogs = await getAllDogsLean();

    expect(dogs.length).toBe(1);
    expect(dogs[0].id).toBe("dog-1");
    expect(dogs[0].ownerId).toBe("owner-1");
  });

  it("returns deleted dog from deleteDog", async () => {
    mock.restore();

    let store = [
      { _id: "dog-1", name: "Dog1" },
      { _id: "dog-2", name: "Dog2" },
    ];

    mock.module("../../src/models/dog.model.js", () => ({
      default: {
        findByIdAndDelete: async (id) => {
          const idx = store.findIndex((d) => d._id === id);
          if (idx === -1) return null;
          const [deleted] = store.splice(idx, 1);
          return deleted;
        },
      },
    }));

    const { deleteDog } = await import("../../src/services/dog.service.js");
    const deleted = await deleteDog("dog-1");

    expect(deleted).not.toBeNull();
    expect(deleted._id).toBe("dog-1");
  });

  it("assigns an unowned dog to an owner", async () => {
    const mod = await import("../../src/services/dog.service.js");
    const { createDog, assignDogToOwner } = mod;

    await createDog({ name: "UnownedDog" });
    const dog = await assignDogToOwner("dog-1", "owner-1");

    expect(dog.ownerId).toBe("owner-1");
  });

  it("re-assigns a dog even if it already has an owner", async () => {
    const mod = await import("../../src/services/dog.service.js");
    const { createDog, assignDogToOwner } = mod;

    await createDog({ name: "OwnedDog", ownerId: "owner-1" });

    const dog = await assignDogToOwner("dog-1", "owner-2");
    expect(dog.ownerId).toBe("owner-2");
  });
});

