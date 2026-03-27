import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { SeriesController } from "./serie.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("SeriesController", () => {
  it("querySeries returns 200 and payload", async () => {
    const querySeriesUseCase: ExecuteMock = { execute: vi.fn() };
    const getSerieByIdUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new SeriesController(
      querySeriesUseCase as never,
      getSerieByIdUseCase as never
    );
    const req = makeReq({ query: { page: "1", limit: "10" } as never });
    const res = makeRes();
    const next = makeNext();
    const payload = { success: true, data: { items: [] } };
    querySeriesUseCase.execute.mockResolvedValue(payload);

    controller.querySeries(req, res, next);
    await flush();

    expect(querySeriesUseCase.execute).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(payload);
    expect(next).not.toHaveBeenCalled();
  });

  it("getSerieById maps withCategories and returns 200", async () => {
    const querySeriesUseCase: ExecuteMock = { execute: vi.fn() };
    const getSerieByIdUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new SeriesController(
      querySeriesUseCase as never,
      getSerieByIdUseCase as never
    );
    const req = makeReq({
      params: { id: "s1" } as never,
      query: { withCategories: "true" } as never,
    });
    const res = makeRes();
    const next = makeNext();
    const serie = { id: "s1" };
    getSerieByIdUseCase.execute.mockResolvedValue(serie);

    controller.getSerieById(req, res, next);
    await flush();

    expect(getSerieByIdUseCase.execute).toHaveBeenCalledWith("s1", {
      withCategories: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Serie retrieved successfully",
      data: serie,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
