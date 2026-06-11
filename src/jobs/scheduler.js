import { processPendingPosts } from '../services/processor.service.js';
import { notifyApprovedEvents } from '../notifications/notification.service.js';

export function startScheduler(bot) {
  console.log('[scheduler] started (clean mode)');

  async function mainJob() {
    try {
      // Собираем всё, что упало в базу в сыром виде (из любых источников)
      // и превращаем в события
      const proc = await processPendingPosts();
      
      if (proc.eventsCreated > 0) {
        console.log(`[scheduler] Processed ${proc.processed} posts, created ${proc.eventsCreated} events`);
        
        // Сразу рассылаем уведомления по новым подтвержденным событиям
        await notifyApprovedEvents(bot);
      }
    } catch (error) {
      console.error('[scheduler] error:', error);
    }
  }

  // Запуск каждую минуту
  const timer = setInterval(mainJob, 60_000);
  mainJob(); 

  return { stop: () => clearInterval(timer) };
}
