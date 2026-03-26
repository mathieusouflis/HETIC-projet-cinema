import { rateLimit } from "express-rate-limit";

export const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5 * 15 * 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});
