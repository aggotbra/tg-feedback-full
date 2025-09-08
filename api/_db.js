import pkg from 'pg';
const { Pool } = pkg;

// На Vercel важно переиспользовать пул, чтобы не открывать новое соединение на каждый запрос
if (!globalThis.__pgPool) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('❌ DATABASE_URL is not set');
  }
  globalThis.__pgPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // большинство managed PG требуют SSL
  });
}
export const pool = globalThis.__pgPool;
