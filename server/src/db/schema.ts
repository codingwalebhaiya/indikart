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
  primaryKey,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";

// ============ ENUMS ============
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
  "refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "cod",
  "upi",
  "card",
  "netbanking",
  "wallet",
]);

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
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
    deviceName: varchar("device_name", { length: 255 }),
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

    uniqueIndex("sessions_refresh_token_hash_unique").on(
      table.refreshTokenHash,
    ),
    index("sessions_expires_at_idx").on(table.expiresAt),
    check(
      "sessions_expires_check",
      sql`${table.expiresAt} > ${table.createdAt}`,
    ),
  ],
);

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  phone: varchar("phone", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  postalCode: varchar("postal_code", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
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
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description"),
    brandId: uuid("brand_id").references(() => brands.id, {
      onDelete: "cascade",
    }),
    // store in cents/paise to avoid float issues, or use numeric
    // price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    // stock: integer("stock").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // 1. Case-insensitive unique slug
    uniqueIndex("products_slug_unique_idx").on(sql`lower(${table.slug})`),
    index("products_description_idx").on(table.description),
    // 2. Data integrity checks
    // check("products_price_check", sql`${table.price} >= 0`),
    // check("products_stock_check", sql`${table.stock} >= 0`),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
    index("categories_parent_idx").on(table.parentId),
  ],
);

// product and category - junction table (also called a join or bridge table) for many to many relationship (one product can have multiple categories and one category can have multiple products)
export const productCategory = pgTable(
  "product_category",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
    index("product_category_category_id_idx").on(table.categoryId),
  ],
);

export const productOptionsGroups = pgTable(
  "product_option_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    name: varchar("name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [index("product_option_group_product_id_idx").on(table.productId)],
);

export const productOptionValues = pgTable(
  "product_option_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    value: varchar("value", { length: 50 }).notNull(),
    optionGroupId: uuid("option_group_id")
      .notNull()
      .references(() => productOptionsGroups.id, {
        onDelete: "cascade",
      }),
    colorCode: varchar("color_code", { length: 20 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    index("product_option_value_option_group_id_idx").on(table.optionGroupId),
    index("product_option_value_value_idx").on(table.value),
  ],
);

export const productVariant = pgTable(
  "product_variant",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    sku: varchar("sku", { length: 50 }).notNull().unique(), // sku means -  Stock Keeping Unit ( A unique code for each product variant )-  unique
    // alphanumeric code (like TSHIRT-BLK-L or IPH15-256-BLU)  , it helps to track inventory and sales of each product variant.

    // DYNAMIC ATTRIBUTES EXAMPLE: { "size": "M", "color": "Red" } OR { "ram": "16GB", "storage": "512GB" }
    attributes: jsonb("attributes").notNull().$type<Record<string, string>>(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
    //stock: integer("stock").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("product_variant_sku_unique_idx").on(table.sku),
    index("product_variant_product_id_idx").on(table.productId),
    index("product_variant_attributes_idx").on(table.attributes),
    index("product_variant_price_idx").on(table.price),
    //index("product_variant_stock_idx").on(table.stock),
    check("product_variant_price_check", sql`${table.price} >= 0`),
    //check("product_variant_stock_check", sql`${table.stock} >= 0`),
    check(
      "product_variant_sku_length_check",
      sql`length(${table.sku}) BETWEEN 1 AND 50`,
    ),
  ],
);

export const variantOptionValues = pgTable(
  "variant_option_values",
  {
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id, {
        onDelete: "cascade",
      }),
    optionValueId: uuid("option_value_id")
      .notNull()
      .references(() => productOptionValues.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.variantId, table.optionValueId] }),
    index("variant_option_values_option_value_id_idx").on(table.optionValueId),
  ],
);

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("brand_slug_idx").on(table.slug)],
);

export const productVariantImages = pgTable(
  "product_variant_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    optionValueId: uuid("option_value_id").references(
      () => productOptionValues.id,
      {
        onDelete: "cascade",
      },
    ),
    // variantId: uuid("variant_id").references(() => productVariant.id, {
    // onDelete: "cascade",
    // }),

    imageStorageKey: varchar("image_storage_key", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false), //On homepage / category page you show ONE image
    altText: varchar("alt_text", { length: 255 }),
    position: integer("position").notNull().default(0), //shows images in specific order you set.
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("product_images_product_id_idx").on(table.productId),
    index("product_images_option_value_id_idx").on(table.optionValueId),
    //  Enforce 5 images per color: unique(optionValueId, position)
    uniqueIndex("product_variant_image_color_position_unique_idx").on(
      table.optionValueId,
      table.position,
    ),
    check("product_images_position_check", sql`${table.position} >= 0`),
    check(
      "product_images_image_storage_key_check",
      sql`${table.imageStorageKey} IS NOT NULL`,
    ),
    // check(
    //   "product_images_max_images_check",
    //   //sql`array_length(${table.imageStorageKey}, 1) BETWEEN 1 AND 4`,
    // ),
  ],
);