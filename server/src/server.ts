import http from "http";

import app from "@/app";
import { checkDatabaseConnection } from "@/db";
import logger from "@/lib/logger";

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const startServer = async () => {
  try {
    await checkDatabaseConnection();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Failed to connect to the database", { error });
    process.exit(1);
  }

  server.listen(PORT, () => {
    logger.info("Server is running on port ", { port: PORT });
    logger.info("Docs available at /docs");
  });
};

const shutdown = () => {
  logger.info("Server is shutting down");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start the server
startServer();
