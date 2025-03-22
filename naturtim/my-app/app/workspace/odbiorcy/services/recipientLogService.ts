import { NextRequest } from 'next/server';
import { logEvent } from '@/lib/logger';

export const RecipientLogService = {
  // Logowanie utworzenia nowego odbiorcy
  async logRecipientCreation(req: NextRequest, recipientId: number, recipientName: string): Promise<void> {
    await logEvent(
      req,
      `Utworzono nowego odbiorcę: ${recipientName}`,
      {
        recipientId,
        recipientName,
        action: 'create'
      }
    );
  },
  
  // Logowanie usunięcia odbiorcy
  async logRecipientDeletion(req: NextRequest, recipientId: number, recipientName: string): Promise<void> {
    await logEvent(
      req,
      `Usunięto odbiorcę: ${recipientName}`,
      {
        recipientId,
        recipientName,
        action: 'delete'
      }
    );
  }
}; 