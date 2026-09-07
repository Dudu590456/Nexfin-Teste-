import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

let dbClient: any = null;

export function getDb() {
  if (!dbClient) {
    const connStr = process.env.DATABASE_URL || connectionString;
    if (!connStr) {
      throw new Error("DATABASE_URL is not configured in environment variables.");
    }
    const client = postgres(connStr);
    dbClient = drizzle(client, { schema });
  }
  return dbClient;
}

export * as schema from "./schema";
