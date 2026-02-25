import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { parseApiError } from "./parse-error";

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = {
    status,
    statusText: String(status),
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  };
  return err;
}

describe("parseApiError", () => {
  it("returns a generic globalError for non-Axios errors", () => {
    const result = parseApiError(new Error("network fail"));
    expect(result.fieldErrors).toEqual({});
    expect(result.globalError).toBeTruthy();
  });

  it("returns a generic globalError when the error body is missing", () => {
    const err = makeAxiosError(500, null);
    const result = parseApiError(err);
    expect(result.fieldErrors).toEqual({});
    expect(result.globalError).toBeTruthy();
  });

  it("returns a generic globalError when error field is not a string", () => {
    const err = makeAxiosError(500, {
      success: false,
      error: { nested: true },
    });
    const result = parseApiError(err);
    expect(result.fieldErrors).toEqual({});
    expect(result.globalError).toBeTruthy();
  });

  it("extracts field errors from a validation error response", () => {
    // Real shape: { success, error: string, details: [...] }
    const err = makeAxiosError(400, {
      success: false,
      error: "Validation failed",
      details: [
        {
          field: "email",
          message: "Invalid email format",
          code: "invalid_string",
        },
        { field: "username", message: "Username too short", code: "too_small" },
      ],
    });

    const result = parseApiError(err);

    expect(result.fieldErrors).toEqual({
      email: "Invalid email format",
      username: "Username too short",
    });
    expect(result.globalError).toBeNull();
  });

  it("returns a globalError for a business error without field details", () => {
    const err = makeAxiosError(409, {
      success: false,
      error: 'A user with email "foo@bar.com" already exists',
    });

    const result = parseApiError(err);

    expect(result.fieldErrors).toEqual({});
    expect(result.globalError).toBe(
      'A user with email "foo@bar.com" already exists'
    );
  });

  it("returns a globalError when there are no details", () => {
    const err = makeAxiosError(401, {
      success: false,
      error: "User not authenticated",
    });

    const result = parseApiError(err);

    expect(result.fieldErrors).toEqual({});
    expect(result.globalError).toBe("User not authenticated");
  });
});
