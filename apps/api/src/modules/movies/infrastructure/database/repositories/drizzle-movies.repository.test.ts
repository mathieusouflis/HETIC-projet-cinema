import { describe, expect, it } from "vitest";
import { DrizzleMoviesRepository } from "./drizzle-movies.repository";

describe("DrizzleMoviesRepository", () => {
  it("sets static metadata and maps rows to movie entity", () => {
    const repo = new DrizzleMoviesRepository();
    expect(repo.contentType).toBe("movie");
    expect((repo as any).entityName).toBe("movie");

    const entity = (repo as any).createEntity({
      id: "m1",
      title: "Movie",
    });
    expect(entity).toBeDefined();
  });
});
