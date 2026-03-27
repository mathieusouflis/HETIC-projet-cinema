import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the generated SDK functions
vi.mock("@packages/api-sdk", () => ({
  pATCHUsersMe: vi.fn(),
  gETUsersMe: vi.fn(),
  dELETEUsersMe: vi.fn(),
}));

import * as sdk from "@packages/api-sdk";
import { usersService } from "./index";

const mockPatchData = {
  success: true,
  data: { userId: "abc", email: "test@example.com", username: "testuser" },
};

const mockGetMeData = {
  success: true,
  data: {
    userId: "abc",
    email: "test@example.com",
    username: "testuser",
    avatarUrl: null,
    followersCount: 12,
    followingCount: 7,
    stats: {
      totalSeriesHours: 0,
      totalMovieHours: 14,
      totalEpisodes: 42,
      totalMovies: 18,
    },
  },
};

describe("usersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("patchMe", () => {
    it("should call pATCHUsersMe with the correct payload", async () => {
      vi.mocked(sdk.pATCHUsersMe).mockResolvedValue({
        data: mockPatchData,
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
        data: mockPatchData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as never,
      });

      const result = await usersService.patchMe({ username: "foo" });
      expect(result).toEqual(mockPatchData);
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
        data: mockGetMeData,
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
        data: mockGetMeData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as never,
      });

      const result = await usersService.getMe();
      expect(result).toEqual(mockGetMeData);
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
