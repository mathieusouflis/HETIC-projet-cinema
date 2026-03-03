import { vi } from "vitest";
import { Friendship } from "../entities/friendship.entity.js";
import type { IFriendshipsRepository } from "./IFriendshipsRepository.js";

export const MOCK_USER_A_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const MOCK_USER_B_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
export const MOCK_FRIENDSHIP_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

export const mockPendingFriendship = new Friendship({
  id: MOCK_FRIENDSHIP_ID,
  userId: MOCK_USER_A_ID,
  friendId: MOCK_USER_B_ID,
  status: "pending",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const mockAcceptedFriendship = new Friendship({
  id: MOCK_FRIENDSHIP_ID,
  userId: MOCK_USER_A_ID,
  friendId: MOCK_USER_B_ID,
  status: "accepted",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function createMockedFriendshipsRepository(
  overrides: Partial<IFriendshipsRepository> = {}
): IFriendshipsRepository {
  const defaults: IFriendshipsRepository = {
    create: vi.fn().mockResolvedValue(mockPendingFriendship),
    update: vi.fn().mockResolvedValue(mockAcceptedFriendship),
    delete: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(mockPendingFriendship),
    findByUserAndFriend: vi.fn().mockResolvedValue(null),
    findAccepted: vi.fn().mockResolvedValue(null),
    findAllForUser: vi.fn().mockResolvedValue([]),
    getFollowers: vi.fn().mockResolvedValue([]),
    getFollowing: vi.fn().mockResolvedValue([]),
  };

  return { ...defaults, ...overrides };
}
