const forbiddenPatterns = [
  /\b\d{1,3}[.,]\d{3,}\s*,\s*\d{1,3}[.,]\d{3,}\b/g,

  /у дома\s+\d+[а-яa-z]?/gi,
  /возле дома\s+\d+[а-яa-z]?/gi,
  /напротив дома\s+\d+[а-яa-z]?/gi,

  /объезж[а-я]+/gi,
  /не езжайте/gi,
  /лучше ехать через/gi,

  /номер экипажа/gi,
  /госномер/gi,
  /номер машины/gi
];

export function sanitizePublicText(text) {
  let result = text;

  for (const pattern of forbiddenPatterns) {
    result = result.replace(pattern, '[скрыто]');
  }

  return result.trim();
}

export function enforceSafePrecision(precisionLevel) {
  if (precisionLevel === 'exact') return 'district';
  if (precisionLevel === 'road') return 'district';

  return precisionLevel;
}

export function canAutoApprove(params) {
  return (
    params.sourceTrustLevel >= 85 &&
    params.confidence >= 0.7 &&
    params.precisionLevel !== 'exact' &&
    params.precisionLevel !== 'road'
  );
}
