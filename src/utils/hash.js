import crypto from 'crypto';

export function createHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
