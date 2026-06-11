import { SourceModel } from '../models/Source.js';
import { RawPostModel } from '../models/RawPost.js';
import { parseRSSSource } from '../scrapers/rss.parser.js';

export async function collectRSSSources() {
  const sources = await SourceModel.find({
    type: 'rss',
    isActive: true
  }).lean();

  if (!sources.length) {
    return {
      collected: 0,
      sources: 0
    };
  }

  let totalCollected = 0;

  for (const source of sources) {
    try {
      const items = await parseRSSSource(source);

      if (items.length) {
        await RawPostModel.insertMany(items, { ordered: false });
        totalCollected += items.length;
      }

      await SourceModel.findByIdAndUpdate(source._id, {
        lastFetchedAt: new Date()
      });
    } catch (error) {
      console.error(`[collector] ${source.name}:`, error.message);
    }
  }

  return {
    collected: totalCollected,
    sources: sources.length
  };
}
