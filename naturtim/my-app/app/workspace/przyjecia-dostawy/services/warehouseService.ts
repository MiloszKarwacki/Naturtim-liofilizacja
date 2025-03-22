import prisma from "@/lib/prisma";

export class WarehouseService {
  /**
   * Aktualizuje warehouse o dany przyrost lub ubytek wagi.
   * @param warehouseName - nazwa magazynu, np. "mroznia"
   * @param weightDelta - zmiana wagi (dodatnia gdy towar trafia do magazynu, ujemna gdy jest pobierany)
   */
  async updateWarehouse(warehouseName: string, weightDelta: number): Promise<void> {
    const warehouse = await prisma.warehouse.findUnique({ 
      where: { name: warehouseName }
    });
    if (!warehouse) {
      throw new Error(`Magazyn ${warehouseName} nie istnieje.`);
    }
    
    await prisma.warehouse.update({
      where: { id: warehouse.id },
      data: {
        totalWeight: warehouse.totalWeight + weightDelta,
        // Uaktualniamy datę inwentaryzacji – można tu zastosować inną logikę
        lastInventoryDate: new Date(),
      },
    });
  }
} 