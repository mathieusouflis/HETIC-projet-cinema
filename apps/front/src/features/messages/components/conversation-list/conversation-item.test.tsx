import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: (props: { children: unknown }) => props.children,
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: "Avatar",
  AvatarImage: "AvatarImage",
  AvatarFallback: "AvatarFallback",
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(" "),
}));

import type { Conversation } from "../../types";
import { ConversationItem } from "./conversation-item";

function findInTree(
  node: unknown,
  predicate: (n: unknown) => boolean
): boolean {
  if (predicate(node)) {
    return true;
  }
  if (!node || typeof node !== "object") {
    return false;
  }
  const el = node as { props?: { children?: unknown } };
  const children = el.props?.children;
  if (!children) {
    return false;
  }
  if (Array.isArray(children)) {
    return children.some((c) => findInTree(c, predicate));
  }
  return findInTree(children, predicate);
}

function containsText(node: unknown, text: string): boolean {
  return findInTree(node, (n) => {
    if (typeof n === "string") {
      return n.includes(text);
    }
    if (typeof n === "number") {
      return String(n).includes(text);
    }
    return false;
  });
}

const baseConversation: Conversation = {
  id: "conv-1",
  type: "direct",
  name: null,
  avatarUrl: null,
  createdBy: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T12:00:00.000Z",
  otherParticipant: {
    id: "user-other",
    username: "alice",
    avatarUrl: null,
  },
  lastMessage: {
    id: "msg-1",
    content: "Hey there!",
    isDeleted: false,
    createdAt: "2024-01-01T12:00:00.000Z",
    authorId: "user-other",
  },
  unreadCount: 0,
};

const baseLastMessage = baseConversation.lastMessage!;

function renderConversationItem({
  conversation = baseConversation,
  typingUsers = [],
  isActive = false,
  onClick = vi.fn(),
}: {
  conversation?: Conversation;
  typingUsers?: string[];
  isActive?: boolean;
  onClick?: () => void;
} = {}) {
  return ConversationItem({
    conversation,
    typingUsers,
    isActive,
    onClick,
  });
}

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    ...baseConversation,
    ...overrides,
  };
}

function makeLastMessage(
  overrides: Partial<NonNullable<Conversation["lastMessage"]>> = {}
): NonNullable<Conversation["lastMessage"]> {
  return {
    ...baseLastMessage,
    ...overrides,
  };
}

function expectFormattedLastMessageDate({
  now,
  createdAt,
  expected,
}: {
  now: string;
  createdAt: string;
  expected: string;
}) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(now));

  const conversation = makeConversation({
    lastMessage: makeLastMessage({ createdAt }),
  });

  const el = renderConversationItem({ conversation });
  expect(containsText(el, expected)).toBe(true);
}

describe("ConversationItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the last message preview when no one is typing", () => {
    const el = renderConversationItem();
    expect(containsText(el, "Hey there!")).toBe(true);
  });

  it("replaces last message preview with typing indicator when typingUsers is non-empty", () => {
    const el = renderConversationItem({ typingUsers: ["alice"] });
    expect(containsText(el, "writing")).toBe(true);
    expect(containsText(el, "Hey there!")).toBe(false);
  });

  it("renders the participant name", () => {
    const el = renderConversationItem();
    expect(containsText(el, "alice")).toBe(true);
  });

  it("renders an unread badge when unreadCount > 0", () => {
    const conversation = makeConversation({ unreadCount: 3 });
    const el = renderConversationItem({ conversation });
    expect(containsText(el, "3")).toBe(true);
  });

  it("does NOT render an unread badge when unreadCount === 0", () => {
    const el = renderConversationItem();
    const hasBadge = findInTree(el, (n) => {
      if (!n || typeof n !== "object") {
        return false;
      }
      const el2 = n as { props?: { className?: string; children?: unknown } };
      return (
        !!el2.props?.className?.includes("rounded-full") &&
        el2.props?.children === 0
      );
    });
    expect(hasBadge).toBe(false);
  });

  it("renders AvatarImage when avatarUrl is set", () => {
    const conversation = makeConversation({
      otherParticipant: {
        ...baseConversation.otherParticipant,
        avatarUrl: "https://example.com/a.png",
      },
    });

    const el = renderConversationItem({ conversation });

    expect(
      findInTree(el, (n) => {
        if (!n || typeof n !== "object") {
          return false;
        }
        const o = n as { type?: unknown; props?: { src?: string } };
        return (
          o.type === "AvatarImage" ||
          o.props?.src === "https://example.com/a.png"
        );
      })
    ).toBe(true);
  });

  it("shows deleted message placeholder when isDeleted", () => {
    const conversation = makeConversation({
      lastMessage: makeLastMessage({
        isDeleted: true,
        content: "secret",
      }),
    });

    const el = renderConversationItem({ conversation });
    expect(containsText(el, "Message deleted")).toBe(true);
  });

  it("caps unread badge at 99+", () => {
    const conversation = makeConversation({ unreadCount: 120 });
    const el = renderConversationItem({ conversation });
    expect(containsText(el, "99+")).toBe(true);
  });

  it("formats recent lastMessage as time (same calendar day window)", () => {
    const createdAt = "2025-06-10T14:30:00.000Z";
    const expected = new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    expectFormattedLastMessageDate({
      now: "2025-06-10T15:00:00.000Z",
      createdAt,
      expected,
    });
  });

  it("formats lastMessage within the week as weekday", () => {
    const createdAt = "2025-06-05T12:00:00.000Z";
    const expected = new Date(createdAt).toLocaleDateString([], {
      weekday: "short",
    });

    expectFormattedLastMessageDate({
      now: "2025-06-10T12:00:00.000Z",
      createdAt,
      expected,
    });
  });

  it("formats older lastMessage as short date", () => {
    const createdAt = "2025-01-01T12:00:00.000Z";
    const expected = new Date(createdAt).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

    expectFormattedLastMessageDate({
      now: "2025-06-10T12:00:00.000Z",
      createdAt,
      expected,
    });
  });
});
