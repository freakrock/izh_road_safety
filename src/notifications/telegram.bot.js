import { Telegraf } from 'telegraf';
import { config } from '../config.js';
import { SubscriberModel } from '../models/Subscriber.js';
import { EventModel } from '../models/Event.js';

export function createTelegramBot() {
  if (!config.telegramBotToken) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN is empty, bot disabled');
    return null;
  }

  const bot = new Telegraf(config.telegramBotToken);

  bot.start(async (ctx) => {
    const telegramId = String(ctx.from.id);

    await SubscriberModel.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        city: config.cityName,
        isActive: true
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
        '— персональные данные.'
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

    const message = events
      .map((event) => {
        return [
          `🚦 ${event.title}`,
          `Зона: ${event.locationText || event.city}`,
          `Тип: ${event.eventType}`,
          '',
          'Соблюдайте ПДД и будьте внимательны.'
        ].join('\n');
      })
      .join('\n\n');

    return ctx.reply(message);
  });

  bot.command('stop', async (ctx) => {
    const telegramId = String(ctx.from.id);

    await SubscriberModel.findOneAndUpdate(
      { telegramId },
      { isActive: false }
    );

    return ctx.reply('Подписка отключена.');
  });

  return bot;
}
