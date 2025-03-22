import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/auth/utils/auth";
import { logEvent } from "@/app/auth/utils/logger";

export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 });
    }
    
    const body = await req.json();
    const { deliveryId, newQuantity, quantityKey } = body;
    
    if (
      typeof deliveryId !== "number" ||
      typeof newQuantity !== "number" ||
      typeof quantityKey !== "string"
    ) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }

    // Dozwolone klucze magazynowe (upewnij się, że odpowiadają polom w modelu)
    const allowedKeys = ["mroznia", "polprodukt", "gotowyProdukt", "kartony"];
    if (!allowedKeys.includes(quantityKey)) {
      return NextResponse.json({ error: "Nieprawidłowy klucz ilości" }, { status: 400 });
    }
    
    // Pobierz istniejący rekord z modelu ProductionBatch
    const productionBatch = await prisma.productionBatch.findUnique({
      where: { id: deliveryId }
    });
    if (!productionBatch) {
      return NextResponse.json({ error: "Rekord nie znaleziony" }, { status: 404 });
    }
    
    // Rzutowanie na any, żeby móc dynamicznie pobrać właściwość
    const oldQuantity = (productionBatch as any)[quantityKey];

    // Zaktualizuj rekord – ustaw nową ilość.
    // Jeśli chcesz aktualizować również pole lastInventoryAt,
    // najpierw dodaj je do modelu ProductionBatch w pliku schema.prisma
    const updatedProductionBatch = await prisma.productionBatch.update({
      where: { id: deliveryId },
      data: {
        [quantityKey]: newQuantity,
        lastInventoryAt: new Date() // odkomentuj, jeśli pole istnieje
      }
    });
    
    // Logujemy zdarzenie: zapisujemy identyfikator partii, klucz magazynu, starą i nową ilość.
    await logEvent(req, "Aktualizacja inwentaryzacji", {
      deliveryId,
      quantityKey,
      oldQuantity,
      newQuantity,
    });
    
    return NextResponse.json(updatedProductionBatch);
  } catch (error) {
    console.error("Błąd przy aktualizacji inwentaryzacji:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas aktualizacji" }, { status: 500 });
  }
} 