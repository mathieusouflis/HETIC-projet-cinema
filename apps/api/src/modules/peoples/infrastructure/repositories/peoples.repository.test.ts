import { beforeEach, describe, expect, it, vi } from "vitest";
import { People } from "../../domain/entities/people.entity.js";
import { PeoplesRepository } from "./peoples.repository.js";

const personRow = {
  id: "p1",
  name: "Actor",
  bio: null,
  photoUrl: null,
  birthDate: null,
  nationality: null,
  tmdbId: 42,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const tmdbPayload = {
  name: "From TMDB",
  bio: null,
  photoUrl: null,
  birthDate: null,
  nationality: null,
  tmdbId: 99,
};

const { MockDrizzle, MockTmdb, drizzle, tmdb } = vi.hoisted(() => {
  const drizzle = {
    checkExistsByTmdbIds: vi.fn(),
    list: vi.fn(),
    bulkCreate: vi.fn(),
    create: vi.fn(),
    getByTmdbId: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getCount: vi.fn(),
    findByTmdbIds: vi.fn(),
  };

  const tmdb = {
    searchPeople: vi.fn(),
    getPersonById: vi.fn(),
    getPeopleByIds: vi.fn(),
  };

  class MockDrizzle {
    checkExistsByTmdbIds = drizzle.checkExistsByTmdbIds;
    list = drizzle.list;
    bulkCreate = drizzle.bulkCreate;
    create = drizzle.create;
    getByTmdbId = drizzle.getByTmdbId;
    getById = drizzle.getById;
    update = drizzle.update;
    delete = drizzle.delete;
    getCount = drizzle.getCount;
    findByTmdbIds = drizzle.findByTmdbIds;
  }

  class MockTmdb {
    searchPeople = tmdb.searchPeople;
    getPersonById = tmdb.getPersonById;
    getPeopleByIds = tmdb.getPeopleByIds;
  }

  return { MockDrizzle, MockTmdb, drizzle, tmdb };
});

vi.mock("./peoples.drizzle.repository.js", () => ({
  PeoplesDrizzleRepository: MockDrizzle,
}));

vi.mock("./peoples.tmdb.repository.js", () => ({
  PeoplesTMDBRepository: MockTmdb,
}));

describe("PeoplesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegue create, getById, list, update, delete, getCount et findByTmdbIds", async () => {
    const repo = new PeoplesRepository();
    const p = new People(personRow);
    drizzle.create.mockResolvedValueOnce(p);
    expect(await repo.create({ name: "A" } as never)).toBe(p);

    drizzle.getById.mockResolvedValueOnce(p);
    expect(await repo.getById("p1")).toBe(p);

    drizzle.list.mockResolvedValueOnce({ data: [p], total: 1 });
    expect(await repo.list({})).toEqual({ data: [p], total: 1 });

    drizzle.update.mockResolvedValueOnce(p);
    expect(await repo.update("p1", { name: "B" })).toBe(p);

    drizzle.delete.mockResolvedValueOnce(undefined);
    await repo.delete("p1");

    drizzle.getCount.mockResolvedValueOnce(3);
    expect(await repo.getCount({ name: "a" })).toBe(3);

    drizzle.findByTmdbIds.mockResolvedValueOnce([p]);
    expect(await repo.getByTMDBIds([42])).toEqual([p]);
  });

  it("searchPeople synchronise les nouvelles personnes TMDB", async () => {
    const repo = new PeoplesRepository();
    tmdb.searchPeople.mockResolvedValueOnce([tmdbPayload]);
    drizzle.checkExistsByTmdbIds.mockResolvedValueOnce({ 99: false } as never);
    const created = new People({ ...personRow, id: "new", tmdbId: 99 });
    drizzle.bulkCreate.mockResolvedValueOnce([created]);
    drizzle.list.mockResolvedValueOnce({ data: [], total: 0 });

    const result = await repo.searchPeople("q", 1);
    expect(result).toHaveLength(1);
    expect(result[0]?.tmdbId).toBe(99);
    expect(drizzle.bulkCreate).toHaveBeenCalledWith([tmdbPayload]);
  });

  it("searchPeople retourne les existants sans bulkCreate", async () => {
    const repo = new PeoplesRepository();
    tmdb.searchPeople.mockResolvedValueOnce([tmdbPayload]);
    drizzle.checkExistsByTmdbIds.mockResolvedValueOnce({ 99: true } as never);
    const existing = new People({ ...personRow, tmdbId: 99 });
    drizzle.list.mockResolvedValueOnce({ data: [existing], total: 1 });

    const result = await repo.searchPeople("q");
    expect(result).toEqual([existing]);
    expect(drizzle.bulkCreate).not.toHaveBeenCalled();
  });

  it("searchPeople avec resultats sans tmdbId retourne vide", async () => {
    const repo = new PeoplesRepository();
    tmdb.searchPeople.mockResolvedValueOnce([
      { ...tmdbPayload, tmdbId: undefined as never },
    ]);
    await expect(repo.searchPeople("q")).resolves.toEqual([]);
  });

  it("getByTmdbId retourne la personne deja en base", async () => {
    const repo = new PeoplesRepository();
    const p = new People(personRow);
    drizzle.getByTmdbId.mockResolvedValueOnce(p);
    await expect(repo.getByTmdbId(42)).resolves.toBe(p);
    expect(tmdb.getPersonById).not.toHaveBeenCalled();
  });

  it("getByTmdbId cree depuis TMDB si absente", async () => {
    const repo = new PeoplesRepository();
    drizzle.getByTmdbId.mockResolvedValueOnce(null);
    tmdb.getPersonById.mockResolvedValueOnce(tmdbPayload);
    const created = new People({ ...personRow, tmdbId: 99 });
    drizzle.create.mockResolvedValueOnce(created);
    await expect(repo.getByTmdbId(99)).resolves.toBe(created);
    expect(drizzle.create).toHaveBeenCalledWith(tmdbPayload);
  });

  it("getByTmdbId retourne null si TMDB ne repond pas", async () => {
    const repo = new PeoplesRepository();
    drizzle.getByTmdbId.mockResolvedValueOnce(null);
    tmdb.getPersonById.mockResolvedValueOnce(null);
    await expect(repo.getByTmdbId(1)).resolves.toBeNull();
  });

  it("getPeopleByTmdbIds retourne tout si deja en base", async () => {
    const repo = new PeoplesRepository();
    const p = new People(personRow);
    drizzle.list.mockResolvedValueOnce({ data: [p], total: 1 });
    await expect(repo.getPeopleByTmdbIds([42])).resolves.toEqual([p]);
    expect(tmdb.getPeopleByIds).not.toHaveBeenCalled();
  });

  it("getPeopleByTmdbIds complete les ids manquants via TMDB", async () => {
    const repo = new PeoplesRepository();
    const existing = new People(personRow);
    drizzle.list.mockResolvedValueOnce({ data: [existing], total: 1 });
    tmdb.getPeopleByIds.mockResolvedValueOnce([tmdbPayload]);
    const created = new People({ ...personRow, id: "n2", tmdbId: 99 });
    drizzle.bulkCreate.mockResolvedValueOnce([created]);

    const result = await repo.getPeopleByTmdbIds([42, 99]);
    expect(result).toHaveLength(2);
    expect(drizzle.bulkCreate).toHaveBeenCalledWith([tmdbPayload]);
  });

  it("getPeopleByTmdbIds retourne [] en cas d erreur", async () => {
    const repo = new PeoplesRepository();
    drizzle.list.mockRejectedValueOnce(new Error("db"));
    await expect(repo.getPeopleByTmdbIds([1])).resolves.toEqual([]);
  });
});
