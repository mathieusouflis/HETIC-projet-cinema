import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  RequiredHeaders,
  SetHeaders,
  RequiredCookie,
  RefreshTokenCookie,
  SetCookie,
  getRequiredHeadersMetadata,
  getSetHeadersMetadata,
  getRequiredCookieMetadata,
  getSetCookieMetadata,
  createRequiredHeadersMiddleware,
  createSetHeadersMiddleware,
  createRequiredCookieMiddleware,
} from "./header.decorator.js";

describe("Header Decorator tests", () => {
  describe("RequiredHeaders decorator", () => {
    it("should attach required headers metadata to a method", () => {
      class TestController {
        @RequiredHeaders(["authorization"])
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredHeadersMetadata(instance, "testMethod");

      expect(metadata).toBeDefined();
      expect(metadata?.headers).toEqual(["authorization"]);
    });

    it("should handle multiple required headers", () => {
      class TestController {
        @RequiredHeaders(["authorization", "content-type", "x-api-version"])
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredHeadersMetadata(instance, "testMethod");

      expect(metadata?.headers).toHaveLength(3);
      expect(metadata?.headers).toContain("authorization");
      expect(metadata?.headers).toContain("content-type");
      expect(metadata?.headers).toContain("x-api-version");
    });

    it("should convert headers to lowercase", () => {
      class TestController {
        @RequiredHeaders(["Authorization", "Content-Type", "X-API-KEY"])
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredHeadersMetadata(instance, "testMethod");

      expect(metadata?.headers).toEqual([
        "authorization",
        "content-type",
        "x-api-key",
      ]);
    });

    it("should handle empty headers array", () => {
      class TestController {
        @RequiredHeaders([])
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredHeadersMetadata(instance, "testMethod");

      expect(metadata?.headers).toEqual([]);
    });

    it("should work on multiple methods independently", () => {
      class TestController {
        @RequiredHeaders(["authorization"])
        method1() {}

        @RequiredHeaders(["content-type"])
        method2() {}
      }

      const instance = new TestController();
      const metadata1 = getRequiredHeadersMetadata(instance, "method1");
      const metadata2 = getRequiredHeadersMetadata(instance, "method2");

      expect(metadata1?.headers).toEqual(["authorization"]);
      expect(metadata2?.headers).toEqual(["content-type"]);
    });
  });

  describe("SetHeaders decorator", () => {
    it("should attach set headers metadata with static values", () => {
      class TestController {
        @SetHeaders({ "X-API-Version": "1.0" })
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetHeadersMetadata(instance, "testMethod");

      expect(metadata).toBeDefined();
      expect(metadata?.headers).toHaveLength(1);
      expect(metadata?.headers[0]).toMatchObject({
        name: "X-API-Version",
        value: "1.0",
      });
    });

    it("should attach set headers metadata with dynamic values", () => {
      const dynamicValue = (req: Request, _res: Response) =>
        `User-${req.params.id}`;

      class TestController {
        @SetHeaders({ "X-User-ID": dynamicValue })
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetHeadersMetadata(instance, "testMethod");

      expect(metadata?.headers[0]?.name).toBe("X-User-ID");
      expect(typeof metadata?.headers[0]?.value).toBe("function");
    });

    it("should handle multiple headers with mixed static and dynamic values", () => {
      const dynamicValue = (req: Request) => req.user?.userId || "anonymous";

      class TestController {
        @SetHeaders({
          "X-API-Version": "1.0",
          "X-User-ID": dynamicValue,
          "X-Custom": "custom-value",
        })
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetHeadersMetadata(instance, "testMethod");

      expect(metadata?.headers).toHaveLength(3);
      expect(metadata?.headers[0]?.value).toBe("1.0");
      expect(typeof metadata?.headers[1]?.value).toBe("function");
      expect(metadata?.headers[2]?.value).toBe("custom-value");
    });

    it("should handle empty headers object", () => {
      class TestController {
        @SetHeaders({})
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetHeadersMetadata(instance, "testMethod");

      expect(metadata?.headers).toEqual([]);
    });

    it("should work on multiple methods independently", () => {
      class TestController {
        @SetHeaders({ "X-Method": "method1" })
        method1() {}

        @SetHeaders({ "X-Method": "method2" })
        method2() {}
      }

      const instance = new TestController();
      const metadata1 = getSetHeadersMetadata(instance, "method1");
      const metadata2 = getSetHeadersMetadata(instance, "method2");

      expect(metadata1?.headers[0]?.value).toBe("method1");
      expect(metadata2?.headers[0]?.value).toBe("method2");
    });
  });

  describe("RequiredCookie decorator", () => {
    it("should attach required cookie metadata", () => {
      class TestController {
        @RequiredCookie("sessionId")
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredCookieMetadata(instance, "testMethod");

      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("sessionId");
    });

    it("should work with different cookie names", () => {
      class TestController {
        @RequiredCookie("refreshToken")
        method1() {}

        @RequiredCookie("accessToken")
        method2() {}
      }

      const instance = new TestController();
      const metadata1 = getRequiredCookieMetadata(instance, "method1");
      const metadata2 = getRequiredCookieMetadata(instance, "method2");

      expect(metadata1?.name).toBe("refreshToken");
      expect(metadata2?.name).toBe("accessToken");
    });

    it("should not have options when not provided", () => {
      class TestController {
        @RequiredCookie("test")
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredCookieMetadata(instance, "testMethod");

      expect(metadata?.options).toBeUndefined();
    });
  });

  describe("RefreshTokenCookie decorator", () => {
    it("should be a shorthand for RequiredCookie with refreshToken", () => {
      class TestController {
        @RefreshTokenCookie()
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredCookieMetadata(instance, "testMethod");

      expect(metadata?.name).toBe("refreshToken");
    });

    it("should work on multiple methods", () => {
      class TestController {
        @RefreshTokenCookie()
        method1() {}

        @RefreshTokenCookie()
        method2() {}
      }

      const instance = new TestController();
      const metadata1 = getRequiredCookieMetadata(instance, "method1");
      const metadata2 = getRequiredCookieMetadata(instance, "method2");

      expect(metadata1?.name).toBe("refreshToken");
      expect(metadata2?.name).toBe("refreshToken");
    });
  });

  describe("SetCookie decorator", () => {
    it("should attach set cookie metadata without options", () => {
      class TestController {
        @SetCookie("sessionId")
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetCookieMetadata(instance, "testMethod");

      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("sessionId");
      expect(metadata?.options).toBeUndefined();
    });

    it("should attach set cookie metadata with options", () => {
      class TestController {
        @SetCookie("refreshToken", {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetCookieMetadata(instance, "testMethod");

      expect(metadata?.name).toBe("refreshToken");
      expect(metadata?.options).toMatchObject({
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    });

    it("should handle all cookie options", () => {
      class TestController {
        @SetCookie("test", {
          domain: "example.com",
          maxAge: 3600000,
          sameSite: "lax",
          secure: true,
          httpOnly: true,
          path: "/api",
        })
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetCookieMetadata(instance, "testMethod");

      expect(metadata?.options).toMatchObject({
        domain: "example.com",
        maxAge: 3600000,
        sameSite: "lax",
        secure: true,
        httpOnly: true,
        path: "/api",
      });
    });

    it("should handle boolean sameSite option", () => {
      class TestController {
        @SetCookie("test", { sameSite: true })
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetCookieMetadata(instance, "testMethod");

      expect(metadata?.options?.sameSite).toBe(true);
    });

    it('should handle "none" sameSite option', () => {
      class TestController {
        @SetCookie("test", { sameSite: "none", secure: true })
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetCookieMetadata(instance, "testMethod");

      expect(metadata?.options?.sameSite).toBe("none");
      expect(metadata?.options?.secure).toBe(true);
    });
  });

  describe("Metadata getters", () => {
    it("should return undefined for methods without decorators", () => {
      class TestController {
        testMethod() {}
      }

      const instance = new TestController();

      expect(
        getRequiredHeadersMetadata(instance, "testMethod"),
      ).toBeUndefined();
      expect(getSetHeadersMetadata(instance, "testMethod")).toBeUndefined();
      expect(getRequiredCookieMetadata(instance, "testMethod")).toBeUndefined();
      expect(getSetCookieMetadata(instance, "testMethod")).toBeUndefined();
    });

    it("should return undefined for non-existent methods", () => {
      class TestController {
        @RequiredHeaders(["test"])
        testMethod() {}
      }

      const instance = new TestController();

      expect(
        getRequiredHeadersMetadata(instance, "nonExistent"),
      ).toBeUndefined();
    });
  });

  describe("createRequiredHeadersMiddleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        headers: {},
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    it("should call next when all required headers are present", () => {
      mockReq.headers = {
        authorization: "Bearer token",
        "content-type": "application/json",
      };

      const middleware = createRequiredHeadersMiddleware([
        "authorization",
        "content-type",
      ]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should return 400 when required header is missing", () => {
      mockReq.headers = {
        "content-type": "application/json",
      };

      const middleware = createRequiredHeadersMiddleware(["authorization"]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Missing required headers: authorization",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 with all missing headers", () => {
      mockReq.headers = {};

      const middleware = createRequiredHeadersMiddleware([
        "authorization",
        "content-type",
        "x-api-key",
      ]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error:
          "Missing required headers: authorization, content-type, x-api-key",
      });
    });

    it("should be case-insensitive for header checking", () => {
      mockReq.headers = {
        authorization: "Bearer token",
      };

      const middleware = createRequiredHeadersMiddleware(["Authorization"]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should handle empty required headers array", () => {
      const middleware = createRequiredHeadersMiddleware([]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should identify some missing headers among multiple", () => {
      mockReq.headers = {
        authorization: "Bearer token",
      };

      const middleware = createRequiredHeadersMiddleware([
        "authorization",
        "content-type",
        "x-api-key",
      ]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Missing required headers: content-type, x-api-key",
      });
    });
  });

  describe("createSetHeadersMiddleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        params: { id: "123" },
        user: { id: "456" },
      } as any;
      mockRes = {
        setHeader: vi.fn(),
      };
      mockNext = vi.fn();
    });

    it("should set static headers", () => {
      const headers = [
        { name: "X-API-Version", value: "1.0" },
        { name: "X-Custom", value: "custom-value" },
      ];

      const middleware = createSetHeadersMiddleware(headers);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith("X-API-Version", "1.0");
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-Custom",
        "custom-value",
      );
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should set dynamic headers using function", () => {
      const headers = [
        {
          name: "X-User-ID",
          value: (req: Request) => `User-${(req as any).user.id}`,
        },
      ];

      const middleware = createSetHeadersMiddleware(headers);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith("X-User-ID", "User-456");
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should handle mixed static and dynamic headers", () => {
      const headers = [
        { name: "X-API-Version", value: "1.0" },
        {
          name: "X-Request-ID",
          value: (req: Request) => `req-${(req as any).params.id}`,
        },
      ];

      const middleware = createSetHeadersMiddleware(headers);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith("X-API-Version", "1.0");
      expect(mockRes.setHeader).toHaveBeenCalledWith("X-Request-ID", "req-123");
    });

    it("should handle empty headers array", () => {
      const middleware = createSetHeadersMiddleware([]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should call dynamic functions with req and res", () => {
      const dynamicFn = vi.fn().mockReturnValue("dynamic-value");
      const headers = [{ name: "X-Dynamic", value: dynamicFn }];

      const middleware = createSetHeadersMiddleware(headers);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(dynamicFn).toHaveBeenCalledWith(mockReq, mockRes);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-Dynamic",
        "dynamic-value",
      );
    });
  });

  describe("createRequiredCookieMiddleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        cookies: {},
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    it("should call next when required cookie is present", () => {
      mockReq.cookies = {
        refreshToken: "token-value",
      };

      const middleware = createRequiredCookieMiddleware("refreshToken");

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should return 401 when required cookie is missing", () => {
      mockReq.cookies = {};

      const middleware = createRequiredCookieMiddleware("refreshToken");

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Missing required cookie: refreshToken",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when cookies object is undefined", () => {
      mockReq.cookies = undefined;

      const middleware = createRequiredCookieMiddleware("sessionId");

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Missing required cookie: sessionId",
      });
    });

    it("should check for specific cookie name", () => {
      mockReq.cookies = {
        otherCookie: "value",
      };

      const middleware = createRequiredCookieMiddleware("refreshToken");

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept cookie with any truthy value", () => {
      mockReq.cookies = {
        test: "0",
      };

      const middleware = createRequiredCookieMiddleware("test");

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
    });
  });

  describe("Combined decorators", () => {
    it("should allow multiple header decorators on same method", () => {
      class TestController {
        @RequiredHeaders(["authorization"])
        @SetHeaders({ "X-API-Version": "1.0" })
        testMethod() {}
      }

      const instance = new TestController();
      const requiredHeaders = getRequiredHeadersMetadata(
        instance,
        "testMethod",
      );
      const setHeaders = getSetHeadersMetadata(instance, "testMethod");

      expect(requiredHeaders?.headers).toEqual(["authorization"]);
      expect(setHeaders?.headers[0]?.value).toBe("1.0");
    });

    it("should allow cookie and header decorators together", () => {
      class TestController {
        @RequiredCookie("sessionId")
        @RequiredHeaders(["authorization"])
        @SetHeaders({ "X-Custom": "value" })
        testMethod() {}
      }

      const instance = new TestController();

      expect(getRequiredCookieMetadata(instance, "testMethod")?.name).toBe(
        "sessionId",
      );
      expect(
        getRequiredHeadersMetadata(instance, "testMethod")?.headers,
      ).toEqual(["authorization"]);
      expect(
        getSetHeadersMetadata(instance, "testMethod")?.headers[0]?.name,
      ).toBe("X-Custom");
    });

    it("should allow SetCookie with other decorators", () => {
      class TestController {
        @SetCookie("newSession", { httpOnly: true })
        @SetHeaders({ "X-New-Session": "true" })
        testMethod() {}
      }

      const instance = new TestController();

      expect(getSetCookieMetadata(instance, "testMethod")?.name).toBe(
        "newSession",
      );
      expect(
        getSetCookieMetadata(instance, "testMethod")?.options?.httpOnly,
      ).toBe(true);
      expect(
        getSetHeadersMetadata(instance, "testMethod")?.headers[0]?.value,
      ).toBe("true");
    });
  });

  describe("Edge cases", () => {
    it("should handle special characters in header names", () => {
      class TestController {
        @RequiredHeaders(["x-custom-header-123"])
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredHeadersMetadata(instance, "testMethod");

      expect(metadata?.headers).toContain("x-custom-header-123");
    });

    it("should handle special characters in cookie names", () => {
      class TestController {
        @RequiredCookie("session_id_123")
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getRequiredCookieMetadata(instance, "testMethod");

      expect(metadata?.name).toBe("session_id_123");
    });

    it("should handle maxAge of 0 for cookies", () => {
      class TestController {
        @SetCookie("temp", { maxAge: 0 })
        testMethod() {}
      }

      const instance = new TestController();
      const metadata = getSetCookieMetadata(instance, "testMethod");

      expect(metadata?.options?.maxAge).toBe(0);
    });
  });
});
