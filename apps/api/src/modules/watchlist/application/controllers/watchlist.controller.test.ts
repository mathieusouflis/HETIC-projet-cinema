import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { WatchlistController } from "./watchlist.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

const watchlistData = {
  id: "w1",
  userId: "u1",
  contentId: "c1",
  status: "plan_to_watch",
};

function makeController() {
  const queryWatchlistUseCase: ExecuteMock = { execute: vi.fn() };
  const addWatchlistContentUseCase: ExecuteMock = { execute: vi.fn() };
  const getWatchlistByIdUseCase: ExecuteMock = { execute: vi.fn() };
  const getWatchlistByContentIdUseCase: ExecuteMock = { execute: vi.fn() };
  const patchWatchlistByIdUseCase: ExecuteMock = { execute: vi.fn() };
  const putWatchlistByContentIdUseCase: ExecuteMock = { execute: vi.fn() };
  const deleteWatchlistByIdUseCase: ExecuteMock = { execute: vi.fn() };
  const deleteWatchlistByContentIdUseCase: ExecuteMock = { execute: vi.fn() };

  const controller = new WatchlistController(
    queryWatchlistUseCase as never,
    addWatchlistContentUseCase as never,
    getWatchlistByIdUseCase as never,
    getWatchlistByContentIdUseCase as never,
    patchWatchlistByIdUseCase as never,
    putWatchlistByContentIdUseCase as never,
    deleteWatchlistByIdUseCase as never,
    deleteWatchlistByContentIdUseCase as never
  );

  return {
    controller,
    queryWatchlistUseCase,
    addWatchlistContentUseCase,
    getWatchlistByIdUseCase,
    getWatchlistByContentIdUseCase,
    patchWatchlistByIdUseCase,
    putWatchlistByContentIdUseCase,
    deleteWatchlistByIdUseCase,
    deleteWatchlistByContentIdUseCase,
  };
}

describe("WatchlistController", () => {
  it("queryWatchlist retourne 200", async () => {
    const { controller, queryWatchlistUseCase } = makeController();
    const payload = { items: [], total: 0 };
    queryWatchlistUseCase.execute.mockResolvedValue(payload);
    const req = makeReq({
      user: { userId: "u1" } as never,
      query: { page: "1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.queryWatchlist(req, res, next);
    await flush();

    expect(queryWatchlistUseCase.execute).toHaveBeenCalledWith("u1", req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(payload);
    expect(next).not.toHaveBeenCalled();
  });

  it("queryWatchlist sans user appelle next", async () => {
    const { controller } = makeController();
    const req = makeReq({ query: {} as never });
    const res = makeRes();
    const next = makeNext();

    controller.queryWatchlist(req, res, next);
    await flush();

    expect(next).toHaveBeenCalled();
  });

  it("getMovieById retourne 200 avec data", async () => {
    const { controller, getWatchlistByContentIdUseCase } = makeController();
    getWatchlistByContentIdUseCase.execute.mockResolvedValue(watchlistData);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "c1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.getMovieById(req, res, next);
    await flush();

    expect(getWatchlistByContentIdUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "c1"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Content in watchlist retrieved successfully",
      data: watchlistData,
    });
  });

  it("getMovieById sans contenu appelle next", async () => {
    const { controller, getWatchlistByContentIdUseCase } = makeController();
    getWatchlistByContentIdUseCase.execute.mockResolvedValue(null);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "c1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.getMovieById(req, res, next);
    await flush();

    expect(next).toHaveBeenCalled();
  });

  it("addContentToWatchlist retourne 201", async () => {
    const { controller, addWatchlistContentUseCase } = makeController();
    addWatchlistContentUseCase.execute.mockResolvedValue(watchlistData);
    const body = { contentId: "c1" };
    const req = makeReq({
      user: { userId: "u1" } as never,
      body: body as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.addContentToWatchlist(req, res, next);
    await flush();

    expect(addWatchlistContentUseCase.execute).toHaveBeenCalledWith("u1", body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("getWatchlistById retourne 200", async () => {
    const { controller, getWatchlistByIdUseCase } = makeController();
    getWatchlistByIdUseCase.execute.mockResolvedValue(watchlistData);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "w1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.getWatchlistById(req, res, next);
    await flush();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getWatchlistById introuvable appelle next", async () => {
    const { controller, getWatchlistByIdUseCase } = makeController();
    getWatchlistByIdUseCase.execute.mockResolvedValue(null);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "w1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.getWatchlistById(req, res, next);
    await flush();

    expect(next).toHaveBeenCalled();
  });

  it("patchWatchlistById retourne 200", async () => {
    const { controller, patchWatchlistByIdUseCase } = makeController();
    patchWatchlistByIdUseCase.execute.mockResolvedValue(watchlistData);
    const body = { status: "watching" };
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "w1" } as never,
      body: body as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.patchWatchlistById(req, res, next);
    await flush();

    expect(patchWatchlistByIdUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "w1",
      body
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("putWatchlistByContentId retourne 200", async () => {
    const { controller, putWatchlistByContentIdUseCase } = makeController();
    putWatchlistByContentIdUseCase.execute.mockResolvedValue(watchlistData);
    const body = { status: "completed" };
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "c1" } as never,
      body: body as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.putWatchlistByContentId(req, res, next);
    await flush();

    expect(putWatchlistByContentIdUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "c1",
      body
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deleteWatchlistById retourne 200", async () => {
    const { controller, deleteWatchlistByIdUseCase } = makeController();
    deleteWatchlistByIdUseCase.execute.mockResolvedValue(undefined);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "w1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.deleteWatchlistById(req, res, next);
    await flush();

    expect(deleteWatchlistByIdUseCase.execute).toHaveBeenCalledWith("u1", "w1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deleteWatchlistByContentId retourne 200", async () => {
    const { controller, deleteWatchlistByContentIdUseCase } = makeController();
    deleteWatchlistByContentIdUseCase.execute.mockResolvedValue(undefined);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "c1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.deleteWatchlistByContentId(req, res, next);
    await flush();

    expect(deleteWatchlistByContentIdUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "c1"
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
