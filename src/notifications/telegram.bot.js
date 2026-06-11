import { Telegraf } from 'telegraf';
import { config } from '../config.js';
import { SubscriberModel } from '../models/Subscriber.js';
import { EventModel } from '../models/Event.js';
import { ingestRawData } from '../services/ingest.service.js'; // Добавили импорт

// Мапинг типов для красивого отображения
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
    `${typeLabel}`,
    `📍 **${event.locationText || 'Ижевск'}** ${time ? `[${time}]` : ''}`,
    `──────────────────`,
    `${event.description || ''}`,
    `──────────────────`,
    `🚥 *Соблюдайте ПДД и будьте аккуратны!*`
  ]
  .filter(Boolean)
  .join('\n');
}

export function createTelegramBot() {
  if (!config.telegramBotToken) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN is empty, bot disabled');
    return null;
  }

  const bot = new Telegraf(config.telegramBotToken);

  // --- КОМАНДЫ ---

  bot.start(async (ctx) => {
    const telegramId = String(ctx.from.id);
    await SubscriberModel.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        chatId: String(ctx.chat.id),
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        isActive: true,
        lastSeenAt: new Date()
      },
      { upsert: true }
    );

    await ctx.replyWithMarkdown(
      `👋 **Привет! Я Маша, твой дорожный ассистент по Ижевску.**\n\n` +
      `Я собираю информацию о рейдах ГИБДД и профилактических мероприятиях.\n\n` +
      `🔹 /today — события за последние 24 часа\n` +
      `🔹 /stop — отключить уведомления`
    );
  });

  bot.command('today', async (ctx) => {
    // Берем события за последние 24 часа
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const events = await EventModel.find({ 
      status: 'approved',
      createdAt: { $gte: yesterday } 
    })
    .sort({ createdAt: -1 })
    .limit(10);

    if (!events.length) {
      return ctx.reply('На данный момент активных подтверждённых событий нет.');
    }

    for (const event of events) {
      await ctx.replyWithMarkdown(formatEvent(event));
    }
  });

  // --- ПРИЕМ ДАННЫХ (НОВОЕ) ---
  
  // Если ты (админ) пересылаешь боту сообщение из ТГ-канала
  bot.on('text', async (ctx, next) => {
    // Простейшая проверка: только если сообщение переслано (forwarded)
    // или если это пишешь ты (можно добавить проверку на твой ID)
    if (ctx.message.forward_from_chat || ctx.from.id === Number(process.env.ADMIN_TELEGRAM_ID)) {
       const text = ctx.message.text;
       
       const post = await ingestRawData({
         text,
         sourceName: ctx.message.forward_from_chat?.title || 'Manual Input',
         externalLink: ctx.message.forward_from_chat?.username ? `https://t.me/${ctx.message.forward_from_chat.username}` : ''
       });

       if (post) {
         return ctx.reply('✅ Данные приняты в обработку. Анализирую...');
       }
    }
    return next();
  });

  // Остальные команды...
  bot.command('stop', async (ctx) => {
    await SubscriberModel.updateOne({ telegramId: String(ctx.from.id) }, { isActive: false });
    ctx.reply('🔕 Уведомления отключены.');
  });

  bot.catch((err) => console.error('[telegram] error:', err));

  return bot;
}
