import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const MINIAPP_URL = 'https://tg-feedback-full.vercel.app';

if (!globalThis.__bot) {
  globalThis.__bot = new Telegraf(BOT_TOKEN, { telegram: { webhookReply: true } });

  // хендлеры регистрируем один раз
  globalThis.__bot.start((ctx) => ctx.reply('Откройте мини-приложение:', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Открыть Tiger.com Feedback', web_app: { url: MINIAPP_URL } }
      ]]
    }
  }));

  globalThis.__bot.command('ping', (ctx) => ctx.reply('pong 🏓'));

  // необязательно, но полезно — поставить кнопку в меню
  globalThis.__bot.telegram.setChatMenuButton(undefined, {
    type: 'web_app',
    text: 'Tiger.com Feedback',
    web_app: { url: MINIAPP_URL },
  }).catch(() => {});

  globalThis.__handlersAttached = true;
}

const bot = globalThis.__bot;

export default async function handler(req, res) {
  // секрет в пути: /api/webhook/:secret
  const { secret } = req.query;
  if (!SECRET || secret !== SECRET) {
    return res.status(404).send('NOT_FOUND');
  }

  // секрет в заголовке от Telegram (мы передадим его в setWebhook)
  const headerSecret = req.headers['x-telegram-bot-api-secret-token'];
  if (SECRET && headerSecret !== SECRET) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  // читаем сырое тело
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let update;
  try { update = JSON.parse(raw || '{}'); }
  catch { return res.status(400).json({ ok:false, error:'invalid_json' }); }

  try {
    await bot.handleUpdate(update);
    return res.status(200).end();
  } catch (e) {
    console.error('webhook error:', e);
    return res.status(200).end();
  }
}
