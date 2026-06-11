import { RawPostModel } from '../models/RawPost.js';
import crypto from 'crypto';

export async function ingestRawData(payload) {
  const { text, sourceName, externalLink, title } = payload;
  
  // Создаем уникальный хеш, чтобы не дублировать сообщения
  const hash = crypto.createHash('md5').update(text + sourceName).digest('hex');

  try {
    const post = await RawPostModel.findOneAndUpdate(
      { hash },
      { 
        text, 
        title, 
        sourceId: null, // Пока привяжем к null или создадим Source "Manual/Telegram"
        externalLink,
        isProcessed: false 
      },
      { upsert: true, new: true }
    );
    return post;
  } catch (e) {
    console.error('[ingest] error:', e.message);
  }
}
