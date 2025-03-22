import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { batchId, fractionId, weight } = await request.json();

    // Walidacja danych wejściowych
    if (!batchId || !fractionId || !weight) {
      return NextResponse.json({ message: "Nieprawidłowe dane wejściowe" }, { status: 400 });
    }

    const fractionWeight = parseFloat(weight);
    if (fractionWeight <= 0) {
      return NextResponse.json({ message: "Waga musi być większa od zera" }, { status: 400 });
    }

    // Pobranie oryginalnej partii
    const originalBatch = await prisma.productionBatch.findUnique({
      where: { id: batchId }
    });

    if (!originalBatch) {
      return NextResponse.json({ message: "Nie znaleziono partii o podanym ID" }, { status: 404 });
    }

    const availableWeight = originalBatch.polprodukt || 0;
    if (fractionWeight > availableWeight) {
      return NextResponse.json(
        { message: `Waga przekracza dostępną wartość w magazynie (${availableWeight} kg)` },
        { status: 400 }
      );
    }

    // Transakcja: odejmujemy wagę od oryginalnej partii i tworzymy nową partię frakcyjną
    await prisma.$transaction(async (prisma) => {
      await prisma.productionBatch.update({
        where: { id: batchId },
        data: {
          polprodukt: availableWeight - fractionWeight
        }
      });

      await prisma.productionBatch.create({
        data: {
          batchNumber: originalBatch.batchNumber,
          product: originalBatch.productId ? { connect: { id: originalBatch.productId } } : undefined,
          supplier: originalBatch.supplierId ? { connect: { id: originalBatch.supplierId } } : undefined,
          status: originalBatch.statusId ? { connect: { id: originalBatch.statusId } } : undefined,
          fraction: { connect: { id: fractionId } },
          polprodukt: fractionWeight, // ustawiamy wagę przydzieloną frakcji
          fractioningDate: new Date() // data przypisania frakcji
        }
      });
    });

    return NextResponse.json({
      message: "Frakcja została przypisana do partii. Magazyn został zaktualizowany."
    });
  } catch (error: any) {
    console.error("Błąd podczas przypisywania frakcji:", error);
    return NextResponse.json(
      { message: error.message || "Wystąpił błąd podczas przypisywania frakcji" },
      { status: 500 }
    );
  }
}