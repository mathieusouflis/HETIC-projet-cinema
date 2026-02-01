import { describe, it } from "vitest";
import z from "zod";
import {
  baseDataWithMessageResponseSchema,
  baseListResponseSchema,
  basePaginatedResponseSchema,
  createListResponseSchema,
  createPaginatedResponseSchema,
  createSuccessWithMessageSchema,
} from "./response.schemas";

describe("ResponseSchema", () => {
  it("Should create a baseDataWithMessageResponseSchema", () => {
    const schema = baseDataWithMessageResponseSchema(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        message: "Success",
        data: "Data",
      })
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
      })
    ).not.toThrow();
  });

  it("Should create a baseListResponseSchema", () => {
    const schema = baseListResponseSchema(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        data: ["Data"],
      })
    ).not.toThrow();
  });

  it("Should create a success response with a message", () => {
    const schema = createSuccessWithMessageSchema(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        message: "Success",
        data: "Data",
      })
    ).not.toThrow();
  });

  it("Should create a success response with a list of item", () => {
    const schema = createListResponseSchema(z.string());
    expect(schema).toBeDefined();
    expect(() =>
      schema.parse({
        success: true,
        data: ["Data"],
      })
    ).not.toThrow();
  });

  it("Should create a success response with pagination", () => {
    const schema = createPaginatedResponseSchema(z.string());
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
      })
    ).not.toThrow();
  });
});
