import crypto, { randomUUID } from 'node:crypto';
import { pool, prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'tumbuhkita-secret-jwt-key-2026-secure';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function signJwt(payload: { id: string; email: string; role?: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${headerB64}.${payloadB64}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

export function verifyJwt(token: string): { id: string; email: string; role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;

    const data = `${headerB64}.${payloadB64}`;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

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

/**
 * Register user in both Supabase auth.users and public.User via Prisma
 */
export async function registerUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check if user already exists in public.User or auth.users
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const checkAuth = await pool.query(
    'SELECT id FROM auth.users WHERE lower(email) = $1',
    [normalizedEmail]
  );
  if (checkAuth.rows.length > 0) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const userId = randomUUID();
  const hashedPassword = await hashPassword(password);

  // 1. Insert into Supabase auth.users
  await pool.query(
    `INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      role,
      aud,
      created_at,
      updated_at
    ) VALUES (
      $1, '00000000-0000-0000-0000-000000000000', $2, $3, NOW(), $4, 'authenticated', 'authenticated', NOW(), NOW()
    )`,
    [userId, normalizedEmail, hashedPassword, JSON.stringify({ name })]
  );

  // 2. Insert into public.User via Prisma
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      name,
      role: 'USER',
    },
  });

  const token = signJwt({ id: user.id, email: user.email, role: user.role });

  return { user, token };
}

/**
 * Authenticate user from Supabase auth.users and get profile from public.User
 */
export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();

  // First check public.User via Prisma
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user && user.passwordHash) {
    const isValid = await comparePassword(password, user.passwordHash);
    if (isValid) {
      const token = signJwt({ id: user.id, email: user.email, role: user.role });
      return { user, token };
    }
  }

  // Fallback check auth.users table
  const authRes = await pool.query(
    'SELECT id, email, encrypted_password, raw_user_meta_data FROM auth.users WHERE lower(email) = $1',
    [normalizedEmail]
  );

  if (authRes.rows.length === 0) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const authUser = authRes.rows[0];
  const isValid = await comparePassword(password, authUser.encrypted_password || '');
  if (!isValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Get or upsert public.User profile
  let finalUser = user;
  if (!finalUser) {
    const metaName = authUser.raw_user_meta_data?.name || normalizedEmail.split('@')[0];
    finalUser = await prisma.user.create({
      data: {
        id: authUser.id,
        email: normalizedEmail,
        passwordHash: authUser.encrypted_password,
        name: metaName,
        role: 'USER',
      },
    });
  }

  const token = signJwt({ id: finalUser.id, email: finalUser.email, role: finalUser.role });

  return { user: finalUser, token };
}
