import prisma from '@/lib/prisma';

// Mapa określająca, które quantityKey mapuje się na jakie pole w bazie
const updateFieldMapping: Record<string, string> = {
  polprodukt: 'polprodukt'
};

export async function getSemifinishedProducts() {
  try {
    // Pobieramy partie, które mają półprodukty
    const semifinishedProducts = await prisma.productionBatch.findMany({
      where: {
        processEndDate: {
          not: null,
        },
        polprodukt: {
          gt: 0,
        },
      },
      include: {
        // Zamiast product użyjmy relacji do Product
        product: true,
        // Zamiast fractionItems użyjmy właściwej nazwy relacji
        fractionItems: {
          include: {
            fraction: true,
          },
        },
      },
    });
    
    // Formatujemy dane zgodnie z oczekiwaniami komponentu InventoryTable
    const formattedData = semifinishedProducts.map((batch) => {
      // Przygotowanie frakcji, jeśli istnieją
      const batchFractions = batch.fractionItems?.map(item => ({
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
        // Używamy daty procesu jako daty utworzenia
        createdAt: batch.processEndDate?.toISOString() || new Date().toISOString(),
        lastInventoryAt: batch.processEndDate?.toISOString(),
        product: {
          name: batch.product?.name || 'Nieznany produkt',
        },
        // To pole odpowiada quantityKey "polprodukt" w komponencie InventoryTable
        polprodukt: batch.polprodukt || 0,
        // Dodajemy frakcje tylko jeśli są 
        batchFractions: batchFractions.length > 0 ? batchFractions : undefined,
      };
    });

    return formattedData;
  } catch (error) {
    console.error("Błąd w getSemifinishedProducts:", error);
    throw error;
  }
}

export async function updateSemifinishedProduct(deliveryId: number, newQuantity: number, quantityKey: string = 'polprodukt') {
  try {
    const updateField = updateFieldMapping[quantityKey];
    if (!updateField) {
      throw new Error(`Invalid quantityKey: ${quantityKey}`);
    }

    const updatedBatch = await prisma.productionBatch.update({
      where: { id: deliveryId },
      data: {
        // Aktualizujemy odpowiednie pole zgodnie z mappingiem
        [updateField]: newQuantity,
      },
    });

    return updatedBatch;
  } catch (error) {
    console.error("Błąd w updateSemifinishedProduct:", error);
    throw error;
  }
} 