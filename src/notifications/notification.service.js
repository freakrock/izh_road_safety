import { EventModel } from '../models/Event.js';

export async function notifyApprovedEvents(bot) {
  // Ищем события, которые подтверждены, но еще не были разосланы
  const events = await EventModel.find({ 
    status: 'approved',
    isNotified: { $ne: true } 
  }).limit(5);

  for (const event of events) {
    try {
      const message = `🚨 *${event.title}*\n\n` +
                      `📍 Локация: ${event.locationText}\n` +
                      `📝 Суть: ${event.description}\n\n` +
                      `#${event.eventType} #Ижевск`;

      // Здесь ID канала или твой ID (для теста)
      // В будущем возьмем из конфига или базы подписчиков
      const chatId = process.env.ADMIN_CHAT_ID; 
      
      if (chatId) {
        await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      }

      event.isNotified = true;
      await event.save();
    } catch (e) {
      console.error('[notifier] ошибка отправки:', e.message);
    }
  }
}
