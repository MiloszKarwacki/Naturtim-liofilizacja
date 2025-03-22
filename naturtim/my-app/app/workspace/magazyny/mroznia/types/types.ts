import { Product, ProductionBatch, Fraction, BatchFraction } from '@prisma/client';

// Typ reprezentujący produkt z mroźni w takiej formie jakiej
// potrzebuje nasz komponent do wyświetlenia
export interface FrozenProductDisplay {
  id: number;
  batchNumber: string;
  createdAt: string; // ISO string
  lastInventoryAt?: string; // ISO string (opcjonalne)
  product: {
    name: string;
  };
  mroznia: number;
  batchFractions?: BatchFractionDisplay[];
}

// Typ reprezentujący frakcję dla interfejsu
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

// Dane dla zapytania PATCH
export interface FrozenProductUpdateData {
  deliveryId: number;
  newQuantity: number;
}