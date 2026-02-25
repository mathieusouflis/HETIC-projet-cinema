import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the generated SDK functions
vi.mock("@packages/api-sdk", () => ({
  pATCHUsersMe: vi.fn(),
  gETUsersMe: vi.fn(),
  deleteUsersMe: vi.fn(),
}));

import * as sdk from "@packages/api-sdk";
import { usersService } from "./index";

const mockData = {
  success: true,
  data: { userId: "abc", email: "test@example.com", username: "testuser" },
};

describe("usersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("patchMe", () => {
    it("should call pATCHUsersMe with the correct payload", async () => {
      vi.mocked(sdk.pATCHUsersMe).mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as never,
      });

      const payload = { username: "newname" };
      await usersService.patchMe(payload);

      expect(sdk.pATCHUsersMe).toHaveBeenCalledWith(payload);
    });

    it("should return response.data", async () => {
      vi.mocked(sdk.pATCHUsersMe).mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as never,
      });

      const result = await usersService.patchMe({ username: "foo" });
      expect(result).toEqual(mockData);
    });

    it("should propagate errors from pATCHUsersMe", async () => {
      vi.mocked(sdk.pATCHUsersMe).mockRejectedValue(new Error("Network error"));
      await expect(usersService.patchMe({ username: "foo" })).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("getMe", () => {
    it("should call gETUsersMe", async () => {
      vi.mocked(sdk.gETUsersMe).mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as never,
      });

      await usersService.getMe();
      expect(sdk.gETUsersMe).toHaveBeenCalledTimes(1);
    });

    it("should return response.data", async () => {
      vi.mocked(sdk.gETUsersMe).mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as never,
      });

      const result = await usersService.getMe();
      expect(result).toEqual(mockData);
    });
  });

  describe("deleteMe", () => {
    it("should call deleteUsersMe", async () => {
      vi.mocked(sdk.dELETEUsersMe).mockResolvedValue({
        data: undefined,
        status: 204,
        statusText: "No Content",
        headers: {},
        config: {} as never,
      });

      await usersService.deleteMe();
      expect(sdk.dELETEUsersMe).toHaveBeenCalledTimes(1);
    });

    it("should resolve without a return value", async () => {
      vi.mocked(sdk.dELETEUsersMe).mockResolvedValue({
        data: undefined,
        status: 204,
        statusText: "No Content",
        headers: {},
        config: {} as never,
      });

      const result = await usersService.deleteMe();
      expect(result).toBeUndefined();
    });
  });
});
