import { config } from '../config.js';

// Здесь можно использовать OpenAI, Anthropic или ваш прокси
// Для примера используем fetch к OpenAI-совместимому API
export async function analyzeTextWithAI(text) {
  const systemPrompt = `
    Ты — аналитик дорожной обстановки в Ижевске. Твоя задача — извлечь данные из сообщения.
    Верни ТОЛЬКО JSON с полями:
    - isRelevant (boolean): относится ли текст к рейдам ГИБДД, проверкам, ДПС или перекрытиям дорог.
    - category (string): один из [sobriety_check, child_safety, tinting_control, pedestrian_priority, motorcycle_control, seatbelt_control, speed_control, unknown]
    - location (string): конкретная улица, перекресток или район (на русском).
    - typeTitle (string): краткий заголовок события.
    - score (number): уверенность от 0 до 1.
    - summary (string): краткая суть одной фразой.

    Текст: "${text}"
  `;

  try {
    // Если у вас нет ключа, можно временно возвращать "заглушку" (Mock-данные)
    // Но для работы нужен вызов к LLM (например, через OpenRouter или OpenAI)
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: systemPrompt }],
            response_format: { type: "json_object" }
        })
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
    */

    // Временная имитация умного анализа для теста:
    const isDrink = text.toLowerCase().includes('трезв') || text.toLowerCase().includes('пьян');
    return {
      isRelevant: true,
      category: isDrink ? 'sobriety_check' : 'unknown',
      location: 'Определяется...',
      typeTitle: isDrink ? 'Рейд на трезвость' : 'Проверка ГИБДД',
      score: 0.9,
      summary: 'Обнаружен экипаж ДПС'
    };
  } catch (e) {
    console.error('[AI Error]', e);
    return { isRelevant: false, score: 0 };
  }
}
