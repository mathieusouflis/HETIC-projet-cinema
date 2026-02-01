import { describe, expect, it } from "vitest";
import { ValidationError } from "./validation-error";

describe("ValidationError", () => {
  it("Should instanciate ValidationError", () => {
    expect(new ValidationError()).toBeDefined();
  });
});
