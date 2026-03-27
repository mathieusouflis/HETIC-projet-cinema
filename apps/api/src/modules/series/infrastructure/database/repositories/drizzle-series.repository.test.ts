import { describe, expect, it } from "vitest";
import { DrizzleSeriesRepository } from "./drizzle-series.repository";

describe("DrizzleSeriesRepository", () => {
  it("sets static metadata and maps rows to serie entity", () => {
    const repo = new DrizzleSeriesRepository();
    expect(repo.contentType).toBe("serie");
    expect((repo as any).entityName).toBe("series");

    const entity = (repo as any).createEntity({
      id: "s1",
      title: "Serie",
    });
    expect(entity).toBeDefined();
  });
});
