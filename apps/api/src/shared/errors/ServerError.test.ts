import { describe, expect, it } from "vitest";
import { ServerError } from "./ServerError";

describe("ServerError", () => {
  it("Should instanciate ServerError", () => {
    expect(new ServerError()).toBeDefined();
  });
});
