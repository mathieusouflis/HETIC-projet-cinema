import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateRequest, validateMultiple } from "./validation.middleware.js";
import { ValidationError } from "../errors/ValidationError.js";

describe("validateRequest", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let nextError: unknown;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {};
    nextError = null;
    next = vi.fn((error?: unknown) => {
      if (error) {
        nextError = error;
      }
    });
  });

  describe("body validation", () => {
    it("should validate valid request body", () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(nextError).toBeNull();
      expect(req.body).toEqual({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should validate and transform data", () => {
      const schema = z.object({
        age: z.string().transform((val) => parseInt(val, 10)),
        active: z.string().transform((val) => val === "true"),
      });

      req.body = {
        age: "25",
        active: "true",
      };

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({
        age: 25,
        active: true,
      });
    });

    it("should fail validation for invalid body", () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      req.body = {
        email: "invalid-email",
        password: "short",
      };

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(ValidationError);
      const error = nextError as ValidationError;
      expect(error.message).toBe("Validation failed");
      expect(error.details).toHaveLength(2);
      expect(error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.any(String),
            code: expect.any(String),
          }),
          expect.objectContaining({
            field: "password",
            message: expect.any(String),
            code: expect.any(String),
          }),
        ]),
      );
    });

    it("should handle missing required fields", () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      req.body = {};

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(ValidationError);
      const error = nextError as ValidationError;
      expect(error.details).toHaveLength(2);
    });

    it("should handle nested object validation", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });

      req.body = {
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
      };

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
      });
    });

    it("should handle nested validation errors with proper field paths", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });

      req.body = {
        user: {
          name: "John Doe",
          email: "invalid-email",
        },
      };

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(ValidationError);
      const error = nextError as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details).toHaveLength(1);
      expect(error.details![0]?.field).toBe("user.email");
    });

    it("should strip unknown fields with strict schema", () => {
      const schema = z
        .object({
          email: z.string().email(),
        })
        .strict();

      req.body = {
        email: "test@example.com",
        unknownField: "value",
      };

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(ValidationError);
    });

    it("should handle array validation", () => {
      const schema = z.object({
        tags: z.array(z.string()),
      });

      req.body = {
        tags: ["tag1", "tag2", "tag3"],
      };

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({
        tags: ["tag1", "tag2", "tag3"],
      });
    });

    it("should handle array validation errors with index in path", () => {
      const schema = z.object({
        items: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          }),
        ),
      });

      req.body = {
        items: [
          { id: 1, name: "Item 1" },
          { id: "invalid", name: "Item 2" },
        ],
      };

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(ValidationError);
      const error = nextError as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details![0]?.field).toBe("items.1.id");
    });
  });

  describe("query validation", () => {
    it("should validate valid query parameters", () => {
      const schema = z.object({
        page: z.string(),
        limit: z.string(),
      });

      req.query = {
        page: "1",
        limit: "10",
      };

      const middleware = validateRequest(schema, "query");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.query).toEqual({
        page: "1",
        limit: "10",
      });
    });

    it("should validate and transform query parameters", () => {
      const schema = z.object({
        page: z.string().transform((val) => parseInt(val, 10)),
        limit: z.string().transform((val) => parseInt(val, 10)),
      });

      req.query = {
        page: "2",
        limit: "20",
      };

      const middleware = validateRequest(schema, "query");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.query).toEqual({
        page: 2,
        limit: 20,
      });
    });

    it("should fail validation for invalid query parameters", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      req.query = {
        email: "invalid-email",
      };

      const middleware = validateRequest(schema, "query");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(ValidationError);
      const error = nextError as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details![0]?.field).toBe("email");
    });

    it("should use Object.defineProperty for query validation", () => {
      const schema = z.object({
        search: z.string(),
      });

      req.query = {
        search: "test",
      };

      const middleware = validateRequest(schema, "query");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      const descriptor = Object.getOwnPropertyDescriptor(req, "query");
      expect(descriptor?.writable).toBe(true);
      expect(descriptor?.enumerable).toBe(true);
      expect(descriptor?.configurable).toBe(true);
    });
  });

  describe("params validation", () => {
    it("should validate valid URL parameters", () => {
      const schema = z.object({
        id: z.uuid(),
      });

      req.params = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const middleware = validateRequest(schema, "params");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.params).toEqual({
        id: "123e4567-e89b-12d3-a456-426614174000",
      });
    });

    it("should fail validation for invalid URL parameters", () => {
      const schema = z.object({
        id: z.uuid(),
      });

      req.params = {
        id: "invalid-uuid",
      };

      const middleware = validateRequest(schema, "params");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(ValidationError);
      const error = nextError as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details![0]?.field).toBe("id");
    });

    it("should use Object.defineProperty for params validation", () => {
      const schema = z.object({
        id: z.string(),
      });

      req.params = {
        id: "123",
      };

      const middleware = validateRequest(schema, "params");
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      const descriptor = Object.getOwnPropertyDescriptor(req, "params");
      expect(descriptor?.writable).toBe(true);
      expect(descriptor?.enumerable).toBe(true);
      expect(descriptor?.configurable).toBe(true);
    });
  });

  describe("default target", () => {
    it("should default to body validation", () => {
      const schema = z.object({
        name: z.string(),
      });

      req.body = {
        name: "Test",
      };

      const middleware = validateRequest(schema);
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({
        name: "Test",
      });
    });
  });

  describe("error handling", () => {
    it("should handle non-ZodError exceptions", () => {
      const schema = z.object({}).transform(() => {
        throw new Error("Custom error");
      });

      req.body = {};

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(Error);
      expect(nextError).not.toBeInstanceOf(ValidationError);
    });

    it("should format error with unknown field when path is empty", () => {
      const schema = z.string();

      req.body = 123;

      const middleware = validateRequest(schema, "body");
      middleware(req as Request, res as Response, next);

      expect(nextError).toBeInstanceOf(ValidationError);
      const error = nextError as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details![0]?.field).toBe("unknown");
    });
  });
});

