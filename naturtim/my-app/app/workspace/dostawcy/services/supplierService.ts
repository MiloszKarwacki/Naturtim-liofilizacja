import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { SupplierLogService } from "./supplierLogService";

export async function getSuppliers() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { id: 'asc' },
  });
  
  return suppliers.map(supplier => ({
    id: supplier.id,
    name: supplier.name,
  }));
}

export async function createSupplier(data: { name: string }, request?: NextRequest) {
  const supplier = await prisma.supplier.create({
    data: {
      name: data.name.trim(),
    },
  });
  
  // Logowanie utworzenia dostawcy
  if (request) {
    await SupplierLogService.logSupplierCreation(request, supplier.id, supplier.name);
  }
  
  return supplier;
}

export async function canDeleteSupplier(id: number) {
  const supplierWithBatches = await prisma.supplier.findUnique({
    where: { id },
    include: { productionBatches: true },
  });
  
  return !supplierWithBatches?.productionBatches.length;
}

export async function deleteSupplier(id: number, request?: NextRequest) {
  // Pobierz informacje o dostawcy przed usunięciem
  const supplier = await prisma.supplier.findUnique({
    where: { id }
  });
  
  const deletedSupplier = await prisma.supplier.delete({
    where: { id },
  });
  
  // Logowanie usunięcia dostawcy
  if (request && supplier) {
    await SupplierLogService.logSupplierDeletion(request, id, supplier.name);
  }
  
  return deletedSupplier;
} 