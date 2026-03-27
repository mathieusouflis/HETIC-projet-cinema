// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/api-sdk", () => ({
  gETConversations: vi.fn(),
  gETConversationsId: vi.fn(),
  pOSTConversations: vi.fn(),
  pOSTConversationsIdRead: vi.fn(),
}));

const setQueryDataMock = vi.fn();
const invalidateQueriesMock = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((config) => config),
  useMutation: vi.fn((config) => config),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: invalidateQueriesMock,
    setQueryData: setQueryDataMock,
  })),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useRef: (val: unknown) => ({ current: val }) };
});

vi.mock("@/features/auth/stores/auth.store", () => ({
  useAuth: Object.assign(() => ({ user: { id: "u1" } }), {
    getState: () => ({ user: { id: "u1" } }),
  }),
}));

import * as sdk from "@packages/api-sdk";
import {
  conversationService,
  queryConversationService,
  toConversation,
} from "./index";

describe("conversationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps conversation payload", () => {
    const mapped = toConversation({
      id: "c1",
      name: "chat",
      avatarUrl: null,
      createdBy: null,
      createdAt: null,
      updatedAt: null,
      otherParticipant: { id: "u2", username: "bob", avatarUrl: null },
      lastMessage: null,
      unreadCount: 0,
    } as never);
    expect(mapped.id).toBe("c1");
    expect(mapped.otherParticipant.username).toBe("bob");
  });

  it("calls imperative endpoints", async () => {
    vi.mocked(sdk.gETConversations).mockResolvedValue({
      data: {
        data: [
          {
            id: "c1",
            otherParticipant: { id: "u2", username: "b" },
            unreadCount: 0,
          },
        ],
      },
    } as never);
    vi.mocked(sdk.gETConversationsId).mockResolvedValue({
      data: {
        data: {
          id: "c1",
          otherParticipant: { id: "u2", username: "b" },
          unreadCount: 0,
        },
      },
    } as never);
    vi.mocked(sdk.pOSTConversations).mockResolvedValue({
      data: { data: { id: "c-new" } },
    } as never);
    vi.mocked(sdk.pOSTConversationsIdRead).mockResolvedValue({} as never);

    await expect(conversationService.list()).resolves.toHaveLength(1);
    await expect(conversationService.get("c1")).resolves.toMatchObject({
      id: "c1",
    });
    await expect(conversationService.create("u2")).resolves.toEqual({
      id: "c-new",
    });
    await expect(conversationService.markRead("c1")).resolves.toBeUndefined();
  });

  it("builds query wrappers", () => {
    const listQuery = queryConversationService.list();
    const getQuery = queryConversationService.get("c1");
    const createMutation = queryConversationService.create();
    const readMutation = queryConversationService.markRead();

    expect(listQuery.enabled).toBe(true);
    expect(getQuery.enabled).toBe(true);
    expect(createMutation.mutationFn).toBeDefined();
    expect(readMutation.mutationFn).toBeDefined();
  });

  it("executes mutation callbacks", async () => {
    vi.mocked(sdk.pOSTConversations).mockResolvedValue({
      data: { data: { id: "created" } },
    } as never);
    vi.mocked(sdk.pOSTConversationsIdRead).mockResolvedValue({} as never);

    const createMutation = queryConversationService.create();
    await expect(createMutation.mutationFn("u9")).resolves.toEqual({
      id: "created",
    });
    createMutation.onSuccess?.();
    expect(invalidateQueriesMock).toHaveBeenCalled();

    const readMutation = queryConversationService.markRead();
    await expect(readMutation.mutationFn("c1")).resolves.toBeUndefined();
    readMutation.onSuccess?.(undefined, "c1");
    expect(setQueryDataMock).toHaveBeenCalled();
  });
});
