import { config } from '../config.js';

const eventRules = [
  {
    type: 'sobriety_check',
    title: 'Профилактическое мероприятие по нетрезвым водителям',
    keywords: [
      'нетрезв',
      'опьянен',
      'опьянения',
      'пьяных водителей',
      'трезвый водитель',
      'алкоголь'
    ]
  },
  {
    type: 'mass_check',
    title: 'Массовая проверка водителей',
    keywords: [
      'массовые проверки',
      'сплошные проверки',
      'рейдовое мероприятие',
      'рейд',
      'рейды',
      'профилактическое мероприятие',
      'профилактические мероприятия'
    ]
  },
  {
    type: 'tinting_control',
    title: 'Контроль светопропускания стекол',
    keywords: ['тонировк', 'светопропускан']
  },
  {
    type: 'child_safety',
    title: 'Профилактическое мероприятие по детской безопасности',
    keywords: [
      'дети',
      'ребенок',
      'ребёнок',
      'юный пассажир',
      'внимание дети',
      'перевозка детей',
      'детское удерживающее'
    ]
  },
  {
    type: 'motorcycle_control',
    title: 'Контроль мототранспорта',
    keywords: [
      'мотоцикл',
      'мотоциклист',
      'питбайк',
      'скутер',
      'мототранспорт',
      'мопед'
    ]
  },
  {
    type: 'pedestrian_priority',
    title: 'Контроль соблюдения приоритета пешеходов',
    keywords: [
      'пешеход',
      'пешеходный переход',
      'не уступил',
      'непредоставление преимущества'
    ]
  },
  {
    type: 'speed_control',
    title: 'Контроль скоростного режима',
    keywords: ['скоростной режим', 'превышение скорости', 'скорость']
  },
  {
    type: 'phone_driving',
    title: 'Контроль использования телефона за рулём',
    keywords: ['телефон за рулем', 'телефон за рулём', 'мобильный телефон']
  },
  {
    type: 'seatbelt_control',
    title: 'Контроль использования ремней безопасности',
    keywords: [
      'ремень безопасности',
      'ремни безопасности',
      'не пристегнут',
      'не пристёгнут'
    ]
  },
  {
    type: 'license_check',
    title: 'Проверка водителей без права управления',
    keywords: [
      'без права управления',
      'не имеет права управления',
      'лишенный права',
      'лишённый права'
    ]
  }
];

const izhevskDistricts = [
  'Индустриальный',
  'Ленинский',
  'Октябрьский',
  'Первомайский',
  'Устиновский'
];

const cityKeywords = [
  'ижевск',
  'ижевска',
  'ижевске',
  'удмурт',
  'удмуртии',
  'удмуртской'
];

export function classifyEvent(text) {
  const normalized = text.toLowerCase();

  const isRelevantCity = cityKeywords.some((keyword) =>
    normalized.includes(keyword)
  );

  if (!isRelevantCity) {
    return null;
  }

  const matchedRules = eventRules
    .map((rule) => {
      const matches = rule.keywords.filter((keyword) =>
        normalized.includes(keyword.toLowerCase())
      );

      return {
        rule,
        score: matches.length
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!matchedRules.length) {
    return null;
  }

  const best = matchedRules[0];

  const district = izhevskDistricts.find((districtName) =>
    normalized.includes(districtName.toLowerCase())
  );

  const confidenceBase = 0.62;
  const confidenceByKeywords = Math.min(best.score * 0.08, 0.24);
  const confidenceByDistrict = district ? 0.08 : 0;

  const confidence = Math.min(
    confidenceBase + confidenceByKeywords + confidenceByDistrict,
    0.95
  );

  return {
    eventType: best.rule.type,
    confidence,
    title: best.rule.title,
    description: text.slice(0, 1500),
    city: config.cityName || 'Ижевск',
    district,
    locationText: district ? `${district} район` : `город ${config.cityName || 'Ижевск'}`,
    precisionLevel: district ? 'district' : 'city'
  };
}