describe("validateMultiple", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let nextError: unknown;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {};
    nextError = null;
    next = vi.fn((error?: unknown) => {
      if (error) {
        nextError = error;
      }
    });
  });

  it("should validate multiple targets successfully", () => {
    const schemas = {
      body: z.object({
        email: z.string().email(),
      }),
      query: z.object({
        page: z.string(),
      }),
      params: z.object({
        id: z.string(),
      }),
    };

    req.body = { email: "test@example.com" };
    req.query = { page: "1" };
    req.params = { id: "123" };

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(nextError).toBeNull();
    expect(req.body).toEqual({ email: "test@example.com" });
    expect(req.query).toEqual({ page: "1" });
    expect(req.params).toEqual({ id: "123" });
  });

  it("should validate only specified targets", () => {
    const schemas = {
      body: z.object({
        email: z.string().email(),
      }),
      query: z.object({
        page: z.string(),
      }),
    };

    req.body = { email: "test@example.com" };
    req.query = { page: "1" };
    req.params = { unvalidated: "value" };

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(nextError).toBeNull();
  });

  it("should collect errors from all targets", () => {
    const schemas = {
      body: z.object({
        email: z.string().email(),
      }),
      query: z.object({
        page: z.string().regex(/^\d+$/),
      }),
      params: z.object({
        id: z.uuid(),
      }),
    };

    req.body = { email: "invalid-email" };
    req.query = { page: "abc" };
    req.params = { id: "invalid-uuid" };

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(nextError).toBeInstanceOf(ValidationError);
    const error = nextError as ValidationError;
    expect(error.details).toHaveLength(3);
    expect(error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "body.email",
        }),
        expect.objectContaining({
          field: "query.page",
        }),
        expect.objectContaining({
          field: "params.id",
        }),
      ]),
    );
  });

  it("should prefix field names with target", () => {
    const schemas = {
      body: z.object({
        user: z.object({
          email: z.string().email(),
        }),
      }),
    };

    req.body = {
      user: {
        email: "invalid-email",
      },
    };

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(nextError).toBeInstanceOf(ValidationError);
    const error = nextError as ValidationError;
    expect(error.details).toBeDefined();
    expect(error.details![0]?.field).toBe("body.user.email");
  });

  it("should handle partial validation success", () => {
    const schemas = {
      body: z.object({
        email: z.string().email(),
      }),
      query: z.object({
        page: z.string(),
      }),
    };

    req.body = { email: "invalid-email" };
    req.query = { page: "1" };

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(nextError).toBeInstanceOf(ValidationError);
    const error = nextError as ValidationError;
    expect(error.details).toBeDefined();
    expect(error.details).toHaveLength(1);
    expect(error.details![0]?.field).toBe("body.email");
    expect(req.query).toEqual({ page: "1" });
  });

  it("should handle non-ZodError exceptions", () => {
    const schemas = {
      body: z.object({}).transform(() => {
        throw new Error("Custom error");
      }),
    };

    req.body = {};

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(nextError).toBeInstanceOf(Error);
    expect(nextError).not.toBeInstanceOf(ValidationError);
  });

  it("should handle empty path in error field", () => {
    const schemas = {
      body: z.string(),
    };

    req.body = 123;

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(nextError).toBeInstanceOf(ValidationError);
    const error = nextError as ValidationError;
    expect(error.details).toBeDefined();
    expect(error.details![0]?.field).toBe("body.unknown");
  });

  it("should transform data for multiple targets", () => {
    const schemas = {
      body: z.object({
        age: z.string().transform((val) => parseInt(val, 10)),
      }),
      query: z.object({
        limit: z.string().transform((val) => parseInt(val, 10)),
      }),
    };

    req.body = { age: "25" };
    req.query = { limit: "10" };

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ age: 25 });
    expect(req.query).toEqual({ limit: 10 });
  });

  it("should use Object.defineProperty for non-body targets", () => {
    const schemas = {
      query: z.object({
        search: z.string(),
      }),
      params: z.object({
        id: z.string(),
      }),
    };

    req.query = { search: "test" };
    req.params = { id: "123" };

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    const queryDescriptor = Object.getOwnPropertyDescriptor(req, "query");
    const paramsDescriptor = Object.getOwnPropertyDescriptor(req, "params");

    expect(queryDescriptor?.writable).toBe(true);
    expect(queryDescriptor?.enumerable).toBe(true);
    expect(queryDescriptor?.configurable).toBe(true);

    expect(paramsDescriptor?.writable).toBe(true);
    expect(paramsDescriptor?.enumerable).toBe(true);
    expect(paramsDescriptor?.configurable).toBe(true);
  });

  it("should handle empty schemas object", () => {
    const schemas = {};

    const middleware = validateMultiple(schemas);
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(nextError).toBeNull();
  });
});
