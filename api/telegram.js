import { Telegraf } from 'telegraf';
import { pool } from '../lib/db.js';
import { createIssue, jiraBrowseUrl } from "../lib/jira.js";
import { pool } from "../lib/db.js"; // если ещё не подключён

const TOKEN = process.env.BOT_TOKEN;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://tg-feedback-full.vercel.app';

if (!TOKEN) {
  throw new Error('BOT_TOKEN is not set');
}

// Инициализация бота (однократно, с реюзом в serverless)
if (!globalThis.__bot) {
  globalThis.__bot = new Telegraf(TOKEN);

  const bot = globalThis.__bot;

  // Кнопка в меню чата (видна всем)
  bot.telegram.setChatMenuButton(undefined, {
    type: 'web_app',
    text: 'Tiger.com Feedback',
    web_app: { url: MINIAPP_URL },
  }).catch(() => {});

  // /start -> кнопка открыть WebApp
  bot.start((ctx) => ctx.reply('Откройте мини-приложение:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Открыть Tiger.com Feedback', web_app: { url: MINIAPP_URL } }]]
    }
  }));

  // /suggest <текст> -> записать в БД
  bot.command('suggest', async (ctx) => {
    const text = ctx.message?.text?.replace(/^\/suggest(@\w+)?\s*/i, '').trim();
    if (!text) return ctx.reply('Напиши так: /suggest ваше предложение');

    await saveSuggestion(ctx, text);
  });

  // Любое обычное текстовое сообщение — как предложение
  bot.on('text', async (ctx) => {
    // не перехватываем команды
    if (ctx.message?.text?.startsWith('/')) return;
    await saveSuggestion(ctx, ctx.message.text);
  });

  async function saveSuggestion(ctx, text) {
    const user = ctx.from || {};
    const user_id = user.id;
    const username = user.username || null;

    // Пока product/topic не выбираются из чата — ставим дефолты.
    const product = 'Tiger.com macOS';
    const topic   = 'График';

    try {
      const q = `
        INSERT INTO suggestions (user_id, username, product, topic, text)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
      `;
      const { rows } = await pool.query(q, [user_id, username, product, topic, text]);
      const s = rows[0];
      await ctx.reply(`✅ Предложение сохранено (id: ${s.id}). Спасибо!`);
    } catch (e) {
      console.error('DB insert error:', e);
      await ctx.reply('❌ Не удалось сохранить. Попробуй ещё раз позже.');
    }
  }
}

const bot = globalThis.__bot;

// Вебхук-эндпоинт: /api/telegram
export default async function handler(req, res) {
  // Читаем сырое тело и прокидываем апдейт в Telegraf
  let raw = '';
  for await (const chunk of req) raw += chunk;

  let update;
  try {
    update = JSON.parse(raw || '{}');
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_json' });
  }

  try {
    await bot.handleUpdate(update);
    return res.status(200).end();
  } catch (e) {
    console.error('webhook error:', e);
    return res.status(200).end();
  }
}
