import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 3001),

  mongoUri:
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/road_safety_izh',

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',

  adminSecret: process.env.ADMIN_SECRET || 'change-me',

  cityName: process.env.CITY_NAME || 'Ижевск',
  regionName: process.env.REGION_NAME || 'Удмуртия',

  collectIntervalCron: process.env.COLLECT_INTERVAL_CRON || '*/5 * * * *'
};
