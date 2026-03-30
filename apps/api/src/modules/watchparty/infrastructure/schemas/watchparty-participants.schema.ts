import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users, watchparties } from "../../../../database/schema";

export const watchpartyParticipantsSchema = pgTable(
  "watchparty_participants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    watchpartyId: uuid("watchparty_id").notNull(),
    userId: uuid("user_id").notNull(),
    status: varchar({ length: 20 }).default("invited"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" }),
    leftAt: timestamp("left_at", { withTimezone: true, mode: "string" }),
    totalWatchTimeSeconds: integer("total_watch_time_seconds").default(0),
  },
  (table) => [
    index("idx_watchparty_participants_party").using(
      "btree",
      table.watchpartyId.asc().nullsLast(),
      table.status.asc().nullsLast()
    ),
    index("idx_watchparty_participants_user").using(
      "btree",
      table.userId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.watchpartyId],
      foreignColumns: [watchparties.id],
      name: "watchparty_participants_watchparty_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "watchparty_participants_user_id_fkey",
    }).onDelete("cascade"),
    unique("unique_watchparty_participant").on(
      table.watchpartyId,
      table.userId
    ),
  ]
);

export const watchpartyInvitationsSchema = pgTable(
  "watchparty_invitations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    watchpartyId: uuid("watchparty_id").notNull(),
    inviterId: uuid("inviter_id").notNull(),
    inviteeId: uuid("invitee_id"),
    inviteToken: varchar("invite_token", { length: 255 }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_invitations_invitee").using(
      "btree",
      table.inviteeId.asc().nullsLast()
    ),
    index("idx_invitations_token").using(
      "btree",
      table.inviteToken.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.watchpartyId],
      foreignColumns: [watchparties.id],
      name: "watchparty_invitations_watchparty_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [users.id],
      name: "watchparty_invitations_inviter_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inviteeId],
      foreignColumns: [users.id],
      name: "watchparty_invitations_invitee_id_fkey",
    }).onDelete("cascade"),
    unique("watchparty_invitations_invite_token_key").on(table.inviteToken),
    unique("unique_invitation").on(table.watchpartyId, table.inviteeId),
  ]
);

export const watchpartyParticipantsRelationsSchema = relations(
  watchpartyParticipantsSchema,
  ({ one }) => ({
    watchparty: one(watchparties, {
      fields: [watchpartyParticipantsSchema.watchpartyId],
      references: [watchparties.id],
    }),
    user: one(users, {
      fields: [watchpartyParticipantsSchema.userId],
      references: [users.id],
    }),
  })
);

export const watchpartyInvitationsRelationsSchema = relations(
  watchpartyInvitationsSchema,
  ({ one }) => ({
    watchparty: one(watchparties, {
      fields: [watchpartyInvitationsSchema.watchpartyId],
      references: [watchparties.id],
    }),
    user_inviterId: one(users, {
      fields: [watchpartyInvitationsSchema.inviterId],
      references: [users.id],
      relationName: "watchpartyInvitations_inviterId_users_id",
    }),
    user_inviteeId: one(users, {
      fields: [watchpartyInvitationsSchema.inviteeId],
      references: [users.id],
      relationName: "watchpartyInvitations_inviteeId_users_id",
    }),
  })
);
