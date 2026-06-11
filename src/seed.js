import { connectMongo } from './db/mongoose.js';
import { SourceModel } from './models/Source.js';
import { config } from './config.js';

async function seed() {
  await connectMongo();

  const sources = [
    {
      name: 'Госавтоинспекция Удмуртии',
      type: 'rss',
      url: 'https://18.мвд.рф/rss/',
      isActive: true,
      parserType: 'rss',
      fetchIntervalMs: 300_000
    },
    {
      name: 'МВД России — ДТП/происшествия',
      type: 'rss',
      url: 'https://мвд.рф/rss/',
      isActive: false,
      parserType: 'rss',
      fetchIntervalMs: 300_000
    }
  ];

  for (const sourceConfig of sources) {
    const existing = await SourceModel.findOne({ name: sourceConfig.name });
    if (!existing) {
      await SourceModel.create(sourceConfig);
      console.log(`[seed] source created: ${sourceConfig.name}`);
    } else {
      console.log(`[seed] source already exists: ${sourceConfig.name}`);
    }
  }

  console.log('[seed] done');
  process.exit(0);
}

seed().catch((error) => {
  console.error('[seed] error:', error);
  process.exit(1);
});
