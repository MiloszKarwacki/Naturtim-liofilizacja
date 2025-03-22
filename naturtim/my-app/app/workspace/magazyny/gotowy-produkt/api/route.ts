import { NextResponse } from 'next/server';
import { getFinishedProducts, updateFinishedProduct } from '../services/service';
import { FinishedProductUpdateData } from '../types/types';

export async function GET() {
  try {
    const finishedProducts = await getFinishedProducts();
    return NextResponse.json(finishedProducts);
  } catch (error) {
    console.error("Błąd podczas pobierania danych produktów gotowych:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać danych produktów gotowych" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as FinishedProductUpdateData;
    const { deliveryId, newQuantity, quantityKey = 'gotowyProdukt' } = body;

    if (!deliveryId || newQuantity === undefined) {
      return NextResponse.json(
        { error: "Brak wymaganych danych" },
        { status: 400 }
      );
    }

    const updatedBatch = await updateFinishedProduct(deliveryId, newQuantity, quantityKey);
    return NextResponse.json({ success: true, data: updatedBatch });
  } catch (error) {
    console.error("Błąd podczas aktualizacji danych produktów gotowych:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować danych produktów gotowych" },
      { status: 500 }
    );
  }
} 