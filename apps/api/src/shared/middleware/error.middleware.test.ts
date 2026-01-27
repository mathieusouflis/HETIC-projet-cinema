import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockConfig = vi.hoisted(() => ({
  config: {
    env: {
      NODE_ENV: "development",
    },
  },
}));

vi.mock("@packages/config", () => mockConfig);

vi.mock("@packages/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import { AppError } from "../errors/AppError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { errorMiddleware, notFoundMiddleware } from "./error.middleware.js";

describe("errorMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    req = {};
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({
      json: jsonMock,
    }));
    res = {
      status: statusMock,
    } as Partial<Response>;
    next = vi.fn();
    mockConfig.config.env.NODE_ENV = "development";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("AppError handling", () => {
    it("should handle UnauthorizedError with correct status code", () => {
      const error = new UnauthorizedError("Invalid credentials");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Invalid credentials",
        })
      );
    });

    it("should handle NotFoundError with correct status code", () => {
      const error = new NotFoundError("User");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "User not found",
        })
      );
    });

    it("should handle ConflictError with correct status code", () => {
      const error = new ConflictError("Email already exists");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Email already exists",
        })
      );
    });

    it("should handle ForbiddenError with correct status code", () => {
      const error = new ForbiddenError("Access denied");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Access denied",
        })
      );
    });

    it("should handle custom AppError with custom status code", () => {
      const error = new AppError("Custom error", 418);

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(418);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Custom error",
        })
      );
    });
  });

  describe("ValidationError handling", () => {
    it("should handle ValidationError with details", () => {
      const details = [
        { field: "email", message: "Invalid email format" },
        { field: "password", message: "Password too short" },
      ];
      const error = new ValidationError("Validation failed", details);

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Validation failed",
          details,
        })
      );
    });

    it("should handle ValidationError without details", () => {
      const error = new ValidationError("Validation failed");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Validation failed",
        })
      );
    });

    it("should handle ValidationError with empty details array", () => {
      const error = new ValidationError("Validation failed", []);

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Validation failed",
          details: [],
        })
      );
    });
  });

  describe("JWT token errors", () => {
    it("should handle JsonWebTokenError", () => {
      const error = new Error("jwt malformed");
      error.name = "JsonWebTokenError";

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Invalid token",
        })
      );
    });

    it("should handle TokenExpiredError", () => {
      const error = new Error("jwt expired");
      error.name = "TokenExpiredError";

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Token expired",
        })
      );
    });
  });

  describe("SyntaxError handling", () => {
    it("should handle SyntaxError with body property", () => {
      const error = new SyntaxError("Unexpected token");
      (error as any).body = {};

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Invalid request body",
        })
      );
    });

    it("should not treat regular SyntaxError as body parsing error", () => {
      const error = new SyntaxError("Some syntax error");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe("Generic error handling", () => {
    it("should handle generic Error with 500 status", () => {
      const error = new Error("Something went wrong");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it("should handle error without message", () => {
      const error = new Error();

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Internal server error",
          stack: expect.any(String),
        })
      );
    });

    it("should sanitize error message in production", () => {
      mockConfig.config.env.NODE_ENV = "production";

      const error = new Error("Database connection failed");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
      });
    });

    it("should preserve error message in development", () => {
      mockConfig.config.env.NODE_ENV = "development";

      const error = new Error("Database connection failed");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Database connection failed",
        })
      );
    });
  });

  describe("Stack trace handling", () => {
    it("should include stack trace in development mode", () => {
      mockConfig.config.env.NODE_ENV = "development";

      const error = new Error("Test error");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Test error",
          stack: expect.any(String),
        })
      );
    });

    it("should include stack trace for AppError in development", () => {
      mockConfig.config.env.NODE_ENV = "development";

      const error = new NotFoundError("User");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "User not found",
          stack: expect.any(String),
        })
      );
    });

    it("should not include stack trace for AppError in production", () => {
      mockConfig.config.env.NODE_ENV = "production";

      const error = new NotFoundError("User");

      errorMiddleware(error, req as Request, res as Response, next);

      const callArg = jsonMock.mock.calls[0]?.[0];
      expect(callArg).not.toHaveProperty("stack");
    });

    it("should handle error without stack trace", () => {
      const error = new Error("Test error");
      (error as any).stack = undefined;

      errorMiddleware(error, req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe("ValidationError with stack trace", () => {
    it("should include details and stack trace in development", () => {
      mockConfig.config.env.NODE_ENV = "development";

      const details = [{ field: "email", message: "Invalid email" }];
      const error = new ValidationError("Validation failed", details);

      errorMiddleware(error, req as Request, res as Response, next);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Validation failed",
          details,
          stack: expect.any(String),
        })
      );
    });

    it("should include details but not stack trace in production", () => {
      mockConfig.config.env.NODE_ENV = "production";

      const details = [{ field: "email", message: "Invalid email" }];
      const error = new ValidationError("Validation failed", details);

      errorMiddleware(error, req as Request, res as Response, next);

      const callArg = jsonMock.mock.calls[0]?.[0];
      expect(callArg).toMatchObject({
        success: false,
        error: "Validation failed",
        details,
      });
      expect(callArg).not.toHaveProperty("stack");
    });
  });

  describe("Environment-specific behavior", () => {
    it("should preserve AppError messages in production", () => {
      mockConfig.config.env.NODE_ENV = "production";

      const error = new UnauthorizedError("Invalid credentials");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Invalid credentials",
      });
    });

    it("should sanitize generic errors in production", () => {
      mockConfig.config.env.NODE_ENV = "production";

      const error = new Error("Sensitive database error details");

      errorMiddleware(error, req as Request, res as Response, next);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
      });
    });
  });
});

describe("notFoundMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({
      json: jsonMock,
    }));
    res = {
      status: statusMock,
    } as Partial<Response>;
    next = vi.fn();
  });

  it("should return 404 for GET request", () => {
    req = {
      method: "GET",
      path: "/api/users",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route GET /api/users not found",
    });
  });

  it("should return 404 for POST request", () => {
    req = {
      method: "POST",
      path: "/api/products",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route POST /api/products not found",
    });
  });

  it("should return 404 for DELETE request", () => {
    req = {
      method: "DELETE",
      path: "/api/users/123",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route DELETE /api/users/123 not found",
    });
  });

  it("should return 404 for PUT request", () => {
    req = {
      method: "PUT",
      path: "/api/settings",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route PUT /api/settings not found",
    });
  });

  it("should return 404 for PATCH request", () => {
    req = {
      method: "PATCH",
      path: "/api/users/456",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route PATCH /api/users/456 not found",
    });
  });

  it("should handle root path", () => {
    req = {
      method: "GET",
      path: "/",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route GET / not found",
    });
  });

  it("should handle deeply nested path", () => {
    req = {
      method: "GET",
      path: "/api/v1/users/123/posts/456/comments",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route GET /api/v1/users/123/posts/456/comments not found",
    });
  });

  it("should handle path with query parameters", () => {
    req = {
      method: "GET",
      path: "/api/search?query=test&page=1",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route GET /api/search?query=test&page=1 not found",
    });
  });

  it("should not call next function", () => {
    req = {
      method: "GET",
      path: "/api/unknown",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("should handle OPTIONS method", () => {
    req = {
      method: "OPTIONS",
      path: "/api/users",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route OPTIONS /api/users not found",
    });
  });

  it("should handle HEAD method", () => {
    req = {
      method: "HEAD",
      path: "/api/health",
    };

    notFoundMiddleware(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Route HEAD /api/health not found",
    });
  });
});
