import prisma from '@/lib/prisma';
import { FrozenProductDisplay, BatchFractionDisplay } from '../types/types';

/**
 * Pobiera produkty znajdujące się w magazynie mroźni
 * wraz z informacjami o frakcjach
 */
export async function getFrozenProducts(): Promise<FrozenProductDisplay[]> {
  try {
    // Pobieramy partie produkcyjne, które mają wagę w mroźni większą od 0
    const frozenProducts = await prisma.productionBatch.findMany({
      where: {
        mroznia: {
          gt: 0, // większe niż 0
        },
      },
      include: {
        product: true,
      },
    });

    // Mapujemy dane do formatu, którego oczekuje nasz komponent InventoryTable
    const formattedData: FrozenProductDisplay[] = frozenProducts.map((batch) => {
      // Zwracamy sformatowany obiekt - bez frakcji
      return {
        id: batch.id,
        batchNumber: batch.batchNumber,
        // Używamy deliveryDate jako daty utworzenia (jeśli istnieje) lub obecny czas
        createdAt: batch.deliveryDate?.toISOString() || new Date().toISOString(),
        // Używamy deliveryDate także jako ostatniej inwentaryzacji 
        lastInventoryAt: batch.deliveryDate?.toISOString(),
        product: {
          name: batch.product?.name || "Nieznany produkt",
        },
        // To pole służy jako quantityKey w komponencie InventoryTable
        mroznia: batch.mroznia || 0,
        // Nie dodajemy frakcji w ogóle
        // batchFractions: undefined,
      };
    });

    return formattedData;
  } catch (error) {
    console.error("Błąd w getFrozenProducts:", error);
    throw error;
  }
}

/**
 * Aktualizuje ilość produktu w magazynie mroźni
 * @param deliveryId ID partii
 * @param newQuantity Nowa ilość
 */
export async function updateFrozenProduct(deliveryId: number, newQuantity: number) {
  try {
    const updatedBatch = await prisma.productionBatch.update({
      where: {
        id: deliveryId,
      },
      data: {
        mroznia: newQuantity,
        // Aktualizujemy datę dostawy jako umowną datę ostatniej inwentaryzacji
        deliveryDate: new Date(),
      },
    });

    return updatedBatch;
  } catch (error) {
    console.error("Błąd w updateFrozenProduct:", error);
    throw error;
  }
}