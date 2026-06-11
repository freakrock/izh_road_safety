import { RawPostModel } from '../models/RawPost.js';
import { EventModel } from '../models/Event.js';
import { config } from '../config.js';

// Простейшая база знаний для Ижевска (можно расширять)
const GEOGRAPHY = {
  districts: ['Октябрьский', 'Первомайский', 'Индустриальный', 'Ленинский', 'Устиновский'],
  streets: ['Пушкинская', 'Удмуртская', 'Ленина', '10 лет Октября', 'Холмогорова', 'Ворошилова', 'Молодежная', 'Гагарина']
};

const TYPE_MAP = {
  'трезвый водитель': 'sobriety_check',
  'пьяный': 'sobriety_check',
  'нетрезвый': 'sobriety_check',
  'дети': 'child_safety',
  'ребенок': 'child_safety',
  'тонировк': 'tinting_control',
  'пешеход': 'pedestrian_priority',
  'мото': 'motorcycle_control',
  'ремень': 'seatbelt_control',
  'скорост': 'speed_control'
};

export async function processPendingPosts() {
  const posts = await RawPostModel.find({ isProcessed: false }).limit(20);
  
  const stats = { processed: 0, eventsCreated: 0 };

  for (const post of posts) {
    const text = post.text.toLowerCase();
    
    // 1. Проверяем релевантность (есть ли ключевые слова)
    const hasKeywords = config.keywords.some(k => text.includes(k.toLowerCase()));
    
    if (!hasKeywords) {
      post.isProcessed = true;
      await post.save();
      continue;
    }

    // 2. Аналитика: пытаемся определить тип события
    let eventType = 'unknown';
    for (const [key, value] of Object.entries(TYPE_MAP)) {
      if (text.includes(key)) {
        eventType = value;
        break;
      }
    }

    // 3. Аналитика: ищем локацию
    let detectedLocation = '';
    for (const street of GEOGRAPHY.streets) {
      if (text.includes(street.toLowerCase())) {
        detectedLocation = street;
        break;
      }
    }

    // 4. Оценка уверенности (Confidence)
    let confidence = 0.5;
    if (eventType !== 'unknown') confidence += 0.2;
    if (detectedLocation) confidence += 0.2;
    if (post.title && post.title.includes('ГИБДД')) confidence += 0.1;

    // 5. Создаем событие
    try {
      // Ищем, не создавали ли мы уже событие по этому посту
      const existing = await EventModel.findOne({ rawPostId: post._id });
      
      if (!existing) {
        await EventModel.create({
          title: post.title || 'Новое дорожное событие',
          description: post.text,
          eventType,
          locationText: detectedLocation || 'Ижевск (уточняется)',
          city: 'Ижевск',
          confidence: Math.min(confidence, 1.0),
          status: confidence > 0.8 ? 'approved' : 'candidate', // Если уверены — сразу в рассылку
          rawPostId: post._id,
          sourceId: post.sourceId
        });
        stats.eventsCreated++;
      }
    } catch (e) {
      console.error('[processor] error creating event:', e.message);
    }

    post.isProcessed = true;
    await post.save();
    stats.processed++;
  }

  return stats;
}
