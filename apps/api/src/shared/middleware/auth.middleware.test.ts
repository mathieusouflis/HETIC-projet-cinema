import { describe, it, expect, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireOwnership,
} from "./auth.middleware.js";
import { JWTService } from "../services/token/JWTService.js";
import { UnauthorizedError } from "../errors/index.js";

describe("authMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      params: {}
    };
    res = {};
    next = (error?: unknown) => {
      if (error) {
        throw error;
      }
    };
  });

  const jwtService = new JWTService();

  describe("authMiddleware", () => {
    it("should authenticate user with valid token", () => {
      const userId = "user-123";
      const email = "test@example.com";
      const token = jwtService.generateAccessToken({ userId, email });

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      authMiddleware(req as Request, res as Response, next);

      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(userId);
      expect(req.user?.email).toBe(email);
    });

    it("should throw UnauthorizedError when no authorization header", () => {
      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow("No authentication token provided");
    });

    it("should throw UnauthorizedError when authorization header is empty", () => {
      req.headers = {
        authorization: "",
      };

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow("No authentication token provided");
    });

    it("should throw UnauthorizedError when authorization header is malformed (no Bearer)", () => {
      const token = jwtService.generateAccessToken({
        userId: "user-123",
        email: "test@example.com",
      });

      req.headers = {
        authorization: token, // Missing "Bearer " prefix
      };

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow("No authentication token provided");
    });

    it("should throw UnauthorizedError when authorization header has wrong scheme", () => {
      const token = jwtService.generateAccessToken({
        userId: "user-123",
        email: "test@example.com",
      });

      req.headers = {
        authorization: `Basic ${token}`,
      };

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow("No authentication token provided");
    });

    it("should throw UnauthorizedError when token is invalid", () => {
      req.headers = {
        authorization: "Bearer invalid.token.here",
      };

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow("Invalid token");
    });

    it("should throw UnauthorizedError when token is expired", () => {
      const token = jwtService.generateAccessToken({
        userId: "user-123",
        email: "test@example.com",
      });


      vi.useFakeTimers();
      vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 255);

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow("Token expired");

      vi.useRealTimers();
    });

    it("should throw UnauthorizedError when Bearer token is empty", () => {
      req.headers = {
        authorization: "Bearer ",
      };

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });

    it("should handle authorization header with extra spaces", () => {
      req.headers = {
        authorization: "Bearer  ",
      };

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when authorization has multiple spaces", () => {
      const token = jwtService.generateAccessToken({
        userId: "user-123",
        email: "test@example.com",
      });

      req.headers = {
        authorization: `Bearer  ${token}  extra`,
      };

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        authMiddleware(req as Request, res as Response, next);
      }).toThrow("No authentication token provided");
    });
  });

  describe("optionalAuthMiddleware", () => {
    it("should authenticate user with valid token", () => {
      const userId = "user-456";
      const email = "optional@example.com";
      const token = jwtService.generateAccessToken({ userId, email });

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      optionalAuthMiddleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(userId);
      expect(req.user?.email).toBe(email);
    });

    it("should proceed without error when no token provided", () => {
      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      optionalAuthMiddleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
      expect(req.user).toBeUndefined();
    });

    it("should proceed without error when token is invalid", () => {
      req.headers = {
        authorization: "Bearer invalid.token.here",
      };

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      optionalAuthMiddleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
      expect(req.user).toBeUndefined();
    });

    it("should proceed without error when authorization header is malformed", () => {
      req.headers = {
        authorization: "InvalidFormat",
      };

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      optionalAuthMiddleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
      expect(req.user).toBeUndefined();
    });

    it("should proceed without error when Bearer token is empty", () => {
      req.headers = {
        authorization: "Bearer ",
      };

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      optionalAuthMiddleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
      expect(req.user).toBeUndefined();
    });

    it("should not set user when token verification fails", () => {
      const refreshToken = jwtService.generateRefreshToken({
        userId: "user-123",
      });

      req.headers = {
        authorization: `Bearer ${refreshToken}`,
      };

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      optionalAuthMiddleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
      expect(req.user).toBeUndefined();
    });
  });

  describe("requireRole", () => {
    it("should throw UnauthorizedError when user is not authenticated", () => {
      const middleware = requireRole("admin", "moderator");

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow("Authentication required");
    });

    it("should proceed when user is authenticated (role checking not yet implemented)", () => {
      req.user = {
        userId: "user-123",
        email: "test@example.com",
      };

      const middleware = requireRole("admin");

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      middleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
    });

    it("should proceed with multiple allowed roles", () => {
      req.user = {
        userId: "user-123",
        email: "test@example.com",
      };

      const middleware = requireRole("admin", "moderator", "editor");

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      middleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
    });

    it("should proceed with no roles specified", () => {
      req.user = {
        userId: "user-123",
        email: "test@example.com",
      };

      const middleware = requireRole();

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      middleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
    });
  });

  describe("requireOwnership", () => {
    it("should throw UnauthorizedError when user is not authenticated", () => {
      req.params = { id: "user-123" };

      const middleware = requireOwnership();

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow("Authentication required");
    });

    it("should proceed when user owns the resource (default param name 'id')", () => {
      const userId = "user-123";
      req.user = {
        userId,
        email: "test@example.com",
      };
      req.params = { id: userId };

      const middleware = requireOwnership();

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      middleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
    });

    it("should throw UnauthorizedError when user does not own the resource", () => {
      req.user = {
        userId: "user-123",
        email: "test@example.com",
      };
      req.params = { id: "user-456" };

      const middleware = requireOwnership();

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow("You can only access your own resources");
    });

    it("should work with custom parameter name", () => {
      const userId = "user-789";
      req.user = {
        userId,
        email: "custom@example.com",
      };
      req.params = { userId };

      const middleware = requireOwnership("userId");

      let nextCalled = false;
      const testNext: NextFunction = () => {
        nextCalled = true;
      };

      middleware(req as Request, res as Response, testNext);

      expect(nextCalled).toBe(true);
    });

    it("should throw UnauthorizedError with custom param when not owner", () => {
      req.user = {
        userId: "user-123",
        email: "test@example.com",
      };
      req.params = { ownerId: "user-456" };

      const middleware = requireOwnership("ownerId");

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow("You can only access your own resources");
    });

    it("should throw UnauthorizedError when param is missing", () => {
      req.user = {
        userId: "user-123",
        email: "test@example.com",
      };
      req.params = {};

      const middleware = requireOwnership();

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow("You can only access your own resources");
    });

    it("should handle undefined params object", () => {
      req.user = {
        userId: "user-123",
        email: "test@example.com",
      };

      const middleware = requireOwnership();

      expect(() => {
        middleware(req as Request, res as Response, next);
      }).toThrow(UnauthorizedError);
    });
  });
});
