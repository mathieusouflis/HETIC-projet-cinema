import { describe, expect, it, vi } from "vitest";
import { logger } from "..";

const consoleLogSpy = vi
  .spyOn(globalThis.console, "log")
  .mockImplementation(() => {
    return;
  });

describe("@packages/logger", () => {
  it("info should print with INFO prefix", () => {
    logger.info("hello");

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "\x1b[36m%s\x1b[0m",
      "    [INFO] ",
      "hello"
    );
  });

  it("warn should print with WARN prefix", () => {
    logger.warn("be careful");

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "\x1b[33m%s\x1b[0m",
      "    [WARN] ",
      "be careful"
    );
  });

  it("error should print with ERROR prefix", () => {
    logger.error("boom");

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "\x1b[31m%s\x1b[0m",
      "   [ERROR] ",
      "boom"
    );
  });

  it("success should print with SUCCESS prefix", () => {
    logger.success("done");

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "\x1b[32m%s\x1b[0m",
      " [SUCCESS] ",
      "done"
    );
  });

  it("should forward multiple arguments", () => {
    logger.info("hello", { id: 1 }, 42);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "\x1b[36m%s\x1b[0m",
      "    [INFO] ",
      "hello",
      { id: 1 },
      42
    );
  });
});
