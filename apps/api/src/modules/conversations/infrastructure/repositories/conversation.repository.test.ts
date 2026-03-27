import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationRepository } from "./conversation.repository.js";

const {
  dbMock,
  findFirstConversationMock,
  findFirstParticipantMock,
  findManyParticipantsMock,
  insertConversationReturning,
  insertValues,
  insertParticipantsValues,
  selectHavingResult,
  selectWhereResult,
  updateWhere,
} = vi.hoisted(() => {
  const findFirstConversationMock = vi.fn();
  const findFirstParticipantMock = vi.fn();
  const findManyParticipantsMock = vi.fn();
  const insertConversationReturning = vi.fn();
  const insertValues = vi.fn();
  const insertParticipantsValues = vi.fn();
  const selectHavingResult = vi.fn();
  const selectWhereResult = vi.fn();
  const updateWhere = vi.fn();

  const dbMock = {
    query: {
      conversationParticipants: {
        findMany: findManyParticipantsMock,
        findFirst: findFirstParticipantMock,
      },
      conversations: {
        findFirst: findFirstConversationMock,
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            // biome-ignore lint/suspicious/noThenProperty: mock thenable for awaited drizzle chain
            then: (resolve: (value: unknown) => unknown) =>
              resolve(selectWhereResult()),
            groupBy: vi.fn(() => ({
              having: selectHavingResult,
              // biome-ignore lint/suspicious/noThenProperty: mock thenable for awaited drizzle chain
              then: (resolve: (value: unknown) => unknown) =>
                resolve(selectWhereResult()),
            })),
          })),
        })),
        where: selectWhereResult,
      })),
    })),
    insert: vi.fn(() => ({ values: insertValues })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({ where: updateWhere })),
    })),
  };

  return {
    dbMock,
    findFirstConversationMock,
    findFirstParticipantMock,
    findManyParticipantsMock,
    insertConversationReturning,
    insertValues,
    insertParticipantsValues,
    selectHavingResult,
    selectWhereResult,
    updateWhere,
  };
});

vi.mock("../../../../database/index.js", () => ({ db: dbMock }));

describe("ConversationRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findById et isParticipant", async () => {
    const repo = new ConversationRepository();

    findFirstConversationMock.mockResolvedValueOnce({
      id: "c1",
      type: "direct",
      createdBy: "u1",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    const conv = await repo.findById("c1");
    expect(conv?.id).toBe("c1");

    findFirstParticipantMock.mockResolvedValueOnce({ id: "cp1" });
    await expect(repo.isParticipant("c1", "u1")).resolves.toBe(true);
    findFirstParticipantMock.mockResolvedValueOnce(null);
    await expect(repo.isParticipant("c1", "u2")).resolves.toBe(false);
  });

  it("create et markAsRead executent les requetes", async () => {
    const repo = new ConversationRepository();

    insertConversationReturning.mockResolvedValueOnce([
      {
        id: "c2",
        type: "direct",
        createdBy: "u1",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    insertValues
      .mockImplementationOnce(() => ({
        returning: insertConversationReturning,
      }))
      .mockImplementationOnce(insertParticipantsValues);
    insertParticipantsValues.mockResolvedValueOnce(undefined);

    const created = await repo.create("u1", ["u1", "u2"]);
    expect(created.id).toBe("c2");
    expect(insertParticipantsValues).toHaveBeenCalled();

    updateWhere.mockResolvedValueOnce(undefined);
    await repo.markAsRead("c2", "u1");
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });

  it("findDirectBetween retourne null puis une conversation", async () => {
    const repo = new ConversationRepository();
    selectHavingResult.mockResolvedValueOnce([]);
    await expect(repo.findDirectBetween("u1", "u2")).resolves.toBeNull();

    selectHavingResult.mockResolvedValueOnce([{ id: "c3" }]);
    findFirstConversationMock.mockResolvedValueOnce({
      id: "c3",
      type: "direct",
      createdBy: "u1",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    const direct = await repo.findDirectBetween("u1", "u2");
    expect(direct?.id).toBe("c3");
  });

  it("findAllForUser et findByIdForUser mappent les metas", async () => {
    const repo = new ConversationRepository();

    findManyParticipantsMock.mockResolvedValueOnce([
      {
        conversation: {
          id: "c1",
          type: "direct",
          createdBy: "u1",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          conversationParticipants: [
            {
              userId: "u1",
              user: { id: "u1", username: "john", avatarUrl: null },
            },
            {
              userId: "u2",
              user: { id: "u2", username: "jane", avatarUrl: null },
            },
          ],
          messages: [
            {
              id: "m1",
              content: "hello",
              deletedAt: null,
              createdAt: "2024-01-01T00:00:00.000Z",
              userId: "u2",
            },
          ],
        },
      },
    ]);
    selectWhereResult.mockResolvedValueOnce([
      { conversationId: "c1", count: 4 },
    ]);

    const all = await repo.findAllForUser("u1");
    expect(all).toHaveLength(1);
    expect((all[0] as any).unreadCount).toBe(4);

    findFirstParticipantMock.mockResolvedValueOnce({
      conversation: {
        id: "c1",
        type: "direct",
        createdBy: "u1",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        conversationParticipants: [
          {
            userId: "u1",
            user: { id: "u1", username: "john", avatarUrl: null },
          },
          {
            userId: "u2",
            user: { id: "u2", username: "jane", avatarUrl: null },
          },
        ],
        messages: [],
      },
    });
    selectWhereResult.mockResolvedValueOnce([{ count: 1 }]);

    const one = await repo.findByIdForUser("c1", "u1");
    expect(one?.id).toBe("c1");
    expect((one as any).unreadCount).toBe(1);
  });
});
