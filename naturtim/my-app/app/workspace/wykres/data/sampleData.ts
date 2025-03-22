import dayjs from "dayjs";
import { Delivery } from "../../harmonogram/types";

// Typy
export interface Machine {
  id: number;
  name: string;
  color?: string;
}

export interface Process {
  id: string;
  machineId: string | number;
  deliveryId: number | string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  machine?: Machine;
  delivery?: Delivery;
  quantity?: number;
  status?: 'PLANNED' | 'STARTED' | 'COMPLETED'; // Dodajemy status
}

export interface ProcessDialogData {
  inputWeight?: number;
  outputWeight?: number;
  actualStartDate?: Date | null;
  actualEndDate?: Date | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

// Usuwamy przykładowe dane, ponieważ teraz będziemy je pobierać z serwera 