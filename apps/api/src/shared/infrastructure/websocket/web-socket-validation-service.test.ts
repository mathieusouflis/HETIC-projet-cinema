import { describe, expect, it } from "vitest";
import { z } from "zod";
import { WebSocketValidationError } from "../../errors/websocket";
import {
  WebSocketValidationService,
  webSocketValidationService,
} from "./web-socket-validation-service";

describe("WebSocketValidationService", () => {
  const service = new WebSocketValidationService();

  it("validates event data", () => {
    const schema = z.object({ roomId: z.string() });
    expect(
      service.validateEventData(schema, { roomId: "r1" }, "room:join")
    ).toEqual({ roomId: "r1" });
  });

  it("throws WebSocketValidationError for invalid event data", () => {
    const schema = z.object({ roomId: z.string() });
    expect(() =>
      service.validateEventData(schema, { roomId: 12 }, "room:join")
    ).toThrow(WebSocketValidationError);
  });

  it("validates acknowledgment and parses event payloads", () => {
    const schema = z.object({ ok: z.boolean() });
    expect(
      service.validateAcknowledgment(schema, { ok: true }, "message:send")
    ).toEqual({ ok: true });
    expect(service.parseEventData('{"a":1}')).toEqual({ a: 1 });
    expect(service.parseEventData("not-json")).toBe("not-json");
  });

  it("covers non-zod parse failures and singleton accessor", () => {
    const fakeSchema = {
      parse: () => {
        throw new Error("unexpected");
      },
    };

    expect(() =>
      service.validateEventData(fakeSchema as never, {}, "evt")
    ).toThrow(WebSocketValidationError);
    expect(() =>
      service.validateAcknowledgment(fakeSchema as never, {}, "ack")
    ).toThrow(WebSocketValidationError);
    expect(WebSocketValidationService.getInstance()).toBe(
      webSocketValidationService
    );
  });
});
