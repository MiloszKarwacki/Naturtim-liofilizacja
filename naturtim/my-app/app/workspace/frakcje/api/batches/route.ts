import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const batches = await prisma.productionBatch.findMany({
      where: {
        polprodukt: { gt: 0 } // tylko te partie, które mają dostępny surowiec
      },
      select: {
        id: true,
        batchNumber: true,
        polprodukt: true,
        product: { select: { id: true, name: true } }
      }
    });

    // Formatowanie danych – zamieniamy polprodukt na availableWeight
    const formattedBatches = batches.map(batch => ({
      id: batch.id,
      batchNumber: batch.batchNumber,
      availableWeight: batch.polprodukt,
      product: batch.product
    }));

    return NextResponse.json(formattedBatches);
  } catch (error) {
    console.error("Błąd podczas pobierania partii:", error);
    return NextResponse.json({ message: "Wystąpił błąd podczas pobierania partii" }, { status: 500 });
  }
}