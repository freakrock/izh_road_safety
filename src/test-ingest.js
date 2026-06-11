import { connectMongo } from './db/mongoose.js';
import { RawPostModel } from './models/RawPost.js';
import { SourceModel } from './models/Source.js';
import mongoose from 'mongoose';

async function test() {
  await connectMongo();

  const source = await SourceModel.findOne() || { _id: new mongoose.Types.ObjectId() };

  const fakePosts = [
    {
      sourceId: source._id,
      text: "Сегодня в Ижевске на улице Пушкинская проходит рейд 'Трезвый водитель'. Будьте внимательны!",
      title: "Информация от ГИБДД",
      hash: "fake_1",
      isProcessed: false
    },
    {
      sourceId: source._id,
      text: "Продам гараж в Устиновском районе, тел. 8999...",
      title: "Объявление",
      hash: "fake_2",
      isProcessed: false
    }
  ];

  for (const p of fakePosts) {
    await RawPostModel.findOneAndUpdate({ hash: p.hash }, p, { upsert: true });
  }

  console.log("✅ Тестовые данные загружены. Сейчас планировщик их обработает.");
  process.exit(0);
}

test();
