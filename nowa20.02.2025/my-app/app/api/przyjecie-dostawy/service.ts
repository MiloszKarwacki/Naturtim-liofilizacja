import  prisma  from "@/lib/prisma";

// Typ dla danych wejściowych przyjęcia dostawy
interface CreateDostawaInput {
  productId: number;
  supplierId: number;
  recipientId?: number | null;
  weight: number;
  boxCount: number;
  notes?: string;
}

class DostawyService {
  /**
   * Generuje unikalny numer partii w formacie XX/YY/ZZZZ
   * gdzie XX to numer seryjny, YY to aktualny miesiąc, ZZZZ to aktualny rok
   */
  async generateBatchNumber(): Promise<string> {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // +1 bo miesiące są od 0
    const year = today.getFullYear().toString();
    
    // Pobieramy ostatnią partię z bieżącego miesiąca i roku
    const lastBatch = await prisma.productionBatch.findFirst({
      where: {
        batchNumber: {
          contains: `/${month}/${year}`
        }
      },
      orderBy: {
        batchNumber: 'desc'
      }
    });
    
    let serialNumber = 1;
    
    if (lastBatch) {
      // Wyciągamy numer seryjny z istniejącego numeru partii
      const match = lastBatch.batchNumber.match(/^(\d+)\//);
      if (match && match[1]) {
        serialNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    // Formatujemy numer seryjny jako dwucyfrowy
    const formattedSerialNumber = String(serialNumber).padStart(2, '0');
    
    // Tworzymy pełny numer partii
    return `${formattedSerialNumber}/${month}/${year}`;
  }
  
  /**
   * Tworzy nową dostawę (partię produkcyjną) w systemie
   */
  async createDostawa(data: CreateDostawaInput) {
    // Generujemy unikalny numer partii
    const batchNumber = await this.generateBatchNumber();
    
    // Szukamy statusu "Przyjęty" w bazie lub tworzymy go jeśli nie istnieje
    let statusPrzyjety = await prisma.batchStatus.findFirst({
      where: { name: "Przyjęty" }
    });
    
    if (!statusPrzyjety) {
      statusPrzyjety = await prisma.batchStatus.create({
        data: {
          name: "Przyjęty",
          description: "Produkt został przyjęty do magazynu",
          color: "#4CAF50" // zielony
        }
      });
    }
    
    // Tworzymy nową partię produkcyjną w bazie danych
    const newBatch = await prisma.productionBatch.create({
      data: {
        batchNumber,
        productId: data.productId,
        supplierId: data.supplierId,
        recipientId: data.recipientId || null,
        initialWeight: data.weight,
        notes: data.notes,
        statusId: statusPrzyjety.id,
        createdAt: new Date(),
        
        // Tworzymy też pierwszą zmianę statusu
        statusHistory: {
          create: {
            newStatus: "Przyjęty",
            changedBy: "System", // Tu docelowo warto przekazać ID użytkownika
            notes: `Przyjęcie dostawy: ${data.weight}kg, ${data.boxCount} kartonów`
          }
        }
      },
      include: {
        product: true,
        supplier: true,
        Recipient: true,
        status: true
      }
    });
    
    return {
      ...newBatch,
      message: "Dostawa została pomyślnie zarejestrowana",
      boxCount: data.boxCount // Dodajemy ilość kartonów do odpowiedzi
    };
  }

  /**
   * Pobiera listę wszystkich produktów
   */
  async getProducts() {
    return await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Pobiera listę wszystkich dostawców
   */
  async getSuppliers() {
    return await prisma.supplier.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Pobiera listę wszystkich odbiorców
   */
  async getRecipients() {
    return await prisma.recipient.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }
}

// Eksportujemy singleton serwisu
export const dostawyService = new DostawyService(); 