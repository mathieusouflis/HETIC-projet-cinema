import { beforeEach, describe, expect, it, vi } from "vitest";

const { warnMock } = vi.hoisted(() => ({
  warnMock: vi.fn(),
}));

vi.mock("@packages/logger", () => ({
  logger: {
    warn: warnMock,
  },
}));

const middlewareMock = vi.hoisted(() => vi.fn());
vi.mock("../../middleware/socket-auth.middleware.js", () => ({
  socketAuthMiddleware: middlewareMock,
}));

import { WebSocketAuthError } from "../../errors/websocket/websocket-auth-error";
import {
  getSocketUser,
  globalAuthEventMiddleware,
  isSocketAuthenticated,
  requireSocketAuth,
  WebSocketAuthService,
} from "./web-socket-auth-service";

describe("WebSocketAuthService", () => {
  const service = new WebSocketAuthService();
  const socket = { id: "s1", user: { userId: "u1", email: "u1@mail.com" } };

  beforeEach(() => {
    warnMock.mockReset();
    middlewareMock.mockReset();
  });

  it("authenticates and checks user helpers", async () => {
    service.authenticate(socket as never);
    expect(middlewareMock).toHaveBeenCalledTimes(1);
    expect(service.isAuthenticated(socket as never)).toBe(true);
    expect(service.getUser(socket as never)).toEqual({
      userId: "u1",
      email: "u1@mail.com",
    });
    await expect(
      service.globalAuthEventMiddleware(socket as never, {})
    ).resolves.toBe(true);
  });

  it("throws auth error when middleware fails", () => {
    middlewareMock.mockImplementation(() => {
      throw new Error("bad token");
    });

    expect(() => service.authenticate(socket as never)).toThrow(
      WebSocketAuthError
    );
    expect(warnMock).toHaveBeenCalledTimes(1);
  });

  it("throws requireAuth for unauthenticated sockets", async () => {
    const noUserSocket = { id: "s2" };
    expect(() => service.requireAuth(noUserSocket as never)).toThrow(
      WebSocketAuthError
    );
    expect(isSocketAuthenticated(noUserSocket as never)).toBe(false);
    expect(getSocketUser(noUserSocket as never)).toBeUndefined();
    await expect(
      globalAuthEventMiddleware(noUserSocket as never, {})
    ).rejects.toThrow(WebSocketAuthError);
    expect(() => requireSocketAuth(noUserSocket as never)).toThrow(
      WebSocketAuthError
    );
  });
});
