import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  inet,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "../../../../database/schema";

export const refreshTokensSchema = pgTable(
  "refresh_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    tokenHash: varchar("token_hash", { length: 255 }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  },
  (table) => [
    index("idx_refresh_tokens_expires").using(
      "btree",
      table.expiresAt.asc().nullsLast()
    ),
    index("idx_refresh_tokens_hash").using(
      "btree",
      table.tokenHash.asc().nullsLast()
    ),
    index("idx_refresh_tokens_user").using(
      "btree",
      table.userId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "refresh_tokens_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const refreshTokensRelationsSchema = relations(
  refreshTokensSchema,
  ({ one }) => ({
    user: one(users, {
      fields: [refreshTokensSchema.userId],
      references: [users.id],
    }),
  })
);
