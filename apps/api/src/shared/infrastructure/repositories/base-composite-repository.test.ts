import { describe, expect, it, vi } from "vitest";
import { BaseCompositeRepository } from "./base-composite-repository";
import type {
  BaseContentProps,
  BaseDrizzleRepository,
} from "./base-drizzle-repository";
import type { BaseTMDBRepository } from "./base-tmdb-repository";

type FakeEntity = {
  id: string;
  tmdbId: number;
  setRelations: (key: string, value: unknown) => void;
  removeRelations: (key: string) => void;
};

type FakeTMDBRepo = {
  search: ReturnType<typeof vi.fn>;
  discover: ReturnType<typeof vi.fn>;
  getMultipleDetails: ReturnType<typeof vi.fn>;
};

type FakeDrizzleRepo = {
  contentType?: "movie" | "serie";
  getByTmdbIds: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
  getCount: ReturnType<typeof vi.fn>;
};

class TestCompositeRepository extends BaseCompositeRepository<
  FakeEntity,
  Record<string, never>,
  BaseContentProps,
  BaseTMDBRepository<any, any>,
  BaseDrizzleRepository<FakeEntity, Record<string, never>, BaseContentProps>
> {
  protected readonly entityType = "test-entity";

  public searchPublic(query: string, options?: any) {
    return this.baseSearch(query, options as any);
  }

  public listPublic(
    title?: string,
    country?: string,
    categories?: string[],
    withCategories?: boolean,
    withPlatforms?: boolean,
    withCast?: boolean,
    withSeasons?: boolean,
    withEpisodes?: boolean,
    options?: any
  ) {
    return this.baseList(
      title,
      country,
      categories,
      withCategories,
      withPlatforms,
      withCast,
      withSeasons,
      withEpisodes,
      options as any
    );
  }
}

const makeEntity = (tmdbId: number): FakeEntity => ({
  id: `id-${tmdbId}`,
  tmdbId,
  setRelations: vi.fn(),
  removeRelations: vi.fn(),
});

const makeSut = () => {
  const tmdbRepository: FakeTMDBRepo = {
    search: vi.fn(),
    discover: vi.fn(),
    getMultipleDetails: vi.fn(),
  };

  const drizzleRepository: FakeDrizzleRepo = {
    contentType: "movie",
    getByTmdbIds: vi.fn(),
    list: vi.fn(),
    getCount: vi.fn(),
  };

  const sut = new TestCompositeRepository(
    tmdbRepository as unknown as BaseTMDBRepository<any, any>,
    drizzleRepository as unknown as BaseDrizzleRepository<
      FakeEntity,
      Record<string, never>,
      BaseContentProps
    >
  );

  return { sut, tmdbRepository, drizzleRepository };
};

