import { EventModel } from '../models/Event.js';

export async function notifyApprovedEvents(bot) {
  if (!bot) return;

  // Ищем события со статусом 'approved', которые еще не были отправлены
  const events = await EventModel.find({
    status: 'approved',
    isNotified: { $ne: true }
  }).limit(5);

  for (const event of events) {
    try {
      const message = `
🔔 *${event.title}*

📍 Локация: ${event.locationText}
📝 Тип: ${event.eventType}
📄 Описание: ${event.description}

#ижевск #дпс #безопасность
      `;

      // Здесь нужно указать ID твоего канала или твой ID
      // Для теста можно слать админу, если ID сохранен в конфиге
      const chatId = process.env.TELEGRAM_CHANNEL_ID || process.env.ADMIN_CHAT_ID;

      if (chatId) {
        await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
        event.isNotified = true;
        await event.save();
      }
    } catch (e) {
      console.error('[notifier] ошибка отправки:', e.message);
    }
  }
}
