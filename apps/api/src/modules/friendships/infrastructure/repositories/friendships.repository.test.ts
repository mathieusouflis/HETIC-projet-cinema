import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServerError } from "../../../../shared/errors/server-error.js";
import { FriendshipsRepository } from "./friendships.repository.js";

const friendshipRow = {
  id: "f1",
  userId: "u1",
  friendId: "u2",
  status: "pending" as const,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
};

const userRow = {
  id: "u1",
  email: "a@b.com",
  username: "a",
  passwordHash: "h",
  displayName: "A",
  avatarUrl: null,
  bio: null,
  oauthProvider: null,
  oauthId: null,
  theme: "dark",
  language: "fr",
  emailNotifications: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  lastLoginAt: null,
  emailVerifiedAt: null,
};

const { dbMock, findFirst, findMany, insertReturning, updateReturning } =
  vi.hoisted(() => {
    const insertReturning = vi.fn();
    const updateReturning = vi.fn();
    const findFirst = vi.fn();
    const findMany = vi.fn();

    const dbMock = {
      insert: vi.fn(() => ({
        values: vi.fn(() => ({ returning: insertReturning })),
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
        friendships: {
          findFirst,
          findMany,
        },
      },
    };

    return { dbMock, findFirst, findMany, insertReturning, updateReturning };
  });

vi.mock("../../../../database/index.js", () => ({ db: dbMock }));

describe("FriendshipsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create retourne une Friendship", async () => {
    insertReturning.mockResolvedValueOnce([friendshipRow]);
    const repo = new FriendshipsRepository();
    const f = await repo.create("u1", "u2");
    expect(f.id).toBe("f1");
  });

  it("create leve ServerError si insert vide", async () => {
    insertReturning.mockResolvedValueOnce([]);
    const repo = new FriendshipsRepository();
    await expect(repo.create("u1", "u2")).rejects.toBeInstanceOf(ServerError);
  });

  it("update retourne la friendship", async () => {
    updateReturning.mockResolvedValueOnce([
      { ...friendshipRow, status: "accepted" },
    ]);
    const repo = new FriendshipsRepository();
    const f = await repo.update("f1", "accepted");
    expect(f.status).toBe("accepted");
  });

  it("delete appelle db.delete", async () => {
    const repo = new FriendshipsRepository();
    await repo.delete("f1");
    expect(dbMock.delete).toHaveBeenCalled();
  });

  it("findById retourne null ou une entite", async () => {
    const repo = new FriendshipsRepository();
    findFirst.mockResolvedValueOnce(null);
    await expect(repo.findById("f1")).resolves.toBeNull();
    findFirst.mockResolvedValueOnce(friendshipRow);
    await expect(repo.findById("f1")).resolves.toMatchObject({ id: "f1" });
  });

  it("findByUserAndFriend delegue a findFirst", async () => {
    findFirst.mockResolvedValueOnce(friendshipRow);
    const repo = new FriendshipsRepository();
    await expect(repo.findByUserAndFriend("u1", "u2")).resolves.toMatchObject({
      id: "f1",
    });
  });

  it("findAccepted delegue a findFirst", async () => {
    findFirst.mockResolvedValueOnce(friendshipRow);
    const repo = new FriendshipsRepository();
    await expect(repo.findAccepted("u1", "u2")).resolves.toMatchObject({
      id: "f1",
    });
  });

  it("findAllForUser avec ou sans statut", async () => {
    findMany.mockResolvedValueOnce([friendshipRow]);
    const repo = new FriendshipsRepository();
    const all = await repo.findAllForUser("u1");
    expect(all).toHaveLength(1);

    findMany.mockResolvedValueOnce([friendshipRow]);
    const filtered = await repo.findAllForUser("u1", "accepted");
    expect(filtered).toHaveLength(1);
  });

  it("getFollowers mappe les users", async () => {
    findMany.mockResolvedValueOnce([{ user_userId: userRow }]);
    const repo = new FriendshipsRepository();
    const users = await repo.getFollowers("u2");
    expect(users).toHaveLength(1);
    expect(users[0]?.id).toBe("u1");
  });

  it("getFollowing mappe les users", async () => {
    findMany.mockResolvedValueOnce([
      { user_friendId: { ...userRow, id: "u2" } },
    ]);
    const repo = new FriendshipsRepository();
    const users = await repo.getFollowing("u1");
    expect(users[0]?.id).toBe("u2");
  });
});
