import { connectMongo } from './db/mongoose.js';
import { ingestRawData } from './services/ingest.service.js';

async function test() {
  await connectMongo();

  console.log("📥 Имитируем получение постов из Telegram...");

  await ingestRawData({
    text: "Внимание! На перекрестке Удмуртская и Ленина экипаж ДПС проверяет тонировку. Работают активно.",
    sourceName: "ИГГС Телеграм",
    title: "Сообщение от очевидца"
  });

  await ingestRawData({
    text: "Продам резину на 16, б/у один сезон. Звоните 8912...",
    sourceName: "Объявления Ижевск",
    title: "Объявление"
  });

  console.log("✅ Данные в базе. Жди минуту, планировщик их обработает.");
  setTimeout(() => process.exit(0), 2000);
}

test();
