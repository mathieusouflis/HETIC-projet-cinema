import { describe, expect, it } from "vitest";
import { ForbiddenError } from "./forbidden-error";

describe("ForbiddenError", () => {
  it("Should instanciate ForbiddenError", () => {
    expect(new ForbiddenError()).toBeDefined();
  });
});
