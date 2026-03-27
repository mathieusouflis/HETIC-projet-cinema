import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServerError } from "../../errors/server-error";

const { infoMock, errorMock } = vi.hoisted(() => ({
  infoMock: vi.fn(),
  errorMock: vi.fn(),
}));

const createMock = vi.hoisted(() => vi.fn());
vi.mock("mailgun.js", () => ({
  default: vi.fn(function MailgunMock() {
    return {
      client: () => ({
        messages: {
          create: createMock,
        },
      }),
    };
  }),
}));

vi.mock("@packages/logger", () => ({
  logger: {
    info: infoMock,
    error: errorMock,
  },
}));

import { config } from "@packages/config";
import { MailgunEmailService } from "./mailgun.service";

describe("MailgunEmailService", () => {
  const service = new MailgunEmailService();

  beforeEach(() => {
    infoMock.mockReset();
    errorMock.mockReset();
    createMock.mockReset();
  });

  it("logs email in development mode", async () => {
    const previous = config.env.NODE_ENV;
    (config.env as any).NODE_ENV = "development";

    await service.send("john@doe.com", "subject", "body");
    expect(infoMock).toHaveBeenCalledTimes(1);

    (config.env as any).NODE_ENV = previous;
  });

  it("sends email through mailgun outside development", async () => {
    const previous = config.env.NODE_ENV;
    (config.env as any).NODE_ENV = "production";
    createMock.mockResolvedValue({ id: "m1" });

    await service.send("john@doe.com", "subject", "body");
    expect(createMock).toHaveBeenCalledTimes(1);

    (config.env as any).NODE_ENV = previous;
  });

  it("throws ServerError when mailgun fails", async () => {
    const previous = config.env.NODE_ENV;
    (config.env as any).NODE_ENV = "production";
    createMock.mockRejectedValue(new Error("boom"));

    await expect(
      service.send("john@doe.com", "subject", "body")
    ).rejects.toBeInstanceOf(ServerError);
    expect(errorMock).toHaveBeenCalledTimes(1);

    (config.env as any).NODE_ENV = previous;
  });
});
