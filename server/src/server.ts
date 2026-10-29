import { env } from "./config/env.js";
import { pool } from "./db/index.js";
import app from "./index.js";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

async function shutdownServer() {
  server.close(async () => {
    console.log("Closing server gracefully...");
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdownServer);
process.on("SIGINT", shutdownServer);
