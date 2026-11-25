import { getRuntimeEnv } from "../lib/runtime-env";

export function getDb() {
  const database = getRuntimeEnv().DB;
  if (!database) {
    throw new Error(
      "Database is unavailable. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN."
    );
  }
  return database;
}
