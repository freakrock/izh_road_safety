import { RawPostModel } from '../models/RawPost.js';
import { EventModel } from '../models/Event.js';
import { analyzeTextWithAI } from './ai.service.js';

export async function processPendingPosts() {
  const posts = await RawPostModel.find({ isProcessed: false }).limit(10);
  const results = { processed: 0, events: 0 };

  for (const post of posts) {
    try {
      console.log(`[processor] Analyzing: ${post.text.substring(0, 50)}...`);

      const analysis = await analyzeTextWithAI(post.text);

      if (analysis.isRelevant && analysis.score > 0.6) {
        await EventModel.create({
          title: analysis.typeTitle || 'Дорожное событие',
          description: post.text,
          eventType: analysis.category || 'unknown',
          locationText: analysis.location,
          confidence: analysis.score,
          status: analysis.score > 0.8 ? 'approved' : 'candidate',
          rawPostId: post._id,
          city: 'Ижевск'
        });
        results.events++;
      }
    } catch (err) {
      console.error(`[processor] Error processing post ${post._id}:`, err.message);
    }

    post.isProcessed = true;
    await post.save();
    results.processed++;
  }
  return results;
}
