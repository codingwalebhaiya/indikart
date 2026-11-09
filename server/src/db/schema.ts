import { sql } from "drizzle-orm";

import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  timestamp,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// User roles
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", {
      length: 255,
    }).notNull(),
    role: userRoleEnum("role").notNull().default("USER"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("users_email_unique").on(sql`lower(${table.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    ipAddress: varchar("ip_address", {
      length: 45,
    }),
    userAgent: varchar("user_agent", {
      length: 500,
    }),
    deviceName: varchar("device_name", {
      length: 255,
    }),
    refreshTokenHash: varchar("refresh_token_hash", {
      length: 255,
    }).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),
    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    lastActiveAt: timestamp("last_active_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sessions_user_id_last_active_at_idx").on(
      table.userId,
      table.lastActiveAt,
    ),

    uniqueIndex("sessions_refresh_token_hash_unique").on(
      table.refreshTokenHash,
    ),

    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);
