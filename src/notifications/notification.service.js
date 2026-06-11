import { EventModel } from '../models/Event.js';
import { SubscriberModel } from '../models/Subscriber.js';
import { NotificationModel } from '../models/Notification.js';
import { config } from '../config.js';

function formatEventNotification(event) {
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

export async function notifyApprovedEvents(bot) {
  if (!bot) {
    return {
      sent: 0,
      failed: 0
    };
  }

  const events = await EventModel.find({
    status: 'approved',
    notifiedAt: null
  })
    .sort({ createdAt: 1 })
    .limit(10)
    .lean();

  if (!events.length) {
    return {
      sent: 0,
      failed: 0
    };
  }

  const subscribers = await SubscriberModel.find({
    isActive: true
  }).lean();

  if (!subscribers.length) {
    return {
      sent: 0,
      failed: 0
    };
  }

  let sent = 0;
  let failed = 0;

  for (const event of events) {
    const message = formatEventNotification(event);

    for (const subscriber of subscribers) {
      const recipientId = subscriber.chatId || subscriber.telegramId;

      try {
        await NotificationModel.create({
          eventId: event._id,
          channel: 'telegram',
          recipientId,
          message,
          status: 'pending'
        });

        await bot.telegram.sendMessage(recipientId, message);

        await NotificationModel.findOneAndUpdate(
          {
            eventId: event._id,
            channel: 'telegram',
            recipientId
          },
          {
            status: 'sent',
            sentAt: new Date()
          }
        );

        sent += 1;
      } catch (error) {
        if (error.code === 11000) {
          continue;
        }

        await NotificationModel.findOneAndUpdate(
          {
            eventId: event._id,
            channel: 'telegram',
            recipientId
          },
          {
            eventId: event._id,
            channel: 'telegram',
            recipientId,
            message,
            status: 'failed',
            error: error.message
          },
          {
            upsert: true
          }
        );

        failed += 1;
        console.error('[notification] telegram failed:', error.message);
      }
    }

    await EventModel.findByIdAndUpdate(event._id, {
      notifiedAt: new Date()
    });
  }

  return {
    sent,
    failed
  };
}
