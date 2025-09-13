import { Pool } from "pg";

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

let pool;
export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: CONN,
      ssl: CONN.includes("sslmode=require") ? undefined : { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function query(text, params) {
  return getPool().query(text, params);
}
