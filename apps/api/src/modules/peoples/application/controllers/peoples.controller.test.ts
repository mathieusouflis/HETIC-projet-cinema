import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { PeoplesController } from "./peoples.controller";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("PeoplesController", () => {
  const makeController = () => {
    const listPeoplesUseCase: ExecuteMock = { execute: vi.fn() };
    const searchPeopleUseCase: ExecuteMock = { execute: vi.fn() };
    const getPeopleUseCase: ExecuteMock = { execute: vi.fn() };
    const createPeopleUseCase: ExecuteMock = { execute: vi.fn() };
    const updatePeopleUseCase: ExecuteMock = { execute: vi.fn() };
    const deletePeopleUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new PeoplesController(
      listPeoplesUseCase as never,
      searchPeopleUseCase as never,
      getPeopleUseCase as never,
      createPeopleUseCase as never,
      updatePeopleUseCase as never,
      deletePeopleUseCase as never
    );
    return {
      controller,
      listPeoplesUseCase,
      searchPeopleUseCase,
      getPeopleUseCase,
      createPeopleUseCase,
    };
  };

  it("list/search/get/create retournent 200/201", async () => {
    const {
      controller,
      listPeoplesUseCase,
      searchPeopleUseCase,
      getPeopleUseCase,
      createPeopleUseCase,
    } = makeController();
    const res = makeRes();
    const next = makeNext();

    listPeoplesUseCase.execute.mockResolvedValue({ success: true, data: [] });
    controller.listPeoples(
      makeReq({ query: { limit: 10 } as never }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);

    searchPeopleUseCase.execute.mockResolvedValue({ success: true, data: [] });
    controller.searchPeople(
      makeReq({ query: { query: "john" } as never }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);

    getPeopleUseCase.execute.mockResolvedValue({
      toJSON: () => ({ id: "p1" }),
    });
    controller.getPeopleById(
      makeReq({ params: { id: "p1" } as never }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);

    createPeopleUseCase.execute.mockResolvedValue({
      toJSON: () => ({ id: "p2" }),
    });
    controller.createPeople(
      makeReq({ body: { name: "John", birthDate: "2000-01-01" } as never }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
