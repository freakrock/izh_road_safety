import { EventModel } from '../models/Event.js';
import { SubscriberModel } from '../models/Subscriber.js';
import { NotificationModel } from '../models/Notification.js';

export async function notifyPendingApprovedEvents(bot) {
  if (!bot) return;

  const events = await EventModel.find({
    status: 'approved',
    notifiedAt: { $exists: false }
  })
    .sort({ createdAt: 1 })
    .limit(20);

  for (const event of events) {
    const subscribers = await SubscriberModel.find({
      isActive: true,
      city: event.city
    });

    const message = [
      `🚦 ${event.title}`,
      '',
      `Город: ${event.city}`,
      event.locationText ? `Зона: ${event.locationText}` : null,
      '',
      'Информационное уведомление о дорожной безопасности.',
      'Соблюдайте ПДД и берегите себя.'
    ]
      .filter(Boolean)
      .join('\n');

    for (const subscriber of subscribers) {
      try {
        await bot.telegram.sendMessage(subscriber.telegramId, message);

        await NotificationModel.create({
          eventId: event._id,
          channel: 'telegram',
          recipientId: subscriber.telegramId,
          message,
          status: 'sent',
          sentAt: new Date()
        });
      } catch (error) {
        await NotificationModel.create({
          eventId: event._id,
          channel: 'telegram',
          recipientId: subscriber.telegramId,
          message,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    event.notifiedAt = new Date();
    await event.save();
  }
}
