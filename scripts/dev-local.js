// index.js
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не задан в .env');
  process.exit(1);
}

// URL твоего мини-приложения (Vercel)
const MINIAPP_URL = 'https://tg-feedback-full.vercel.app';

const bot = new Telegraf(BOT_TOKEN);

// Меню чата (кнопка под полем ввода)
bot.telegram.setChatMenuButton(undefined, {
  type: 'web_app',
  text: 'Tiger.com Feedback',
  web_app: { url: MINIAPP_URL },
}).catch(console.error);

// /start — покажем инлайн-кнопку «Открыть»
bot.start((ctx) =>
  ctx.reply('Откройте мини-приложение:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Открыть Tiger.com Feedback', web_app: { url: MINIAPP_URL } }]],
    },
  })
);

// /open — альтернативная команда
bot.command('open', (ctx) =>
  ctx.reply('Открыть Tiger.com Feedback:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Открыть', web_app: { url: MINIAPP_URL } }]],
    },
  })
);

// /ping — проверка, что бот живой
bot.command('ping', (ctx) => ctx.reply('pong 🏓'));

// Обработка данных, которые мини-приложение может прислать назад через WebApp
bot.on('message', (ctx) => {
  if (ctx.message?.web_app_data?.data) {
    try {
      const payload = JSON.parse(ctx.message.web_app_data.data);
      return ctx.reply(`✅ Получено из WebApp:\n\`\`\`\n${JSON.stringify(payload, null, 2)}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch {
      return ctx.reply(`✅ Получено из WebApp (raw): ${ctx.message.web_app_data.data}`);
    }
  }
});

bot.launch()
  .then(() => console.log('🤖 Bot started. Menu button set.'))
  .catch(console.error);

// Гладкое завершение
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));