describe("BaseCompositeRepository", () => {
  it("baseSearch should return [] when TMDB returns no ids", async () => {
    const { sut, tmdbRepository, drizzleRepository } = makeSut();
    tmdbRepository.search.mockResolvedValue({ ids: [], results: [], total: 0 });

    const result = await sut.searchPublic("nothing");

    expect(result).toEqual([]);
    expect(drizzleRepository.getByTmdbIds).not.toHaveBeenCalled();
  });

  it("baseSearch should remove relations based on options", async () => {
    const { sut, tmdbRepository, drizzleRepository } = makeSut();
    const entity = makeEntity(10);
    tmdbRepository.search.mockResolvedValue({
      ids: [10],
      results: [],
      total: 1,
    });
    drizzleRepository.getByTmdbIds.mockResolvedValue([entity]);

    const result = await sut.searchPublic("john", {
      withCategories: false,
      withPlatforms: false,
      withCast: false,
      withSeasons: false,
    });

    expect(result).toHaveLength(1);
    expect(entity.removeRelations).toHaveBeenCalledWith("contentCategories");
    expect(entity.removeRelations).toHaveBeenCalledWith("contentPlatforms");
    expect(entity.removeRelations).toHaveBeenCalledWith("contentCredits");
    expect(entity.removeRelations).toHaveBeenCalledWith("seasons");
  });

  it("baseSearch should create missing entities from TMDB details", async () => {
    const { sut, tmdbRepository, drizzleRepository } = makeSut();
    const existingEntity = makeEntity(1);
    const createdEntity = makeEntity(2);
    const createEntitiesSpy = vi
      .spyOn(
        sut as unknown as {
          createEntitiesWithRelations: (
            ...args: unknown[]
          ) => Promise<FakeEntity[]>;
        },
        "createEntitiesWithRelations"
      )
      .mockResolvedValue([createdEntity]);
    tmdbRepository.search.mockResolvedValue({
      ids: [1, 2],
      results: [],
      total: 2,
    });
    tmdbRepository.getMultipleDetails.mockResolvedValue([{ tmdbId: 2 }]);
    drizzleRepository.getByTmdbIds.mockResolvedValue([existingEntity]);

    const result = await sut.searchPublic("john");

    expect(tmdbRepository.getMultipleDetails).toHaveBeenCalledWith([2]);
    expect(createEntitiesSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([existingEntity, createdEntity]);
  });

  it("baseSearch should throw when TMDB search fails", async () => {
    const { sut, tmdbRepository } = makeSut();
    tmdbRepository.search.mockRejectedValue(new Error("tmdb down"));

    await expect(sut.searchPublic("boom")).rejects.toThrow("tmdb down");
  });

  it("baseList should throw when TMDB search fails", async () => {
    const { sut, tmdbRepository, drizzleRepository } = makeSut();
    tmdbRepository.search.mockRejectedValue(new Error("tmdb unavailable"));

    await expect(
      sut.listPublic(
        "my-title",
        undefined,
        undefined,
        true,
        false,
        false,
        false,
        false,
        { page: 1, limit: 10 }
      )
    ).rejects.toThrow("tmdb unavailable");
    expect(drizzleRepository.list).not.toHaveBeenCalled();
  });

  it("baseList should use discover when title is undefined", async () => {
    const { sut, tmdbRepository, drizzleRepository } = makeSut();
    const entity = makeEntity(22);
    tmdbRepository.discover.mockResolvedValue({
      ids: [22],
      results: [],
      total: 1,
    });
    drizzleRepository.getByTmdbIds.mockResolvedValue([entity]);
    drizzleRepository.getCount.mockResolvedValue(1);

    const result = await sut.listPublic(
      undefined,
      undefined,
      undefined,
      true,
      true,
      true,
      true,
      true,
      { page: 1, limit: 10 }
    );

    expect(tmdbRepository.discover).toHaveBeenCalledWith({
      page: 1,
      withCategories: [],
    });
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it("baseList should use search when title is provided", async () => {
    const { sut, tmdbRepository, drizzleRepository } = makeSut();
    const entity = makeEntity(33);
    tmdbRepository.search.mockResolvedValue({
      ids: [33],
      results: [],
      total: 1,
    });
    drizzleRepository.getByTmdbIds.mockResolvedValue([entity]);
    drizzleRepository.getCount.mockResolvedValue(1);

    const result = await sut.listPublic(
      "matrix",
      undefined,
      undefined,
      true,
      false,
      false,
      false,
      false,
      { page: 2, limit: 10 }
    );

    expect(tmdbRepository.search).toHaveBeenCalledWith({
      query: "matrix",
      page: 2,
      withCategories: [],
    });
    expect(result.data).toEqual([entity]);
  });

  it("baseList should return empty result when TMDB ids are empty", async () => {
    const { sut, tmdbRepository, drizzleRepository } = makeSut();
    tmdbRepository.search.mockResolvedValue({ ids: [], results: [], total: 0 });

    const result = await sut.listPublic("empty");

    expect(result).toEqual({ data: [], total: 0 });
    expect(drizzleRepository.getByTmdbIds).not.toHaveBeenCalled();
  });

  it("baseList should create missing entities and append to existing", async () => {
    const { sut, tmdbRepository, drizzleRepository } = makeSut();
    const existingEntity = makeEntity(40);
    const createdEntity = makeEntity(41);
    const createEntitiesSpy = vi
      .spyOn(
        sut as unknown as {
          createEntitiesWithRelations: (
            ...args: unknown[]
          ) => Promise<FakeEntity[]>;
        },
        "createEntitiesWithRelations"
      )
      .mockResolvedValue([createdEntity]);
    tmdbRepository.search.mockResolvedValue({
      ids: [40, 41],
      results: [],
      total: 2,
    });
    tmdbRepository.getMultipleDetails.mockResolvedValue([{ tmdbId: 41 }]);
    drizzleRepository.getByTmdbIds.mockResolvedValue([existingEntity]);
    drizzleRepository.getCount.mockResolvedValue(2);

    const result = await sut.listPublic("with-missing");

    expect(tmdbRepository.getMultipleDetails).toHaveBeenCalledWith([41]);
    expect(createEntitiesSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: [existingEntity, createdEntity], total: 2 });
  });
});
