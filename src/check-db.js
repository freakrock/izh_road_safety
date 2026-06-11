import { connectMongo } from './db/mongoose.js';
import { RawPostModel } from './models/RawPost.js';
import { EventModel } from './models/Event.js';

async function check() {
  await connectMongo();
  const raws = await RawPostModel.countDocuments();
  const processed = await RawPostModel.countDocuments({ isProcessed: true });
  const events = await EventModel.countDocuments();
  
  console.log(`--- Статистика БД ---`);
  console.log(`Сырых постов: ${raws}`);
  console.log(`Обработано: ${processed}`);
  console.log(`Создано событий: ${events}`);
  
  const lastEvent = await EventModel.findOne().sort({ createdAt: -1 });
  if (lastEvent) {
    console.log(`Последнее событие: [${lastEvent.status}] ${lastEvent.locationText} - ${lastEvent.eventType}`);
  }
  
  process.exit(0);
}
check();
