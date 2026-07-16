"use server";

import { cookies } from 'next/headers';
import { createSessionToken, verifySessionToken } from '../lib/auth';

const COOKIE_NAME = 'admin_session';

export interface LoginResponse {
  success: boolean;
  role?: 'superadmin' | 'admin' | 'sacerdote';
  error?: string;
}

export async function loginAdmin(formData: FormData): Promise<LoginResponse> {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return { success: false, error: 'Todos los campos son obligatorios.' };
    }

    const envAdminUsername = process.env.ADMIN_USERNAME || 'admin';
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'clave_segura_admin_2026';

    const envSacerdoteUsername = process.env.SACERDOTE_USERNAME || 'sacerdote';
    const envSacerdotePassword = process.env.SACERDOTE_PASSWORD || 'clave_segura_sacerdote_2026';

    const envSuperAdminUsername = process.env.SUPERADMIN_USERNAME || 'superadmin';
    const envSuperAdminPassword = process.env.SUPERADMIN_PASSWORD || 'clave_segura_superadmin_2026';

    let role: 'superadmin' | 'admin' | 'sacerdote';

    if (username === envSuperAdminUsername && password === envSuperAdminPassword) {
      role = 'superadmin';
    } else if (username === envAdminUsername && password === envAdminPassword) {
      role = 'admin';
    } else if (username === envSacerdoteUsername && password === envSacerdotePassword) {
      role = 'sacerdote';
    } else {
      return { success: false, error: 'Usuario o contraseña incorrectos.' };
    }

    // Generar token con rol y setear cookie
    const token = createSessionToken(username, role);
    const cookieStore = await cookies();
    
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 horas en segundos
    });

    return { success: true, role };
  } catch (error: any) {
    console.error('Error en loginAdmin:', error);
    return { success: false, error: 'Ocurrió un error inesperado al iniciar sesión.' };
  }
}

export async function logoutAdminAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return { success: false };
  }
}

export async function verifyAuthAction(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie) return false;

    const payload = verifySessionToken(sessionCookie.value);
    return payload !== null;
  } catch (error) {
    return false;
  }
}
