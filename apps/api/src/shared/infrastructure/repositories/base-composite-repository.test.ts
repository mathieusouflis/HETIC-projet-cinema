import { beforeEach, describe, expect, it, vi } from "vitest";

const { loggerMock } = vi.hoisted(() => ({
  loggerMock: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@packages/logger", () => ({
  logger: loggerMock,
}));

const {
  categoryRepoMock,
  platformRepoMock,
  peoplesRepoMock,
  seasonsRepoMock,
  episodesRepoMock,
} = vi.hoisted(() => ({
  categoryRepoMock: {
    findById: vi.fn(),
    findByTmdbIds: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
  },
  platformRepoMock: {
    findByTmdbIds: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
  },
  peoplesRepoMock: {
    getByTMDBIds: vi.fn(),
    create: vi.fn(),
  },
  seasonsRepoMock: {
    getByTmdbId: vi.fn(),
    createSeason: vi.fn(),
  },
  episodesRepoMock: {
    getByTmdbId: vi.fn(),
    createEpisode: vi.fn(),
  },
}));

vi.mock(
  "../../../modules/categories/infrastructure/database/repositories/category/category.repository",
  () => {
    class CategoryRepository {
      findById = categoryRepoMock.findById;
      findByTmdbIds = categoryRepoMock.findByTmdbIds;
      findBySlug = categoryRepoMock.findBySlug;
      create = categoryRepoMock.create;
    }
    return { CategoryRepository };
  }
);

vi.mock(
  "../../../modules/platforms/infrastructure/database/platforms.repository",
  () => {
    class PlatformsRepository {
      findByTmdbIds = platformRepoMock.findByTmdbIds;
      findBySlug = platformRepoMock.findBySlug;
      create = platformRepoMock.create;
    }
    return { PlatformsRepository };
  }
);

vi.mock(
  "../../../modules/peoples/infrastructure/repositories/peoples.repository",
  () => {
    class PeoplesRepository {
      getByTMDBIds = peoplesRepoMock.getByTMDBIds;
      create = peoplesRepoMock.create;
    }
    return { PeoplesRepository };
  }
);

vi.mock(
  "../../../modules/seasons/infrastructure/database/seasons.database.repository",
  () => {
    class SeasonsDatabaseRepository {
      getByTmdbId = seasonsRepoMock.getByTmdbId;
      createSeason = seasonsRepoMock.createSeason;
    }
    return { SeasonsDatabaseRepository };
  }
);

vi.mock(
  "../../../modules/episodes/infrastructure/database/episodes.database.repository",
  () => {
    class EpisodesDatabaseRepository {
      getByTmdbId = episodesRepoMock.getByTmdbId;
      createEpisode = episodesRepoMock.createEpisode;
    }
    return { EpisodesDatabaseRepository };
  }
);

import {
  BaseCompositeRepository,
  CacheManager,
} from "./base-composite-repository.js";

type FakeEntity = {
  id: string;
  tmdbId?: number | null;
  removeRelations: (key: string) => void;
};

function entity(id: string, tmdbId: number): FakeEntity {
  return { id, tmdbId, removeRelations: vi.fn() };
}

