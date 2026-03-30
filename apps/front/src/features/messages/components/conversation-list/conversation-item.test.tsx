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

describe("ConversationItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T14:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the last message preview when no one is typing", () => {
    const el = ConversationItem({
      conversation: baseConversation,
      typingUsers: [],
      isActive: false,
      onClick: vi.fn(),
    });
    expect(containsText(el, "Hey there!")).toBe(true);
  });

  it("replaces last message preview with typing indicator when typingUsers is non-empty", () => {
    const el = ConversationItem({
      conversation: baseConversation,
      typingUsers: ["alice"],
      isActive: false,
      onClick: vi.fn(),
    });
    expect(containsText(el, "writing")).toBe(true);
    expect(containsText(el, "Hey there!")).toBe(false);
  });

  it("renders the participant name", () => {
    const el = ConversationItem({
      conversation: baseConversation,
      typingUsers: [],
      isActive: false,
      onClick: vi.fn(),
    });
    expect(containsText(el, "alice")).toBe(true);
  });

  it("renders an unread badge when unreadCount > 0", () => {
    const conversation = { ...baseConversation, unreadCount: 3 };
    const el = ConversationItem({
      conversation,
      typingUsers: [],
      isActive: false,
      onClick: vi.fn(),
    });
    expect(containsText(el, "3")).toBe(true);
  });

  it("does NOT render an unread badge when unreadCount === 0", () => {
    const el = ConversationItem({
      conversation: baseConversation, // unreadCount: 0
      typingUsers: [],
      isActive: false,
      onClick: vi.fn(),
    });
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

  it("shows Message deleted when lastMessage.isDeleted is true", () => {
    const conversation: Conversation = {
      ...baseConversation,
      lastMessage: {
        ...baseConversation.lastMessage!,
        content: "gone",
        isDeleted: true,
      },
    };
    const el = ConversationItem({
      conversation,
      typingUsers: [],
      isActive: false,
      onClick: vi.fn(),
    });
    expect(containsText(el, "Message deleted")).toBe(true);
  });

  it("caps unread badge at 99+", () => {
    const conversation = { ...baseConversation, unreadCount: 150 };
    const el = ConversationItem({
      conversation,
      typingUsers: [],
      isActive: false,
      onClick: vi.fn(),
    });
    expect(containsText(el, "99+")).toBe(true);
  });

  it("renders avatar image when avatarUrl is set", () => {
    const conversation: Conversation = {
      ...baseConversation,
      otherParticipant: {
        ...baseConversation.otherParticipant,
        avatarUrl: "https://example.com/a.png",
      },
    };
    const el = ConversationItem({
      conversation,
      typingUsers: [],
      isActive: false,
      onClick: vi.fn(),
    });
    const hasImg = findInTree(el, (n) => {
      if (!n || typeof n !== "object") {
        return false;
      }
      const p = (n as { props?: { src?: string } }).props;
      return p?.src === "https://example.com/a.png";
    });
    expect(hasImg).toBe(true);
  });

  it("formatTimestamp uses toLocaleDateString for non-same-day messages (weekday and month branches)", () => {
    const spy = vi
      .spyOn(Date.prototype, "toLocaleDateString")
      .mockReturnValue("MOCK-DATE");
    try {
      const withinWeek: Conversation = {
        ...baseConversation,
        lastMessage: {
          ...baseConversation.lastMessage!,
          createdAt: "2024-06-10T10:30:00.000Z",
        },
      };
      ConversationItem({
        conversation: withinWeek,
        typingUsers: [],
        isActive: false,
        onClick: vi.fn(),
      });

      const older: Conversation = {
        ...baseConversation,
        lastMessage: {
          ...baseConversation.lastMessage!,
          createdAt: "2024-01-05T10:30:00.000Z",
        },
      };
      ConversationItem({
        conversation: older,
        typingUsers: [],
        isActive: false,
        onClick: vi.fn(),
      });

      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
    } finally {
      spy.mockRestore();
    }
  });

  it("renders an empty preview when lastMessage is null and nobody is typing", () => {
    const conversation = { ...baseConversation, lastMessage: null };
    const el = ConversationItem({
      conversation,
      typingUsers: [],
      isActive: false,
      onClick: vi.fn(),
    });
    expect(containsText(el, "Hey there!")).toBe(false);
  });
});
