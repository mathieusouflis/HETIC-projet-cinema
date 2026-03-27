import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { CategoriesController } from "./categories.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("CategoriesController", () => {
  it("getCategoryById et listCategories retournent 200", async () => {
    const getCategoryByIdUseCase: ExecuteMock = { execute: vi.fn() };
    const listCategoriesUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new CategoriesController(
      getCategoryByIdUseCase as never,
      listCategoriesUseCase as never
    );
    const res = makeRes();
    const next = makeNext();

    getCategoryByIdUseCase.execute.mockResolvedValue({
      toJSON: () => ({ id: "c1", name: "Action" }),
    });
    controller.getCategoryById(
      makeReq({ params: { id: "c1" } as never }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);

    listCategoriesUseCase.execute.mockResolvedValue({
      categories: [{ toJSONWithRelations: () => ({ id: "c1" }) }],
      total: 1,
      page: 1,
      limit: 10,
    });
    controller.listCategories(
      makeReq({ query: { page: 1, limit: 10 } as never }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
