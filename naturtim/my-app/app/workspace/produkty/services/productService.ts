import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { ProductLogService } from "./productLogService";

export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' },
  });
  
  return products.map(product => ({
    id: product.id,
    name: product.name,
  }));
}

export async function createProduct(data: { name: string }, request?: NextRequest) {
  const product = await prisma.product.create({
    data: {
      name: data.name.trim(),
    },
  });
  
  if (request) {
    await ProductLogService.logProductCreation(request, product.id, product.name);
  }
  
  return product;
}

export async function canDeleteProduct(id: number) {
  const productWithBatches = await prisma.product.findUnique({
    where: { id },
    include: { productionBatches: true },
  });
  
  return !productWithBatches?.productionBatches.length;
}

export async function deleteProduct(id: number, request?: NextRequest) {
  const product = await prisma.product.findUnique({
    where: { id }
  });
  
  const deletedProduct = await prisma.product.delete({
    where: { id },
  });
  
  if (request && product) {
    await ProductLogService.logProductDeletion(request, id, product.name);
  }
  
  return deletedProduct;
}
