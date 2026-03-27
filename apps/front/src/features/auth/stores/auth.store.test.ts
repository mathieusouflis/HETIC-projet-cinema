import { beforeEach, describe, expect, it } from "vitest";
import { useAuth } from "./auth.store";

const storage = (() => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
  };
})();

describe("useAuth store", () => {
  beforeEach(() => {
    globalThis.sessionStorage = storage as Storage;
    useAuth.getState().clear();
  });

  it("updates user/loading/error and clear resets state", () => {
    useAuth.getState().setLoading(true);
    useAuth.getState().setError("oops");
    useAuth
      .getState()
      .setUser({ id: "u1", email: "john@doe.com", username: "john" } as never);

    expect(useAuth.getState().isLoading).toBe(true);
    expect(useAuth.getState().error).toBe("oops");
    expect(useAuth.getState().user?.id).toBe("u1");

    useAuth.getState().clear();

    expect(useAuth.getState().isLoading).toBe(false);
    expect(useAuth.getState().error).toBeNull();
    expect(useAuth.getState().user).toBeNull();
  });
});
