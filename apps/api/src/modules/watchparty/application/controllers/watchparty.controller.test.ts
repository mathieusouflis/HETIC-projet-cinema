import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { WatchpartyController } from "./watchparty.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

const party = {
  id: "wp1",
  title: "Soirée",
};

function makeController() {
  const listWatchpartiesUseCase: ExecuteMock = { execute: vi.fn() };
  const getWatchpartyUseCase: ExecuteMock = { execute: vi.fn() };
  const createWatchpartyUseCase: ExecuteMock = { execute: vi.fn() };
  const updateWatchpartyUseCase: ExecuteMock = { execute: vi.fn() };
  const deleteWatchpartyUseCase: ExecuteMock = { execute: vi.fn() };

  const controller = new WatchpartyController(
    listWatchpartiesUseCase as never,
    getWatchpartyUseCase as never,
    createWatchpartyUseCase as never,
    updateWatchpartyUseCase as never,
    deleteWatchpartyUseCase as never
  );

  return {
    controller,
    listWatchpartiesUseCase,
    getWatchpartyUseCase,
    createWatchpartyUseCase,
    updateWatchpartyUseCase,
    deleteWatchpartyUseCase,
  };
}

describe("WatchpartyController", () => {
  it("queryWatchparties retourne 200", async () => {
    const { controller, listWatchpartiesUseCase } = makeController();
    const payload = { data: [], total: 0 };
    listWatchpartiesUseCase.execute.mockResolvedValue(payload);
    const req = makeReq({
      user: { userId: "u1" } as never,
      query: {} as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.queryWatchparties(req, res, next);
    await flush();

    expect(listWatchpartiesUseCase.execute).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("queryWatchparties sans user appelle next", async () => {
    const { controller } = makeController();
    const req = makeReq({ query: {} as never });
    const res = makeRes();
    const next = makeNext();

    controller.queryWatchparties(req, res, next);
    await flush();

    expect(next).toHaveBeenCalled();
  });

  it("getWatchpartyById retourne 200", async () => {
    const { controller, getWatchpartyUseCase } = makeController();
    getWatchpartyUseCase.execute.mockResolvedValue(party);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "wp1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.getWatchpartyById(req, res, next);
    await flush();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getWatchpartyById introuvable appelle next", async () => {
    const { controller, getWatchpartyUseCase } = makeController();
    getWatchpartyUseCase.execute.mockResolvedValue(null);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "wp1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.getWatchpartyById(req, res, next);
    await flush();

    expect(next).toHaveBeenCalled();
  });

  it("createWatchparty retourne 201", async () => {
    const { controller, createWatchpartyUseCase } = makeController();
    createWatchpartyUseCase.execute.mockResolvedValue(party);
    const body = { contentId: "c1", title: "T" };
    const req = makeReq({
      user: { userId: "u1" } as never,
      body: body as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.createWatchparty(req, res, next);
    await flush();

    expect(createWatchpartyUseCase.execute).toHaveBeenCalledWith("u1", body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("updateWatchparty retourne 200", async () => {
    const { controller, updateWatchpartyUseCase } = makeController();
    updateWatchpartyUseCase.execute.mockResolvedValue(party);
    const body = { title: "New" };
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "wp1" } as never,
      body: body as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.updateWatchparty(req, res, next);
    await flush();

    expect(updateWatchpartyUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "wp1",
      body
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deleteWatchparty retourne 200", async () => {
    const { controller, deleteWatchpartyUseCase } = makeController();
    deleteWatchpartyUseCase.execute.mockResolvedValue(undefined);
    const req = makeReq({
      user: { userId: "u1" } as never,
      params: { id: "wp1" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.deleteWatchparty(req, res, next);
    await flush();

    expect(deleteWatchpartyUseCase.execute).toHaveBeenCalledWith("u1", "wp1");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
