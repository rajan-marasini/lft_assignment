import knex, { type Knex } from "knex";

const DEFAULT_POOL_MIN = 2;
const DEFAULT_POOL_MAX = 10;

type PostgreSqlConnection = {
  query(sql: string, callback: (error: Error | null) => void): void;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Expected a non-negative integer, received "${value}".`);
  }

  return parsed;
}

export function createDatabase(
  connectionString = process.env.DATABASE_URL,
): Knex {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required. Copy .env.example to .env and provide a PostgreSQL connection string.",
    );
  }

  const poolMin = positiveInteger(process.env.DB_POOL_MIN, DEFAULT_POOL_MIN);
  const poolMax = positiveInteger(process.env.DB_POOL_MAX, DEFAULT_POOL_MAX);

  if (poolMin > poolMax) {
    throw new Error("DB_POOL_MIN cannot be greater than DB_POOL_MAX.");
  }

  return knex({
    client: "pg",
    connection: connectionString,
    pool: {
      min: poolMin,
      max: poolMax,
      acquireTimeoutMillis: 10_000,
      createTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      afterCreate(
        connection: PostgreSqlConnection,
        done: (error: Error | null, connection: PostgreSqlConnection) => void,
      ) {
        connection.query("SET TIME ZONE 'UTC'", (error: Error | null) =>
          done(error, connection),
        );
      },
    },
  });
}

export const db = createDatabase();

export async function checkDatabaseConnection(): Promise<void> {
  await db.raw("select 1");
}

export async function closeDatabaseConnection(): Promise<void> {
  await db.destroy();
}

export default db;
