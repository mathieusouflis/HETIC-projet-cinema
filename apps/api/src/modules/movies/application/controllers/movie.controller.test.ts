import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { MoviesController } from "./movie.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("MoviesController", () => {
  it("queryMovies returns 200 and payload", async () => {
    const queryMoviesUseCase: ExecuteMock = { execute: vi.fn() };
    const getMovieByIdUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new MoviesController(
      queryMoviesUseCase as never,
      getMovieByIdUseCase as never
    );
    const req = makeReq({ query: { page: "1", limit: "10" } as never });
    const res = makeRes();
    const next = makeNext();
    const payload = { success: true, data: { items: [] } };
    queryMoviesUseCase.execute.mockResolvedValue(payload);

    controller.queryMovies(req, res, next);
    await flush();

    expect(queryMoviesUseCase.execute).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(payload);
    expect(next).not.toHaveBeenCalled();
  });

  it("getMovieById maps withCategories and returns 200", async () => {
    const queryMoviesUseCase: ExecuteMock = { execute: vi.fn() };
    const getMovieByIdUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new MoviesController(
      queryMoviesUseCase as never,
      getMovieByIdUseCase as never
    );
    const req = makeReq({
      params: { id: "m1" } as never,
      query: { withCategories: "true" } as never,
    });
    const res = makeRes();
    const next = makeNext();
    const movie = { id: "m1" };
    getMovieByIdUseCase.execute.mockResolvedValue(movie);

    controller.getMovieById(req, res, next);
    await flush();

    expect(getMovieByIdUseCase.execute).toHaveBeenCalledWith("m1", {
      withCategories: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Movie retrieved successfully",
      data: movie,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
