import 'dotenv/config';
import { connectMongo } from './db/mongoose.js';
import { SourceModel } from './models/Source.js';

async function main() {
  await connectMongo();

  const sources = [
    {
      name: 'Госавтоинспекция Удмуртии Telegram Public',
      type: 'telegram',
      url: 'https://t.me/s/udmgai18',
      trustLevel: 90,
      isActive: true
    },
    {
      name: 'Manual Test Source',
      type: 'official',
      url: 'manual://test',
      trustLevel: 90,
      isActive: true
    }
  ];

  for (const source of sources) {
    await SourceModel.findOneAndUpdate(
      {
        url: source.url
      },
      source,
      {
        upsert: true,
        new: true
      }
    );
  }

  console.log('[seed] sources created');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
