import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const MINIAPP_URL = 'https://tg-feedback-full.vercel.app';

console.log('BOT_TOKEN present:', !!BOT_TOKEN);

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не задан в .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Проверим подключение к Telegram
bot.telegram.getMe()
  .then(me => console.log('✅ Connected as @' + me.username))
  .catch(err => console.error('❌ getMe error:', err));

// Поставим кнопку в меню чата
bot.telegram.setChatMenuButton(undefined, {
  type: 'web_app',
  text: 'Tiger.com Feedback',
  web_app: { url: MINIAPP_URL },
})
.then(() => console.log('✅ Menu button set'))
.catch(err => console.error('❌ setChatMenuButton error:', err));

// /start — инлайн-кнопка
bot.start((ctx) => {
  ctx.reply('Откройте мини-приложение:', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Открыть Tiger.com Feedback', web_app: { url: MINIAPP_URL } }
      ]]
    }
  });
});

// Живой пинг
bot.command('ping', (ctx) => ctx.reply('pong 🏓'));

// Запуск long polling
bot.launch()
  .then(() => console.log('🤖 Bot launched (long polling)'))
  .catch(err => console.error('❌ launch error:', err));

// Гладкое завершение
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
