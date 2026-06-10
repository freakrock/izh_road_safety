import { SourceModel } from '../models/Source.js';
import { RawPostModel } from '../models/RawPost.js';
import { createHash } from '../utils/hash.js';
import { createEventFromRawPost } from '../events/event.service.js';

export async function ingestManualText(params) {
  const source = await SourceModel.findOneAndUpdate(
    {
      name: params.sourceName || 'Manual Test Source'
    },
    {
      name: params.sourceName || 'Manual Test Source',
      type: 'official',
      url: 'manual://test',
      trustLevel: 90,
      isActive: true
    },
    {
      upsert: true,
      new: true
    }
  );

  const hash = createHash(`${source._id}:${params.text}`);

  const existing = await RawPostModel.findOne({ hash });

  if (existing) {
    return {
      rawPost: existing,
      event: null,
      duplicate: true
    };
  }

  const rawPost = await RawPostModel.create({
    sourceId: source._id,
    text: params.text,
    hash,
    fetchedAt: new Date()
  });

  const event = await createEventFromRawPost({
    sourceId: source._id,
    rawPostId: rawPost._id,
    text: params.text
  });

  return {
    rawPost,
    event,
    duplicate: false
  };
}
