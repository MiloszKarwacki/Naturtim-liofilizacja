import { Product, ProductionBatch, Fraction, BatchFraction } from '@prisma/client';

// Typ reprezentujący gotowy produkt dla wyświetlenia w tabeli
export interface FinishedProductDisplay {
  id: number;
  batchNumber: string;
  createdAt: string; // ISO string
  lastInventoryAt?: string; // ISO string (opcjonalne)
  product: {
    name: string;
  };
  gotowyProdukt: number; // Ilość gotowego produktu w magazynie
  batchFractions?: BatchFractionDisplay[]; // Frakcje partii
}

// Typ reprezentujący frakcję dla interfejsu (podobny jak w mroźni)
export interface BatchFractionDisplay {
  id: number;
  fraction: {
    name: string;
  };
  polproduktWeight: number;
  gotowyProduktWeight: number; 
  wasteWeight: number;
  qualityControlDate?: string;
}

// Dane dla zapytania PATCH (aktualizacja ilości)
export interface FinishedProductUpdateData {
  deliveryId: number;
  newQuantity: number;
  quantityKey?: string;
} 