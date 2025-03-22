import prisma from '@/lib/prisma';
import { FinishedProductDisplay } from '../types/types';

// Mapa określająca, które quantityKey mapuje się na jakie pole w bazie
const updateFieldMapping: Record<string, string> = {
  gotowyProdukt: 'gotowyProdukt'
};

/**
 * Pobiera produkty gotowe znajdujące się w magazynie
 */
export async function getFinishedProducts(): Promise<FinishedProductDisplay[]> {
  try {
    // Pobieramy partie produkcyjne, które mają wagę produktów gotowych większą od 0
    const finishedProducts = await prisma.productionBatch.findMany({
      where: {
        gotowyProdukt: {
          gt: 0, // większe niż 0
        },
      },
      include: {
        product: true,
        fractionItems: {
          include: {
            fraction: true,
          },
        },
      },
    });

    // Mapujemy dane do formatu, którego oczekuje nasz komponent InventoryTable
    const formattedData: FinishedProductDisplay[] = finishedProducts.map((batch) => {
      // Przygotowanie frakcji, jeśli istnieją
      const batchFractions = batch.fractionItems?.map(item => ({
        id: item.id,
        fraction: {
          name: item.fraction.name,
        },
        polproduktWeight: item.polproduktWeight || 0,
        gotowyProduktWeight: item.gotowyProduktWeight || 0,
        wasteWeight: item.wasteWeight || 0,
        qualityControlDate: item.qualityControlDate?.toISOString(),
      })) || [];

      return {
        id: batch.id,
        batchNumber: batch.batchNumber,
        // Używamy qualityControlDate z pierwszej frakcji lub processEndDate jako daty utworzenia
        createdAt: batchFractions[0]?.qualityControlDate || 
                   batch.processEndDate?.toISOString() || 
                   new Date().toISOString(),
        // Jako ostatnia inwentaryzacja - data kontroli jakości
        lastInventoryAt: batchFractions[0]?.qualityControlDate,
        product: {
          name: batch.product?.name || "Nieznany produkt",
        },
        // To pole służy jako quantityKey w komponencie InventoryTable
        gotowyProdukt: batch.gotowyProdukt || 0,
        // Dodajemy frakcje tylko jeśli są
        batchFractions: batchFractions.length > 0 ? batchFractions : undefined,
      };
    });

    return formattedData;
  } catch (error) {
    console.error("Błąd w getFinishedProducts:", error);
    throw error;
  }
}

/**
 * Aktualizuje ilość produktu w magazynie produktów gotowych
 * @param deliveryId ID partii
 * @param newQuantity Nowa ilość
 * @param quantityKey Klucz określający, które pole aktualizować
 */
export async function updateFinishedProduct(
  deliveryId: number, 
  newQuantity: number, 
  quantityKey: string = 'gotowyProdukt'
) {
  try {
    const updateField = updateFieldMapping[quantityKey];
    if (!updateField) {
      throw new Error(`Invalid quantityKey: ${quantityKey}`);
    }

    const updatedBatch = await prisma.productionBatch.update({
      where: {
        id: deliveryId,
      },
      data: {
        [updateField]: newQuantity,
      },
    });

    return updatedBatch;
  } catch (error) {
    console.error("Błąd w updateFinishedProduct:", error);
    throw error;
  }
} 