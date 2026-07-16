export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0020')) return `+20${cleaned.slice(4)}`;
  if (cleaned.startsWith('20')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+20${cleaned.slice(1)}`;
  return `+20${cleaned}`;
}

export function computeHash(data: Record<string, unknown>): string {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data, Object.keys(data).sort()));
  return hash.digest('hex');
}

export function generateVersionString(): string {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isEgyptianCoordinate(lat: number, lng: number): boolean {
  return lat >= 22 && lat <= 32 && lng >= 25 && lng <= 37;
}

export function isValidEgyptianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return /^(0020|20)?1[0-2,5]\d{8}$/.test(cleaned);
}
