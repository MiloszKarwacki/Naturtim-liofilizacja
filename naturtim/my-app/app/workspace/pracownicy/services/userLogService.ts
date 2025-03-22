import { NextRequest } from 'next/server';
import { logEvent } from '@/lib/logger';
import { User } from '../types/user';

export const UserLogService = {
  // Logowanie utworzenia nowego pracownika
  async logUserCreation(req: NextRequest, userId: number, userLogin: string): Promise<void> {
    await logEvent(
      req,
      `Utworzono nowego pracownika: ${userLogin}`,
      {
        userId,
        userLogin,
        action: 'create'
      }
    );
  },
  
  // Logowanie aktualizacji pracownika
  async logUserUpdate(
    req: NextRequest, 
    userId: number, 
    userLogin: string, 
    updatedFields: string[],
    permissionChanges?: {
      added: string[],
      removed: string[]
    }
  ): Promise<void> {
    // Przygotuj bardziej opisowy komunikat
    let description = `Zaktualizowano pracownika: ${userLogin}`;
    
    // Dodaj informacje o zmienionych uprawnieniach, jeśli są dostępne
    if (permissionChanges && (permissionChanges.added.length > 0 || permissionChanges.removed.length > 0)) {
      if (permissionChanges.added.length > 0) {
        description += ` | Dodane uprawnienia: ${permissionChanges.added.join(', ')}`;
      }
      if (permissionChanges.removed.length > 0) {
        description += ` | Usunięte uprawnienia: ${permissionChanges.removed.join(', ')}`;
      }
    }
    
    await logEvent(
      req,
      description,
      {
        userId,
        userLogin,
        updatedFields,
        permissionChanges,
        action: 'update'
      }
    );
  },
  
  // Logowanie usunięcia pracownika
  async logUserDeletion(req: NextRequest, userId: number, userLogin: string): Promise<void> {
    await logEvent(
      req,
      `Usunięto pracownika: ${userLogin}`,
      {
        userId,
        userLogin,
        action: 'delete'
      }
    );
  }
}; 