import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { optionalUserId, requireUserId } from "./auth.utils.js";

const makeRequest = (user?: { userId?: string }) =>
  ({ user }) as unknown as Request;

describe("auth.utils", () => {
  describe("requireUserId", () => {
    it("should return user id when authenticated user exists", () => {
      const req = makeRequest({ userId: "user-123" });

      const result = requireUserId(req);

      expect(result).toBe("user-123");
    });

    it("should throw UnauthorizedError when user is missing", () => {
      const req = makeRequest();

      expect(() => requireUserId(req)).toThrow(UnauthorizedError);
      expect(() => requireUserId(req)).toThrow("User not authenticated");
    });

    it("should throw UnauthorizedError when userId is undefined", () => {
      const req = makeRequest({});

      expect(() => requireUserId(req)).toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when userId is empty", () => {
      const req = makeRequest({ userId: "" });

      expect(() => requireUserId(req)).toThrow(UnauthorizedError);
    });
  });

  describe("optionalUserId", () => {
    it("should return user id when authenticated user exists", () => {
      const req = makeRequest({ userId: "user-456" });

      const result = optionalUserId(req);

      expect(result).toBe("user-456");
    });

    it("should return undefined when user is missing", () => {
      const req = makeRequest();

      const result = optionalUserId(req);

      expect(result).toBeUndefined();
    });

    it("should return undefined when userId is missing", () => {
      const req = makeRequest({});

      const result = optionalUserId(req);

      expect(result).toBeUndefined();
    });
  });
});
