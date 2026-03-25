import {
  foreignKey,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "../../../../database/schema.js";

export const emailVerificationTokensSchema = pgTable(
  "email_verification_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_email_verification_tokens_hash").using(
      "btree",
      table.tokenHash.asc().nullsLast()
    ),
    index("idx_email_verification_tokens_user").using(
      "btree",
      table.userId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "email_verification_tokens_user_id_fkey",
    }).onDelete("cascade"),
  ]
);