describe("BaseCompositeRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("baseSearch retourne [] quand TMDB renvoie aucun id", async () => {
    const tmdbRepo = {
      search: vi.fn().mockResolvedValue({ ids: [], results: [], total: 0 }),
      getMultipleDetails: vi.fn(),
    };
    const drizzleRepo = {
      contentType: "movie",
      getByTmdbIds: vi.fn(),
    };

    class Repo extends BaseCompositeRepository<any, any, any, any, any> {
      protected readonly entityType = "x";
      constructor() {
        super(tmdbRepo as never, drizzleRepo as never);
      }
    }

    const repo = new Repo() as any;
    const out = await repo.baseSearch("q", { page: 1 });
    expect(out).toEqual([]);
    expect(drizzleRepo.getByTmdbIds).not.toHaveBeenCalled();
  });

  it("baseSearch retire les relations quand options sont false", async () => {
    const e = entity("e1", 1);
    const tmdbRepo = {
      search: vi.fn().mockResolvedValue({ ids: [1], results: [], total: 1 }),
      getMultipleDetails: vi.fn(),
    };
    const drizzleRepo = {
      contentType: "movie",
      getByTmdbIds: vi.fn().mockResolvedValue([e]),
    };

    class Repo extends BaseCompositeRepository<any, any, any, any, any> {
      protected readonly entityType = "x";
      constructor() {
        super(tmdbRepo as never, drizzleRepo as never);
      }
    }

    const repo = new Repo() as any;
    const out = await repo.baseSearch("q", {
      withCategories: false,
      withPlatforms: false,
      withCast: false,
      withSeasons: false,
    });
    expect(out).toHaveLength(1);
    expect(e.removeRelations).toHaveBeenCalledWith("contentCategories");
    expect(e.removeRelations).toHaveBeenCalledWith("contentPlatforms");
    expect(e.removeRelations).toHaveBeenCalledWith("contentCredits");
    expect(e.removeRelations).toHaveBeenCalledWith("seasons");
  });

  it("baseList retourne vide si TMDB ids est vide (title vs discover branches)", async () => {
    const tmdbRepo = {
      search: vi.fn().mockResolvedValue({ ids: [], results: [], total: 0 }),
      discover: vi.fn().mockResolvedValue({ ids: [], results: [], total: 0 }),
      getMultipleDetails: vi.fn(),
    };
    const drizzleRepo = {
      contentType: "movie",
      getByTmdbIds: vi.fn(),
      getCount: vi.fn().mockResolvedValue(0),
    };

    class Repo extends BaseCompositeRepository<any, any, any, any, any> {
      protected readonly entityType = "x";
      constructor() {
        super(tmdbRepo as never, drizzleRepo as never);
      }
    }

    const repo = new Repo() as any;
    await expect(
      repo.baseList("t", undefined, [], true, true, true, true, true, {
        page: 2,
      })
    ).resolves.toEqual({ data: [], total: 0 });
    expect(tmdbRepo.search).toHaveBeenCalled();

    await expect(
      repo.baseList(undefined, undefined, [], true, true, true, true, true, {
        page: 1,
      })
    ).resolves.toEqual({ data: [], total: 0 });
    expect(tmdbRepo.discover).toHaveBeenCalled();
  });

  it("ensureCategoriesExist couvre findBySlug, create, et retry", async () => {
    const tmdbRepo = { search: vi.fn() };
    const drizzleRepo = {
      contentType: "movie",
      getByTmdbIds: vi.fn(),
      getCount: vi.fn(),
    };

    class Repo extends BaseCompositeRepository<any, any, any, any, any> {
      protected readonly entityType = "x";
      constructor() {
        super(tmdbRepo as never, drizzleRepo as never);
      }
    }

    const repo = new Repo() as any;

    // findBySlug branch
    categoryRepoMock.findByTmdbIds.mockResolvedValueOnce([]);
    categoryRepoMock.findBySlug.mockResolvedValueOnce({ id: "cat1" });
    await repo.ensureCategoriesExist([{ id: 1, name: "Action" }]);

    // create branch
    categoryRepoMock.findByTmdbIds.mockResolvedValueOnce([]);
    categoryRepoMock.findBySlug.mockResolvedValueOnce(null);
    categoryRepoMock.create.mockResolvedValueOnce({ id: "cat2" });
    await repo.ensureCategoriesExist([{ id: 2, name: "Drama" }]);

    // retry branch
    categoryRepoMock.findByTmdbIds.mockResolvedValueOnce([]);
    categoryRepoMock.findBySlug.mockResolvedValueOnce(null);
    categoryRepoMock.create.mockRejectedValueOnce(new Error("fail"));
    categoryRepoMock.findByTmdbIds.mockResolvedValueOnce([
      { id: "cat3", tmdbId: 3 },
    ]);
    await repo.ensureCategoriesExist([{ id: 3, name: "Comedy" }]);
  });

  it("createEntitiesWithRelations lie genres/providers/cast (cache + link) et relit via getByTmdbIds", async () => {
    categoryRepoMock.findByTmdbIds.mockResolvedValueOnce([
      { id: "cat-db", tmdbId: 7 },
    ]);
    platformRepoMock.findByTmdbIds.mockResolvedValueOnce([
      { toJSON: () => ({ id: "pl-db", tmdbId: 8 }) },
    ]);
    peoplesRepoMock.getByTMDBIds.mockResolvedValueOnce([
      { toJSON: () => ({ id: "p-db", tmdbId: 9 }) },
    ]);

    const drizzleRepo = {
      contentType: "movie",
      create: vi.fn().mockResolvedValue({
        id: "e-db",
        tmdbId: 10,
        removeRelations: vi.fn(),
      }),
      linkCategories: vi.fn(),
      linkProviders: vi.fn(),
      linkCasts: vi.fn(),
      getByTmdbIds: vi
        .fn()
        .mockResolvedValue([
          { id: "e-db", tmdbId: 10, removeRelations: vi.fn() },
        ]),
    };
    const tmdbRepo = { search: vi.fn(), getMultipleDetails: vi.fn() };

    class Repo extends BaseCompositeRepository<any, any, any, any, any> {
      protected readonly entityType = "x";
      constructor() {
        super(tmdbRepo as never, drizzleRepo as never);
      }
    }

    const repo = new Repo() as any;

    await repo.createEntitiesWithRelations([
      {
        tmdbId: 10,
        title: "t",
        type: "movie",
        genres: [{ id: 7, name: "Action" }],
        providers: [{ provider_id: 8, provider_name: "X" }],
        cast: [{ id: 9, cast_id: 9, name: "A" }],
        seasons: [],
      },
    ]);

    expect(drizzleRepo.linkCategories).toHaveBeenCalled();
    expect(drizzleRepo.linkProviders).toHaveBeenCalled();
    expect(drizzleRepo.linkCasts).toHaveBeenCalled();
    expect(drizzleRepo.getByTmdbIds).toHaveBeenCalledWith(
      [10],
      expect.any(Object)
    );
    expect(CacheManager.generateSlug("Hello World")).toBe("hello-world");
  });
});
