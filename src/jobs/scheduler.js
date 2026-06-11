import { collectRSSSources } from '../collectors/rss.collector.js';
import { processPendingPosts } from '../services/processor.service.js'; // Добавили
import { notifyApprovedEvents } from '../notifications/notification.service.js';

export function startScheduler(bot) {
  console.log('[scheduler] started');

  async function mainJob() {
    try {
      // 1. Собираем сырые данные
      const collect = await collectRSSSources();
      
      // 2. Сразу обрабатываем их (Комплексная аналитика)
      const proc = await processPendingPosts();
      
      if (proc.eventsCreated > 0) {
        console.log(`[scheduler] processed ${proc.processed} posts, created ${proc.eventsCreated} events`);
      }

      // 3. Рассылаем то, что подтверждено
      await notifyApprovedEvents(bot);

    } catch (error) {
      console.error('[scheduler] critical error:', error);
    }
  }

  // Запуск каждые 60 секунд для теста
  const timer = setInterval(mainJob, 60_000);
  mainJob(); // Первый запуск сразу

  return {
    stop: () => clearInterval(timer)
  };
}
