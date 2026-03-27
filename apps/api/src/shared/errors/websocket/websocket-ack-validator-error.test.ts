import { describe, expect, it } from "vitest";
import { WebSocketAckValidationError } from "./websocket-ack-validator-error";

describe("WebSocketAckValidationError", () => {
  it("uses default message and code", () => {
    const err = new WebSocketAckValidationError();
    expect(err.message).toBe("Acknowledgment validation failed");
    expect(err.code).toBe("WS_ACK_VALIDATION_ERROR");
  });

  it("accepts custom message and event", () => {
    const err = new WebSocketAckValidationError("Ack invalid", "message:send");
    expect(err.toJSON()).toEqual({
      error: "Ack invalid",
      code: "WS_ACK_VALIDATION_ERROR",
      event: "message:send",
    });
  });
});
