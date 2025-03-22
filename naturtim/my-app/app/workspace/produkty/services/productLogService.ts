import { NextRequest } from 'next/server';
import { logEvent } from '@/lib/logger';

export const ProductLogService = {
  // Logowanie utworzenia nowego produktu
  async logProductCreation(req: NextRequest, productId: number, productName: string): Promise<void> {
    await logEvent(
      req,
      `Utworzono nowy produkt: ${productName}`,
      {
        productId,
        productName,
        action: 'create'
      }
    );
  },
  
  // Logowanie usunięcia produktu
  async logProductDeletion(req: NextRequest, productId: number, productName: string): Promise<void> {
    await logEvent(
      req,
      `Usunięto produkt: ${productName}`,
      {
        productId,
        productName,
        action: 'delete'
      }
    );
  },
  
  // Możesz później dodać więcej metod, np. do logowania edycji produktu
}; 