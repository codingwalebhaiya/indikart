import { pool } from "./db/index.js";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./infrastructure/logger/logger.js";

const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info({ PORT }, "Server running on port ");
});

async function shutdownServer() {
  server.close(async () => {
    logger.info({}, "Closing server gracefully...");
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdownServer);
process.on("SIGINT", shutdownServer);
