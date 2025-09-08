import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Client } = pg;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ Нет DATABASE_URL в .env");
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }, // обязательно для Neon
  });

  try {
    await client.connect();
    console.log("✅ Успешное подключение к PostgreSQL");

    // тестовый запрос
    const res = await client.query("SELECT NOW() as now, current_database() as db");
    console.log("📊 Ответ:", res.rows[0]);
  } catch (err) {
    console.error("❌ Ошибка подключения:", err);
  } finally {
    await client.end();
  }
}

main();
