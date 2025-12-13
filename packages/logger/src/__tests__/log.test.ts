import { describe, it, expect, vi } from "vitest";
import { log } from "..";

vi.spyOn(global.console, "log");

describe("@packages/logger", () => {
  it("prints a message", () => {
    log("hello");
    expect(console.log).toBeCalledWith("LOGGER: ", "hello");
  });
});
