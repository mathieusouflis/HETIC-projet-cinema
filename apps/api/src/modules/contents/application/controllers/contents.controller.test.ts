import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ContentsController } from "./contents.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("ContentsController", () => {
  it("queryContents retourne 200", async () => {
    const queryContentsUseCase: ExecuteMock = { execute: vi.fn() };
    const getContentByIdUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new ContentsController(
      queryContentsUseCase as never,
      getContentByIdUseCase as never
    );
    const payload = { success: true, data: { items: [] } };
    queryContentsUseCase.execute.mockResolvedValue(payload);
    const req = makeReq({ query: { page: "1" } as never });
    const res = makeRes();
    const next = makeNext();

    controller.queryContents(req, res, next);
    await flush();

    expect(queryContentsUseCase.execute).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(payload);
    expect(next).not.toHaveBeenCalled();
  });

  it("getContentById mappe les flags booleens depuis la query", async () => {
    const queryContentsUseCase: ExecuteMock = { execute: vi.fn() };
    const getContentByIdUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new ContentsController(
      queryContentsUseCase as never,
      getContentByIdUseCase as never
    );
    const content = { id: "x1" };
    getContentByIdUseCase.execute.mockResolvedValue(content);
    const req = makeReq({
      params: { id: "x1" } as never,
      query: {
        withCast: "true",
        withCategory: "false",
        withPlatform: "true",
        withSeasons: "true",
        withEpisodes: "false",
      } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.getContentById(req, res, next);
    await flush();

    expect(getContentByIdUseCase.execute).toHaveBeenCalledWith({
      id: "x1",
      withCast: true,
      withCategory: false,
      withPlatform: true,
      withSeasons: true,
      withEpisodes: false,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: content,
    });
  });
});
