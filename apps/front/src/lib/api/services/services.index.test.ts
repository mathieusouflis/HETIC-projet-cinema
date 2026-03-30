// @ts-nocheck
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((config) => config),
}));

vi.mock("./auth", () => ({ authService: { login: vi.fn() } }));
vi.mock("./contents", () => ({
  contentService: { discover: vi.fn() },
  queryContentService: { discover: vi.fn(), get: vi.fn() },
}));
vi.mock("./conversations", () => ({
  conversationService: { list: vi.fn() },
  queryConversationService: { list: vi.fn() },
}));
vi.mock("./friendships", () => ({
  friendshipService: { list: vi.fn() },
  queryFriendshipService: { list: vi.fn() },
}));
vi.mock("./genres", () => ({ categorieService: { list: vi.fn() } }));
vi.mock("./messages", () => ({
  messageService: { fetchMessages: vi.fn() },
  queryMessageService: { infiniteList: vi.fn() },
}));
vi.mock("./peoples", () => ({ queryPeoplesService: { search: vi.fn() } }));
vi.mock("./users", () => ({
  usersService: { getMe: vi.fn() },
  queryUserService: { getMe: vi.fn() },
}));
vi.mock("./watchlists", () => ({
  watchlistService: { list: vi.fn() },
  queryWatchlistService: { list: vi.fn() },
}));

import { getApi, useApi } from "./index";

describe("services index", () => {
  it("exposes imperative services with getApi", () => {
    const api = getApi();
    expect(api.auth).toBeDefined();
    expect(api.users).toBeDefined();
    expect(api.contents).toBeDefined();
    expect(api.watchlsit).toBeDefined();
  });

  it("builds useApi object and category list hook", () => {
    const api = useApi();
    expect(api.categories).toBeDefined();
    const q = api.categories.list({ page: 1 } as never);
    expect(q.queryKey).toEqual(["categories", "list", { page: 1 }]);
  });

  it("useApi exposes watchlist, messages and friendship query bundles", () => {
    const api = useApi();
    expect(api.watchlist).toBeDefined();
    expect(api.messages).toBeDefined();
    expect(api.friendships).toBeDefined();
  });

  it("useApi exposes peoples and conversation query bundles", () => {
    const api = useApi();
    expect(api.peoples).toBeDefined();
    expect(api.conversations).toBeDefined();
  });
});
