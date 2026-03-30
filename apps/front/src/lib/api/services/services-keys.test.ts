import { describe, expect, it } from "vitest";
import { contentsKeys } from "./contents/keys";
import { conversationKeys } from "./conversations/keys";
import { friendshipKeys } from "./friendships/keys";
import { categoriesKeys } from "./genres/keys";
import { messageKeys } from "./messages/keys";
import { peoplesKeys } from "./peoples/keys";
import { usersKeys } from "./users/keys";
import { watchlistKeys } from "./watchlists/keys";

describe("services keys", () => {
  it("builds conversation keys", () => {
    expect(conversationKeys.all("u1")).toEqual(["conversations", "u1"]);
    expect(conversationKeys.detail("u1", "c1")).toEqual([
      "conversations",
      "u1",
      "c1",
    ]);
  });

  it("builds contents keys", () => {
    expect(contentsKeys.all()).toEqual(["contents"]);
    expect(contentsKeys.discoverAll()).toEqual(["contents", "discover"]);
    expect(contentsKeys.discover({ page: 1 } as never)).toEqual([
      "contents",
      "discover",
      { page: 1 },
    ]);
    expect(contentsKeys.get("content-1")).toEqual([
      "contents",
      "get",
      "content-1",
      undefined,
    ]);
  });

  it("contents get key includes optional params when provided", () => {
    expect(
      contentsKeys.get("content-1", { withCategory: "true" } as never)
    ).toEqual([
      "contents",
      "get",
      "content-1",
      { withCategory: "true" },
    ]);
  });

  it("builds remaining service keys", () => {
    expect(friendshipKeys.all()).toEqual(["friendships"]);
    expect(friendshipKeys.byStatus("accepted")).toEqual([
      "friendships",
      "accepted",
    ]);
    expect(categoriesKeys.list()).toEqual(["categories", "list", undefined]);
    expect(messageKeys.conversation("conv-1")).toEqual([
      "messages",
      "conversation",
      "conv-1",
    ]);
    expect(peoplesKeys.search({ query: "john" } as never)).toEqual([
      "peoples",
      "search",
      { query: "john" },
    ]);
    expect(usersKeys.me()).toEqual(["users", "me"]);
    expect(usersKeys.getId("u-1")).toEqual(["users", "get", "u-1"]);
    expect(watchlistKeys.all("u1")).toEqual(["watchlists", "u1"]);
    expect(watchlistKeys.getId("u1", "c1")).toEqual([
      "watchlists",
      "u1",
      "content",
      "c1",
    ]);
  });
});
