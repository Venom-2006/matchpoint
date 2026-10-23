
import http from "node:http";

import app from "./app.js";
import { env } from "./config/env.js";
import {
  connectDatabase,
  disconnectDatabase
} from "./config/database.js";

const server = http.createServer(app);

let isShuttingDown = false;

async function startServer() {
  try {
    await connectDatabase();

    server.listen(env.port, () => {
      console.log(
        `MatchPoint AI API running at http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10000);

  forceExit.unref();

  server.close(async () => {
    try {
      await disconnectDatabase();
      process.exitCode = 0;
    } catch (error) {
      console.error("Shutdown error:", error.message);
      process.exitCode = 1;
    } finally {
      clearTimeout(forceExit);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

await startServer();
