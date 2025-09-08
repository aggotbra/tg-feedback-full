import pkg from 'pg';
const { Pool } = pkg;

// Реиспользуем пул между инвокациями (Vercel serverless best practice)
if (!globalThis.__pgPool) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  globalThis.__pgPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Neon требует SSL
  });
}
export const pool = globalThis.__pgPool;
