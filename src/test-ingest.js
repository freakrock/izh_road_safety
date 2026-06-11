import { connectMongo } from './db/mongoose.js';
import { RawPostModel } from './models/RawPost.js';
import mongoose from 'mongoose';

async function test() {
  await connectMongo();
  console.log("🛠 Запуск ручного заброса данных...");

  const fakeData = {
    text: "На перекрестке Пушкинская и 10 лет Октября стоят два экипажа ДПС, проверяют документы и тонировку.",
    title: "Сообщение из ТГ",
    hash: "test_hash_" + Date.now(),
    isProcessed: false
  };

  await RawPostModel.create(fakeData);

  console.log("✅ Пост добавлен в базу как RawPost.");
  console.log("Теперь ProcessorService подхватит его при следующем запуске планировщика.");
  
  // Даем время на запись и выходим
  setTimeout(() => {
    mongoose.disconnect();
    process.exit(0);
  }, 1000);
}

test().catch(console.error);
