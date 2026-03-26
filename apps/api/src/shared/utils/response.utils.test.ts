import { describe, expect, it } from "vitest";
import {
  buildEmptyResponse,
  buildErrorResponse,
  buildExtendedPaginatedResponse,
  buildListResponse,
  buildOffsetPaginatedResponse,
  buildOffsetPaginatedResponseFromResult,
  buildPaginatedResponse,
  buildPaginatedResponseFromResult,
  buildSuccessResponse,
  buildSuccessWithMessage,
  transformAndWrap,
  transformArrayAndWrap,
  transformOffsetPaginatedData,
  transformPaginatedData,
} from "./response.utils.js";

describe("response.utils", () => {
  it("buildSuccessResponse should wrap data", () => {
    const response = buildSuccessResponse({ id: "1" });

    expect(response).toEqual({
      success: true,
      data: { id: "1" },
    });
  });

  it("buildSuccessWithMessage should include message and data", () => {
    const response = buildSuccessWithMessage({ id: "1" }, "created");

    expect(response).toEqual({
      success: true,
      message: "created",
      data: { id: "1" },
    });
  });

  it("buildErrorResponse should include details only when provided", () => {
    expect(buildErrorResponse("oops")).toEqual({
      success: false,
      error: "oops",
    });

    expect(buildErrorResponse("oops", { code: "E1" })).toEqual({
      success: false,
      error: "oops",
      details: { code: "E1" },
    });
  });

  it("buildListResponse should return success response with array", () => {
    const response = buildListResponse([{ id: "a" }, { id: "b" }]);

    expect(response).toEqual({
      success: true,
      data: [{ id: "a" }, { id: "b" }],
    });
  });

  it("buildEmptyResponse should include optional message", () => {
    expect(buildEmptyResponse()).toEqual({ success: true });
    expect(buildEmptyResponse("done")).toEqual({
      success: true,
      message: "done",
    });
  });

  it("buildPaginatedResponse and buildPaginatedResponseFromResult should keep expected meta fields", () => {
    const items = [{ id: "1" }, { id: "2" }];
    const pagination = {
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    };

    const direct = buildPaginatedResponse(items, pagination);
    const fromResult = buildPaginatedResponseFromResult({ items, pagination });

    expect(direct).toEqual({
      success: true,
      data: {
        items,
        pagination: {
          page: 2,
          total: 25,
          totalPages: 3,
        },
      },
    });
    expect(fromResult).toEqual(direct);
  });

  it("buildExtendedPaginatedResponse should include full metadata", () => {
    const response = buildExtendedPaginatedResponse([{ id: "1" }], {
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
      offset: 0,
      hasNextPage: true,
      hasPreviousPage: false,
    });

    expect(response).toEqual({
      success: true,
      data: {
        items: [{ id: "1" }],
        pagination: {
          page: 1,
          total: 45,
          totalPages: 3,
          offset: 0,
          limit: 20,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    });
  });

  it("buildOffsetPaginatedResponse and buildOffsetPaginatedResponseFromResult should return offset format", () => {
    const items = [{ id: "x" }];
    const pagination = {
      offset: 10,
      limit: 5,
      total: 17,
      hasMore: true,
    };

    const direct = buildOffsetPaginatedResponse(items, pagination);
    const fromResult = buildOffsetPaginatedResponseFromResult({
      items,
      pagination,
    });

    expect(direct).toEqual({
      success: true,
      data: {
        items,
        pagination,
      },
    });
    expect(fromResult).toEqual(direct);
  });

  it("transformAndWrap and transformArrayAndWrap should map data before wrapping", () => {
    const single = transformAndWrap({ first: "john", last: "doe" }, (u) => {
      return `${u.first} ${u.last}`;
    });

    const list = transformArrayAndWrap(
      [{ value: 1 }, { value: 2 }],
      (item) => item.value * 10
    );

    expect(single).toEqual({
      success: true,
      data: "john doe",
    });
    expect(list).toEqual({
      success: true,
      data: [10, 20],
    });
  });

  it("transformPaginatedData and transformOffsetPaginatedData should map only items", () => {
    const paginated = transformPaginatedData(
      {
        items: [{ id: 1 }, { id: 2 }],
        pagination: {
          page: 1,
          limit: 2,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      (item) => ({ key: String(item.id) })
    );

    const offset = transformOffsetPaginatedData(
      {
        items: [{ id: 3 }],
        pagination: {
          offset: 0,
          limit: 1,
          total: 1,
          hasMore: false,
        },
      },
      (item) => ({ key: `id-${item.id}` })
    );

    expect(paginated).toEqual({
      success: true,
      data: {
        items: [{ key: "1" }, { key: "2" }],
        pagination: {
          page: 1,
          total: 2,
          totalPages: 1,
        },
      },
    });

    expect(offset).toEqual({
      success: true,
      data: {
        items: [{ key: "id-3" }],
        pagination: {
          offset: 0,
          limit: 1,
          total: 1,
          hasMore: false,
        },
      },
    });
  });
});
