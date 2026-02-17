import { describe, expect, it } from "vitest";
import { BaseController } from "../base/controllers/base-controller.js";
import {
  AUTH_MIDDLEWARE_MARKER,
  type AuthMiddlewareMarker,
  isController,
  isRouteHandler,
  type RouteHandler,
} from "./types.js";

describe("Types tests", () => {
  describe("isRouteHandler", () => {
    it("should return true for a valid route handler function", () => {
      const handler: RouteHandler = (_req, res) => {
        res.status(200).send("OK");
      };

      expect(isRouteHandler(handler)).toBe(true);
    });

    it("should return true for async route handler function", () => {
      const handler: RouteHandler = async (_req, res) => {
        res.status(200).send("OK");
      };

      expect(isRouteHandler(handler)).toBe(true);
    });

    it("should return true for route handler with next parameter", () => {
      const handler: RouteHandler = (_req, _res, next) => {
        if (next) {
          next();
        }
      };

      expect(isRouteHandler(handler)).toBe(true);
    });

    it("should return true for any function", () => {
      const func = () => {};

      expect(isRouteHandler(func)).toBe(true);
    });

    it("should return true for arrow function", () => {
      const handler = () => {};

      expect(isRouteHandler(handler)).toBe(true);
    });

    it("should return false for non-function values", () => {
      expect(isRouteHandler(null)).toBe(false);
      expect(isRouteHandler(undefined)).toBe(false);
      expect(isRouteHandler(123)).toBe(false);
      expect(isRouteHandler("string")).toBe(false);
      expect(isRouteHandler({})).toBe(false);
      expect(isRouteHandler([])).toBe(false);
      expect(isRouteHandler(true)).toBe(false);
    });

    it("should return false for object with function property", () => {
      const obj = {
        handler: () => {},
      };

      expect(isRouteHandler(obj)).toBe(false);
    });
  });

  describe("isController", () => {
    it("should return true for BaseController instance", () => {
      class TestController extends BaseController {}

      const controller = new TestController();

      expect(isController(controller)).toBe(true);
    });

    it("should return false for non-controller instances", () => {
      class NotAController {}

      const notController = new NotAController();

      expect(isController(notController)).toBe(false);
    });

    it("should return false for plain objects", () => {
      const obj = {};

      expect(isController(obj)).toBe(false);
    });

    it("should return false for primitive values", () => {
      expect(isController(null)).toBe(false);
      expect(isController(undefined)).toBe(false);
      expect(isController(123)).toBe(false);
      expect(isController("string")).toBe(false);
      expect(isController(true)).toBe(false);
    });

    it("should return false for functions", () => {
      const func = () => {};

      expect(isController(func)).toBe(false);
    });

    it("should return false for arrays", () => {
      expect(isController([])).toBe(false);
      expect(isController([1, 2, 3])).toBe(false);
    });

    it("should return false for objects with similar structure", () => {
      const fakeController = {
        constructor: BaseController,
      };

      expect(isController(fakeController)).toBe(false);
    });
  });

  describe("AUTH_MIDDLEWARE_MARKER", () => {
    it("should be a constant string value", () => {
      expect(AUTH_MIDDLEWARE_MARKER).toBe("__AUTH__");
    });

    it("should have the correct type", () => {
      const marker: AuthMiddlewareMarker = AUTH_MIDDLEWARE_MARKER;

      expect(marker).toBe("__AUTH__");
    });
  });
});
