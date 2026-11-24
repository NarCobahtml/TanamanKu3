import crypto from 'node:crypto';

// Migrasi password legacy
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  try {
    if (storedHash.includes(':')) {
      const [salt, key] = storedHash.split(':');
      if (!salt || !key) return false;
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    }
  } catch {
    return false;
  }
  return false;
}
