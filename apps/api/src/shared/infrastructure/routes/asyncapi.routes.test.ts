import { describe, expect, it, vi } from "vitest";

const { generateSpec } = vi.hoisted(() => ({
  generateSpec: vi.fn(() => ({
    asyncapi: "2.6.0",
    info: { title: "T" },
  })),
}));

vi.mock("../documentation/asyncapi-generator", () => ({
  asyncAPIGenerator: { generateSpec },
}));

import { createAsyncAPIRouter } from "./asyncapi.routes";

describe("createAsyncAPIRouter", () => {
  it("GET /asyncapi.json calls generateSpec with host from req and returns JSON", () => {
    const router = createAsyncAPIRouter();
    const layer = router.stack.find(
      (l) => "route" in l && l.route?.path === "/asyncapi.json"
    ) as { route: { stack: { handle: Function }[] } } | undefined;

    expect(layer).toBeDefined();

    const handler = layer!.route.stack[0]!.handle;
    const req = { get: vi.fn().mockReturnValue("api.example.com:3000") };
    const res = { json: vi.fn() };

    handler(req, res);

    expect(generateSpec).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Cinema WebSocket API",
        serverUrl: "ws://api.example.com:3000",
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      asyncapi: "2.6.0",
      info: { title: "T" },
    });
  });

  it("uses localhost fallback when host header is missing", () => {
    generateSpec.mockClear();
    const router = createAsyncAPIRouter();
    const layer = router.stack.find(
      (l) => "route" in l && l.route?.path === "/asyncapi.json"
    ) as { route: { stack: { handle: Function }[] } } | undefined;
    const handler = layer!.route.stack[0]!.handle;

    const req = { get: vi.fn().mockReturnValue(undefined) };
    const res = { json: vi.fn() };
    handler(req, res);

    expect(generateSpec).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrl: "ws://localhost:3000",
      })
    );
  });
});
