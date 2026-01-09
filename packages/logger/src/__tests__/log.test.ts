import { describe, it, expect, vi } from "vitest";
import { logger } from "..";

vi.spyOn(global.console, "log");

describe("@packages/logger", () => {
  it("prints a message", () => {
    logger.info("hello");
    expect(console.log).toBeCalledWith("[INFO] ", "hello");
  });
});
