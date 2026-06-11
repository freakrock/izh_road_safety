import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 3001),

  mongoUri:
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/road_safety_izh',

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',

  adminSecret: process.env.ADMIN_SECRET || 'change-me',

  cityName: process.env.CITY_NAME || 'Ижевск',
  regionName: process.env.REGION_NAME || 'Удмуртия',

  collectIntervalCron: process.env.COLLECT_INTERVAL_CRON || '*/5 * * * *',
  keywords: [
  'Госавтоинспекция',
  'ГИБДД',
  'ДПС',
  'профилактическое мероприятие',
  'профилактический рейд',
  'безопасность дорожного движения',
  'нетрезвый водитель',
  'пьяный за рулём',
  'тонировка',
  'ремни безопасности',
  'детское кресло',
  'пешеход',
  'скорость',
  'мотоцикл',
  'ограничение движения',
  'перекрытие дороги',
  'Ижевск',
  'Удмуртия',
  'Удмуртская Республика'
],

};
