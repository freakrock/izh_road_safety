import cron from 'node-cron';
import { config } from '../config.js';
import { collectAllRssSources } from '../collectors/rss.collector.js';
import { notifyPendingApprovedEvents } from '../notifications/notification.service.js';

export function startScheduler(bot) {
  cron.schedule(config.collectIntervalCron, async () => {
    console.log('[scheduler] collect started');

    try {
      const results = await collectAllRssSources();
      console.log('[scheduler] collect results', results);

      await notifyPendingApprovedEvents(bot);
    } catch (error) {
      console.error('[scheduler] error', error);
    }
  });

  cron.schedule('* * * * *', async () => {
    try {
      await notifyPendingApprovedEvents(bot);
    } catch (error) {
      console.error('[scheduler:notify] error', error);
    }
  });

  console.log('[scheduler] started');
}
