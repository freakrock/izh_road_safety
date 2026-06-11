import 'dotenv/config';
import { buildApp } from './app.js';
import { connectMongo } from './db/mongoose.js';
import { config } from './config.js';
import { createTelegramBot } from './notifications/telegram.bot.js';
import { startScheduler } from './jobs/scheduler.js';

async function main() {
  await connectMongo();

  const app = await buildApp();

  const bot = createTelegramBot();

  if (bot) {
    await bot.launch();
    console.log('[telegram] bot launched');
  }

  startScheduler(bot);

  await app.listen({
    port: config.port,
    host: '0.0.0.0'
  });

  console.log(`[server] started on port ${config.port}`);

  process.once('SIGINT', () => {
    if (bot) bot.stop('SIGINT');
    process.exit(0);
  });

  process.once('SIGTERM', () => {
    if (bot) bot.stop('SIGTERM');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
