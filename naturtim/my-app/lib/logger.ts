import { NextRequest } from 'next/server';
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/auth/utils/auth";

// lib/logger.ts
export async function logEvent(req: NextRequest, description: string, details: any = null) {
  try {
    const user = getAuthUser(req);
    
    if (!user) {
      console.warn('Próba logowania zdarzenia bez zalogowanego użytkownika:', description);
      return null;
    }
    
    // Pobierz dane użytkownika z bazy, jeśli nie mamy pełnych informacji
    let userName = '';
    
    // Jeśli token zawiera już imię i nazwisko, użyj ich
    if (user.username && user.userSurname) {
      userName = `${user.username} ${user.userSurname}`;
    } else {
      // W przeciwnym razie pobierz dane z bazy
      const userData = await prisma.user.findUnique({
        where: { id: user.id }
      });
      
      if (userData) {
        userName = `${userData.username} ${userData.userSurname}`;
      } else {
        userName = user.login; // Awaryjnie użyj loginu
      }
    }
    
    // Zapisz zdarzenie w bazie
    return prisma.auditLog.create({
      data: {
        userId: user.id,
        userName,
        description,
        details: details ? JSON.stringify(details) : null
      }
    });
  } catch (error) {
    console.error('Błąd podczas zapisywania zdarzenia:', error);
    return null;
  }
}