import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgTable,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { content, contentCredits, people } from "../../../../database/schema";

export const contentCreditsSchema = pgTable(
  "content_credits",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    contentId: uuid("content_id").notNull(),
    personId: uuid("person_id").notNull(),
    role: varchar({ length: 50 }).notNull(),
    characterName: varchar("character_name", { length: 255 }),
    orderIndex: integer("order_index"),
  },
  (table) => [
    index("idx_credits_content").using(
      "btree",
      table.contentId.asc().nullsLast()
    ),
    index("idx_credits_person").using(
      "btree",
      table.personId.asc().nullsLast(),
      table.role.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "content_credits_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [people.id],
      name: "content_credits_person_id_fkey",
    }).onDelete("cascade"),
    unique("unique_credit").on(table.role, table.personId, table.contentId),
  ]
);

export type ContentCreditsRow = typeof contentCreditsSchema.$inferSelect;
export type NewContentCreditsRow = typeof contentCreditsSchema.$inferInsert;

export const contentCreditsRelationsSchema = relations(
  contentCreditsSchema,
  ({ one }) => ({
    content: one(content, {
      fields: [contentCredits.contentId],
      references: [content.id],
    }),
    person: one(people, {
      fields: [contentCredits.personId],
      references: [people.id],
    }),
  })
);
