import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.SESSION_SECRET || 'fallback_secret_sistema_church_2026_super_secure';
const COOKIE_NAME = 'admin_session';

export interface SessionPayload {
  username: string;
  role: 'superadmin' | 'admin' | 'sacerdote';
  expiresAt: number;
}

export function createSessionToken(username: string, role: 'superadmin' | 'admin' | 'sacerdote'): string {
  const payload: SessionPayload = {
    username,
    role,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
  };
  
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payloadStr)
    .digest('base64url'); // base64url is safer for cookies
    
  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [payloadStr, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payloadStr)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    const decodedPayload = JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf8')) as SessionPayload;
    
    if (decodedPayload.expiresAt < Date.now()) {
      return null; // Expirado
    }
    
    return decodedPayload;
  } catch (e) {
    return null;
  }
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return null;
  
  return verifySessionToken(sessionCookie.value);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const payload = await getSessionPayload();
  return payload !== null && (payload.role === 'admin' || payload.role === 'superadmin');
}

export async function isSuperAdminAuthenticated(): Promise<boolean> {
  const payload = await getSessionPayload();
  return payload !== null && payload.role === 'superadmin';
}

export async function isSacerdoteAuthenticated(): Promise<boolean> {
  const payload = await getSessionPayload();
  return payload !== null && payload.role === 'sacerdote';
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

