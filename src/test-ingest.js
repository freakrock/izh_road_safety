// src/test-ingest.js
import { connectMongo } from './db/mongoose.js';
import { ingestRawData } from './services/ingest.service.js';

async function test() {
  await connectMongo();

  console.log("📥 Имитируем поступление дорожных новостей...");

  // Пример 1: Релевантный пост
  await ingestRawData({
    text: "Ижевск! На улице Удмуртская, около ТЦ Флагман, стоят ДПС. Проверяют тонировку у всех подряд.",
    sourceName: "ТГ Канал Дороги Удмуртии",
    title: "ДПС Удмуртская"
  });

  // Пример 2: Мусорный пост (не должен создать событие)
  await ingestRawData({
    text: "Куплю диски на Ладу Весту, r16. Писать в личку.",
    sourceName: "Барахолка 18",
    title: "Объявление"
  });

  console.log("✅ Посты добавлены в RawPosts.");
  console.log("Теперь планировщик (через минуту) превратит их в события и пришлет в ТГ.");
  
  setTimeout(() => process.exit(0), 1000);
}

test();
