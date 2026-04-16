import { describe, expect, it } from "bun:test";
import { comparePassword, hashPassword } from "../../src/utils/password.js";

describe("password util", () => {
  it("hashes and verifies password values", async () => {
    const plain = "S3cret!123";
    const hash = await hashPassword(plain);

    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(10);

    const ok = await comparePassword(plain, hash);
    const bad = await comparePassword("wrong-pass", hash);

    expect(ok).toBe(true);
    expect(bad).toBe(false);
  });
});
