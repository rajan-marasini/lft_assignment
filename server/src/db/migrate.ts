import { fileURLToPath } from "node:url";

import { logger } from "../lib/logger.ts";
import { closeDatabaseConnection, db } from "./index.ts";

const command = process.argv[2] ?? "latest";
const migrationsDirectory = fileURLToPath(
  new URL("./migrations", import.meta.url),
);

try {
  if (command === "latest") {
    const [, migrations] = await db.migrate.latest({
      directory: migrationsDirectory,
      extension: "ts",
    });
    if (migrations.length === 0) {
      logger.info("Database is already up to date");
    } else {
      logger.info("Database migrations applied", {
        count: migrations.length,
        migrations,
      });
    }
  } else if (command === "rollback") {
    const [, migrations] = await db.migrate.rollback({
      directory: migrationsDirectory,
      extension: "ts",
    });
    if (migrations.length === 0) {
      logger.info("No migration batch to roll back");
    } else {
      logger.info("Database migrations rolled back", {
        count: migrations.length,
        migrations,
      });
    }
  } else {
    throw new Error(
      `Unknown migration command "${command}". Use "latest" or "rollback".`,
    );
  }
} catch (error) {
  logger.error("Database migration failed", { error });
  process.exitCode = 1;
} finally {
  await closeDatabaseConnection();
}
