import { sql } from "@vercel/postgres";

export async function ensureDemoRequestsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS demo_requests (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      employees TEXT,
      source TEXT DEFAULT 'pse-marketing',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function ensureChapInteractionsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS chap_interactions (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      email TEXT,
      question TEXT NOT NULL,
      response JSONB NOT NULL,
      determination TEXT,
      latency_ms INTEGER,
      model_used TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS chap_interactions_session_idx ON chap_interactions(session_id)`;
  await sql`CREATE INDEX IF NOT EXISTS chap_interactions_email_idx ON chap_interactions(email) WHERE email IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS chap_interactions_created_idx ON chap_interactions(created_at DESC)`;
}

export async function ensureChapLeadsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS chap_leads (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      session_id TEXT NOT NULL,
      source TEXT DEFAULT 'chap-widget',
      first_question TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (email, session_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS chap_leads_email_idx ON chap_leads(email)`;
  await sql`CREATE INDEX IF NOT EXISTS chap_leads_created_idx ON chap_leads(created_at DESC)`;
}

export async function ensureChapRateLimitsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS chap_rate_limits (
      scope TEXT NOT NULL,
      identifier TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (scope, identifier)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS chap_rate_limits_window_idx ON chap_rate_limits(window_start)`;
}

export async function ensureChapTables() {
  await ensureChapInteractionsTable();
  await ensureChapLeadsTable();
  await ensureChapRateLimitsTable();
}
