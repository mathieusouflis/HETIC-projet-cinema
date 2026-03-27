import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("should merge basic class names", () => {
    expect(cn("p-2", "text-sm")).toBe("p-2 text-sm");
  });

  it("should resolve tailwind conflicts with latest value", () => {
    expect(cn("p-2", "p-4", "text-sm", "text-lg")).toBe("p-4 text-lg");
  });

  it("should ignore falsy values", () => {
    expect(cn("rounded", false && "hidden", null, undefined, "block")).toBe(
      "rounded block"
    );
  });
});
