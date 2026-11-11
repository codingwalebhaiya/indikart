import { sql } from "drizzle-orm";

import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  timestamp,
  boolean,
  uniqueIndex,
  text,
  integer,
  index,
  numeric,
  check,
} from "drizzle-orm/pg-core";

// User roles
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

export const brandEnum = pgEnum("brand", [
  "Nike",
  "Adidas",
  "Puma",
  "Reebok",
  "Jordan",
]);
export const categoryEnum = pgEnum("category", ["Men", "Women", "Kids"]);
export const subCategoryEnum = pgEnum("sub_category", [
  "Sport Shoes",
  "Running Shoes",
  "Casual Shoes",
  "Football Shoes",
  "Basketball Shoes",
]);

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: text("password").notNull(), // not varchar
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
    userAgent: text("user_agent"),
    deviceName: varchar("device_name"),
    refreshTokenHash: text("refresh_token_hash").notNull(),
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

    index("sessions_refresh_token_hash_unique").on(table.refreshTokenHash),

    index("sessions_expires_at_idx").on(table.expiresAt),
    check(
      "sessions_expires_check",
      sql`${table.expiresAt} > ${table.createdAt}`,
    ),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description"),
    brand: brandEnum("brand").notNull(),
    category: categoryEnum("category").notNull(),
    subCategory: subCategoryEnum("sub_category").notNull(),
    // text[] is better than varchar[] for s3 keys
    s3ImageKey: text("s3_image_key")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    // this is for s3 bucket image key ["image1","image2","image3","image4"]
    // store in cents/paise to avoid float issues, or use numeric
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
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
  (table) => [
    // 1. Case-insensitive unique slug
    uniqueIndex("products_slug_unique_idx").on(sql`lower(${table.slug})`),

    // 2. Performance indexes for filters
    index("products_brand_idx").on(table.brand),
    index("products_category_idx").on(table.category),
    index("products_is_active_idx").on(table.isActive),
    // 3. Data integrity checks
    check("products_price_check", sql`${table.price} >= 0`),
    check("products_stock_check", sql`${table.stock} >= 0`),
    check(
      "products_s3_images_check",
      sql`array_length(${table.s3ImageKey}, 1) BETWEEN 1 AND 4`,
    ),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// note - onDelete: "cascade" means deleting a product also deletes its variants. In normal application workflows, we will deactivate products instead.
