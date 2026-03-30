// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

const { setQueryDataMock } = vi.hoisted(() => ({
  setQueryDataMock: vi.fn((_key, updater) =>
    updater({
      pages: [
        {
          items: [
            { id: "m2", conversationId: "c1", userId: "u1", type: "text" },
          ],
        },
      ],
      pageParams: [],
    })
  ),
}));

vi.mock("@packages/api-sdk", () => ({
  gETMessagesConversationsConversationId: vi.fn(),
  pATCHMessagesMessageId: vi.fn(),
  dELETEMessagesMessageId: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: vi.fn((config) => config),
  useMutation: vi.fn((config) => config),
  useQueryClient: vi.fn(() => ({
    setQueryData: setQueryDataMock,
  })),
}));

const emitWithAckMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/socket/socket-client", () => ({
  getSocket: () => ({ emitWithAck: emitWithAckMock }),
}));

import * as sdk from "@packages/api-sdk";
import { messageService, queryMessageService, toMessage } from "./index";

describe("messageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps message payload and imperative methods", async () => {
    expect(
      toMessage({
        id: "m1",
        conversationId: "c1",
        userId: "u1",
        content: "hello",
        type: "text",
        isDeleted: false,
      } as never)
    ).toMatchObject({ id: "m1", content: "hello" });

    vi.mocked(sdk.gETMessagesConversationsConversationId).mockResolvedValue({
      data: { data: { items: [], nextCursor: null, hasMore: false } },
    } as never);
    vi.mocked(sdk.pATCHMessagesMessageId).mockResolvedValue({
      data: {
        data: {
          id: "m1",
          conversationId: "c1",
          userId: "u1",
          type: "text",
          isDeleted: false,
        },
      },
    } as never);
    vi.mocked(sdk.dELETEMessagesMessageId).mockResolvedValue({
      data: {
        data: {
          id: "m1",
          conversationId: "c1",
          userId: "u1",
          type: "text",
          isDeleted: true,
        },
      },
    } as never);

    await expect(messageService.fetchMessages("c1")).resolves.toMatchObject({
      items: [],
      hasMore: false,
    });
    await expect(
      messageService.editMessage("m1", "upd")
    ).resolves.toMatchObject({
      id: "m1",
    });
    await expect(messageService.deleteMessage("m1")).resolves.toMatchObject({
      isDeleted: true,
    });
  });

  it("builds query wrappers", () => {
    const listQuery = queryMessageService.infiniteList("c1");
    const sendMutation = queryMessageService.send("c1");
    const editMutation = queryMessageService.edit();
    const deleteMutation = queryMessageService.delete();

    expect(listQuery.enabled).toBe(true);
    expect(sendMutation.mutationFn).toBeDefined();
    expect(editMutation.mutationFn).toBeDefined();
    expect(deleteMutation.mutationFn).toBeDefined();
    expect(listQuery.getPreviousPageParam({ nextCursor: "n1" })).toBe("n1");
  });

  it("executes send/edit/delete mutation functions", async () => {
    vi.mocked(sdk.pATCHMessagesMessageId).mockResolvedValue({
      data: {
        data: {
          id: "m2",
          conversationId: "c1",
          userId: "u1",
          type: "text",
          isDeleted: false,
        },
      },
    } as never);
    vi.mocked(sdk.dELETEMessagesMessageId).mockResolvedValue({
      data: {
        data: {
          id: "m2",
          conversationId: "c1",
          userId: "u1",
          type: "text",
          isDeleted: true,
        },
      },
    } as never);

    const sendMutation = queryMessageService.send("c1");
    await expect(sendMutation.mutationFn("hello")).resolves.toBeUndefined();
    expect(emitWithAckMock).toHaveBeenCalled();

    const editMutation = queryMessageService.edit();
    const updated = await editMutation.mutationFn({
      messageId: "m2",
      content: "updated",
    });
    expect(updated).toMatchObject({ id: "m2" });
    editMutation.onSuccess?.(updated);
    await expect(
      editMutation.mutationFn({ messageId: "m2", content: "updated" })
    ).resolves.toMatchObject({ id: "m2" });

    const deleteMutation = queryMessageService.delete();
    const tombstone = await deleteMutation.mutationFn("m2");
    expect(tombstone).toMatchObject({
      isDeleted: true,
    });
    deleteMutation.onSuccess?.(tombstone);
  });

  it("edit onSuccess is a no-op when the infinite query cache is missing", async () => {
    vi.mocked(sdk.pATCHMessagesMessageId).mockResolvedValue({
      data: {
        data: {
          id: "m2",
          conversationId: "c1",
          userId: "u1",
          type: "text",
          isDeleted: false,
        },
      },
    } as never);

    setQueryDataMock.mockImplementationOnce((_key, updater) => {
      expect(updater(undefined)).toBeUndefined();
    });

    const editMutation = queryMessageService.edit();
    const updated = await editMutation.mutationFn({
      messageId: "m2",
      content: "updated",
    });
    editMutation.onSuccess?.(updated);
  });
});
