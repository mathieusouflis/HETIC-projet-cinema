import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/errors/index.js";
import { MessageRepository } from "./message.repository.js";

const {
  dbMock,
  findFirstMock,
  findManyMock,
  insertReturning,
  updateReturning,
} = vi.hoisted(() => {
  const findFirstMock = vi.fn();
  const findManyMock = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();

  const dbMock = {
    query: {
      messages: {
        findFirst: findFirstMock,
        findMany: findManyMock,
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: insertReturning })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({ returning: updateReturning })),
      })),
    })),
  };

  return {
    dbMock,
    findFirstMock,
    findManyMock,
    insertReturning,
    updateReturning,
  };
});

vi.mock("../../../../database/index.js", () => ({ db: dbMock }));

describe("MessageRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findByConversation pagine et calcule nextCursor", async () => {
    const repo = new MessageRepository();
    findManyMock.mockResolvedValueOnce([
      {
        id: "m1",
        conversationId: "c1",
        userId: "u1",
        content: "a",
        type: "text",
        deletedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "m2",
        conversationId: "c1",
        userId: "u1",
        content: "b",
        type: "text",
        deletedAt: null,
        createdAt: "2024-01-01T00:01:00.000Z",
        updatedAt: "2024-01-01T00:01:00.000Z",
      },
    ]);

    const page = await repo.findByConversation("c1", undefined, 1);
    expect(page.items).toHaveLength(1);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe("m1");
  });

  it("findByConversation avec cursor interroge d'abord findFirst", async () => {
    const repo = new MessageRepository();
    findFirstMock.mockResolvedValueOnce({
      id: "cursor",
      createdAt: "2024-01-02T00:00:00.000Z",
    });
    findManyMock.mockResolvedValueOnce([]);
    await repo.findByConversation("c1", "cursor", 10);
    expect(findFirstMock).toHaveBeenCalledTimes(1);
    expect(findManyMock).toHaveBeenCalledTimes(1);
  });

  it("findById retourne null puis un message", async () => {
    const repo = new MessageRepository();
    findFirstMock.mockResolvedValueOnce(null);
    await expect(repo.findById("m1")).resolves.toBeNull();

    findFirstMock.mockResolvedValueOnce({
      id: "m1",
      conversationId: "c1",
      userId: "u1",
      content: "hi",
      type: "text",
      deletedAt: null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    const msg = await repo.findById("m1");
    expect(msg?.id).toBe("m1");
  });

  it("create, update et softDelete", async () => {
    const repo = new MessageRepository();

    insertReturning.mockResolvedValueOnce([
      {
        id: "m1",
        conversationId: "c1",
        userId: "u1",
        content: "hello",
        type: "text",
        deletedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const created = await repo.create({
      conversationId: "c1",
      userId: "u1",
      content: "hello",
    });
    expect(created.id).toBe("m1");

    updateReturning.mockResolvedValueOnce([
      {
        id: "m1",
        conversationId: "c1",
        userId: "u1",
        content: "edited",
        type: "text",
        deletedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const updated = await repo.update("m1", "edited");
    expect(updated.content).toBe("edited");

    updateReturning.mockResolvedValueOnce([
      {
        id: "m1",
        conversationId: "c1",
        userId: "u1",
        content: "edited",
        type: "text",
        deletedAt: "2024-01-01T00:00:00.000Z",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const deleted = await repo.softDelete("m1");
    expect(deleted.id).toBe("m1");
  });

  it("update/softDelete throw NotFoundError when row missing", async () => {
    const repo = new MessageRepository();
    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.update("missing", "x")).rejects.toBeInstanceOf(
      NotFoundError
    );
    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.softDelete("missing")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
