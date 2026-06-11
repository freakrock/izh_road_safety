import { Telegraf } from 'telegraf';
import { config } from '../config.js';
import { SubscriberModel } from '../models/Subscriber.js';
import { EventModel } from '../models/Event.js';
import { ingestRawData } from '../services/ingest.service.js';

const EVENT_LABELS = {
  'sobriety_check': '🍷 Трезвый водитель',
  'child_safety': '👶 Внимание, дети!',
  'tinting_control': '🕶 Контроль тонировки',
  'pedestrian_priority': '🚶 Пешеходный переход',
  'motorcycle_control': '🏍 Мотоциклист',
  'seatbelt_control': '🎗 Ремень безопасности',
  'speed_control': '🚀 Скоростной режим',
  'unknown': 'ℹ️ Дорожное событие'
};

function formatEvent(event) {
  const typeLabel = EVENT_LABELS[event.eventType] || EVENT_LABELS.unknown;
  const time = event.createdAt ? new Date(event.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';

  return [
    `*${typeLabel}*`,
    `📍 *${event.locationText || 'Ижевск'}* ${time ? `[${time}]` : ''}`,
    `──────────────────`,
    `${event.description}`,
    `──────────────────`,
    `🚥 *Соблюдайте ПДД и будьте аккуратны!*`
  ].join('\n');
}

// Глобальная ссылка на бота для внешних вызовов
let botInstance = null;

export async function sendLogToAdmins(message) {
  if (botInstance && process.env.ADMIN_TELEGRAM_ID) {
    try {
      await botInstance.telegram.sendMessage(process.env.ADMIN_TELEGRAM_ID, `🛠 [System Log]: ${message}`);
    } catch (e) {
      console.error('Failed to send log to admin:', e.message);
    }
  }
}

export function createTelegramBot() {
  if (!config.telegramBotToken) return null;

  const bot = new Telegraf(config.telegramBotToken);
  botInstance = bot;

  bot.start(async (ctx) => {
    await SubscriberModel.findOneAndUpdate(
      { telegramId: String(ctx.from.id) },
      {
        telegramId: String(ctx.from.id),
        chatId: String(ctx.chat.id),
        username: ctx.from.username,
        isActive: true,
        lastSeenAt: new Date()
      },
      { upsert: true }
    );

    ctx.reply(`👋 *Привет! Я Маша.*\n\nЯ помогу тебе быть в курсе проверок ГИБДД в Ижевске.\n\n🔹 /today — события за сутки\n🔹 /stop — выключить уведомления`, { parse_mode: 'Markdown' });
  });

  bot.command('today', async (ctx) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const events = await EventModel.find({ status: 'approved', createdAt: { $gte: yesterday } }).sort({ createdAt: -1 });

    if (!events.length) return ctx.reply('Пока нет подтвержденных событий.');

    for (const event of events) {
      await ctx.reply(formatEvent(event), { parse_mode: 'Markdown' });
    }
  });

  // Прием данных
  bot.on('text', async (ctx, next) => {
    const isAdmin = String(ctx.from.id) === String(process.env.ADMIN_TELEGRAM_ID);
    const isForwarded = ctx.message.forward_from_chat || ctx.message.forward_origin;

    if (isAdmin || isForwarded) {
      const sourceName = ctx.message.forward_from_chat?.title || (isAdmin ? 'Admin' : 'Forward');
      
      await ingestRawData({
        text: ctx.message.text,
        sourceName,
        title: 'Telegram Ingest'
      });

      if (isAdmin) ctx.reply('📥 Пост принят. Анализирую...');
    }
    return next();
  });

  bot.command('stop', async (ctx) => {
    await SubscriberModel.updateOne({ telegramId: String(ctx.from.id) }, { isActive: false });
    ctx.reply('🔕 Уведомления отключены.');
  });

  return bot;
}
