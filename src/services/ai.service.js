// Используем стандартный подход для работы с LLM
export async function analyzeTextWithAI(text) {
  const prompt = `
    Проанализируй сообщение о дорожной ситуации в Ижевске:
    "${text}"
    
    Верни JSON:
    {
      "isRelevant": true/false (относится ли это к проверкам ДПС, ДТП или перекрытиям),
      "category": "sobriety_check" | "tinting" | "accident" | "other",
      "location": "название улицы или района",
      "typeTitle": "краткий заголовок",
      "score": 0.0-1.0 (уверенность)
    }
  `;

  // Тут будет вызов модели Gemini или GPT через API
  // Для начала можно оставить заглушку, но логика уже готова.
  return {
    isRelevant: text.includes('ДПС') || text.includes('рейд'),
    category: 'sobriety_check',
    location: 'Уточняется',
    typeTitle: 'Рейд ГИБДД',
    score: 0.9
  };
}
