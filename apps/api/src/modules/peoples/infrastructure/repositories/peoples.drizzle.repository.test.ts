import { beforeEach, describe, expect, it, vi } from "vitest";
import { PeoplesDrizzleRepository } from "./peoples.drizzle.repository.js";

function makeChainedBuilder(rows: unknown[]) {
  const b = {
    where: vi.fn(function (this: typeof b) {
      return b;
    }),
    limit: vi.fn(function (this: typeof b) {
      return b;
    }),
    offset: vi.fn(function (this: typeof b) {
      return b;
    }),
    // biome-ignore lint/suspicious/noThenProperty: mock thenable for awaited drizzle builder
    then: (resolve: (v: unknown) => unknown) => resolve(rows),
  };
  return b;
}

const {
  dbMock,
  findFirstMock,
  insertReturning,
  selectFromMock,
  updateReturning,
} = vi.hoisted(() => {
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const findFirstMock = vi.fn();
  const selectFromMock = vi.fn();

  const dbMock = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: insertReturning })),
    })),
    select: vi.fn(() => ({
      from: selectFromMock,
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({ returning: updateReturning })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
    query: {
      people: {
        findFirst: findFirstMock,
      },
    },
  };

  return {
    dbMock,
    findFirstMock,
    insertReturning,
    selectFromMock,
    updateReturning,
  };
});

vi.mock("../../../../database/index.js", () => ({ db: dbMock }));

describe("PeoplesDrizzleRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const personRow = {
    id: "p1",
    name: "Actor One",
    bio: null,
    photoUrl: null,
    birthDate: null,
    nationality: null,
    tmdbId: 42,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("create retourne une People", async () => {
    const repo = new PeoplesDrizzleRepository();
    insertReturning.mockResolvedValueOnce([personRow]);
    const created = await repo.create({
      name: "Actor One",
      tmdbId: 42,
    } as never);
    expect(created.id).toBe("p1");
    expect(created.tmdbId).toBe(42);
  });

  it("create leve si aucune ligne retournee", async () => {
    const repo = new PeoplesDrizzleRepository();
    insertReturning.mockResolvedValueOnce([]);
    await expect(
      repo.create({ name: "x", tmdbId: 1 } as never)
    ).rejects.toThrow("Person not created");
  });

  it("getById retourne null ou People", async () => {
    const repo = new PeoplesDrizzleRepository();
    findFirstMock.mockResolvedValueOnce(null);
    expect(await repo.getById("p1")).toBeNull();
    findFirstMock.mockResolvedValueOnce(personRow);
    const found = await repo.getById("p1");
    expect(found?.id).toBe("p1");
  });

  it("getByTmdbId retourne null ou People", async () => {
    const repo = new PeoplesDrizzleRepository();
    findFirstMock.mockResolvedValueOnce(null);
    expect(await repo.getByTmdbId(99)).toBeNull();
    findFirstMock.mockResolvedValueOnce(personRow);
    expect((await repo.getByTmdbId(42))?.tmdbId).toBe(42);
  });

  it("findByTmdbIds mappe les lignes", async () => {
    const repo = new PeoplesDrizzleRepository();
    selectFromMock.mockReturnValue({
      where: vi.fn(() => Promise.resolve([personRow])),
    });
    const people = await repo.findByTmdbIds([42]);
    expect(people).toHaveLength(1);
    expect(people[0]?.tmdbId).toBe(42);
  });

  it("list retourne data et total (deux requetes)", async () => {
    const repo = new PeoplesDrizzleRepository();
    selectFromMock
      .mockReturnValueOnce(makeChainedBuilder([personRow]))
      .mockReturnValueOnce(makeChainedBuilder([personRow, personRow]));
    const result = await repo.list({});
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(2);
  });

  it("checkExistsByTmdbIds indique les ids presents", async () => {
    const repo = new PeoplesDrizzleRepository();
    selectFromMock
      .mockReturnValueOnce(makeChainedBuilder([personRow]))
      .mockReturnValueOnce(makeChainedBuilder([personRow, personRow]));
    const status = await repo.checkExistsByTmdbIds([42, 99] as const);
    expect(status[42]).toBe(true);
    expect(status[99]).toBe(false);
  });

  it("update retourne la personne mise a jour", async () => {
    const repo = new PeoplesDrizzleRepository();
    updateReturning.mockResolvedValueOnce([{ ...personRow, name: "Updated" }]);
    const updated = await repo.update("p1", { name: "Updated" });
    expect(updated.name).toBe("Updated");
  });

  it("update leve si aucune ligne", async () => {
    const repo = new PeoplesDrizzleRepository();
    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.update("missing", { name: "x" })).rejects.toThrow(
      "Person not found or not updated"
    );
  });

  it("delete appelle db.delete", async () => {
    const repo = new PeoplesDrizzleRepository();
    await repo.delete("p1");
    expect(dbMock.delete).toHaveBeenCalled();
  });

  it("getCount retourne la longueur du resultat", async () => {
    const repo = new PeoplesDrizzleRepository();
    selectFromMock.mockReturnValueOnce(
      makeChainedBuilder([personRow, personRow])
    );
    await expect(repo.getCount()).resolves.toBe(2);
  });

  it("bulkCreate retourne [] si liste vide", async () => {
    const repo = new PeoplesDrizzleRepository();
    await expect(repo.bulkCreate([])).resolves.toEqual([]);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("bulkCreate insere et mappe", async () => {
    const repo = new PeoplesDrizzleRepository();
    insertReturning.mockResolvedValueOnce([personRow]);
    const created = await repo.bulkCreate([{ name: "A", tmdbId: 1 } as never]);
    expect(created).toHaveLength(1);
  });

  it("getByIds retourne [] si ids vide", async () => {
    const repo = new PeoplesDrizzleRepository();
    await expect(repo.getByIds([])).resolves.toEqual([]);
  });

  it("getByIds selectionne par ids", async () => {
    const repo = new PeoplesDrizzleRepository();
    selectFromMock.mockReturnValue({
      where: vi.fn(() => Promise.resolve([personRow])),
    });
    const people = await repo.getByIds(["p1"]);
    expect(people).toHaveLength(1);
  });
});
