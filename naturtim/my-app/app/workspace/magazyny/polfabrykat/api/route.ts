import { NextResponse } from 'next/server';
import { getSemifinishedProducts, updateSemifinishedProduct } from '../services/service';

export async function GET() {
  try {
    const semifinishedProducts = await getSemifinishedProducts();
    return NextResponse.json(semifinishedProducts);
  } catch (error) {
    console.error("Błąd podczas pobierania danych półfabrykatów:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać danych półfabrykatów" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { deliveryId, newQuantity, quantityKey = 'polprodukt' } = body;

    if (!deliveryId || newQuantity === undefined) {
      return NextResponse.json(
        { error: "Brak wymaganych danych" },
        { status: 400 }
      );
    }

    const updatedBatch = await updateSemifinishedProduct(deliveryId, newQuantity, quantityKey);
    return NextResponse.json({ success: true, data: updatedBatch });
  } catch (error) {
    console.error("Błąd podczas aktualizacji danych półfabrykatów:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować danych półfabrykatów" },
      { status: 500 }
    );
  }
} 