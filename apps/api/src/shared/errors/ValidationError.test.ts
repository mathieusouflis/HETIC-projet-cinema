import { describe, it, expect } from "vitest";
import { ValidationError } from "./ValidationError";

describe("ValidationError", () => {
  it("Should instanciate ValidationError", () => {
    expect(new ValidationError()).toBeDefined();
  });
});
