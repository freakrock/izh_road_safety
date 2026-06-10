import Parser from 'rss-parser';
import { SourceModel } from '../models/Source.js';
import { RawPostModel } from '../models/RawPost.js';
import { createHash } from '../utils/hash.js';
import { createEventFromRawPost } from '../events/event.service.js';

const parser = new Parser();

export async function collectRssSource(sourceId) {
  const source = await SourceModel.findById(sourceId);

  if (!source) {
    throw new Error('Source not found');
  }

  const feed = await parser.parseURL(source.url);

  let createdPosts = 0;
  let createdEvents = 0;

  for (const item of feed.items) {
    const text = [item.title, item.contentSnippet, item.content]
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!text) continue;

    const hash = createHash(`${source.id}:${item.guid || item.link || ''}:${text}`);

    const existing = await RawPostModel.findOne({ hash });

    if (existing) continue;

    const rawPost = await RawPostModel.create({
      sourceId: source._id,
      externalId: item.guid || item.link,
      url: item.link,
      text,
      hash,
      publishedAt: item.isoDate ? new Date(item.isoDate) : undefined
    });

    createdPosts++;

    const event = await createEventFromRawPost({
      sourceId: source._id,
      rawPostId: rawPost._id,
      text
    });

    if (event) {
      createdEvents++;
    }
  }

  return {
    source: source.name,
    createdPosts,
    createdEvents
  };
}

export async function collectAllRssSources() {
  const sources = await SourceModel.find({
    isActive: true,
    type: {
      $in: ['rss', 'media', 'official']
    }
  });

  const results = [];

  for (const source of sources) {
    try {
      const result = await collectRssSource(String(source._id));
      results.push(result);
    } catch (error) {
      console.error(`[collector:rss] ${source.name}`, error.message);
    }
  }

  return results;
}
