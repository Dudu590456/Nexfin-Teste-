import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbClient: any = null;
let sqlClient: any = null;
let tablesInitialized = false;

export function isDbConfigured(): boolean {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) return false;
  if (
    connStr.includes("sua-senha") ||
    connStr.includes("[sua-senha]") ||
    connStr.includes("MY_DATABASE_URL") ||
    connStr.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

export function getSqlClient() {
  if (!isDbConfigured()) return null;
  const connStr = process.env.DATABASE_URL!;
  if (!sqlClient) {
    const isSupabase = connStr.includes("supabase.co") || connStr.includes("pooler.supabase.com") || connStr.includes("aws-");
    sqlClient = postgres(connStr, {
      prepare: false, // Required for Supabase PgBouncer / Supavisor transaction poolers
      ssl: isSupabase ? "require" : undefined,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sqlClient;
}

export function getDb() {
  if (!isDbConfigured()) return null;
  if (!dbClient) {
    const client = getSqlClient();
    if (!client) return null;
    dbClient = drizzle(client, { schema });
  }
  return dbClient;
}

export async function ensureDatabaseSchema(): Promise<boolean> {
  if (tablesInitialized) return true;
  const sql = getSqlClient();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        cpf text NOT NULL,
        avatar text NOT NULL,
        theme text DEFAULT 'dark' NOT NULL,
        language text DEFAULT 'pt' NOT NULL,
        notifications_enabled boolean DEFAULT true NOT NULL,
        ai_grounding boolean DEFAULT true NOT NULL,
        realtime_sync boolean DEFAULT true NOT NULL,
        password text
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        type text NOT NULL,
        category text NOT NULL,
        amount double precision NOT NULL,
        description text NOT NULL,
        date text NOT NULL,
        card_id text,
        status text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goals (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        name text NOT NULL,
        target_amount double precision NOT NULL,
        current_amount double precision NOT NULL,
        category text NOT NULL,
        deadline text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        category text NOT NULL,
        limit_amount double precision NOT NULL,
        spent_amount double precision NOT NULL,
        month text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS investments (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        name text NOT NULL,
        category text NOT NULL,
        amount double precision NOT NULL,
        yield_rate text NOT NULL,
        date text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        transaction_id text,
        name text NOT NULL,
        size text NOT NULL,
        type text NOT NULL,
        url text NOT NULL,
        uploaded_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        type text NOT NULL,
        title text NOT NULL,
        message text NOT NULL,
        date text NOT NULL,
        read boolean DEFAULT false NOT NULL
      );

      CREATE TABLE IF NOT EXISTS calendar_events (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        title text NOT NULL,
        amount double precision NOT NULL,
        type text NOT NULL,
        date text NOT NULL,
        status text NOT NULL,
        is_recurring boolean DEFAULT false NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cards (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        name text NOT NULL,
        "limit" double precision NOT NULL,
        current_spent double precision NOT NULL,
        color text NOT NULL,
        expiry text NOT NULL,
        last_four text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS installments (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        description text NOT NULL,
        total_amount double precision NOT NULL,
        installments_count integer NOT NULL,
        installment_amount double precision NOT NULL,
        current_installment integer NOT NULL,
        category text NOT NULL,
        first_due_date text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS financial_reports (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        type text NOT NULL,
        title text NOT NULL,
        file_url text NOT NULL,
        generated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS financial_scores (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        score integer NOT NULL,
        organization integer NOT NULL,
        control integer NOT NULL,
        savings integer NOT NULL,
        reserve integer NOT NULL,
        goals integer NOT NULL,
        punctuality integer NOT NULL,
        suggestions jsonb NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_history_items (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        role text NOT NULL,
        content text NOT NULL,
        timestamp text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notes (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        title text NOT NULL,
        content text NOT NULL,
        category text DEFAULT 'Geral' NOT NULL,
        color text DEFAULT 'blue' NOT NULL,
        is_pinned boolean DEFAULT false NOT NULL,
        updated_at text NOT NULL,
        created_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS checklists (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        title text NOT NULL,
        category text DEFAULT 'Geral' NOT NULL,
        items jsonb NOT NULL,
        created_at text NOT NULL
      );
    `;
    tablesInitialized = true;
    return true;
  } catch (err) {
    console.error("Failed to auto-bootstrap schema:", err);
    return false;
  }
}

export * as schema from "./schema";
