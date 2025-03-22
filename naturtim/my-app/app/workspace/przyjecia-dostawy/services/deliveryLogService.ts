import { NextRequest } from "next/server";
import { logEvent } from "@/lib/logger";

export const DeliveryLogService = {
  async logDeliveryCreation(req: NextRequest, deliveryData: any): Promise<void> {
    await logEvent(
      req,
      `Przyjęcie dostawy o numerze partii ${deliveryData.batchNumber}`,
      {
        batchNumber: deliveryData.batchNumber,
        productId: deliveryData.productId,
        supplierId: deliveryData.supplierId,
        weight: deliveryData.weight,
        boxCount: deliveryData.boxCount,
        notes: deliveryData.notes || "Brak notatek",
        action: "create"
      }
    );
  }
}; 