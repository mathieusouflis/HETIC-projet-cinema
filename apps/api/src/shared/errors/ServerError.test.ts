import { describe, expect, it } from "vitest";
import { ServerError } from "./server-error";

describe("ServerError", () => {
  it("Should instanciate ServerError", () => {
    expect(new ServerError()).toBeDefined();
  });
});
