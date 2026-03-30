import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { queryClient } from "./client";

describe("queryClient default options", () => {
  const options = queryClient.getDefaultOptions();
  const queryRetry = options.queries?.retry as (
    failureCount: number,
    error: AxiosError
  ) => boolean;
  const queryRetryDelay = options.queries?.retryDelay as (
    attemptIndex: number
  ) => number;
  const mutationRetry = options.mutations?.retry as (
    failureCount: number,
    error: AxiosError
  ) => boolean;
  const mutationRetryDelay = options.mutations?.retryDelay as (
    attemptIndex: number
  ) => number;

  it("disable retry for 401/403 and any 4xx status", () => {
    expect(queryRetry(0, { response: { status: 401 } } as AxiosError)).toBe(
      false
    );
    expect(queryRetry(0, { response: { status: 403 } } as AxiosError)).toBe(
      false
    );
    expect(queryRetry(0, { response: { status: 404 } } as AxiosError)).toBe(
      false
    );
    expect(mutationRetry(0, { response: { status: 401 } } as AxiosError)).toBe(
      false
    );
    expect(mutationRetry(0, { response: { status: 404 } } as AxiosError)).toBe(
      false
    );
  });

  it("retries queries on 5xx responses up to the failure cap", () => {
    expect(queryRetry(0, { response: { status: 500 } } as AxiosError)).toBe(
      true
    );
    expect(queryRetry(2, { response: { status: 500 } } as AxiosError)).toBe(
      true
    );
    expect(queryRetry(3, { response: { status: 500 } } as AxiosError)).toBe(
      false
    );
  });

  it("apply retry limits for non-4xx errors", () => {
    expect(queryRetry(0, {} as AxiosError)).toBe(true);
    expect(queryRetry(2, {} as AxiosError)).toBe(true);
    expect(queryRetry(3, {} as AxiosError)).toBe(false);

    expect(mutationRetry(0, {} as AxiosError)).toBe(true);
    expect(mutationRetry(1, {} as AxiosError)).toBe(false);
  });

  it("caps exponential retry delay at 30s", () => {
    expect(queryRetryDelay(0)).toBe(1000);
    expect(queryRetryDelay(1)).toBe(2000);
    expect(queryRetryDelay(10)).toBe(30000);

    expect(mutationRetryDelay(0)).toBe(1000);
    expect(mutationRetryDelay(10)).toBe(30000);
  });
});
