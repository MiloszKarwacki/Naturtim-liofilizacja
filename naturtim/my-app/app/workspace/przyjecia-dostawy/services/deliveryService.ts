import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { FormData, DeliveryInput } from "../types/delivery";
import { DeliveryLogService } from "./deliveryLogService";
import { WarehouseService } from "./warehouseService";

export async function createDelivery(data: DeliveryInput, req: NextRequest) {
  // Sprawdzamy czy numer partii już istnieje
  const existingBatch = await prisma.productionBatch.findFirst({
    where: { batchNumber: data.batchNumber }
  });

  if (existingBatch) {
    throw new Error(`Partia o numerze ${data.batchNumber} już istnieje w systemie`);
  }

  // Tworzymy nową partię i automatycznie przypisujemy wagę do magazynu mroźni
  const productionBatch = await prisma.productionBatch.create({
    data: {
      batchNumber: data.batchNumber,
      productId: data.productId,
      supplierId: data.supplierId,
      recipientId: data.recipientId || null,
      initialWeight: data.weight,
      mroznia: data.weight, // tutaj ustawiamy, że cała waga trafia do magazynu mroźni
      kartony: data.boxCount,
      notes: data.notes,
      deliveryDate: new Date(), // Data przyjęcia ustawiana na aktualną
    },
    include: {
      product: true,
      supplier: true,
      recipient: true,
    }
  });

  // Logowanie przyjęcia dostawy
  await DeliveryLogService.logDeliveryCreation(req, data);

  // Aktualizacja stanu magazynu "mroźnia"
  const warehouseService = new WarehouseService();
  // Dodajemy wagę dostawy do magazynu - weightDelta jest dodatnia, gdy towar trafia do magazynu
  await warehouseService.updateWarehouse("mroznia", data.weight);

  return productionBatch;
}

export async function getDeliveries() {
  const deliveries = await prisma.productionBatch.findMany({
    orderBy: { id: "desc" },
    include: {
      product: true,
      supplier: true,
      recipient: true,
    }
  });
  return deliveries;
}

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { name: "asc" }
  });
}

export async function getSuppliers() {
  return await prisma.supplier.findMany({
    orderBy: { name: "asc" }
  });
}

export async function getRecipients() {
  return await prisma.recipient.findMany({
    orderBy: { name: "asc" }
  });
}

export function mapFormDataToDeliveryInput(formData: FormData): DeliveryInput {
  return {
    batchNumber: formData.batchNumber,
    productId: formData.product?.id as number,
    supplierId: formData.supplier?.id as number,
    recipientId: formData.recipient?.id || null,
    weight: formData.weight,
    boxCount: formData.boxCount,
    notes: formData.notes
  };
}