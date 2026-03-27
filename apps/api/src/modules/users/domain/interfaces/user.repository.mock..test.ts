import { describe, expect, it } from "vitest";
import { createMockedUserRepository } from "./user.repository.mock.";

describe("createMockedUserRepository", () => {
  it("returns default mocked behaviors", async () => {
    const repo = createMockedUserRepository();

    await expect(repo.existsByEmail("test1@example.com")).resolves.toBe(true);
    await expect(repo.existsByUsername("john")).resolves.toBe(true);
    await expect(repo.findByEmail("unknown@example.com")).resolves.toBeNull();
    await expect(repo.findById("missing")).resolves.toBeNull();
    await expect(repo.findAll({ page: 1, limit: 10 })).resolves.toMatchObject({
      total: 3,
    });
  });

  it("supports method overrides", async () => {
    const repo = createMockedUserRepository({
      findByEmail: async () => ({ id: "override" }) as any,
    });
    await expect(repo.findByEmail("x")).resolves.toMatchObject({
      id: "override",
    });
  });
});
