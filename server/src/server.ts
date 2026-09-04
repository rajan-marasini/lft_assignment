import http from "http";

import app from "@/app";
import logger from "@/lib/logger";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const startServer = async () => {
  server.listen(PORT, () => {
    logger.info("Server is running on port ", { port: PORT });
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
