import prisma from '@/lib/prisma';
import { WarehouseInfo, WarehouseDetails } from '../types/warehousesTypes';

// Pobieranie wszystkich magazynów
export async function getAllWarehouses(): Promise<WarehouseInfo[]> {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: { warehouseFractions: true }
        }
      }
    });
    
    return warehouses.map(warehouse => ({
      id: warehouse.id,
      name: warehouse.name,
      description: warehouse.description || undefined,
      totalWeight: warehouse.totalWeight,
      lastInventoryDate: warehouse.lastInventoryDate.toISOString(),
      fractionCount: warehouse._count.warehouseFractions
    }));
  } catch (error) {
    console.error("Błąd podczas pobierania magazynów:", error);
    throw error;
  }
}

// Pobieranie szczegółów konkretnego magazynu
export async function getWarehouseDetails(warehouseId: number): Promise<WarehouseDetails | null> {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: {
        warehouseFractions: {
          include: {
            fraction: true,
            productionBatch: {
              include: {
                product: true
              }
            }
          },
          orderBy: {
            weight: 'desc'
          }
        }
      }
    });
    
    if (!warehouse) return null;
    
    const fractions = warehouse.warehouseFractions.map(wf => ({
      id: wf.id,
      fractionId: wf.fractionId,
      fractionName: wf.fraction.name,
      weight: wf.weight,
      batchNumber: wf.productionBatch?.batchNumber,
      productName: wf.productionBatch?.product?.name,
      productionBatchId: wf.productionBatchId || undefined
    }));
    
    return {
      id: warehouse.id,
      name: warehouse.name,
      description: warehouse.description || undefined,
      totalWeight: warehouse.totalWeight,
      lastInventoryDate: warehouse.lastInventoryDate.toISOString(),
      fractions
    };
  } catch (error) {
    console.error("Błąd podczas pobierania szczegółów magazynu:", error);
    throw error;
  }
}

// Aktualizacja wagi frakcji w magazynie
export async function updateWarehouseFraction(
  warehouseId: number,
  fractionId: number,
  newWeight: number,
  productionBatchId?: number
): Promise<WarehouseDetails | null> {
  try {
    // Sprawdzamy czy frakcja istnieje w magazynie
    const warehouseFraction = await prisma.warehouseFraction.findFirst({
      where: {
        warehouseId,
        fractionId,
        productionBatchId: productionBatchId || undefined
      }
    });
    
    // Jeśli frakcja istnieje, aktualizujemy jej wagę
    if (warehouseFraction) {
      await prisma.warehouseFraction.update({
        where: { id: warehouseFraction.id },
        data: { weight: newWeight }
      });
    } 
    // Jeśli frakcja nie istnieje i waga > 0, dodajemy nową
    else if (newWeight > 0) {
      await prisma.warehouseFraction.create({
        data: {
          warehouseId,
          fractionId,
          productionBatchId: productionBatchId || undefined,
          weight: newWeight
        }
      });
    }
    
    // Aktualizujemy całkowitą wagę magazynu
    const totalWeight = await prisma.warehouseFraction.aggregate({
      where: { warehouseId },
      _sum: { weight: true }
    });
    
    await prisma.warehouse.update({
      where: { id: warehouseId },
      data: { 
        totalWeight: totalWeight._sum.weight || 0,
        lastInventoryDate: new Date()
      }
    });
    
    // Zwracamy zaktualizowane dane magazynu
    return getWarehouseDetails(warehouseId);
  } catch (error) {
    console.error("Błąd podczas aktualizacji frakcji w magazynie:", error);
    throw error;
  }
} 