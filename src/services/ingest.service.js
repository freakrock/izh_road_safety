// src/services/ingest.service.js
import { RawPostModel } from '../models/RawPost.js';
import crypto from 'crypto';

export async function ingestRawData({ text, sourceName, externalLink, title }) {
  if (!text) return null;

  // Создаем уникальный ID сообщения, чтобы не дублировать
  const hash = crypto.createHash('md5').update(text + sourceName).digest('hex');

  try {
    return await RawPostModel.findOneAndUpdate(
      { hash },
      { 
        text, 
        title: title || 'Сообщение из мониторинга',
        sourceName, // Добавь это поле в схему RawPost или просто храни в text
        externalLink,
        isProcessed: false 
      },
      { upsert: true, new: true }
    );
  } catch (e) {
    console.error('[ingest] ошибка сохранения:', e.message);
  }
}
