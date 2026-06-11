import crypto from 'crypto';
import { RawPostModel } from '../models/RawPost.js';
import { SourceModel } from '../models/Source.js';

export async function parseRSSSource(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RoadSafetyBot/1.0)'
      },
      signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
      console.warn(`[rss] ${source.name}: HTTP ${response.status}`);
      return [];
    }

    const xml = await response.text();

    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const results = [];

    for (const itemXml of items) {
      const getTag = (tag) => {
        const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return match ? match[1].trim() : '';
      };

      const getCDATA = () => {
        const match = itemXml.match(/<!$$CDATA$$([\s\S]*?)$$$$>/);
        return match ? match[1].trim() : '';
      };

      const title = getTag('title') || '';
      const link = getTag('link') || '';
      const description = getTag('description') || '';
      const pubDateStr = getTag('pubDate');

      const text = `${title}\n${description}`.trim();

      if (!text) {
        continue;
      }

      const hash = crypto.createHash('sha256').update(text).digest('hex');

      const externalId = link || hash.slice(0, 16);

      const publishedAt = pubDateStr ? new Date(pubDateStr) : new Date();

      const existingPost = await RawPostModel.findOne({ hash });

      if (existingPost) {
        continue;
      }

      results.push({
        sourceId: source._id,
        externalId,
        url: link,
        title: title || text.slice(0, 100),
        text: description || title || text,
        publishedAt,
        rawData: { itemXml },
        hash,
        isProcessed: false
      });
    }

    return results;
  } catch (error) {
    console.error(`[rss] parse error [${source.name}]:`, error.message);
    return [];
  }
}
