import prisma  from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export class ScheduleService {
  /**
   * Pobiera wszystkie dane potrzebne do harmonogramu
   */
  static async getScheduleData() {
    try {
      // Pobieramy maszyny z bazy danych
      const machines = await prisma.machine.findMany();
      
      // Pobieramy partie produkcyjne (traktowane jako dostawy)
      const deliveries = await prisma.productionBatch.findMany({
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Pobieramy procesy liofilizacji (to nadal partie, ale z datami liofilizacji)
      const processes = await prisma.productionBatch.findMany({
        where: {
          OR: [
            { lyophilizationStartDate: { not: null } },
            { scheduledDate: { not: null } }
          ],
          machineId: { not: null }
        },
        include: {
          Machine: true,
          product: true
        }
      });
      
      // Mapujemy procesy do formatu oczekiwanego przez frontend
      const mappedProcesses = processes.map(process => ({
        id: process.id.toString(),
        machineId: process.machineId || 0,
        deliveryId: process.id,
        startDate: process.lyophilizationStartDate || process.scheduledDate,
        endDate: process.lyophilizationEndDate || 
                (process.scheduledDate ? new Date(new Date(process.scheduledDate).getTime() + (8 * 60 * 60 * 1000)) : null),
        machine: process.Machine,
        delivery: {
          id: process.id,
          batchNumber: process.batchNumber,
          mroznia: process.initialWeight || 0,
          createdAt: process.createdAt.toISOString(),
          product: { name: process.product?.name || "Nieznany produkt" }
        }
      }));
      
      return {
        machines,
        deliveries: deliveries.map(d => ({
          id: d.id,
          batchNumber: d.batchNumber,
          mroznia: d.initialWeight || 0,
          createdAt: d.createdAt.toISOString(),
          product: { name: d.product?.name || "Nieznany produkt" }
        })),
        processes: mappedProcesses
      };
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      throw error;
    }
  }

  /**
   * Dodaje nowy proces liofilizacji (aktualizując partię produkcyjną)
   */
  static async addProcess(processData: any) {
    try {
      const { machineId, deliveryId, startDate, endDate } = processData;
      
      // Aktualizujemy partię produkcyjną o dane procesu liofilizacji
      const updatedBatch = await prisma.productionBatch.update({
        where: { id: deliveryId },
        data: {
          machineId: machineId,
          lyophilizationStartDate: new Date(startDate),
          lyophilizationEndDate: new Date(endDate),
          scheduledDate: new Date(startDate)
        }
      });
      
      revalidatePath('/workspace/harmonogram');
      
      return {
        id: updatedBatch.id.toString(),
        machineId: updatedBatch.machineId || 0,
        deliveryId: updatedBatch.id,
        startDate: updatedBatch.lyophilizationStartDate,
        endDate: updatedBatch.lyophilizationEndDate
      };
    } catch (error) {
      console.error("Error adding process:", error);
      throw error;
    }
  }

  /**
   * Aktualizuje istniejący proces liofilizacji
   */
  static async updateProcess(processData: any) {
    try {
      const { id, machineId, startDate, endDate } = processData;
      
      const updatedBatch = await prisma.productionBatch.update({
        where: { id: parseInt(id) },
        data: {
          machineId: machineId,
          lyophilizationStartDate: new Date(startDate),
          lyophilizationEndDate: new Date(endDate),
          scheduledDate: new Date(startDate)
        }
      });
      
      revalidatePath('/workspace/harmonogram');
      
      return {
        id: updatedBatch.id.toString(),
        machineId: updatedBatch.machineId || 0,
        deliveryId: updatedBatch.id,
        startDate: updatedBatch.lyophilizationStartDate,
        endDate: updatedBatch.lyophilizationEndDate
      };
    } catch (error) {
      console.error("Error updating process:", error);
      throw error;
    }
  }

  /**
   * Usuwa proces liofilizacji (czyści pola w partii produkcyjnej)
   */
  static async deleteProcess(id: string) {
    try {
      // Usuwamy dane liofilizacji z partii produkcyjnej (nie usuwamy samej partii)
      await prisma.productionBatch.update({
        where: { id: parseInt(id) },
        data: {
          machineId: null,
          lyophilizationStartDate: null,
          lyophilizationEndDate: null,
          scheduledDate: null
        }
      });
      
      revalidatePath('/workspace/harmonogram');
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting process:", error);
      throw error;
    }
  }
} 