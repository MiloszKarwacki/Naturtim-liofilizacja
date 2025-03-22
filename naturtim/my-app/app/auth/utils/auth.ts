import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/config/constants';
import { AuthUser } from '../types/auth';

// Funkcja do weryfikacji tokenu i pobierania danych użytkownika
export function getAuthUser(req: NextRequest): AuthUser | null {
  try {
    // Pobierz token z ciasteczka
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Weryfikuj token JWT używając importowanego sekretu
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    console.error('Błąd weryfikacji tokenu:', error);
    return null;
  }
}

// Funkcja sprawdzająca, czy użytkownik ma uprawnienia
export function hasPermission(user: AuthUser | null, requiredPermissions: string[]): boolean {
  if (!user) return false;
  
  // Sprawdź, czy użytkownik ma którekolwiek z wymaganych uprawnień
  return requiredPermissions.some(permission => 
    user.permissions.includes(permission)
  );
} 