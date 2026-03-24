import crypto from "node:crypto";

/**
 * Generate a cryptographically secure random token.
 * Returns the raw hex string — never store this directly; hash it first.
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hash a token with SHA-256 for safe storage.
 * Use the raw token in URLs/emails; store only the hash in the DB.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Returns a Date that is `expiryMs` milliseconds from now.
 */
export function getExpiryDate(expiryMs: number): Date {
  return new Date(Date.now() + expiryMs);
}
