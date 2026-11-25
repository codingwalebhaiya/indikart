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
  index,
  numeric,
  check,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";

import type { AnyPgColumn } from "drizzle-orm/pg-core";

// ============ ENUMS ============
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

export const status = pgEnum("status", ["draft", "published", "archived"]);

// 
export const imageStatusEnum = pgEnum("image_status", ["uploaded", "processing", "ready", "failed", "deleted"]);

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

//  --------------- products -----------------
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
    // base price - jab koi variant select na ho tab dikhane ke liye
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    status: status("status").notNull().default("draft"),
    publishedAt: timestamp("published_at").defaultNow(),
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
    index("products_description_idx").on(table.description),
    check("products_base_price_check", sql`${table.basePrice} >= 0`),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "set null",
    }), // self-referencing key - parent category ko refer karegi
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

// attributes like Color, Size, etc.
export const attributes = pgTable("attributes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

// attribute values like red, blue, green, small, medium, large, etc.
export const attributeValues = pgTable(
  "attribute_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    value: varchar("value", { length: 50 }).notNull(),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attributes.id, {
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
    uniqueIndex("attribute_value_unique_idx").on(
      table.attributeId,
      sql`lower(${table.value})`,
    ),
  ],
);

export const productVariant = pgTable(
  "product_variant",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, {
        onDelete: "cascade",
      })
      .notNull(),
    sku: varchar("sku", { length: 50 }).notNull().unique(), // sku means -  Stock Keeping Unit ( A unique code for each product variant )-  unique
    // alphanumeric code (like TSHIRT-BLK-L or IPH15-256-BLU)  , it helps to track inventory and sales of each product variant.

    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    //discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
    stock: integer("stock").notNull().default(0),
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
    index("product_variant_price_idx").on(table.price),
    check("product_variant_price_check", sql`${table.price} >= 0`),
    check(
      "product_variant_sku_length_check",
      sql`length(${table.sku}) BETWEEN 1 AND 50`,
    ),
  ],
);

// product_variants (Many) <-> attribute_values (Many)

// Ek Variant me bahut saare Attribute Values ho sakte hain - Red + XL
// Aur ek Attribute Value bahut saare Variants me use ho sakta hai - Red color Red-L, Red-XL, Red-XXL teeno me hai.

// Direct connect nahi ho sakta, isiliye beech me ek // Junction Table chahiye: variant_attribute_values
export const variantAttributeValues = pgTable(
  "variant_attribute_values",
  {
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id, {
        onDelete: "cascade",
      }),
    attributeValueId: uuid("attribute_value_id")
      .notNull()
      .references(() => attributeValues.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.variantId, table.attributeValueId] }),
    index("variant_attribute_values_attribute_value_id_idx").on(
      table.attributeValueId,
    ),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    variantId: uuid("variant_id").references(() => productVariant.id, {
      onDelete: "cascade", // variant delete to image delete
    }),

    rawS3Key: varchar("raw_s3_key", { length: 500 }), // raw/products/xxx.jpg - temporary, worker delete kar dega
    s3Key: varchar("s3_key", { length: 500 }).notNull(), // processed/products/xxx-medium.webp
    url: varchar("url", { length: 500 }).notNull(),
    // Extra versions for fast loading
    variantsJson: text("variants_json"), // {"thumb": ".../thumb.webp", "medium": ".../medium.webp", "large": ".../large.webp"} JSON string

    isPrimary: boolean("is_primary").default(false), //On homepage / category page you show ONE image
    sortOrder: integer("sort_order").default(0), // Images first by sort_order, then by 
    status: imageStatusEnum("status").notNull().default("processing"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("product_images_product_id_idx").on(table.productId),
    check(
      "product_images_image_storage_key_check",
      sql`${table.s3Key} IS NOT NULL`,
    ),
  ],
);
