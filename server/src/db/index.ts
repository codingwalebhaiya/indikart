import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import { env } from "../config/env.js";
import { logger } from "../infrastructure/logger/logger.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10, // max no. of connections
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
  logger.error({ err: error }, "Unexpected postgresql pool error");
});

export const db = drizzle(pool, { schema });
