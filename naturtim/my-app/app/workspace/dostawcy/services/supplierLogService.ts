import { NextRequest } from 'next/server';
import { logEvent } from '@/lib/logger';

export const SupplierLogService = {
  // Logowanie utworzenia nowego dostawcy
  async logSupplierCreation(req: NextRequest, supplierId: number, supplierName: string): Promise<void> {
    await logEvent(
      req,
      `Utworzono nowego dostawcę: ${supplierName}`,
      {
        supplierId,
        supplierName,
        action: 'create'
      }
    );
  },
  
  // Logowanie usunięcia dostawcy
  async logSupplierDeletion(req: NextRequest, supplierId: number, supplierName: string): Promise<void> {
    await logEvent(
      req,
      `Usunięto dostawcę: ${supplierName}`,
      {
        supplierId,
        supplierName,
        action: 'delete'
      }
    );
  }
}; 