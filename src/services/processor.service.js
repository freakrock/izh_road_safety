import { RawPostModel } from '../models/RawPost.js';
import { EventModel } from '../models/Event.js';
// Представим, что у нас есть обертка для AI (например, через ваш API ключ)
import { analyzeTextWithAI } from './ai.service.js'; 

export async function processPendingPosts() {
  const posts = await RawPostModel.find({ isProcessed: false }).limit(10);
  
  for (const post of posts) {
    console.log(`[ai-processor] Анализируем: ${post.text.substring(0, 50)}...`);

    // Отправляем текст в нейросеть
    const analysis = await analyzeTextWithAI(post.text);

    if (analysis.isRelevant) {
      await EventModel.create({
        title: analysis.typeTitle,
        description: post.text,
        eventType: analysis.category, // sobriety_check, accident, etc.
        locationText: analysis.location,
        confidence: analysis.score,
        status: analysis.score > 0.8 ? 'approved' : 'candidate',
        rawPostId: post._id
      });
    }

    post.isProcessed = true;
    await post.save();
  }
}
