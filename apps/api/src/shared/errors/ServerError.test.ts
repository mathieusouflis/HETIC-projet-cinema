import { describe, it, expect } from "vitest";
import { ServerError } from "./ServerError";

describe("ServerError", () => {
  it("Should instanciate ServerError", () => {
    expect(new ServerError()).toBeDefined();
  });
});
