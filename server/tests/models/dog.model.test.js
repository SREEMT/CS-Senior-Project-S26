import Dog from "../../src/models/dog.model.js";
import mongoose from "mongoose";

describe("Dog Model", () => {
  it("should require a name", async () => {
    const dog = new Dog({});
    let err;

    try {
      await dog.validate();
    } catch (e) {
      err = e;
    }

    expect(err).toBeDefined();
  });
});