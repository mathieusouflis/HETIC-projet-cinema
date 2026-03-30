import { describe, expect, it } from "vitest";
import {
  generateSecureToken,
  getExpiryDate,
  hashToken,
} from "./crypto.utils";

describe("crypto.utils", () => {
  it("generateSecureToken returns a hex string of expected length (default 32 bytes)", () => {
    const token = generateSecureToken();
    expect(token).toMatch(/^[0-9a-f]+$/);
    expect(token.length).toBe(64);
  });

  it("generateSecureToken respects custom byte length", () => {
    const token = generateSecureToken(16);
    expect(token.length).toBe(32);
  });

  it("hashToken is deterministic for the same input", () => {
    const a = hashToken("same");
    const b = hashToken("same");
    expect(a).toBe(b);
    expect(a.length).toBe(64);
  });

  it("hashToken differs when input differs", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });

  it("getExpiryDate shifts now by the given milliseconds", () => {
    const now = Date.now();
    const d = getExpiryDate(5000);
    expect(d.getTime()).toBeGreaterThanOrEqual(now + 4999);
    expect(d.getTime()).toBeLessThanOrEqual(now + 5010);
  });

  it("getExpiryDate(0) returns a date at or very near now", () => {
    const before = Date.now();
    const d = getExpiryDate(0);
    const after = Date.now();
    expect(d.getTime()).toBeGreaterThanOrEqual(before);
    expect(d.getTime()).toBeLessThanOrEqual(after);
  });

  it("generateSecureToken produces different values across calls", () => {
    const a = generateSecureToken(8);
    const b = generateSecureToken(8);
    expect(a).not.toBe(b);
  });

  it("hashToken output looks like a SHA-256 hex digest", () => {
    expect(hashToken("hello")).toMatch(/^[0-9a-f]{64}$/);
  });
});
