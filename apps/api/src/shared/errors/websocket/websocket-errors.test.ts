import { describe, expect, it } from "vitest";
import { WebSocketHandlerNotFoundError } from "./websocket-handler-error";
import { WebSocketInternalError } from "./websocket-internal-error";
import { WebSocketMiddlewareError } from "./websocket-middleware-error";
import { WebSocketValidationError } from "./websocket-validation-error";

describe("WebSocket error classes", () => {
  it("WebSocketHandlerNotFoundError carries code and optional event", () => {
    const err = new WebSocketHandlerNotFoundError("onFoo", "evt-1");
    expect(err.message).toContain("onFoo");
    expect(err.code).toBe("WS_HANDLER_NOT_FOUND");
    expect(err.event).toBe("evt-1");
    expect(err.toJSON()).toMatchObject({
      code: "WS_HANDLER_NOT_FOUND",
      event: "evt-1",
    });
  });

  it("WebSocketInternalError defaults to non-operational internal message", () => {
    const err = new WebSocketInternalError();
    expect(err.message).toBe("Internal server error");
    expect(err.code).toBe("WS_INTERNAL_ERROR");
    expect(err.isOperational).toBe(false);
  });

  it("WebSocketInternalError accepts custom message and event", () => {
    const err = new WebSocketInternalError("boom", "e2");
    expect(err.message).toBe("boom");
    expect(err.event).toBe("e2");
  });

  it("WebSocketMiddlewareError sets middleware code", () => {
    const err = new WebSocketMiddlewareError("nope", "mid");
    expect(err.message).toBe("nope");
    expect(err.code).toBe("WS_MIDDLEWARE_ERROR");
    expect(err.event).toBe("mid");
  });

  it("WebSocketValidationError toJSON includes details when provided", () => {
    const details = [{ path: ["body", "x"], message: "required" }];
    const err = new WebSocketValidationError("bad", details, "val");
    expect(err.details).toEqual(details);
    expect(err.toJSON()).toEqual({
      error: "bad",
      code: "WS_VALIDATION_ERROR",
      event: "val",
      details,
    });
  });
});
