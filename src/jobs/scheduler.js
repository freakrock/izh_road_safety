import { processPendingPosts } from '../services/processor.service.js';
import { notifyApprovedEvents } from '../notifications/notification.service.js';

export function startScheduler(bot) {
  console.log('[scheduler] запущен: режим обработки очереди');

  async function mainJob() {
    try {
      // 1. Берем сырые данные (из ТГ/ВК/Тестов) и анализируем их
      const proc = await processPendingPosts();
      
      if (proc.eventsCreated > 0) {
        console.log(`[scheduler] Обработано постов: ${proc.processed}, Создано событий: ${proc.eventsCreated}`);
        
        // 2. Рассылаем уведомления пользователям (если есть бот)
        if (bot) {
          await notifyApprovedEvents(bot);
        }
      }
    } catch (error) {
      console.error('[scheduler] Ошибка в цикле планировщика:', error.message);
    }
  }

  // Запуск раз в 60 секунд
  const timer = setInterval(mainJob, 60000);
  
  // Первый запуск сразу
  mainJob();

  return {
    stop: () => clearInterval(timer)
  };
}
