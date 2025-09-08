// api/telegram.js
import { Telegraf } from "telegraf";
import { pool } from "../lib/db.js";
import { createIssue, jiraBrowseUrl } from "../lib/jira.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error("BOT_TOKEN is not set");

// один экземпляр бота между инвокациями
if (!globalThis.__bot) {
  globalThis.__bot = new Telegraf(BOT_TOKEN, { telegram: { webhookReply: false } });
  const bot = globalThis.__bot;

  bot.start(async (ctx) => {
    await ctx.reply("Привет! Пришли идею/предложение так:\n/suggest <текст>");
  });

  // классическая команда — сработает в реальном Telegram (есть entities: bot_command)
  bot.command("suggest", onSuggest);

  // подстраховка для curl/тестов: если текст начинается с /suggest — тоже вызываем
  bot.on("text", async (ctx) => {
    const t = ctx.message?.text || "";
    if (/^\/suggest(@\S+)?(\s|$)/i.test(t)) return onSuggest(ctx);
    // а если без команды — трактуем как предложение
    if (!t.startsWith("/")) return onSuggest(ctx);
  });
}

async function onSuggest(ctx) {
  const user = ctx.from || {};
  const fullText = ctx.message?.text || "";
  const text = fullText.replace(/^\/suggest(@\S+)?\s*/i, "").trim() || fullText.trim();

  if (!text) {
    return ctx.reply("Напиши так: `/suggest твоя идея`", { parse_mode: "Markdown" });
  }

  const user_id = user.id;
  const username = user.username || null;
  const product = "Tiger.com macOS";
  const topic   = "График";

  console.log("[TG] suggest from", { user_id, username, text });

  // 1) вставка в PG
  let inserted;
  try {
    const q = `
      INSERT INTO suggestions (user_id, username, product, topic, text)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    const { rows } = await pool.query(q, [user_id, username, product, topic, text]);
    inserted = rows[0];
    console.log("[DB] inserted suggestion", inserted);
  } catch (e) {
    console.error("[DB] insert error:", e);
    return ctx.reply("❌ Не удалось сохранить. Попробуй ещё раз позже.");
  }

  // 2) создаём тикет в Jira
  let jira = null;
  try {
    jira = await createIssue({ text, username, product, topic }); // { id, key }
    console.log("[Jira] created", jira);
  } catch (e) {
    console.error("[Jira] create error:", e);
  }

  // 3) апдейт PG jira_* полями
  try {
    await pool.query(
      `UPDATE suggestions
       SET jira_key = $2, jira_id = $3, jira_status = COALESCE(jira_status, 'created')
       WHERE id = $1`,
      [inserted.id, jira?.key || null, jira?.id || null]
    );
    console.log("[DB] updated with jira", { id: inserted.id, key: jira?.key, jira_id: jira?.id });
  } catch (e) {
    console.error("[DB] update jira fields error:", e);
  }

  // 4) ответ
  if (jira?.key) {
    await ctx.reply(
      `✅ Идея (#${inserted.id}) сохранена.\nСоздан тикет *${jira.key}* → ${jiraBrowseUrl(jira.key)}`,
      { parse_mode: "Markdown" }
    );
  } else {
    await ctx.reply(`✅ Идея (#${inserted.id}) сохранена.\n⚠️ Тикет в Jira не создался.`);
  }
}

const bot = globalThis.__bot;

export default async function handler(req, res) {
  try {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const update = raw ? JSON.parse(raw) : {};
    console.log("[HTTP] update", JSON.stringify(update));
    await bot.handleUpdate(update);
    res.statusCode = 200;
    res.end();
  } catch (e) {
    console.error("[HTTP] webhook error:", e);
    res.statusCode = 200;
    res.end();
  }
}