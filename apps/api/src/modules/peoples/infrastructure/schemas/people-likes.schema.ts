import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { people, users } from "../../../../database/schema";

export const peopleLikesSchema = pgTable(
  "people_likes",
  {
    userId: uuid("user_id").notNull(),
    personId: uuid("person_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "people_likes_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [people.id],
      name: "people_likes_person_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.personId],
      name: "people_likes_pkey",
    }),
  ]
);

export const peopleLikesRelationsSchema = relations(
  peopleLikesSchema,
  ({ one }) => ({
    user: one(users, {
      fields: [peopleLikesSchema.userId],
      references: [users.id],
    }),
    person: one(people, {
      fields: [peopleLikesSchema.personId],
      references: [people.id],
    }),
  })
);
