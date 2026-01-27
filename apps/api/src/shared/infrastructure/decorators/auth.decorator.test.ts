import type { RequestHandler } from "express";
import { describe, expect, it, vi } from "vitest";
import {
  Middlewares,
  Protected,
  getMiddlewaresMetadata,
} from "./auth.decorator.js";
import { AUTH_MIDDLEWARE_MARKER } from "./types.js";

describe("Auth Decorator tests", () => {
  describe("Middlewares decorator", () => {
    it("should attach middleware metadata to a method", () => {
      const mockMiddleware: RequestHandler = vi.fn();

      class TestController {
        @Middlewares(mockMiddleware)
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "testMethod");

      expect(metadata).toBeDefined();
      expect(metadata?.middlewares).toHaveLength(1);
      expect(metadata?.middlewares[0]).toBe(mockMiddleware);
    });

    it("should attach multiple middlewares to a method", () => {
      const middleware1: RequestHandler = vi.fn();
      const middleware2: RequestHandler = vi.fn();
      const middleware3: RequestHandler = vi.fn();

      class TestController {
        @Middlewares(middleware1, middleware2, middleware3)
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "testMethod");

      expect(metadata).toBeDefined();
      expect(metadata?.middlewares).toHaveLength(3);
      expect(metadata?.middlewares[0]).toBe(middleware1);
      expect(metadata?.middlewares[1]).toBe(middleware2);
      expect(metadata?.middlewares[2]).toBe(middleware3);
    });

    it("should preserve middleware order", () => {
      const middleware1: RequestHandler = vi.fn();
      const middleware2: RequestHandler = vi.fn();

      class TestController {
        @Middlewares(middleware1, middleware2)
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "testMethod");

      expect(metadata?.middlewares[0]).toBe(middleware1);
      expect(metadata?.middlewares[1]).toBe(middleware2);
    });

    it("should handle multiple decorated methods independently", () => {
      const middleware1: RequestHandler = vi.fn();
      const middleware2: RequestHandler = vi.fn();

      class TestController {
        @Middlewares(middleware1)
        method1() {}

        @Middlewares(middleware2)
        method2() {}
      }

      const instance = new TestController();
      const metadata1 = getMiddlewaresMetadata(instance, "method1");
      const metadata2 = getMiddlewaresMetadata(instance, "method2");

      expect(metadata1?.middlewares).toHaveLength(1);
      expect(metadata1?.middlewares[0]).toBe(middleware1);
      expect(metadata2?.middlewares).toHaveLength(1);
      expect(metadata2?.middlewares[0]).toBe(middleware2);
    });

    it("should handle empty middleware array", () => {
      class TestController {
        @Middlewares()
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "testMethod");

      expect(metadata).toBeDefined();
      expect(metadata?.middlewares).toHaveLength(0);
    });
  });

  describe("Protected decorator", () => {
    it("should attach AUTH_MIDDLEWARE_MARKER to a method", () => {
      class TestController {
        @Protected()
        protectedMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "protectedMethod");

      expect(metadata).toBeDefined();
      expect(metadata?.middlewares).toHaveLength(1);
      expect(metadata?.middlewares[0]).toBe(AUTH_MIDDLEWARE_MARKER);
    });

    it("should work on multiple methods independently", () => {
      class TestController {
        @Protected()
        protectedMethod1() {}

        @Protected()
        protectedMethod2() {}

        publicMethod() {}
      }

      const instance = new TestController();
      const metadata1 = getMiddlewaresMetadata(instance, "protectedMethod1");
      const metadata2 = getMiddlewaresMetadata(instance, "protectedMethod2");
      const metadata3 = getMiddlewaresMetadata(instance, "publicMethod");

      expect(metadata1?.middlewares[0]).toBe(AUTH_MIDDLEWARE_MARKER);
      expect(metadata2?.middlewares[0]).toBe(AUTH_MIDDLEWARE_MARKER);
      expect(metadata3).toBeUndefined();
    });

    it("should only add auth marker, not actual middleware function", () => {
      class TestController {
        @Protected()
        protectedMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "protectedMethod");

      expect(metadata?.middlewares).toHaveLength(1);
      expect(typeof metadata?.middlewares[0]).toBe("string");
      expect(metadata?.middlewares[0]).toBe("__AUTH__");
    });
  });

  describe("getMiddlewaresMetadata", () => {
    it("should return undefined for undecorated methods", () => {
      class TestController {
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "testMethod");

      expect(metadata).toBeUndefined();
    });

    it("should return undefined for non-existent methods", () => {
      class TestController {
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "nonExistentMethod");

      expect(metadata).toBeUndefined();
    });

    it("should retrieve metadata from parent class prototype", () => {
      const mockMiddleware: RequestHandler = vi.fn();

      class TestController {
        @Middlewares(mockMiddleware)
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(
        Object.getPrototypeOf(instance),
        "testMethod"
      );

      expect(metadata).toBeDefined();
      expect(metadata?.middlewares[0]).toBe(mockMiddleware);
    });
  });

  describe("Decorator combinations", () => {
    it("should allow both Middlewares and Protected on different methods", () => {
      const customMiddleware: RequestHandler = vi.fn();

      class TestController {
        @Middlewares(customMiddleware)
        customMethod() {}

        @Protected()
        protectedMethod() {}
      }

      const instance = new TestController();
      const customMetadata = getMiddlewaresMetadata(instance, "customMethod");
      const protectedMetadata = getMiddlewaresMetadata(
        instance,
        "protectedMethod"
      );

      expect(customMetadata?.middlewares[0]).toBe(customMiddleware);
      expect(protectedMetadata?.middlewares[0]).toBe(AUTH_MIDDLEWARE_MARKER);
    });
  });

  describe("Metadata structure", () => {
    it("should have correct metadata structure for Middlewares", () => {
      const mockMiddleware: RequestHandler = vi.fn();

      class TestController {
        @Middlewares(mockMiddleware)
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "testMethod");

      expect(metadata).toHaveProperty("middlewares");
      expect(Array.isArray(metadata?.middlewares)).toBe(true);
    });

    it("should have correct metadata structure for Protected", () => {
      class TestController {
        @Protected()
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getMiddlewaresMetadata(instance, "testMethod");

      expect(metadata).toHaveProperty("middlewares");
      expect(Array.isArray(metadata?.middlewares)).toBe(true);
    });
  });
});
