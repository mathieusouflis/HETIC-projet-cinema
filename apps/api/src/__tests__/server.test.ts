import supertest from "supertest";
import { describe, it, expect, vi } from "vitest";

vi.mock("../database/index.js", () => ({
  isDatabaseHealthy: vi.fn().mockResolvedValue(true),
  getAdapter: vi.fn().mockReturnValue({
    db: {},
    pool: null,
    isConnected: () => true,
    healthCheck: vi.fn().mockResolvedValue(true),
  }),
  db: {},
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

import { createServer } from "../server";

describe("Server", () => {
  it("health check returns 200", async () => {
    const { app } = createServer();
    const response = await supertest(app).get("/status");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
