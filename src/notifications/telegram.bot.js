import { Telegraf } from 'telegraf';
import { config } from '../config.js';
import { SubscriberModel } from '../models/Subscriber.js';
import { EventModel } from '../models/Event.js';

function formatEvent(event) {
  return [
    `🚦 ${event.title}`,
    '',
    `Зона: ${event.locationText || event.city || config.cityName}`,
    `Тип: ${event.eventType || 'unknown'}`,
    '',
    event.description || '',
    '',
    'ℹ️ Соблюдайте ПДД и будьте внимательны.'
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

  bot.start(async (ctx) => {
    const telegramId = String(ctx.from.id);
    const chatId = String(ctx.chat.id);

    await SubscriberModel.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        chatId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        city: config.cityName,
        isActive: true,
        lastSeenAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    await ctx.reply(
      [
        '🚦 Вы подписались на уведомления о дорожной безопасности в Ижевске.',
        '',
        'Мы отправляем:',
        '— официальные и публичные сообщения о профилактических мероприятиях;',
        '— информацию на уровне города или района;',
        '— рекомендации по безопасному движению.',
        '',
        'Мы не отправляем:',
        '— точные live-точки экипажей;',
        '— маршруты объезда;',
        '— персональные данные.',
        '',
        'Команды:',
        '/today — последние события',
        '/stop — отключить уведомления',
        '/help — помощь'
      ].join('\n')
    );
  });

  bot.command('today', async (ctx) => {
    const events = await EventModel.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!events.length) {
      return ctx.reply('Пока нет подтверждённых уведомлений.');
    }

    const message = events.map(formatEvent).join('\n\n────────────\n\n');

    return ctx.reply(message);
  });

  bot.command('stop', async (ctx) => {
    const telegramId = String(ctx.from.id);

    await SubscriberModel.findOneAndUpdate(
      { telegramId },
      {
        isActive: false,
        lastSeenAt: new Date()
      }
    );

    return ctx.reply('🔕 Подписка отключена. Чтобы включить снова — отправьте /start.');
  });

  bot.command('help', async (ctx) => {
    return ctx.reply(
      [
        '🚦 Команды бота:',
        '',
        '/start — подписаться на уведомления',
        '/today — посмотреть последние события',
        '/stop — отключить уведомления',
        '/help — помощь'
      ].join('\n')
    );
  });

  bot.catch((error) => {
    console.error('[telegram] bot error:', error);
  });

  return bot;
}
