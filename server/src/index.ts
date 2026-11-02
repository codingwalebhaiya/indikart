import { pool } from "./db/index.js";
import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
