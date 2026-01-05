import { describe, it } from "vitest";
import {
  baseDataWithMessageResponseSchema,
  baseListResponseSchema,
  basePaginatedResponseSchema,
  createListResponse,
  createPaginatedResponse,
  createSuccessWithMessage,
} from "./response.schemas";
import z from "zod";

describe("ResponseSchema", () => {
  it("Should create a baseDataWithMessageResponseSchema", () => {
    const schema = baseDataWithMessageResponseSchema(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        message: "Success",
        data: "Data",
      }),
    ).not.toThrow();
  });

  it("Should create a basePaginatedResponseSchema", () => {
    const schema = basePaginatedResponseSchema(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        data: {
          items: ["Data"],
          pagination: {
            page: 1,
            total: 1,
            totalPages: 0,
          },
        },
      }),
    ).not.toThrow();
  });

  it("Should create a baseListResponseSchema", () => {
    const schema = baseListResponseSchema(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        data: ["Data"],
      }),
    ).not.toThrow();
  });

  it("Should create a success response with a message", () => {
    const schema = createSuccessWithMessage(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        message: "Success",
        data: "Data",
      }),
    ).not.toThrow();
  });

  it("Should create a success response with a list of item", () => {
    const schema = createListResponse(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        data: ["Data"],
      }),
    ).not.toThrow();
  });

  it("Should create a success response with pagination", () => {
    const schema = createPaginatedResponse(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        data: {
          items: ["Data"],
          pagination: {
            page: 1,
            total: 1,
            totalPages: 1,
          },
        },
      }),
    ).not.toThrow();
  });
});
