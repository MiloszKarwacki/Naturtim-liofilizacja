import dayjs from "dayjs";

// Definicje typów
export interface Machine {
  id: number;
  name: string;
  color: string; // dla kalendarza
}

export interface Process {
  id: string;
  machineId: number;
  deliveryId: number;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  // Optionalnie pola z relacjami pobranymi z serwera
  machine?: Machine;
  delivery?: Delivery;
}

// Interfejs dla dostawy (tak jak w module magazynu)
export interface Delivery {
  id: number;
  batchNumber: string;
  mroznia: number;
  createdAt: string;
  lastInventoryAt?: string;
  product: { name: string };
}