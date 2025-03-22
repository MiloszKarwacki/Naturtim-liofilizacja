import prisma from "@/lib/prisma";

// Interfejs dla danych wejściowych przypisania frakcji
interface AssignFractionInput {
  batchId: number;
  fractionId: number;
  weight: number;
}

class FrakcjeService {
  /**
   * Pobiera wszystkie dostępne frakcje
   */
  async getFractions() {
    return await prisma.fraction.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Pobiera partie produkcyjne, które można poddać frakcjonowaniu
   * (te, które są po liofilizacji, ale bez przypisanej frakcji)
   */
  async getAvailableBatches() {
    // Status, który wskazuje na zakończoną liofilizację
    const statusPoLiofilizacji = await prisma.batchStatus.findFirst({
      where: { 
        name: { contains: "Po liofilizacji" }
      }
    });

    if (!statusPoLiofilizacji) {
      // Jeśli nie ma takiego statusu, znajdź jakiekolwiek partie bez frakcji
      return await prisma.productionBatch.findMany({
        where: {
          fractionId: null,
          lyophilizationEndDate: { not: null } // Musi mieć datę końca liofilizacji
        },
        orderBy: { batchNumber: 'desc' },
        include: {
          product: true
        }
      });
    }

    // Pobierz partie o statusie "Po liofilizacji" bez przypisanej frakcji
    return await prisma.productionBatch.findMany({
      where: {
        statusId: statusPoLiofilizacji.id,
        fractionId: null
      },
      orderBy: { batchNumber: 'desc' },
      include: {
        product: true
      }
    });
  }

  /**
   * Przypisuje frakcję do partii produkcyjnej
   */
  async assignFraction(data: AssignFractionInput) {
    // Pobierz aktualną partię
    const batch = await prisma.productionBatch.findUnique({
      where: { id: data.batchId },
      include: {
        product: true,
        status: true
      }
    });

    if (!batch) {
      throw new Error("Nie znaleziono partii o podanym ID");
    }

    // Szukamy lub tworzymy status "Po frakcjonowaniu"
    let statusPoFrakcjonowaniu = await prisma.batchStatus.findFirst({
      where: { name: "Po frakcjonowaniu" }
    });

    if (!statusPoFrakcjonowaniu) {
      statusPoFrakcjonowaniu = await prisma.batchStatus.create({
        data: {
          name: "Po frakcjonowaniu",
          description: "Produkt został poddany frakcjonowaniu",
          color: "#FF9800" // pomarańczowy
        }
      });
    }

    // Aktualna data dla frakcjonowania
    const now = new Date();

    // Aktualizujemy partię - ustawiamy frakcję, datę frakcjonowania i status
    const updatedBatch = await prisma.productionBatch.update({
      where: { id: data.batchId },
      data: {
        fractionId: data.fractionId,
        fractioningDate: now,
        statusId: statusPoFrakcjonowaniu.id,
        postLyophilizationWeight: data.weight, // Aktualizujemy wagę po liofilizacji

        // Dodajemy wpis do historii statusów
        statusHistory: {
          create: {
            oldStatus: batch.status?.name || "Nieznany",
            newStatus: "Po frakcjonowaniu",
            changedBy: "System", // Tutaj później możemy użyć danych użytkownika
            changedAt: now,
            notes: `Przypisano frakcję, waga: ${data.weight}kg`
          }
        }
      },
      include: {
        product: true,
        fraction: true,
        status: true
      }
    });

    return {
      ...updatedBatch,
      message: "Frakcja została pomyślnie przypisana do partii"
    };
  }
}

// Eksportujemy singleton serwisu
export const frakcjeService = new FrakcjeService(); 