import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import type { Socket } from "socket.io";

const { mockVerifyAccessToken } = vi.hoisted(() => ({
  mockVerifyAccessToken: vi.fn(),
}));

vi.mock("../services/token/JWTService.js", () => ({
  JWTService: class {
    verifyAccessToken(...args: any[]) {
      return mockVerifyAccessToken(...args);
    }
  },
}));

vi.mock("@packages/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import {
  socketAuthMiddleware,
  socketAuthNamespaceMiddleware,
} from "./socket-auth.middleware.js";

describe("Socket Authentication Middleware", () => {
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSocket = {
      id: "test-socket-id",
      handshake: {
        auth: {},
        headers: {},
      } as any,
      user: undefined,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("socketAuthMiddleware", () => {
    describe("Token Extraction", () => {
      it("should extract token from auth object", () => {
        const token = "valid-token-from-auth";
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockReturnValue({
          userId: "user-123",
          email: "test@example.com",
        });

        socketAuthMiddleware(mockSocket as Socket);

        expect(mockVerifyAccessToken).toHaveBeenCalledWith(token);
        expect(mockSocket.user).toEqual({
          userId: "user-123",
          email: "test@example.com",
        });
      });

      it("should extract token from authorization header", () => {
        const token = "valid-token-from-header";
        mockSocket.handshake!.headers = {
          authorization: `Bearer ${token}`,
        };
        mockVerifyAccessToken.mockReturnValue({
          userId: "user-456",
          email: "header@example.com",
        });

        socketAuthMiddleware(mockSocket as Socket);

        expect(mockVerifyAccessToken).toHaveBeenCalledWith(token);
        expect(mockSocket.user).toEqual({
          userId: "user-456",
          email: "header@example.com",
        });
      });

      it("should prefer auth object over authorization header when both are present", () => {
        const authToken = "auth-token";
        const headerToken = "header-token";
        mockSocket.handshake!.auth = { token: authToken };
        mockSocket.handshake!.headers = {
          authorization: `Bearer ${headerToken}`,
        };
        mockVerifyAccessToken.mockReturnValue({
          userId: "user-789",
          email: "priority@example.com",
        });

        socketAuthMiddleware(mockSocket as Socket);

        expect(mockVerifyAccessToken).toHaveBeenCalledWith(authToken);
      });

      it("should throw error when no token is provided", () => {
        mockSocket.handshake!.auth = {};
        mockSocket.handshake!.headers = {};

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
          "No authentication token provided"
        );
      });

      it("should throw error when authorization header is malformed (no Bearer)", () => {
        mockSocket.handshake!.headers = {
          authorization: "InvalidFormat token-here",
        };

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
          "No authentication token provided"
        );
      });

      it("should throw error when authorization header has only 'Bearer' without token", () => {
        mockSocket.handshake!.headers = {
          authorization: "Bearer",
        };

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
          "No authentication token provided"
        );
      });

      it("should throw error when authorization header has empty token", () => {
        mockSocket.handshake!.headers = {
          authorization: "Bearer ",
        };

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
          "No authentication token provided"
        );
      });
    });

    describe("Token Verification", () => {
      it("should successfully verify valid token and attach user to socket", () => {
        const token = "valid-jwt-token";
        const payload = {
          userId: "user-123",
          email: "valid@example.com",
        };
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockReturnValue(payload);

        socketAuthMiddleware(mockSocket as Socket);

        expect(mockSocket.user).toEqual({
          userId: payload.userId,
          email: payload.email,
        });
      });

      it("should throw 'Token expired' error when token is expired", () => {
        const token = "expired-token";
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockImplementation(() => {
          throw new Error("Access token expired");
        });

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
          "Token expired"
        );
      });

      it("should throw 'Invalid token' error when token is invalid", () => {
        const token = "invalid-token";
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockImplementation(() => {
          throw new Error("Invalid access token");
        });

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
          "Invalid token"
        );
      });

      it("should throw generic 'Authentication failed' for unknown errors", () => {
        const token = "problematic-token";
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockImplementation(() => {
          throw new Error("Some unknown error");
        });

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
          "Authentication failed"
        );
      });

      it("should throw generic 'Authentication failed' for non-Error exceptions", () => {
        const token = "problematic-token";
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockImplementation(() => {
          throw "String error";
        });

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
          "Authentication failed"
        );
      });

      it("should not attach user to socket when verification fails", () => {
        const token = "invalid-token";
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockImplementation(() => {
          throw new Error("Invalid access token");
        });

        expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow();
        expect(mockSocket.user).toBeUndefined();
      });
    });

    describe("User Attachment", () => {
      it("should attach user with correct userId and email", () => {
        const token = "valid-token";
        const payload = {
          userId: "specific-user-id",
          email: "specific@email.com",
        };
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockReturnValue(payload);

        socketAuthMiddleware(mockSocket as Socket);

        expect(mockSocket.user).toBeDefined();
        expect(mockSocket.user!.userId).toBe(payload.userId);
        expect(mockSocket.user!.email).toBe(payload.email);
      });

      it("should overwrite existing user data on socket", () => {
        const token = "new-valid-token";
        const oldUser = { userId: "old-user", email: "old@example.com" };
        const newPayload = {
          userId: "new-user",
          email: "new@example.com",
        };
        mockSocket.user = oldUser;
        mockSocket.handshake!.auth = { token };
        mockVerifyAccessToken.mockReturnValue(newPayload);

        socketAuthMiddleware(mockSocket as Socket);

        expect(mockSocket.user).toEqual({
          userId: newPayload.userId,
          email: newPayload.email,
        });
        expect(mockSocket.user).not.toEqual(oldUser);
      });
    });
  });

  describe("socketAuthNamespaceMiddleware", () => {
    let nextCallback: Mock

    beforeEach(() => {
      nextCallback = vi.fn();
    });

    it("should call next() without error when authentication succeeds", () => {
      const token = "valid-token";
      mockSocket.handshake!.auth = { token };
      mockVerifyAccessToken.mockReturnValue({
        userId: "user-123",
        email: "test@example.com",
      });

      socketAuthNamespaceMiddleware(mockSocket as Socket, nextCallback);

      expect(nextCallback).toHaveBeenCalledWith();
      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(mockSocket.user).toBeDefined();
    });

    it("should call next(error) when authentication fails with no token", () => {
      mockSocket.handshake!.auth = {};
      mockSocket.handshake!.headers = {};

      socketAuthNamespaceMiddleware(mockSocket as Socket, nextCallback);

      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith(expect.any(Error));
      const error = nextCallback.mock.calls?.[0]?.[0];
      expect(error.message).toBe("No authentication token provided");
    });

    it("should call next(error) when token is expired", () => {
      const token = "expired-token";
      mockSocket.handshake!.auth = { token };
      mockVerifyAccessToken.mockImplementation(() => {
        throw new Error("Access token expired");
      });

      socketAuthNamespaceMiddleware(mockSocket as Socket, nextCallback);

      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith(expect.any(Error));
      const error = nextCallback.mock.calls?.[0]?.[0];
      expect(error.message).toBe("Token expired");
    });

    it("should call next(error) when token is invalid", () => {
      const token = "invalid-token";
      mockSocket.handshake!.auth = { token };
      mockVerifyAccessToken.mockImplementation(() => {
        throw new Error("Invalid access token");
      });

      socketAuthNamespaceMiddleware(mockSocket as Socket, nextCallback);

      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith(expect.any(Error));
      const error = nextCallback.mock.calls?.[0]?.[0];
      expect(error.message).toBe("Invalid token");
    });

    it("should convert non-Error exceptions to Error objects", () => {
      const token = "problematic-token";
      mockSocket.handshake!.auth = { token };
      mockVerifyAccessToken.mockImplementation(() => {
        throw "String error message";
      });

      socketAuthNamespaceMiddleware(mockSocket as Socket, nextCallback);

      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith(expect.any(Error));
      const error = nextCallback.mock.calls?.[0]?.[0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Authentication failed");
    });

    it("should attach user to socket before calling next()", () => {
      const token = "valid-token";
      const payload = {
        userId: "user-123",
        email: "test@example.com",
      };
      mockSocket.handshake!.auth = { token };
      mockVerifyAccessToken.mockReturnValue(payload);

      socketAuthNamespaceMiddleware(mockSocket as Socket, nextCallback);

      expect(mockSocket.user).toEqual({
        userId: payload.userId,
        email: payload.email,
      });
      expect(nextCallback).toHaveBeenCalledWith();
    });

    it("should not attach user to socket when authentication fails", () => {
      const token = "invalid-token";
      mockSocket.handshake!.auth = { token };
      mockVerifyAccessToken.mockImplementation(() => {
        throw new Error("Invalid access token");
      });

      socketAuthNamespaceMiddleware(mockSocket as Socket, nextCallback);

      expect(mockSocket.user).toBeUndefined();
      expect(nextCallback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("Edge Cases", () => {
    it("should handle socket with undefined handshake gracefully", () => {
      const brokenSocket = { id: "broken-socket" } as Socket;

      expect(() => socketAuthMiddleware(brokenSocket)).toThrow();
    });

    it("should handle socket with null auth object", () => {
      mockSocket.handshake!.auth = null as any;

      expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
        "No authentication token provided"
      );
    });

    it("should handle token with special characters (JWT format)", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      mockSocket.handshake!.auth = { token };
      mockVerifyAccessToken.mockReturnValue({
        userId: "user-123",
        email: "test@example.com",
      });

      socketAuthMiddleware(mockSocket as Socket);

      // Asert
      expect(mockVerifyAccessToken).toHaveBeenCalledWith(token);
      expect(mockSocket.user).toBeDefined();
    });

    it("should handle very long token strings", () => {
      const longToken = "a".repeat(10000);
      mockSocket.handshake!.auth = { token: longToken };
      mockVerifyAccessToken.mockReturnValue({
        userId: "user-123",
        email: "test@example.com",
      });

      socketAuthMiddleware(mockSocket as Socket);

      expect(mockVerifyAccessToken).toHaveBeenCalledWith(longToken);
    });

    it("should handle empty string token in auth object", () => {
      mockSocket.handshake!.auth = { token: "" };

      expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow(
        "No authentication token provided"
      );
    });

    it("should handle whitespace-only token", () => {
      mockSocket.handshake!.auth = { token: "   " };
      mockVerifyAccessToken.mockImplementation(() => {
        throw new Error("Invalid access token");
      });

      expect(() => socketAuthMiddleware(mockSocket as Socket)).toThrow();
    });
  });

  describe("Multiple Socket Instances", () => {
    it("should handle multiple sockets with different tokens independently", () => {
      const socket1 = {
        id: "socket-1",
        handshake: { auth: { token: "token1" }, headers: {} } as any,
      } as Socket;

      const socket2 = {
        id: "socket-2",
        handshake: { auth: { token: "token2" }, headers: {} } as any,
      } as Socket;

      mockVerifyAccessToken
        .mockReturnValueOnce({ userId: "user-1", email: "user1@example.com" })
        .mockReturnValueOnce({ userId: "user-2", email: "user2@example.com" });

      socketAuthMiddleware(socket1);
      socketAuthMiddleware(socket2);

      expect(socket1.user).toEqual({
        userId: "user-1",
        email: "user1@example.com",
      });
      expect(socket2.user).toEqual({
        userId: "user-2",
        email: "user2@example.com",
      });
      expect(mockVerifyAccessToken).toHaveBeenCalledTimes(2);
    });

    it("should not affect other sockets when one fails authentication", () => {
      const socket1 = {
        id: "socket-1",
        handshake: { auth: { token: "valid-token" }, headers: {} } as any,
      } as Socket;

      const socket2 = {
        id: "socket-2",
        handshake: { auth: { token: "invalid-token" }, headers: {} } as any,
      } as Socket;

      mockVerifyAccessToken
        .mockReturnValueOnce({ userId: "user-1", email: "user1@example.com" })
        .mockImplementationOnce(() => {
          throw new Error("Invalid access token");
        });

      socketAuthMiddleware(socket1);

      expect(socket1.user).toBeDefined();
      expect(() => socketAuthMiddleware(socket2)).toThrow();
      expect(socket2.user).toBeUndefined();
    });
  });
});
