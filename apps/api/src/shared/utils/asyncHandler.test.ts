import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "./asyncHandler";

describe("asyncHandler", () => {
  const mockRequest = () => ({} as Request);
  const mockResponse = () =>
    ({
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    }) as unknown as Response;
  const mockNext = () => vi.fn() as NextFunction;

  it("should call the wrapped async function with req, res, and next", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const asyncFn = vi.fn().mockResolvedValue(undefined);

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    expect(asyncFn).toHaveBeenCalledTimes(1);
  });

  it("should not call next when async function resolves successfully", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const asyncFn = vi.fn().mockResolvedValue(undefined);

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(next).not.toHaveBeenCalled();
  });

  it("should handle successful async operations that return a response", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const asyncFn = vi.fn().mockImplementation(async (_req, res) => {
      return res.json({ success: true });
    });

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(asyncFn).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it("should catch errors and pass them to next", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const error = new Error("Test error");
    const asyncFn = vi.fn().mockRejectedValue(error);

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should handle thrown errors in async function", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const error = new Error("Thrown error");
    const asyncFn = vi.fn().mockImplementation(async () => {
      throw error;
    });

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should handle different types of errors", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const stringError = "String error";
    const asyncFn = vi.fn().mockRejectedValue(stringError);

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(stringError);
  });

  it("should handle custom error objects", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const customError = {
      statusCode: 404,
      message: "Not found",
    };
    const asyncFn = vi.fn().mockRejectedValue(customError);

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(customError);
  });

  it("should handle async functions that access request params", async () => {
    const req = {
      params: { id: "123" },
      body: { name: "Test" },
    } as unknown as Request;
    const res = mockResponse();
    const next = mockNext();
    const asyncFn = vi.fn().mockImplementation(async (req, res) => {
      return res.json({ id: req.params.id, name: req.body.name });
    });

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(res.json).toHaveBeenCalledWith({ id: "123", name: "Test" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should work with multiple sequential calls", async () => {
    const req1 = mockRequest();
    const res1 = mockResponse();
    const next1 = mockNext();
    const req2 = mockRequest();
    const res2 = mockResponse();
    const next2 = mockNext();

    const asyncFn = vi.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(asyncFn);

    handler(req1, res1, next1);
    handler(req2, res2, next2);

    await new Promise((resolve) => setImmediate(resolve));

    expect(asyncFn).toHaveBeenCalledTimes(2);
    expect(next1).not.toHaveBeenCalled();
    expect(next2).not.toHaveBeenCalled();
  });

  it("should handle promise that resolves to void", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const asyncFn = vi.fn().mockImplementation(async (_req, res) => {
      res.status(200).send("OK");
    });

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("OK");
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle errors in promise chain", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const error = new Error("Database error");
    const asyncFn = vi.fn().mockImplementation(async () => {
      await Promise.reject(error);
    });

    const handler = asyncHandler(asyncFn);
    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
  });

  it("should return void from the wrapper function", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const asyncFn = vi.fn().mockResolvedValue(undefined);

    const handler = asyncHandler(asyncFn);
    const result = handler(req, res, next);

    expect(result).toBeUndefined();
  });
});
