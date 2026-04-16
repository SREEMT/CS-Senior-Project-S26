import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("Dog Model", () => {
  let Dog;

  beforeEach(async () => {
    mock.restore();

    class Schema {
      constructor(definition) {
        this.definition = definition;
      }
    }
    Schema.Types = { ObjectId: class MockObjectId {} };

    const model = (_name, schema) =>
      class MockDogModel {
        constructor(data = {}) {
          this.data = data;
          this.schema = schema;
        }

        async validate() {
          if (!this.data.name) {
            throw new Error("Path `name` is required.");
          }
        }
      };

    mock.module("mongoose", () => ({
      default: { Schema, model },
    }));

    const mod = await import(
      `../../src/models/dog.model.js?dog-model=${Date.now()}-${Math.random()}`
    );
    Dog = mod.default;
  });

  afterEach(() => {
    mock.restore();
  });

  it("should require a name", async () => {
    const dog = new Dog({});
    await expect(dog.validate()).rejects.toBeDefined();
  });
});
